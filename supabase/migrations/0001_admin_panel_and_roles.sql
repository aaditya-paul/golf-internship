-- 1. Add Role Column
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Update New User Trigger to include Default Charity
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  default_charity_id UUID;
BEGIN
  -- Get the first available charity
  SELECT id INTO default_charity_id FROM public.charities ORDER BY name ASC LIMIT 1;
  
  INSERT INTO public.profiles (id, email, charity_id)
  VALUES (new.id, new.email, default_charity_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Security Definer Helper for RLS
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Admin RLS Policies
CREATE POLICY "Admins bypass RLS on charities" ON public.charities FOR ALL USING (public.is_admin());
CREATE POLICY "Admins bypass RLS on scores" ON public.scores FOR ALL USING (public.is_admin());
CREATE POLICY "Admins bypass RLS on profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admins bypass RLS on draws" ON public.draws FOR ALL USING (public.is_admin());
CREATE POLICY "Admins bypass RLS on draw_winners" ON public.draw_winners FOR ALL USING (public.is_admin());
CREATE POLICY "Admins bypass RLS on charity_donations" ON public.charity_donations FOR ALL USING (public.is_admin());
