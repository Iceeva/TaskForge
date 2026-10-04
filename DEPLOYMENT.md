# 🚀 Déploiement sur Vercel

TaskForge se déploie sur Vercel de deux façons. **L'option A (un seul projet) est recommandée** : une seule URL, pas de CORS, un seul déploiement.

| | Option A - 1 projet (recommandé) | Option B - 2 projets |
|---|---|---|
| Root Directory | `.` (racine du repo) | `backend` **et** `frontend` (2 projets) |
| Front | `frontend/dist` (statique) | projet Vercel dédié |
| API | `api/index.js` → NestJS (`/api/*`) | projet Vercel dédié |
| `VITE_API_URL` | non défini (`/api` par défaut) | `https://api.tondomaine.com/api` |
| CORS | inutile (même origine) | `CORS_ORIGIN` obligatoire |

---

## 0. Base de données PostgreSQL

Utilise un provider avec **pooling** (Neon, Supabase, Vercel Postgres) :

- `DATABASE_URL` → URL **poolée** (ajoute `?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL` → URL **directe** (migrations / `db push`)

Applique le schéma **une fois, depuis ta machine** :

```bash
cd backend
cp .env.example .env      # renseigne DATABASE_URL et DIRECT_URL
npx prisma db push
npx prisma db seed        # optionnel : données de démo
```

---

## Option A - Un seul projet Vercel

1. [vercel.com/new](https://vercel.com/new) → importe le repo, **Root Directory = `.`**, Framework Preset = **Other**.
   Le `vercel.json` racine fournit déjà : build (`npm run vercel-build`), dossier de sortie (`frontend/dist`), fonction API et rewrites.
2. Variables d'environnement (Production **et** Preview) :

```
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...
JWT_SECRET=<≥ 32 caractères aléatoires>
JWT_REFRESH_SECRET=<≥ 32 caractères, différent du précédent>
```

   Génère les secrets avec : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   `CORS_ORIGIN` n'est pas nécessaire (même origine).
3. Déploie, puis vérifie :
   - `https://<ton-projet>.vercel.app/api/health` → `{"status":"ok","db":"up"}`
   - `https://<ton-projet>.vercel.app/api/docs` → Swagger
   - `https://<ton-projet>.vercel.app/` → l'application

---

## Option B - Deux projets Vercel

**API** - Root Directory `backend`, Preset *Other*. Variables :

```
DATABASE_URL=...  DIRECT_URL=...
JWT_SECRET=...    JWT_REFRESH_SECRET=...
CORS_ORIGIN=https://app.tondomaine.com
FRONTEND_URL=https://app.tondomaine.com
```

**App** - Root Directory `frontend`, Preset *Vite*. Variable :

```
VITE_API_URL=https://api.tondomaine.com/api
```

`CORS_ORIGIN` accepte plusieurs origines séparées par des virgules (sans slash final). Redéploie après toute modification de variable.

---

## ⚠️ Temps réel (WebSocket)

Les fonctions serverless ne gardent pas de connexion ouverte : **Socket.IO est automatiquement désactivé sur Vercel** (`process.env.VERCEL`), l'application fonctionne en REST pur. Côté front, `lib/socket.ts` est inactif tant que `VITE_WS_URL` n'est pas défini.

Pour le temps réel, héberge le backend sur Render / Railway / Fly.io (via `backend/Dockerfile`), garde le front sur Vercel et définis `VITE_WS_URL=https://ton-backend` + `VITE_API_URL=https://ton-backend/api`.

## Fichiers / e-mails

Le filesystem d'une fonction Vercel est éphémère : utilise Cloudinary ou S3 pour les uploads, et un SMTP externe pour les invitations.

## Checklist

- [ ] `/api/health` répond `db: up`
- [ ] Inscription → connexion → création d'un projet et d'une tâche
- [ ] Rotation des secrets si un `.env` a déjà été partagé (voir ci-dessous)
- [ ] `JWT_SECRET` / `JWT_REFRESH_SECRET` ≥ 32 caractères

> 🔐 Ne commite jamais `backend/.env` (déjà dans `.gitignore`). Si ce fichier a été envoyé/partagé (archive, chat, ticket…), **régénère le mot de passe de la base** (Neon → Roles → Reset password) et les secrets JWT.
