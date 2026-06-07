# Corriger `localhost:3000/?code=...` (connexion Google / email)

## Cause

Dans Supabase, **Site URL** = `http://localhost:3000`.  
Après Google (ou lien e-mail), Supabase renvoie vers cette adresse avec `?code=...` → **ERR_CONNECTION_REFUSED** si vous n’avez pas de serveur local.

## À faire dans Supabase (obligatoire)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard) → projet **gfqmmdihubcpvouidpkc**
2. **Authentication** → **URL Configuration**
3. Modifier :

| Champ | Valeur |
|--------|--------|
| **Site URL** | `https://landing-jacques99e.vercel.app` |
| **Redirect URLs** | Ajouter chaque ligne ci-dessous |

```
https://landing-jacques99e.vercel.app/auth/callback
https://landing-jacques99e.vercel.app/**
https://landing-jacques99e.vercel.app/reset-password
https://landing-jacques99e.vercel.app/post-auth
```

4. **Save**

Optionnel pour le dev local (garder en plus) :

```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

## Google Cloud Console (si Google OAuth)

**APIs & Services** → **Credentials** → votre client OAuth → **Authorized redirect URIs** :

```
https://gfqmmdihubcpvouidpkc.supabase.co/auth/v1/callback
```

(Supabase gère le retour ; pas besoin de mettre localhost dans Google sauf pour tests locaux.)

## Après la modification

1. Attendre 1–2 minutes
2. Navigation privée → https://landing-jacques99e.vercel.app/login
3. **Continuer avec Google** → l’URL doit devenir `https://landing-jacques99e.vercel.app/...` (plus `localhost`)

## Connexion SMS (sans Google)

https://wazo-digital.vercel.app/login — ne dépend pas de la Site URL Supabase pour le flux SMS.
