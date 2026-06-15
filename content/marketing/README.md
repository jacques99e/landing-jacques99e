# Package marketing Wazo Digital

Kit complet pour commercialisation, réseaux sociaux et production vidéo.

## Contenu

| Fichier | Description |
|---------|-------------|
| [01-plaquette-commerciale.md](./01-plaquette-commerciale.md) | Plaquette 10 pages (PDF-ready) |
| [02-script-video-demonstration.md](./02-script-video-demonstration.md) | Script voix off 3 min 30 + variantes |
| [03-posts-reseaux-sociaux-30j.md](./03-posts-reseaux-sociaux-30j.md) | Calendrier 30 posts copier-coller |

## Données structurées (code)

```ts
import { SOCIAL_POSTS_30, WAZO_BRAND } from "@/lib/marketing-package";
```

- `lib/marketing-package/brand.ts` — URLs, tarifs, hashtags
- `lib/marketing-package/social-posts.ts` — 30 posts typés (plateforme, pilier, visuel)

## Export PDF plaquette

Ouvrir `01-plaquette-commerciale.md` dans Word, Google Docs ou Canva → exporter PDF.

## Enregistrer la vidéo démo

```bash
npm run record:demo
```

Aligné sur `02-script-video-demonstration.md` et `e2e/demo-tour.config.mjs`.

## Contact commercial

- WhatsApp : +228 93 92 40 40
- E-mail : jacquesnoussougan93@gmail.com
- Inscription : https://wazo-digital.com/register
