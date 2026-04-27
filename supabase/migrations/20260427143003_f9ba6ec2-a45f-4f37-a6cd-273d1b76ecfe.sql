-- Tighten room_members insert
DROP POLICY IF EXISTS "User can join rooms (insert self)" ON public.room_members;

CREATE POLICY "Self-join or creator-add to room" ON public.room_members
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.chat_rooms r
    WHERE r.id = room_members.room_id AND r.created_by = auth.uid()
  )
);

-- Lock down SECURITY DEFINER helper
REVOKE ALL ON FUNCTION public.is_room_member(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_room_member(UUID, UUID) TO authenticated;