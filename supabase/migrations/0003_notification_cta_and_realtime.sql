-- Add optional CTA metadata for in-app notification links
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS cta_url TEXT,
ADD COLUMN IF NOT EXISTS cta_label TEXT;

-- Ensure notifications are included in Supabase realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;
