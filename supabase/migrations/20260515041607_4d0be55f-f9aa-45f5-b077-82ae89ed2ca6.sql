
-- 1. Profiles: owner sees full row; others use a safe view
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Owner reads own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, headline, bio, avatar_url, college_name,
       department, degree, account_type, current_position, company,
       location, is_verified, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 2. Event RSVPs: authenticated only
DROP POLICY IF EXISTS "RSVPs viewable by all" ON public.event_rsvps;
CREATE POLICY "RSVPs viewable by authenticated"
  ON public.event_rsvps FOR SELECT
  TO authenticated
  USING (true);

-- 3. Realtime: drop OR fallback so only room-* topics with membership are allowed
DROP POLICY IF EXISTS "Room members read realtime topic" ON realtime.messages;
CREATE POLICY "Room members read realtime topic"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE 'room-%'
    AND public.is_room_member(
      (substring(realtime.topic() from 6))::uuid,
      (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Room members write realtime topic" ON realtime.messages;
CREATE POLICY "Room members write realtime topic"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'room-%'
    AND public.is_room_member(
      (substring(realtime.topic() from 6))::uuid,
      (SELECT auth.uid())
    )
  );

-- 4. user_roles: admin-only INSERT/UPDATE/DELETE with explicit WITH CHECK
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
