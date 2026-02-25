# 🏓 ft_transcendence

> **The ultimate final project of the 42 core curriculum. A fully functional, modular single-page application (SPA) featuring real-time multiplayer games, Avalanche blockchain integration, AI opponents, and robust ELK/Prometheus infrastructure.**

[![42 Madrid](https://img.shields.io/badge/42-Madrid-black?style=flat-square&logo=42)](https://42madrid.com/)
[![Score](https://img.shields.io/badge/Score-125%2F100-success?style=flat-square)](#)

## 📑 Table of Contents
* [About the Project](#-about-the-project)
* [🏆 Achieved Modules](#-achieved-modules)
* [✨ Key Features](#-key-features)
* [💻 Tech Stack (Strict Requirements)](#-tech-stack-strict-requirements)
* [🏗 Architecture & DevOps](#-architecture--devops)
* [🛠 Getting Started](#-getting-started)
* [🤝 The Team](#-the-team)

---

## 🚀 About the Project

**ft_transcendence** is the capstone project of the 42 school curriculum. Following the strict modular requirements of version 18.0, this project discards standard paradigms in favor of specific technology constraints to test adaptability and system design.

Our application replaces the classic game of Pong with a fully server-side validated engine, introduces a secondary custom game, implements blockchain technology (Avalanche) to permanently store tournament results, features an AI opponent, and deploys a production-ready infrastructure with comprehensive log management and monitoring.

---

## 🏆 Achieved Modules

This project successfully implements the required minimum of 7 Major Modules (we implemented 8) alongside 5 Minor Modules.

### Major Modules (8)
* **Web:** Use a framework to build the backend (Node.js/Fastify).
* **Web:** Store the score of a tournament in the Blockchain (Avalanche/Solidity).
* **User Management:** Standard user management, authentication, users across tournaments.
* **User Management:** Implementing a remote authentication (OAuth 2.0).
* **Gameplay:** Remote players (Multiplayer integration).
* **Gameplay:** Add another game with user history and matchmaking.
* **AI-Algo:** Introduce an AI opponent (Simulated inputs, no A* algorithm).
* **Cybersecurity:** Implement Two-Factor Authentication (2FA) and JWT.
* **DevOps:** Infrastructure setup for log management (ELK Stack).
* **Server-Side Pong:** Replace basic Pong with server-side Pong and implement an API.

### Minor Modules (5)
* **Web:** Use a framework or a toolkit to build the frontend (TypeScript + Tailwind CSS).
* **Web:** Use a database for the backend (SQLite).
* **Gameplay:** Game customization options (Maps, power-ups, default modes).
* **AI-Algo:** User and game stats dashboards.
* **DevOps:** Monitoring system (Prometheus + Grafana).
* **Accessibility:** Supports multiple languages (i18n).

---

## ✨ Key Features

### 🎮 Gameplay & AI
* **Server-Side Pong Engine:** The core game logic runs entirely on the backend via our custom API, preventing client-side cheating and syncing via WebSockets.
* **Dual Game Experience:** Play classic Pong or try our completely new custom game, complete with independent matchmaking and history.
* **AI Opponent:** A custom-built Artificial Intelligence that simulates keyboard inputs and anticipates bounces (strictly built without A*).
* **Deep Customization:** Personalize your gaming experience with custom maps, modifiers, and visual tweaks.

### ⛓️ Web3 & Blockchain Tournaments
* **Avalanche Integration:** Tournament scores and outcomes are securely deployed and stored on an Avalanche testing blockchain via Solidity smart contracts, ensuring permanent, tamper-proof match histories.

### 📊 Dashboards & Internationalization
* **Advanced Statistics:** Comprehensive user dashboards displaying win/loss ratios, match history, and performance metrics across both games.
* **Multilingual (i18n):** The entire application UI is available in multiple languages, easily toggled by the user.

### 🔒 Security & Identity
* **OAuth & JWT:** Secure login flow using remote authentication (42 Intranet API), protected by JSON Web Tokens.
* **2FA Setup:** Enhanced account security using Two-Factor Authentication.

---

## 💻 Tech Stack (Strict Requirements)

Following the strict constraints of the subject v18.0, the following technologies were mandatory for our chosen modules:

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | TypeScript, Tailwind CSS (Single Page Application) |
| **Backend Framework** | Node.js with Fastify |
| **Database** | SQLite |
| **Blockchain** | Avalanche (Testnet), Solidity |
| **DevOps & Infra** | Docker, Docker Compose |
| **Log Management** | ELK Stack (Elasticsearch, Logstash, Kibana) |
| **Monitoring** | Prometheus, Grafana |

---

## 🏗 Architecture & DevOps

The application is fully containerized using Docker, complying with the requirement to launch everything via a single command. 

* **Log Management (ELK):** Centralized logging infrastructure captures backend requests, authentication attempts, and game state changes. Logstash processes data, Elasticsearch indexes it, and Kibana visualizes it.
* **System Monitoring:** Prometheus scrapes live health-checks, resource usage, and traffic metrics, which are visualized in real-time through custom Grafana dashboards.

---

## 🛠 Getting Started

### Prerequisites
* `make`
* `Docker`
* `Docker Compose`

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)[your-username]/ft_transcendence.git
   cd ft_transcendence
