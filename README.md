# ⚡ TaskForge — Gestion de tâches collaborative en SaaS

![NestJS](https://img.shields.io/badge/NestJS-10-red) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-sky) ![Prisma](https://img.shields.io/badge/Prisma-6-teal) ![License](https://img.shields.io/badge/License-MIT-green)

> 🚀 **Déploiement sur Vercel** (1 projet recommandé, ou 2 projets) : voir [`DEPLOYMENT.md`](./DEPLOYMENT.md). Le temps réel (Socket.IO) est désactivé sur Vercel et reste disponible en Docker / Render / Railway / Fly.

## 📖 À propos

TaskForge est une plateforme SaaS de gestion de tâches collaborative, dans l'esprit de Jira, Trello ou Linear.

**Ce qu'elle permet :**
- organiser le travail par workspaces (multi-tenant), équipes et projets ;
- visualiser les tâches en Kanban (glisser-déposer), liste, calendrier, timeline et Gantt ;
- planifier en mode agile : sprints, jalons, dépendances entre tâches, suivi du temps, analytics ;
- collaborer avec des commentaires, des mentions, des notifications et un journal d'activité ;
- sécuriser l'accès avec des rôles (Owner, Admin, Member, Viewer), une authentification JWT, le 2FA et des clés API.

**Stack :** NestJS + Prisma + PostgreSQL côté backend, React + Vite + Tailwind côté frontend.

## ✨ Fonctionnalités

### 📋 Gestion des tâches
- **Tableau Kanban** — glisser-déposer des tâches entre colonnes (dnd-kit)
- **Vue liste** — tableau des tâches avec tri et filtres
- **Vue calendrier** — calendrier mensuel avec placement des tâches
- **Vue timeline** — frise horizontale pour les tâches datées
- **Diagramme de Gantt** — planning du projet avec barres de progression et dépendances
- **Détail d'une tâche** — modale riche : description, checklist, commentaires, journal d'activité
- **Sous-tâches** — hiérarchie de tâches imbriquées
- **Priorités** — Urgente, Haute, Moyenne, Basse, Aucune
- **Labels** — étiquettes colorées personnalisables
- **Checklist** — éléments de checklist au sein d'une tâche
- **Pièces jointes** — envoi de fichiers

### 👥 Collaboration
- **Synchronisation temps réel** — WebSocket Socket.io pour les mises à jour en direct *(hors Vercel)*
- **Commentaires** — commentaires en fil sur les tâches
- **Curseurs en direct** — voir où travaillent les coéquipiers
- **Indicateurs de saisie** — savoir quand quelqu'un écrit
- **Journal d'activité** — historique complet des modifications
- **@Mentions** — identifier des membres dans les commentaires

### 🏢 Multi-tenant
- **Workspaces** — données isolées par espace de travail
- **Équipes** — organisation des membres en équipes
- **Projets** — plusieurs projets par workspace
- **Invitations** — invitations de membres par e-mail
- **RBAC** — rôles Owner, Admin, Member, Viewer

### 🔐 Sécurité
- **Authentification JWT** — jetons d'accès + de rafraîchissement
- **OAuth** — connexion sociale Google & GitHub
- **Double authentification** — 2FA par TOTP
- **Hachage des mots de passe** — bcrypt, 12 tours
- **CORS** — politique d'origines configurable

### 🔔 Notifications
- **Dans l'application** — fil de notifications
- **Configurables** — réglages par type de notification
- **Marquer comme lu** — individuellement ou en masse

### 🏃 Agile & suivi
- **Sprints** — planification, activation, burndown chart
- **Jalons** — jalons de projet avec date d'échéance
- **Suivi du temps** — temps logué par tâche, résumé par membre/projet
- **Dépendances entre tâches** — « bloque » / « bloqué par »
- **Analytics** — taux de complétion, retards, charge par membre, tendance sur 14 jours
- **Recherche globale** — palette de commandes (Cmd+K)
- **Filtres sauvegardés** — personnels ou partagés
- **Clés API** — intégrations externes (clé hachée en SHA-256)
- **Export CSV** — export des tâches d'un projet

## 🛠 Stack technique

### Backend
| Couche | Technologie |
|--------|-------------|
| **Framework** | NestJS 10 |
| **Langage** | TypeScript 5.6 |
| **ORM** | Prisma 6 (16 modèles) |
| **Base de données** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Temps réel** | Socket.io 4 |
| **Auth** | Passport JWT + bcryptjs + otplib |
| **Documentation API** | Swagger (OpenAPI) |
| **Déploiement** | Vercel (serverless) ou Docker |

### Frontend
| Couche | Technologie |
|--------|-------------|
| **Framework** | React 18.3 + Vite 5 |
| **Langage** | TypeScript 5.6 |
| **Styles** | TailwindCSS 3.4 |
| **Glisser-déposer** | @dnd-kit/core + sortable |
| **Animations** | Framer Motion 11 |
| **État** | Zustand 5 |
| **HTTP** | Axios |
| **Routage** | React Router 6 |
| **Temps réel** | socket.io-client |
| **Dates** | date-fns 4 |
| **Toasts** | react-hot-toast |
| **Déploiement** | Vercel (statique) ou Nginx + Docker |

## 📁 Structure du projet

```
taskforge/
├── api/
│   └── index.js            # Point d'entrée serverless Vercel (mode 1 projet)
├── backend/
│   ├── api/index.js        # Point d'entrée serverless Vercel (mode 2 projets)
│   ├── prisma/
│   │   ├── schema.prisma   # 16 modèles
│   │   └── seed.ts         # Données de démo
│   ├── src/
│   │   ├── main.ts         # Démarrage NestJS local
│   │   ├── create-app.ts   # Fabrique de l'app (local + serverless) + Swagger
│   │   ├── app.module.ts   # Module racine
│   │   ├── config/         # Vérification des variables d'environnement
│   │   ├── common/         # AccessService (contrôle d'accès workspace/projet)
│   │   ├── health/         # GET /api/health
│   │   ├── prisma/         # Module + service Prisma
│   │   ├── auth/           # Auth (JWT, 2FA, OAuth)
│   │   ├── workspaces/     # CRUD workspaces + membres
│   │   ├── projects/       # Projets + colonnes
│   │   ├── tasks/          # CRUD tâches + déplacement + assignation
│   │   ├── comments/       # Commentaires
│   │   ├── notifications/  # Fil de notifications
│   │   ├── sprints/ milestones/ timetracking/ analytics/
│   │   ├── search/ saved-filters/ api-keys/
│   │   └── realtime/       # Passerelle WebSocket (désactivée sur Vercel)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx        # Point d'entrée React
│   │   ├── App.tsx         # Routeur + garde d'authentification
│   │   ├── lib/            # api.ts (Axios), socket.ts (Socket.io), utils.ts
│   │   ├── types/          # Interfaces TypeScript
│   │   ├── stores/         # auth.ts, project.ts (Zustand)
│   │   ├── layouts/        # DashboardLayout
│   │   ├── components/     # layout/, views/ (Kanban, Liste, Calendrier, Timeline, Gantt), TaskCard, TaskDetailModal
│   │   └── pages/          # Login, Register, Dashboard, Project, ProjectSprints, ProjectAnalytics, Settings, Team
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── vercel.json             # Config Vercel (mode 1 projet)
├── DEPLOYMENT.md
└── package.json
```

## 🚀 Démarrage

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ *(optionnel, temps réel)*

### Démarrage rapide

```bash
# Cloner
git clone <url-du-repo>
cd taskforge

# Installer les dépendances (workspaces)
npm install

# Configurer le backend
cd backend
cp .env.example .env
# Renseigne DATABASE_URL, DIRECT_URL, JWT_SECRET et JWT_REFRESH_SECRET dans .env
npx prisma generate
npx prisma db push
npx prisma db seed
cd ..

# Lancer frontend + backend ensemble
npm run dev
# App : http://localhost:3000   API : http://localhost:4000/api
```

### Avec Docker

```bash
docker-compose up -d
# App :     http://localhost:3000
# API :     http://localhost:4000/api
# Swagger : http://localhost:4000/api/docs
```

### Identifiants de démo

```
john@taskforge.io / password123 (Owner)
sarah@taskforge.io / password123 (Admin)
alex@taskforge.io / password123 (Member)
```

## 📡 Endpoints de l'API

### Santé
- `GET /api/health` — État de l'API et de la base de données

### Auth
- `POST /api/auth/register` — Créer un compte
- `POST /api/auth/login` — Connexion (renvoie un JWT)
- `POST /api/auth/refresh` — Rafraîchir le jeton
- `POST /api/auth/2fa/setup` — Configurer le TOTP
- `POST /api/auth/2fa/verify` — Vérifier le 2FA

### Workspaces
- `GET /api/workspaces` — Workspaces de l'utilisateur
- `GET /api/workspaces/:id` — Détail d'un workspace
- `POST /api/workspaces/:id/invite` — Inviter un membre

### Projets
- `GET /api/projects?workspaceId=` — Lister les projets
- `GET /api/projects/:id` — Projet avec colonnes et tâches
- `POST /api/projects` — Créer un projet
- `POST /api/projects/:id/columns` — Ajouter une colonne

### Tâches
- `GET /api/tasks?projectId=` — Lister les tâches (filtrable)
- `GET /api/tasks/:id` — Détail d'une tâche
- `POST /api/tasks` — Créer une tâche
- `PATCH /api/tasks/:id` — Modifier une tâche
- `POST /api/tasks/:id/move` — Déplacer une tâche (Kanban)
- `POST /api/tasks/:id/assign` — Assigner un utilisateur

### Commentaires
- `GET /api/comments?taskId=` — Commentaires d'une tâche
- `POST /api/comments` — Ajouter un commentaire

### Notifications
- `GET /api/notifications` — Fil de notifications
- `POST /api/notifications/read-all` — Tout marquer comme lu

La documentation complète est disponible sur `/api/docs` (Swagger).

## 🔌 Événements WebSocket

*Disponibles uniquement si le backend tourne sur un serveur persistant (Docker, Render, Railway, Fly) et que `VITE_WS_URL` est défini.*

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `join:workspace` | → Serveur | Rejoindre la room du workspace |
| `join:project` | → Serveur | Rejoindre la room du projet |
| `task:move` | → Serveur | Diffuser un déplacement de tâche |
| `task:moved` | ← Client | Recevoir un déplacement de tâche |
| `task:update` | → Serveur | Diffuser une mise à jour de tâche |
| `task:updated` | ← Client | Recevoir une mise à jour de tâche |
| `comment:new` | → Serveur | Diffuser un nouveau commentaire |
| `comment:added` | ← Client | Recevoir un nouveau commentaire |
| `cursor:move` | → Serveur | Diffuser la position du curseur |
| `cursor:moved` | ← Client | Recevoir la position du curseur |
| `users:online` | ← Client | Liste des utilisateurs en ligne |

