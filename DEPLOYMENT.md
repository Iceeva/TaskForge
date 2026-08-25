# 🚀 Déploiement sur Vercel — 2 domaines séparés

TaskForge est structuré comme **deux projets Vercel indépendants** :

| Projet | Dossier | Domaine (exemple) | Contenu |
|---|---|---|---|
| **API** | `backend/` | `api-taskforge.tondomaine.com` | NestJS en fonction serverless |
| **App** | `frontend/` | `app.tondomaine.com` | React (SPA statique) |

Les deux se déploient séparément depuis le même repo Git (Vercel permet de définir un "Root Directory" différent par projet).

---

## 0. Base de données PostgreSQL

Vercel n'héberge pas de Postgres persistant adapté aux fonctions serverless sans pooling. Utilise un provider avec **connection pooling** :

- [Neon](https://neon.tech) (recommandé, gratuit pour démarrer) — fournit une URL "pooled" (`?pgbouncer=true`) et une URL "direct"
- [Supabase](https://supabase.com) — idem (port 6543 pooled / 5432 direct)
- Vercel Postgres (Neon en marque blanche)

Récupère deux chaînes de connexion :
- `DATABASE_URL` → connexion **poolée** (utilisée par l'app à l'exécution)
- `DIRECT_URL` → connexion **directe** (utilisée par Prisma Migrate)

---

## 1. Déployer le backend (API)

1. Sur [vercel.com/new](https://vercel.com/new), importe le repo, puis en "Root Directory" choisis **`backend`**
2. Framework Preset : **Other**
3. Variables d'environnement à ajouter (Project Settings → Environment Variables) :

```
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...
JWT_SECRET=<valeur longue et aléatoire>
JWT_REFRESH_SECRET=<autre valeur longue et aléatoire>
CORS_ORIGIN=https://app.tondomaine.com
FRONTEND_URL=https://app.tondomaine.com
```

4. Déploie. Vercel exécute automatiquement `npm install`, ce qui déclenche `postinstall` → `prisma generate`.
5. Applique le schéma à la base (une seule fois, depuis ta machine, avec les mêmes `DATABASE_URL`/`DIRECT_URL` dans `backend/.env`) :

```bash
cd backend
npx prisma db push
npx prisma db seed   # optionnel — données de démo
```

6. Une fois déployé, note l'URL générée (ou configure ton domaine personnalisé dans Project Settings → Domains). Le préfixe global de l'API est `/api`, donc toutes les routes sont sous `https://api-taskforge.tondomaine.com/api/...` (ex: `/api/auth/login`, `/api/tasks`).
7. Vérifie que ça répond : `https://api-taskforge.tondomaine.com/api/docs` doit afficher Swagger.

### ⚠️ Limite importante : temps réel (WebSocket)

Les fonctions serverless Vercel ne maintiennent pas de connexions persistantes : le module `RealtimeModule` (Socket.IO) ne fonctionnera **pas** correctement une fois déployé sur Vercel (les clients se reconnecteront en boucle, sans recevoir d'événements live). Le reste de l'application (API REST, auth, tâches, etc.) n'est pas affecté.

Deux options si la collaboration en temps réel est importante pour toi :
- **Recommandé** : héberge uniquement `backend/` sur une plateforme à connexions persistantes (Render, Railway, Fly.io) via le `Dockerfile` déjà présent, et garde le frontend sur Vercel.
- Ou désactive `RealtimeModule` dans `app.module.ts` et ajoute un polling léger côté frontend (rafraîchir `GET /projects/:id` toutes les X secondes) en attendant une meilleure solution (ex: Pusher, Ably, ou Vercel + un service pub/sub externe).

---

## 2. Déployer le frontend (App)

1. Sur [vercel.com/new](https://vercel.com/new), importe le **même repo** une seconde fois (nouveau projet), Root Directory : **`frontend`**
2. Framework Preset : **Vite** (auto-détecté)
3. Variable d'environnement :

```
VITE_API_URL=https://api-taskforge.tondomaine.com/api
```

4. Déploie. `vercel.json` gère déjà le rewrite SPA (`/* → /index.html`).
5. Configure ton domaine personnalisé (Project Settings → Domains), ex. `app.tondomaine.com`.

---

## 3. Relier les deux domaines (CORS)

Une fois le frontend déployé sur son domaine final, retourne dans le projet **backend** sur Vercel et vérifie que `CORS_ORIGIN` correspond exactement à l'URL du frontend (avec `https://`, sans slash final). Redéploie si tu modifies une variable d'environnement (Vercel ne les applique qu'au prochain build).

Tu peux lister plusieurs origines séparées par des virgules, utile pour garder aussi l'URL `*.vercel.app` de preview :

```
CORS_ORIGIN=https://app.tondomaine.com,https://taskforge-frontend.vercel.app
```

---

## 4. Checklist finale

- [ ] `https://api-taskforge.tondomaine.com/api/docs` répond (Swagger)
- [ ] `https://app.tondomaine.com` charge et permet de se connecter
- [ ] Créer une tâche, un sprint, logguer du temps → tout persiste bien en base
- [ ] Le stockage de fichiers (avatars, pièces jointes) est configuré via Cloudinary (ou S3) — les uploads ne persistent pas sur le filesystem d'une fonction serverless
- [ ] Le webhook/planificateur d'emails (SMTP) est configuré si tu comptes utiliser les invitations par email

---

## Alternative : un seul domaine

Si tu préfères un seul domaine (`tondomaine.com/*` pour le front, `tondomaine.com/api/*` pour l'API), utilise plutôt les **Vercel Rewrites** au niveau du projet frontend pour proxifier `/api/*` vers l'URL du projet backend, et retire alors le `VITE_API_URL` (garde `/api` par défaut). C'est un peu moins isolé que 2 domaines mais évite de gérer le CORS.
