# Wazo Digital — Landing & Authentification

Landing page moderne et flux d'authentification complet pour **Wazo Digital**, le SaaS qui digitalise les micro-entreprises en Afrique (commerçants, agriculteurs, agents de santé, livreurs, éducateurs).

Construit avec **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **Lucide React** et **Supabase** (auth par cookies / SSR).

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Configuration Supabase](#configuration-supabase) — voir aussi [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- [Lancer le projet](#lancer-le-projet)
- [Structure du projet](#structure-du-projet)
- [Routes](#routes)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Personnalisation](#personnalisation)

---

## Fonctionnalités

- **Landing one-page** responsive (navbar, hero, problème, fonctionnalités, secteurs, étapes, témoignages, tarifs, FAQ, CTA, footer)
- Animations subtiles au défilement (Framer Motion)
- Barre d'annonce, bouton « Retour en haut », menu mobile
- SEO + Open Graph (partage WhatsApp / Facebook)
- **Authentification complète** via Supabase :
  - Inscription avec confirmation par email
  - Connexion
  - Mot de passe oublié + réinitialisation
  - Déconnexion
  - **Protection de route côté serveur** (`proxy.ts`) pour `/dashboard`

---

## Prérequis

- **Node.js 18.18+** (recommandé : Node 20 LTS)
- **npm** (ou pnpm / yarn)
- Un projet **Supabase** (gratuit) : <https://supabase.com>

---

## Installation

```bash
npm install
```

---

## Variables d'environnement

Crée un fichier `.env.local` à la racine (un exemple est fourni dans `.env.local.example`) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-REF-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_PUBLIQUE
```

Ces valeurs se trouvent dans le dashboard Supabase : **Project Settings → API**.

> La clé `anon` est **publique** et peut être exposée côté client. Ne jamais committer la clé `service_role`.

---

## Configuration Supabase

1. **Activer le provider Email**
   - Dashboard → **Authentication → Providers → Email** : activer.
   - Selon ton besoin, activer ou non « Confirm email ».

2. **Configurer les URLs de redirection**
   - Dashboard → **Authentication → URL Configuration**
   - **Site URL** :
     - En dev : `http://localhost:3000`
     - En prod : `https://votre-domaine.com`
   - **Redirect URLs** : ajouter
     - `http://localhost:3000/auth/callback`
     - `https://votre-domaine.com/auth/callback`

Le lien de confirmation d'email et le lien de réinitialisation pointent vers `/auth/callback`, qui échange le `code` contre une session (cookies) côté serveur.

> 📖 **Guide détaillé** : voir [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) pour la configuration complète (URL Configuration, Google OAuth, SMS/Phone, modèles d'emails, RLS, et l'intégration à 2 applications `Landing` + `wazo-digital`).

---

## Lancer le projet

### Développement

```bash
npm run dev
```

Ouvre <http://localhost:3000>.

### Build de production

```bash
npm run build
npm run start
```

---

## Structure du projet

```
Landing/
├── app/
│   ├── auth/callback/route.ts     # Échange du code OAuth/email → session (cookies)
│   ├── dashboard/
│   │   ├── page.tsx               # Page protégée (Server Component)
│   │   └── sign-out-button.tsx    # Bouton déconnexion (Client Component)
│   ├── forgot-password/page.tsx   # Demande de réinitialisation
│   ├── login/page.tsx             # Connexion
│   ├── register/page.tsx          # Inscription
│   ├── reset-password/page.tsx    # Nouveau mot de passe
│   ├── globals.css                # Tailwind v4
│   ├── icon.svg                   # Favicon
│   ├── layout.tsx                 # Layout + metadata SEO/OG
│   └── page.tsx                   # Landing page
├── lib/supabase/
│   ├── client.ts                  # Client navigateur (createBrowserClient)
│   ├── server.ts                  # Client serveur (createServerClient + cookies)
│   └── middleware.ts              # Logique de session + redirections
├── public/
│   └── logo-wazo.svg              # Logo
├── proxy.ts                       # Middleware Next.js 16 (protection des routes)
├── next.config.ts                 # Config (autorise images Unsplash)
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

---

## Routes

| Route              | Type      | Accès                                              |
| ------------------ | --------- | -------------------------------------------------- |
| `/`                | Statique  | Public (landing)                                   |
| `/login`           | Statique  | Public → redirige vers `/dashboard` si connecté    |
| `/register`        | Statique  | Public → redirige vers `/dashboard` si connecté    |
| `/forgot-password` | Statique  | Public → redirige vers `/dashboard` si connecté    |
| `/reset-password`  | Statique  | Accessible avec une session de récupération        |
| `/auth/callback`   | Dynamique | Échange le `code` puis redirige                    |
| `/dashboard`       | Dynamique | **Protégée** — redirige vers `/login` si déconnecté |

La protection est appliquée **avant le rendu** par `proxy.ts`, et redoublée côté serveur dans `app/dashboard/page.tsx`.

---

## Déploiement sur Vercel (Git + auto-deploy)

| | |
|---|---|
| **Repo GitHub** | [github.com/jacques99e/landing-jacques99e](https://github.com/jacques99e/landing-jacques99e) |
| **Projet Vercel** | `landing-jacques99e` |
| **URL prod** | https://wazo-digital.com |
| **Branche prod** | `master` |

Le dépôt est **déjà connecté** à Vercel : chaque `git push` sur `master` déclenche un déploiement production.

### Workflow quotidien

```bash
git add .
git commit -m "feat: ma modification"
git push origin master
```

Suivi : [Vercel → landing-jacques99e → Deployments](https://vercel.com/jacques99es-projects/landing-jacques99e).

### Variables d'environnement (Production)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://app.wazo-digital.com`

### Supabase (auth)

- **Site URL** = `https://wazo-digital.com`
- **Redirect URL** = `https://wazo-digital.com/auth/callback`
- Ajoute aussi les previews : `https://*-landing-jacques99e*.vercel.app/auth/callback`

### Déploiement manuel (secours)

```bash
vercel deploy --prod --yes
```

Utiliser seulement si le réseau local coupe le suivi Git ; le flux normal reste `git push`.

---

## Personnalisation

- **Couleurs de marque** (Tailwind, classes arbitraires) :
  - Vert principal : `#075E54`
  - Orange accent : `#FF6F00`
  - Fond crème : `#FFF8F0`
  - Texte foncé : `#1A1A1A`
- **Contenu** (titres, fonctionnalités, témoignages, tarifs, FAQ) : tableaux en haut de `app/page.tsx`.
- **Logo / favicon** : `public/logo-wazo.svg` et `app/icon.svg`.
- **Liens sociaux** : tableau `socialLinks` dans `app/page.tsx`.

---

© 2025 Wazo Digital. Fait avec ❤️ pour l'Afrique.
