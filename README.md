# 🖥️ Retro Console Task Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A retro-style task manager with a terminal interface. Created for those who love the aesthetics of old computer terminals and efficient task management.

## ✨ Features

- 🎨 **Retro Design** - Authentic old terminal look
- ⚡ **Speed** - Minimalist interface without unnecessary elements
- 🐳 **Docker Ready** - Easy deployment in containers
- 📱 **Responsive** - Works on all devices
- 💾 **File Database** - Simple JSON files for storage

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Run with Docker
docker-compose -f docker-compose.dev.yml up --build

# Open browser: http://localhost:3000
```

### Local Installation

```bash
# Install dependencies
npm install

# Start server
npm run dev
```

## 🐳 Docker Commands

```bash
# Start container
docker-compose -f docker-compose.dev.yml up

# Stop container
docker-compose -f docker-compose.dev.yml down

# Restart after changes
docker-compose -f docker-compose.dev.yml restart

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 🏗️ Project Structure

```
RetroConsole/
├── 📁 main/                    # Frontend files
│   ├── 📄 index.html          # Main page
│   ├── 📁 css/                # Styles
│   │   ├── styles.css         # Main styles
│   │   └── themes.css         # Theme styles
│   ├── 📁 js/                 # JavaScript code
│   │   ├── app.js             # Main application file
│   │   ├── managers/          # Managers
│   │   ├── models/            # Data models
│   │   ├── storage/           # Data handling
│   │   └── terminal/          # Terminal UI
│   ├── 📁 data/               # Database
│   │   └── tasks.json         # Tasks file
│   └── 📁 assets/             # Resources
├── 📄 server.js               # Backend server (Node.js + Express)
├── 📄 package.json            # Project dependencies
├── 🐳 Dockerfile.dev          # Docker configuration for development
├── 🐳 docker-compose.dev.yml  # Docker Compose configuration
└── 📁 docs/                   # Documentation (API, architecture)
```

## 🎮 Terminal Commands

- `ls` - Show all tasks
- `add <description>` - Add new task
- `complete <id>` - Mark task as completed
- `delete <id>` - Delete task
- `clear` - Clear all tasks
- `stats` - Show statistics
- `help` - Show help

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id/complete` | Mark as completed |
| DELETE | `/api/tasks/:id` | Delete task |

## 🧪 Testing

```bash
# Run tests
npm test
```

---

**Personal project for task management with retro interface**