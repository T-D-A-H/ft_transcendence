<div align="center">

# 🏓 ft_transcendence

### The Final Project of the 42 Common Core

![42 School](https://img.shields.io/badge/42-Madrid-000000?style=for-the-badge&logo=42&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)

*A full-stack single-page application bringing the legendary Pong game online — featuring real-time multiplayer, an AI opponent, live chat, blockchain score storage, and much more.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Modules Implemented](#-modules-implemented)
- [Architecture](#-architecture)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [Team](#-team)

---

## 🧭 Overview

**ft_transcendence** is the final mandatory project of the 42 School Common Core. The goal is to build a complete, production-ready web platform from scratch using technologies intentionally imposed by the subject — many of them unfamiliar at the start of development.

The platform allows users to compete in real-time Pong matches (in-browser and via CLI), participate in tournaments, socialize through a live chat system, track their statistics on detailed dashboards, and have their tournament scores permanently recorded on the **Avalanche blockchain**.

This project was completed with **7 major modules and 7 minor modules**, well above the 7-major-module minimum required for full marks.

> *"The superficial purpose is a Pong game. The real purpose is to build something you have never built before, with tools you have never used before."*

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | TypeScript, Tailwind CSS |
| **Backend** | Fastify, Node.js, TypeScript |
| **Database** | SQLite |
| **Real-time** | WebSockets |
| **Auth** | JWT, OAuth 2.0, TOTP (2FA) |
| **Blockchain** | Avalanche (testnet), Solidity |
| **AI** | Custom AI opponent (no A*) |
| **Observability** | ELK Stack (Elasticsearch, Logstash, Kibana) |
| **Monitoring** | Prometheus + Grafana |
| **Containerization** | Docker, Docker Compose |
| **i18n** | Multi-language support (3+ languages) |

---

## ✅ Modules Implemented

This project implements the following modules from the subject:

### Web *(1 Major + 2 Minor)*
| Type | Module |
|---|---|
| ⭐ Major | Use **Fastify with Node.js** as the backend framework |
| Minor | Use **TypeScript + Tailwind CSS** as the frontend toolkit |
| Minor | Use **SQLite** as the backend database |

### Blockchain *(1 Major)*
| Type | Module |
|---|---|
| ⭐ Major | Store tournament scores on the **Avalanche** blockchain using **Solidity** smart contracts |

### User Management *(2 Major)*
| Type | Module |
|---|---|
| ⭐ Major | Standard user management — registration, login, avatars, friends, match history, stats |
| ⭐ Major | Remote authentication via **OAuth 2.0** |

### Gameplay & User Experience *(2 Major + 1 Minor)*
| Type | Module |
|---|---|
| ⭐ Major | **Remote players** — two players on separate machines playing in real-time |
| ⭐ Major | **Additional game** with user history and matchmaking |
| Minor | **Game customization** options (power-ups, maps, etc.) |

### AI-Algo *(1 Major + 1 Minor)*
| Type | Module |
|---|---|
| ⭐ Major | **AI opponent** — simulates human behavior with 1-second view refresh, no A* |
| Minor | **User and game stats dashboards** with charts and historical data |

### Cybersecurity *(1 Major)*
| Type | Module |
|---|---|
| ⭐ Major | **Two-Factor Authentication (2FA)** and **JWT** for secure session management |

### DevOps *(1 Major + 1 Minor)*
| Type | Module |
|---|---|
| ⭐ Major | **ELK Stack** infrastructure for centralized log management |
| Minor | **Prometheus + Grafana** monitoring system |

### Accessibility *(1 Minor)*
| Type | Module |
|---|---|
| Minor | **Multi-language support** — 3+ languages with an in-app language switcher |

### Server-Side Pong *(1 Major)*
| Type | Module |
|---|---|
| ⭐ Major | **Server-side Pong** with REST API — game logic handled on the server, playable via CLI |

**Total: 7 Major + 7 Minor modules** *(equivalent to 10.5 major modules)*

---

## 🏗 Architecture

The entire application is orchestrated via **Docker Compose** and launched with a single command.

```
┌──────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                                                              │
│  ┌───────────┐    ┌────────────┐    ┌─────────────────────┐  │
│  │   Nginx   │───▶│  Frontend  │    │  Backend (Fastify)  │  │
│  │ (Reverse  │    │ TypeScript │    │  Node.js / JWT      │  │
│  │  Proxy)   │    │ Tailwind   │    │  WebSockets / API   │  │
│  └───────────┘    └────────────┘    └──────────┬──────────┘  │
│        │                                       │             │
│        └───────────────────────────────────────┘             │
│                                                │             │
│                                    ┌───────────▼──────────┐  │
│                                    │   SQLite Database    │  │
│                                    └──────────────────────┘  │
│                                                              │
│  ┌───────────────────┐    ┌────────────────────────────────┐ │
│  │    ELK Stack      │    │     Prometheus + Grafana       │ │
│  │  Elasticsearch    │    │     Metrics & Alerting         │ │
│  │  Logstash, Kibana │    └────────────────────────────────┘ │
│  └───────────────────┘                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           Avalanche Testnet (Blockchain)             │    │
│  │           Solidity Smart Contracts                   │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

- **Nginx** handles SSL termination (HTTPS/WSS) and reverse-proxies to the SPA and the API.
- **Fastify** serves the REST API and manages WebSocket connections for real-time gameplay and chat.
- **SQLite** stores all persistent data — users, matches, stats, channels.
- **Avalanche** testnet permanently records tournament results via Solidity smart contracts.
- **ELK** aggregates and visualizes all service logs; **Prometheus + Grafana** handles metrics and alerting.

---

## ✨ Features

### 🎮 Pong — Server-Side with API
- Game logic runs entirely on the server, making it cheat-proof and API-accessible.
- Playable via the **browser** or a **CLI client** against web users.
- Tournaments with bracket display and automatic matchmaking announcements.
- Game customization: power-ups, map selection, speed settings.
- Full **remote multiplayer** — two players on separate machines in real-time.

### 🤖 AI Opponent
- Custom-built AI that simulates human behavior — it can only refresh its game view **once per second**, forcing it to predict ball trajectories and anticipate bounces.
- The A* algorithm is explicitly **not used**, in compliance with subject constraints.
- The AI uses power-ups when game customization is enabled.
- Fully capable of winning; logic is auditable and explainable during evaluation.

### 🎲 Additional Game
- A second game distinct from Pong, with its own matchmaking system, user history, and leaderboard.

### ⛓ Blockchain Score Storage
- Tournament scores are stored on the **Avalanche testnet** via Solidity smart contracts.
- Provides a transparent, tamper-proof, and immutable record of competitive results.
- Smart contract interactions are handled server-side from the Fastify backend.

### 👤 User Management
- Secure registration and login with **bcrypt-hashed** passwords.
- **OAuth 2.0** remote authentication.
- **JWT-based** session management with protected API routes.
- **Two-Factor Authentication (2FA)** via TOTP (e.g. Google Authenticator).
- Customizable profiles: display name, avatar upload, biography.
- Friend system with real-time **online / offline / in-game** status.
- Match history and per-user statistics visible on every profile.

### 📊 Dashboards
- Per-user stats: win rate, Elo history, game count, win/loss ratio.
- Per-session stats: match outcome, rally lengths, score breakdown.
- Data visualized with charts and graphs for an intuitive overview.

### 🌍 Internationalization
- Full multi-language support for **3+ languages** with an in-app language switcher.
- All navigation menus, headings, and key UI elements are fully translated.

### 🔍 Observability
- **ELK Stack**: Elasticsearch + Logstash + Kibana for centralized log aggregation and search across all containers.
- **Prometheus + Grafana**: real-time system metrics, custom dashboards, and alerting rules.

### 🔒 Security
- All passwords hashed with **bcrypt**.
- Protection against **SQL injection** and **XSS** attacks.
- Mandatory **HTTPS / WSS** — all traffic is encrypted end-to-end.
- Server-side validation of all forms and user input.
- JWT tokens signed and validated securely; all API routes requiring auth are protected.
- All credentials and API keys stored in `.env` — never committed to version control.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) `>= 24.x`
- [Docker Compose](https://docs.docker.com/compose/) `>= 2.x`
- `make`

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/<your-org>/ft_transcendence.git
cd ft_transcendence
```

**2. Configure environment variables**

```bash
cp .env.example .env
# Fill in your values — see the Environment Variables section below
```

**3. Build and launch everything**

```bash
make
```

**4. Open the application**

Navigate to [https://localhost](https://localhost) in your browser (Mozilla Firefox recommended).

### Makefile Targets

| Command | Description |
|---|---|
| `make` | Build and start all containers |
| `make up` | Start containers without rebuilding |
| `make down` | Stop and remove containers |
| `make clean` | Stop containers and remove volumes |
| `make fclean` | Full cleanup including built images |
| `make logs` | Stream logs from all running services |
| `make ps` | Display running container status |

---

## 🔐 Environment Variables

Create a `.env` file at the root of the project based on `.env.example`:

```env
# SQLite
DATABASE_PATH=./data/transcendence.db

# Fastify Backend
BACKEND_PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600s

# OAuth 2.0
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_CALLBACK_URL=https://localhost/api/auth/callback

# 2FA (TOTP)
TOTP_APP_NAME=ft_transcendence

# Blockchain (Avalanche testnet)
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SMART_CONTRACT_ADDRESS=your_deployed_contract_address
DEPLOYER_PRIVATE_KEY=your_wallet_private_key

# Frontend
VITE_API_URL=https://localhost/api
VITE_WS_URL=wss://localhost

# ELK Stack
ELASTICSEARCH_HOST=http://elasticsearch:9200
LOGSTASH_PORT=5044

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

> ⚠️ **Never commit your `.env` file.** It is included in `.gitignore` by default.

---

## 📡 API Reference

All endpoints are served under `/api`. The server-side Pong game is also accessible via this API, enabling CLI gameplay.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `GET` | `/api/auth/oauth` | ❌ | Initiate OAuth 2.0 flow |
| `POST` | `/api/auth/2fa/verify` | ✅ | Verify TOTP code |
| `GET` | `/api/users/me` | ✅ | Get own profile |
| `PATCH` | `/api/users/me` | ✅ | Update profile / avatar |
| `GET` | `/api/users/:id` | ✅ | Get public user profile |
| `GET` | `/api/users/:id/history` | ✅ | Get match history |
| `GET` | `/api/users/:id/stats` | ✅ | Get user statistics |
| `POST` | `/api/friends/:id` | ✅ | Send a friend request |
| `GET` | `/api/leaderboard` | ✅ | Fetch global Elo rankings |
| `POST` | `/api/pong/init` | ✅ | Initialize a Pong game session |
| `GET` | `/api/pong/state/:gameId` | ✅ | Get current game state (CLI-compatible) |
| `POST` | `/api/pong/input` | ✅ | Send player input (CLI-compatible) |
| `GET` | `/api/tournament` | ✅ | Get active tournament bracket |
| `GET` | `/api/blockchain/scores` | ✅ | Fetch scores recorded on the blockchain |

---

## 🔌 WebSocket Events

The backend exposes a WebSocket server for real-time game state and chat.

### Game namespace

| Event | Direction | Description |
|---|---|---|
| `join_queue` | Client → Server | Enter matchmaking |
| `leave_queue` | Client → Server | Cancel matchmaking |
| `game_found` | Server → Client | Match found, game is starting |
| `player_input` | Client → Server | Send paddle direction |
| `game_state` | Server → Client | Authoritative game state broadcast |
| `game_over` | Server → Client | Match result and final score |

### Chat namespace

| Event | Direction | Description |
|---|---|---|
| `send_message` | Client → Server | Send a message to a channel or DM |
| `new_message` | Server → Client | Receive a new message |
| `user_status` | Server → Client | Friend online / offline / in-game update |
| `game_invite` | Client → Server | Invite a user to a Pong match via chat |
| `tournament_notify` | Server → Client | Next match announcement for tournament players |

---

## 👥 Team

Built by a team of 5 students from **42 Madrid**:

| Name | GitHub | Responsibilities |
|---|---|---|
| Jaimesan | [@handle](https://github.com/) | Backend (Fastify, API, WebSockets) |
| Ctommasi | [@handle](https://github.com/) | Frontend (TypeScript, Tailwind CSS) |
| Student 3 | [@handle](https://github.com/) | Game Engine & AI Opponent |
| Student 4 | [@handle](https://github.com/) | Auth (JWT, OAuth, 2FA) & Blockchain |
| Student 5 | [@handle](https://github.com/) | DevOps (Docker, ELK, Prometheus/Grafana) |

---

<div align="center">

Made with ❤️ at **42 Madrid**

*"Look at you now; it's time to shine!"*

</div>
