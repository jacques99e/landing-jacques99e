# Alerte Supabase — taux de rebond emails Auth

**Projet :** `gfqmmdihubcpvouidpkc`  
**Cause typique :** emails Auth (confirmation, reset) envoyés via le **SMTP gratuit Supabase** vers des adresses invalides / jetables / tests.

---

## 1. Brancher Resend (à faire maintenant)

Vous avez déjà Resend + domaine `wazo-digital.com` vérifié.

1. Ouvrir : [SMTP Auth Supabase](https://supabase.com/dashboard/project/gfqmmdihubcpvouidpkc/auth/smtp)
2. **Enable Custom SMTP**
3. Remplir :

| Champ | Valeur |
|--------|--------|
| Sender email | `onboarding@wazo-digital.com` |
| Sender name | `Wazo Digital` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | votre `RESEND_API_KEY` (`re_...`) |

4. **Save**
5. Tester une inscription avec **votre vrai email** (pas un jetable)
6. Vérifier dans [Resend → Emails](https://resend.com/emails) que le message apparaît

---

## 2. Arrêter les rebonds

| À faire | Pourquoi |
|---------|----------|
| Ne plus utiliser d’emails faux / jetables en test | Ex. `*@fivejm.com` = rebond |
| Tester en local avec votre Gmail / Outlook réel | Ou désactiver les inscriptions de test |
| Activer CAPTCHA (Auth → Attack Protection) | Bloque les bots qui créent des comptes |
| Ne pas désactiver la confirmation email sous la pression | Risque sécurité |

### Audit rapide

```powershell
cd C:\Users\user\Desktop\Landing
node scripts/audit-auth-emails.mjs
```

Ce script liste les emails suspects / non confirmés.

---

## 3. Nettoyage recommandé

Dans [Authentication → Users](https://supabase.com/dashboard/project/gfqmmdihubcpvouidpkc/auth/users) :

- Supprimer les comptes de test / jetables qui n’ont jamais confirmé
- Garder les vrais pilotes (Gmail, etc.)

---

## 4. Après configuration

- Les emails Auth (signup, reset) passent par **Resend** → meilleure délivrabilité
- Les emails pilotes (`pilot:send`) utilisent déjà Resend → OK
- Surveiller Resend (bounces / complaints) 48 h

Si Supabase a déjà restreint l’envoi : après SMTP custom + nettoyage, répondre à leur mail ou ouvrir un ticket support en indiquant que le custom SMTP Resend est actif.

---

## 5. Statut — 14 juil. 2026

- [x] SMTP Resend activé sur le projet `gfqmmdihubcpvouidpkc`
- [x] Widget Turnstile prêt côté Landing (`components/turnstile.tsx` + login/register/forgot)
- [x] CAPTCHA Turnstile actif (Site Key Vercel + Attack Protection Supabase) — vérifié 14 juil.
- [x] Nettoyage bounce : plus de comptes invalides à supprimer (seul reste AWODJE / fivejm — pilote, skip)
- [ ] Demander à AWODJE un vrai email (actuellement `fivejm.com` jetable)
- Note 14 juil. : 7 emails Gmail non confirmés (inscriptions récentes) — ne pas supprimer, laisser confirmer

### Activer CAPTCHA (manuel, ~5 min)

1. [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) → créer un widget (domaines : `wazo-digital.com`, `localhost`)
2. Copier **Site Key** → Vercel Landing `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Production) + redeploy
3. Copier **Secret Key** → Supabase → Authentication → Attack Protection → Enable CAPTCHA → Turnstile
4. Tester `/register` : le widget doit apparaître et bloquer les bots

### Vérifier que ça marche

1. Resend → [Emails](https://resend.com/emails) : un mail Auth doit apparaître après signup/reset
2. Supabase → Authentication → Users : plus de nouveaux emails `*.com.com` / jetables
3. Répondre à l’alerte Supabase : « Custom SMTP Resend configured + bounce cleanup underway »
