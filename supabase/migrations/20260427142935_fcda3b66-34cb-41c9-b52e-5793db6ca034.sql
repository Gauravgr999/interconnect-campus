-- =========================================================
-- CONNECTIONS
-- =========================================================
CREATE TYPE public.connection_status AS ENUM ('pending','accepted','declined');

CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their connections" ON public.connections
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can request connection" ON public.connections
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipient can update connection" ON public.connections
FOR UPDATE USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

CREATE POLICY "Either party can delete connection" ON public.connections
FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER trg_connections_updated
BEFORE UPDATE ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- POSTS / LIKES / COMMENTS
-- =========================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by authenticated" ON public.posts
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own posts" ON public.posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users edit own posts" ON public.posts
FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users delete own posts" ON public.posts
FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE TRIGGER trg_posts_updated
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by authenticated" ON public.post_likes
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users like as themselves" ON public.post_likes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own" ON public.post_likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by authenticated" ON public.post_comments
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users comment as themselves" ON public.post_comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own comments" ON public.post_comments
FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- =========================================================
-- EVENTS
-- =========================================================
CREATE TYPE public.event_category AS ENUM ('hackathon','workshop','fest','meetup','webinar','other');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category public.event_category NOT NULL DEFAULT 'other',
  college TEXT,
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  cover_url TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by all" ON public.events
FOR SELECT USING (true);
CREATE POLICY "Users create events" ON public.events
FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizer updates own event" ON public.events
FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizer deletes own event" ON public.events
FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

CREATE TRIGGER trg_events_updated
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.event_rsvps (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RSVPs viewable by all" ON public.event_rsvps
FOR SELECT USING (true);
CREATE POLICY "User rsvps as self" ON public.event_rsvps
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User cancels own rsvp" ON public.event_rsvps
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- CHAT: rooms, members, messages
-- =========================================================
CREATE TYPE public.room_type AS ENUM ('dm','group');

CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.room_type NOT NULL DEFAULT 'group',
  name TEXT,
  created_by UUID NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.room_members (
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS between rooms <-> members
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.room_members WHERE room_id = _room_id AND user_id = _user_id)
$$;

CREATE POLICY "Members view their rooms" ON public.chat_rooms
FOR SELECT TO authenticated USING (public.is_room_member(id, auth.uid()));
CREATE POLICY "Authenticated create rooms" ON public.chat_rooms
FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Members update room metadata" ON public.chat_rooms
FOR UPDATE TO authenticated USING (public.is_room_member(id, auth.uid()));

CREATE POLICY "Members view membership" ON public.room_members
FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "User can join rooms (insert self)" ON public.room_members
FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "User can leave room" ON public.room_members
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read messages" ON public.messages
FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "Members send messages" ON public.messages
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND public.is_room_member(room_id, auth.uid())
);
CREATE POLICY "Senders delete own messages" ON public.messages
FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- bump last_message_at
CREATE OR REPLACE FUNCTION public.bump_room_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.chat_rooms SET last_message_at = NEW.created_at WHERE id = NEW.room_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_messages_bump_room
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.bump_room_last_message();

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Indexes
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_messages_room_created ON public.messages(room_id, created_at);
CREATE INDEX idx_events_starts ON public.events(starts_at);
CREATE INDEX idx_room_members_user ON public.room_members(user_id);