ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage stores" ON public.stores;
CREATE POLICY "Owners manage stores" ON public.stores FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public read stores by slug" ON public.stores;
CREATE POLICY "Public read stores by slug" ON public.stores FOR SELECT
  USING (is_public = true);

NOTIFY pgrst, 'reload schema';

select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'stores'
order by column_name;
