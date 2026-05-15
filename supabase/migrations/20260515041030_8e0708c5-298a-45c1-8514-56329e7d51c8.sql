
-- 1. Profiles: require authentication to view
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Connections: only addressee can update status
DROP POLICY IF EXISTS "Recipient can update connection" ON public.connections;
CREATE POLICY "Addressee updates connection status"
  ON public.connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

-- 3. Chat rooms: creators can delete
CREATE POLICY "Creator deletes own room"
  ON public.chat_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 4. Lock down transition_graduates_to_alumni from app users
REVOKE EXECUTE ON FUNCTION public.transition_graduates_to_alumni() FROM PUBLIC, anon, authenticated;

-- 5. Realtime: restrict Broadcast/Presence to chat room members
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room members read realtime topic" ON realtime.messages;
CREATE POLICY "Room members read realtime topic"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    (realtime.topic() LIKE 'room-%'
     AND public.is_room_member(
       (substring(realtime.topic() from 6))::uuid,
       (SELECT auth.uid())
     ))
    OR realtime.topic() NOT LIKE 'room-%'
  );

DROP POLICY IF EXISTS "Room members write realtime topic" ON realtime.messages;
CREATE POLICY "Room members write realtime topic"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (realtime.topic() LIKE 'room-%'
     AND public.is_room_member(
       (substring(realtime.topic() from 6))::uuid,
       (SELECT auth.uid())
     ))
    OR realtime.topic() NOT LIKE 'room-%'
  );
