
REVOKE EXECUTE ON FUNCTION public.cleanup_old_page_visits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_page_visits() TO service_role;
