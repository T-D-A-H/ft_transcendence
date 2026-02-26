<div align="center">

# ft_transcendence

### 42 Madrid — Common Core Final Project

![42 School](https://img.shields.io/badge/42-Madrid-000000?style=for-the-badge&logo=42&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API](#api)
- [Team](#team)

---

## Overview

ft_transcendence is the final project of the 42 Common Core. The objective is to build a complete web platform from scratch using a set of technologies imposed by the subject — most of them new at the start of development.

The platform lets users play real-time Pong matches against each other (from the browser or via CLI), organize tournaments, chat, and track stats through dashboards. Tournament scores are stored permanently on the Avalanche blockchain via a Solidity smart contract.

The project was completed with **7 major modules and 7 minor modules**, equivalent to 10.5 major modules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, Tailwind CSS |
| Backend | Fastify, Node.js |
| Database | SQLite |
| Real-time | WebSockets |
| Auth | JWT, Google OAuth 2.0, TOTP (2FA), SMTP |
| Blockchain | Avalanche Fuji testnet, Solidity, Hardhat, viem |
| AI | Custom AI opponent |
| Log management | Elasticsearch, Logstash, Kibana |
| Monitoring | Prometheus, Grafana |
| Containerization | Docker, Docker Compose |
| Reverse proxy | Nginx |
| i18n | Multi-language support (3+ languages) |

---

## Modules

**7 Major + 7 Minor** — equivalent to 10.5 major modules

![Web](https://img.shields.io/badge/Web-3_modules-0ea5e9?style=flat-square)
![Blockchain](https://img.shields.io/badge/Blockchain-1_module-E84142?style=flat-square)
![User_Management](https://img.shields.io/badge/User_Management-2_modules-8b5cf6?style=flat-square)
![Gameplay](https://img.shields.io/badge/Gameplay-3_modules-22c55e?style=flat-square)
![AI](https://img.shields.io/badge/AI-2_modules-f59e0b?style=flat-square)
![Security](https://img.shields.io/badge/Security-1_module-ef4444?style=flat-square)
![DevOps](https://img.shields.io/badge/DevOps-2_modules-64748b?style=flat-square)
![Accessibility](https://img.shields.io/badge/Accessibility-1_module-14b8a6?style=flat-square)
![Server_Pong](https://img.shields.io/badge/Server--Side_Pong-1_module-f97316?style=flat-square)

| Category | Type | Module |
|---|---|---|
| Web | Major | Fastify + Node.js backend framework |
| Web | Minor | TypeScript + Tailwind CSS frontend |
| Web | Minor | SQLite database |
| Blockchain | Major | Tournament scores on Avalanche Fuji via `TournamentScores.sol` |
| User Management | Major | Registration, login, avatars, friends, match history, stats |
| User Management | Major | Remote authentication via Google OAuth 2.0 |
| Gameplay | Major | Remote players — two machines, real-time |
| Gameplay | Major | Additional game with matchmaking and user history |
| Gameplay | Minor | Game customization — themes, power-ups |
| AI | Major | AI opponent, 1s view refresh, no A* |
| AI | Minor | User and game stats dashboards |
| Cybersecurity | Major | Two-Factor Authentication (2FA) and JWT |
| DevOps | Major | ELK stack for centralized log management |
| DevOps | Minor | Prometheus + Grafana monitoring |
| Accessibility | Minor | Multi-language support with language switcher |
| Server-Side Pong | Major | Server-side Pong with REST API, playable via CLI |

---

## Architecture

Everything runs inside Docker and starts with a single command.

```
                    [ Browser ]  [ CLI ]
                         |          |
                      HTTPS      HTTPS/REST
                         |          |
                  +------+----------+------+
                  |           Nginx        |
                  |  reverse proxy + SSL   |
                  +----------+-------------+
                             |
              +--------------+--------------+
              |                             |
    +---------+--------+       +-----------+----------+
    |     Frontend     |       |        Backend        |
    |  TypeScript +    |       |  Fastify  /  WSS      |
    |  Tailwind CSS    |       |  REST API  /  JWT     |
    +------------------+       +-----------+-----------+
                                           |
                               +-----------+-----------+
                               |         SQLite        |
                               +-----------------------+

    +------------------------+    +----------------------+
    |       ELK Stack        |    |  Prometheus + Grafana |
    |  Elasticsearch         |    |  metrics / alerting   |
    |  Logstash  /  Kibana   |    +----------------------+
    +------------------------+

    +--------------------------------------------------+
    |           Avalanche Fuji Testnet                 |
    |    TournamentScores.sol   (Hardhat + viem)       |
    +--------------------------------------------------+
```

Nginx handles SSL termination and routes traffic to the frontend SPA and the backend API. The backend writes structured logs consumed by Logstash and indexed in Elasticsearch, visible in Kibana. Prometheus scrapes service metrics and displays them in Grafana. Tournament scores are written to a Solidity smart contract deployed on the Avalanche Fuji testnet via Hardhat.

---

## Getting Started

**Requirements**

- Docker >= 24.x
- Docker Compose >= 2.x
- make

**Steps**

```bash
git clone git@github.com:T-D-A-H/ft_transcendencer.git
cd ft_transcendencer
make
```

Open [https://localhost](https://localhost) in Mozilla Firefox.

**Makefile targets**

| Command | Description |
|---|---|
| `make` | Build and start all containers |
| `make up` | Start without rebuilding |
| `make down` | Stop and remove containers |
| `make clean` | Stop containers and remove volumes |
| `make fclean` | Remove containers, volumes, and images |
| `make logs` | Tail logs from all services |
| `make ps` | Show container status |

---

## Environment Variables

Two `.env` files are required. Neither should ever be committed.

> Sensitive values are marked as `your_*`. Replace them before running the project.

---

### `backend/.env` — root level

Used by the backend and blockchain containers.

```env
# ── Auth ──────────────────────────────────────────────────────────
JWT_SECRET=your_jwt_secret

# ── Email (2FA code delivery) ─────────────────────────────────────
SMTP_USER=your_smtp_email
SMTP_PASS=your_smtp_app_password

# ── Google OAuth 2.0 ──────────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Blockchain — Avalanche ────────────────────────────────────────
PRIVATE_KEY=your_wallet_private_key
WALLET_ADDRESS=your_wallet_address
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc
CONTRACT_ADDRESS=your_deployed_contract_address
```

---

### `ops/.env` — ELK + monitoring

Used by the ELK and Grafana/Prometheus containers.

```env
# ── Elasticsearch ─────────────────────────────────────────────────
ELASTIC_PASSWORD=your_elastic_password
ES_JAVA_OPTS=-Xms512m -Xmx512m
XPACK_SECURITY_ENABLED=true
XPACK_MONITORING_ENABLED=true

# ── Kibana ────────────────────────────────────────────────────────
KIBANA_SYSTEM_PASSWORD=your_kibana_system_password
KIBANA_ENCRYPTION_KEY=your_32char_random_key

# ── Logstash ──────────────────────────────────────────────────────
LOGSTASH_SYSTEM_PASSWORD=your_logstash_system_password
LOGSTASH_WRITER_PASSWORD=your_logstash_writer_password

# ── Grafana ───────────────────────────────────────────────────────
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=your_grafana_password
GF_USERS_ALLOW_SIGN_UP=false
GF_SERVER_HTTP_PORT=3001
```

**Service URLs once running**

| Service | URL |
|---|---|
| Application | https://localhost:4000    |
| Database    | http://localhost:5001     |
| Kibana      | https://localhost/kibana  |
| Grafana     | https://localhost/grafana |

---

## API

The backend exposes a REST API under `/api`. All routes that require authentication expect a valid JWT in the `Authorization` header.

| Group | Routes |
|---|---|
| `/api/users` | registration, profile updates, avatar, 2FA setup |
| `/api/sessions` | login, logout, 2FA verification, Google OAuth callback |
| `/api/friends` | friend requests, friend list, online status |
| `/api/matches` | create, join, invite, start, result, history |
| `/api/tournaments` | create, join, bracket, start, details |
| `/api/games` | server-side game state and paddle input |

The `/api/games` endpoints mirror the browser game logic, so a CLI client can join and play against a web user by polling game state and posting move inputs.

---

## Team

Built by a team of 5 students from **42 Madrid**:

| Name | GitHub | Responsibilities |
|---|---|---|
| jaimesan  | [@handle](https://github.com/Ja1m3st)      | Backend (Fastify, API, WebSockets), Auth (JWT, OAuth, 2FA), Docker, Basic Stats      |
| ctommasi  | [@handle](https://github.com/vikingokvist) | Frontend (TypeScript, Tailwind CSS), Game Engin, Backend (Fastify, API, WebSockets)  |
| luis      | [@handle](https://github.com/)             |  AI Opponent & Graphic Stats                                                         |
| jesus     | [@handle](https://github.com/)             |  Blockchain & DevOps (ELK, Prometheus/Grafana)                                       |

---

<div align="center">
42 Madrid
</div>
