
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_date DATE;

DROP FUNCTION IF EXISTS public.transition_graduates_to_alumni();

CREATE FUNCTION public.transition_graduates_to_alumni()
RETURNS TABLE(transitioned_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected BIGINT;
BEGIN
  WITH updated AS (
    UPDATE public.profiles
    SET account_type = 'alumni'
    WHERE account_type = 'college_student'
      AND (
        (graduation_date IS NOT NULL AND graduation_date <= CURRENT_DATE)
        OR (graduation_date IS NULL
            AND graduation_year IS NOT NULL
            AND graduation_year < EXTRACT(YEAR FROM CURRENT_DATE)::INT)
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO affected FROM updated;
  RETURN QUERY SELECT affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.transition_graduates_to_alumni() FROM PUBLIC, anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
