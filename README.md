# ⚡ TaskForge — SaaS Collaborative Task Management

> A full-featured task management platform with Kanban boards, real-time collaboration, multiple views, and AI-powered features.

![NestJS](https://img.shields.io/badge/NestJS-10-red) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-sky) ![Prisma](https://img.shields.io/badge/Prisma-6-teal) ![License](https://img.shields.io/badge/License-MIT-green)

> 🚀 **Déploiement sur Vercel (2 domaines séparés)** : voir [`DEPLOYMENT.md`](./DEPLOYMENT.md) pour le guide complet (backend serverless + frontend, PostgreSQL/Prisma, CORS).

## ✨ Features

### 📋 Task Management
- **Kanban Board** — Drag & drop tasks between columns (dnd-kit)
- **List View** — Tabular task view with sorting and filtering
- **Calendar View** — Monthly calendar with task placement
- **Timeline View** — Horizontal timeline for date-based tasks
- **Gantt Chart** — Project timeline with progress bars and dependencies
- **Task Details** — Rich modal with description, checklist, comments, activity log
- **Sub-tasks** — Nested task hierarchy
- **Priority Levels** — Urgent, High, Medium, Low, None
- **Labels** — Custom color-coded labels
- **Checklist** — Within-task checklist items
- **Attachments** — File upload support

### 👥 Collaboration
- **Real-time Sync** — Socket.io WebSocket for live updates
- **Comments** — Threaded comments on tasks
- **Live Cursors** — See where teammates are working
- **Typing Indicators** — Know when someone is typing
- **Activity Feed** — Full audit log of all changes
- **@Mentions** — Tag team members in comments

### 🏢 Multi-Tenant
- **Workspaces** — Isolated data per workspace
- **Teams** — Organize members into teams
- **Projects** — Multiple projects per workspace
- **Invitations** — Email-based invite system
- **RBAC** — Owner, Admin, Member, Viewer roles

### 🔐 Security
- **JWT Auth** — Access + Refresh token flow
- **OAuth** — Google & GitHub social login
- **Two-Factor Auth** — TOTP-based 2FA
- **Password Hashing** — bcrypt with 12 rounds
- **CORS** — Configurable origin policy

### 🔔 Notifications
- **In-App** — Real-time notification feed
- **Configurable** — Per-notification-type settings
- **Mark Read** — Individual or bulk mark-as-read

### 🏃 Agile & Suivi (nouveau)
- **Sprints** — planification, activation, burndown chart
- **Milestones** — jalons de projet avec date d'échéance
- **Time Tracking** — logguer du temps par tâche, résumé par membre/projet
- **Dépendances entre tâches** — "bloque" / "bloqué par"
- **Analytics** — taux de complétion, retards, charge par membre, tendance 14 jours
- **Recherche globale** — palette de commandes (Cmd+K)
- **Filtres sauvegardés** — personnels ou partagés
- **Clés API** — intégrations externes (clé hashée SHA-256)
- **Export CSV** — export des tâches d'un projet

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS 10 |
| **Language** | TypeScript 5.6 |
| **ORM** | Prisma 6 (16 models) |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Real-time** | Socket.io 4 |
| **Auth** | Passport JWT + bcryptjs + otplib |
| **API Docs** | Swagger (OpenAPI) |
| **Deploy** | Docker |

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18.3 + Vite 5 |
| **Language** | TypeScript 5.6 |
| **Styling** | TailwindCSS 3.4 |
| **Drag & Drop** | @dnd-kit/core + sortable |
| **Animations** | Framer Motion 11 |
| **State** | Zustand 5 |
| **HTTP** | Axios |
| **Routing** | React Router 6 |
| **Real-time** | socket.io-client |
| **Dates** | date-fns 4 |
| **Toasts** | react-hot-toast |
| **Deploy** | Nginx + Docker |

## 📁 Project Structure

```
taskforge/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 16 models
│   │   └── seed.ts             # Demo data seeder
│   ├── src/
│   │   ├── main.ts             # NestJS bootstrap + Swagger
│   │   ├── app.module.ts       # Root module
│   │   ├── prisma/             # Prisma module + service
│   │   ├── auth/               # Auth (JWT, 2FA, OAuth)
│   │   ├── workspaces/         # Workspace CRUD + members
│   │   ├── projects/           # Projects + columns
│   │   ├── tasks/              # Tasks CRUD + move + assign
│   │   ├── comments/           # Threaded comments
│   │   ├── notifications/      # Notification feed
│   │   └── realtime/           # WebSocket gateway
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # React entry
│   │   ├── App.tsx             # Router + auth guard
│   │   ├── index.css           # Tailwind + globals
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios + auth interceptors
│   │   │   ├── socket.ts       # Socket.io client
│   │   │   └── utils.ts        # Utilities + priority colors
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript interfaces
│   │   ├── stores/
│   │   │   ├── auth.ts         # Auth state (Zustand)
│   │   │   └── project.ts      # Project/board state
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Header
│   │   │   ├── views/          # KanbanBoard, ListView,
│   │   │   │                   # CalendarView, TimelineView,
│   │   │   │                   # GanttView
│   │   │   ├── TaskCard.tsx    # Kanban task card
│   │   │   └── TaskDetailModal.tsx # Task detail modal
│   │   └── pages/
│   │       ├── Login.tsx       # Login + OAuth
│   │       ├── Register.tsx    # Registration
│   │       ├── Dashboard.tsx   # Overview + stats
│   │       ├── Project.tsx     # Project view (5 views)
│   │       ├── Settings.tsx    # All settings tabs
│   │       └── Team.tsx        # Team management
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Quick Start

```bash
# Clone
git clone <repo-url>
cd taskforge

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma generate
npx prisma db push
npx prisma db seed

# Start backend
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

### With Docker

```bash
docker-compose up -d
# App: http://localhost:3000
# API: http://localhost:4000
# Swagger: http://localhost:4000/api/docs
```

### Demo Credentials

```
john@taskforge.io / password123 (Owner)
sarah@taskforge.io / password123 (Admin)
alex@taskforge.io / password123 (Member)
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login (returns JWT)
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/2fa/setup` — Setup TOTP
- `POST /api/auth/2fa/verify` — Verify 2FA

### Workspaces
- `GET /api/workspaces` — User's workspaces
- `GET /api/workspaces/:id` — Workspace details
- `POST /api/workspaces/:id/invite` — Invite member

### Projects
- `GET /api/projects?workspaceId=` — List projects
- `GET /api/projects/:id` — Project with columns & tasks
- `POST /api/projects` — Create project
- `POST /api/projects/:id/columns` — Add column

### Tasks
- `GET /api/tasks?projectId=` — List tasks (filterable)
- `GET /api/tasks/:id` — Task detail
- `POST /api/tasks` — Create task
- `PATCH /api/tasks/:id` — Update task
- `POST /api/tasks/:id/move` — Move task (Kanban)
- `POST /api/tasks/:id/assign` — Assign user

### Comments
- `GET /api/comments?taskId=` — Task comments
- `POST /api/comments` — Add comment

### Notifications
- `GET /api/notifications` — Notification feed
- `POST /api/notifications/read-all` — Mark all read

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:workspace` | → Server | Join workspace room |
| `join:project` | → Server | Join project room |
| `task:move` | → Server | Broadcast task move |
| `task:moved` | ← Client | Receive task move |
| `task:update` | → Server | Broadcast task update |
| `task:updated` | ← Client | Receive task update |
| `comment:new` | → Server | Broadcast new comment |
| `comment:added` | ← Client | Receive new comment |
| `cursor:move` | → Server | Broadcast cursor position |
| `cursor:moved` | ← Client | Receive cursor position |
| `users:online` | ← Client | Online users list |

## 📜 License

MIT — Built with ❤️ by TaskForge team.
