-- 1. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.is_admin());

-- 3. Modify Score Trigger to prevent >5 scores
CREATE OR REPLACE FUNCTION public.enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
BEGIN
  -- Count how many scores the user already has BEFORE this insert
  SELECT count(*) INTO score_count FROM public.scores WHERE user_id = NEW.user_id;
  
  IF score_count >= 5 THEN
     RAISE EXCEPTION 'You already have 5 tickets (scores) assigned for this draw period. Changes are locked.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing AFTER trigger with BEFORE trigger
DROP TRIGGER IF EXISTS enforce_max_5_scores ON public.scores;

CREATE TRIGGER enforce_max_5_scores
  BEFORE INSERT ON public.scores
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_score_limit();
