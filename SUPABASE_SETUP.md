# Configuration Supabase — Wazo Digital

Guide de configuration de l'authentification Supabase pour l'architecture à **2 applications** :

- **`Landing`** — vitrine + point d'entrée d'authentification (email/mot de passe, Google, réinitialisation). C'est **la seule app que Supabase doit connaître** pour les redirections OAuth/email.
- **`wazo-digital`** — l'application SaaS. Elle reçoit la session via tokens (`/auth/receive`) et **n'a pas besoin** d'être déclarée dans les Redirect URLs Supabase.

> Conséquence clé : **toutes les URLs de redirection à configurer pointent vers `Landing`**.

Projet Supabase : `gfqmmdihubcpvouidpkc`

---

## 1. Clés API (Project Settings → API)

| Variable | Type | Usage |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | publique | `https://gfqmmdihubcpvouidpkc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publique (`sb_publishable_...`) | client navigateur |
| `SUPABASE_SERVICE_ROLE_KEY` | **secrète** (`sb_service_role_...`) | serveur uniquement, jamais exposée ni commitée |

Ces valeurs vont dans le `.env.local` de **chaque** projet (les deux pointent vers le même projet Supabase).

---

## 2. URL Configuration (Authentication → URL Configuration)

Section la plus importante : un `redirectTo` absent de la liste blanche est ignoré (retour sur Site URL).

**Site URL**
- Dev : `http://localhost:3000` (Landing)
- Prod : `https://votre-domaine.com` (Landing)

**Redirect URLs**

```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
https://votre-domaine.com/auth/callback
https://votre-domaine.com/reset-password
```

Previews Vercel (optionnel) : `https://*-ton-projet.vercel.app/auth/callback`

---

## 3. Provider Email / Mot de passe (Authentication → Providers → Email)

- **Enable Email provider** : activé.
- **Confirm email** :
  - **Activé** → email de confirmation requis ; le lien renvoie vers `/auth/callback`.
  - **Désactivé** → session immédiate après inscription (plus simple à tester).

Le code gère les deux cas (session immédiate ou message « vérifiez votre email »).

---

## 4. Provider Google / OAuth (Authentication → Providers → Google)

### a) Google Cloud Console (console.cloud.google.com)
1. APIs & Services → Credentials → **Create OAuth client ID** (type « Web application »).
2. **Authorized redirect URI** = l'URL **Supabase** (pas l'app) :
   ```
   https://gfqmmdihubcpvouidpkc.supabase.co/auth/v1/callback
   ```
3. Récupérer **Client ID** et **Client Secret**.

### b) Supabase (Providers → Google)
- Coller Client ID + Client Secret, activer.

**Flux :** `signInWithOAuth` → Google → Supabase `/auth/v1/callback` → `Landing/auth/callback` (échange du code) → `/post-auth` → handoff vers l'app.

---

## 5. Provider Phone — désactivé

L'authentification par SMS a été **abandonnée**. Ne pas activer **Providers → Phone** ni le hook **Send SMS** dans Supabase Auth.

- Connexion : **email/mot de passe** ou **Google** sur `Landing/login`.
- `app.wazo-digital.com/login` redirige vers la vitrine.
- `/phone-login` redirige vers `/login` (anciens liens).

Les SMS **métier** de l'app (rappels logistique, éducation, etc.) passent par `wazo-digital/src/lib/sms.ts` et des routes API dédiées — ce n'est **pas** de l'auth Supabase.

---

## 6. Modèles d'emails (Authentication → Email Templates)

Avec `@supabase/ssr` (flux **PKCE**), les liens contiennent un `code`.

- Vérifier que **Confirm signup** et **Reset password** utilisent bien `{{ .ConfirmationURL }}`.
- Si un lien ne crée pas de session, c'est presque toujours : (a) URL absente de la liste blanche, ou (b) template modifié qui a cassé `{{ .ConfirmationURL }}`.

---

## 7. Table `profiles` + RLS — déjà configuré ✅

`wazo-digital/register` fait un `upsert` dans `public.profiles`. **Aucune action requise** : la RLS et un trigger sont déjà définis dans la migration `wazo-digital/supabase/migrations/001_initial_schema.sql` :

```sql
-- Déjà présent dans la migration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger : création automatique du profil à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

L'`upsert` (INSERT + UPDATE) est entièrement couvert par ces policies. **Ne pas ajouter de policy `FOR ALL`** : ce serait un doublon.

> ⚠️ Vérifie simplement que les migrations ont bien été **appliquées** au projet live. Pour le confirmer dans **SQL Editor** :
>
> ```sql
> select policyname, cmd from pg_policies where tablename = 'profiles';
> ```
>
> Tu dois voir les 3 policies ci-dessus. Si la table/policies n'existent pas, applique les migrations (`supabase db push` avec le CLI, ou colle le contenu de `001_initial_schema.sql` dans le SQL Editor).

---

## 8. Checklist récapitulative

| Élément | Où | Valeur / Action |
| --- | --- | --- |
| Site URL | URL Configuration | URL de `Landing` |
| Redirect URLs | URL Configuration | `Landing/auth/callback` + `Landing/reset-password` (dev + prod) |
| Email provider | Providers → Email | Activé (+ choix Confirm email) |
| Google | Providers → Google | Client ID/Secret depuis Google Cloud |
| Google redirect URI | Google Cloud | `https://gfqmmdihubcpvouidpkc.supabase.co/auth/v1/callback` |
| Phone | Providers → Phone | **Désactivé** (auth SMS abandonnée) |
| RLS `profiles` | SQL Editor | Policy `auth.uid() = id` |

---

## 9. Points de vigilance pour cette architecture

1. **`wazo-digital` n'apparaît dans aucune config Supabase** — normal et voulu (handoff par tokens, pas de redirection OAuth).
2. Le handoff par tokens **ne dépend pas des cookies partagés** : il fonctionne en dev (ports différents) et en prod (domaines différents).
3. En prod, regrouper les deux apps sous le même domaine racine (ex. `votre-domaine.com` + `app.votre-domaine.com`) est recommandé pour la cohérence de marque, mais **optionnel**.

---

## 10. Variables d'environnement par projet

**`Landing/.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gfqmmdihubcpvouidpkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3001        # URL de wazo-digital
```

**`wazo-digital/.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gfqmmdihubcpvouidpkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_...
NEXT_PUBLIC_LANDING_URL=http://localhost:3000    # URL de Landing
```

---

## 11. Lancer en local (2 terminaux)

```bash
# Terminal 1 — Landing (vitrine + auth) sur le port 3000
cd Landing
npm run dev

# Terminal 2 — wazo-digital (l'app) sur le port 3001
cd wazo-digital
npm run dev -- -p 3001
```
