INSERT INTO public.profiles (id, phone)
SELECT id, NULLIF(phone, '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

select id, full_name, phone from public.profiles order by created_at;
