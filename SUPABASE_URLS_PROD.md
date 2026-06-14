# URLs Supabase — domaine custom `wazo-digital.com`

## À configurer dans Supabase (obligatoire)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard) → projet **gfqmmdihubcpvouidpkc**
2. **Authentication** → **URL Configuration**
3. Modifier :

| Champ | Valeur |
|--------|--------|
| **Site URL** | `https://wazo-digital.com` |
| **Redirect URLs** | Ajouter chaque ligne ci-dessous |

```
https://wazo-digital.com/auth/callback
https://wazo-digital.com/**
https://wazo-digital.com/reset-password
https://wazo-digital.com/post-auth
```

Conserver en option (dev + anciens alias Vercel) :

```
http://localhost:3000/auth/callback
http://localhost:3000/**
https://landing-jacques99e.vercel.app/auth/callback
https://landing-jacques99e.vercel.app/**
```

4. **Save**

## Google Cloud Console (si Google OAuth)

**Authorized redirect URIs** :

```
https://gfqmmdihubcpvouidpkc.supabase.co/auth/v1/callback
```

## PayDunya — callback paiement

```
https://app.wazo-digital.com/api/payments/momo/callback
```

## Vérification

1. Navigation privée → https://wazo-digital.com/login
2. **Continuer avec Google** → l’URL doit rester sur `https://wazo-digital.com/...`
3. Connexion email/mot de passe ou Google → redirection vers l’app après `/post-auth`
4. https://app.wazo-digital.com/login → redirige vers https://wazo-digital.com/login
