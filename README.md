# 🖥️ Retro Console Task Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Ретро-стильний менеджер завдань з інтерфейсом терміналу. Створений для тих, хто любить естетику старих комп'ютерних терміналів та ефективне управління завданнями.

## ✨ Особливості

- 🎨 **Ретро дизайн** - Автентичний вигляд старого терміналу
- ⚡ **Швидкість** - Мінімалістичний інтерфейс без зайвих елементів
- 🐳 **Docker Ready** - Легке розгортання в контейнері
- 📱 **Адаптивність** - Працює на всіх пристроях
- 💾 **Файлова база даних** - Прості JSON файли для зберігання

## 🚀 Швидкий старт

### Використання Docker (Рекомендовано)

```bash
# Запуск з Docker
docker-compose -f docker-compose.dev.yml up --build

# Відкрийте браузер: http://localhost:3000
```

### Локальна установка

```bash
# Встановлення залежностей
npm install

# Запуск сервера
npm run dev
```

## 🐳 Docker команди

```bash
# Запуск контейнера
docker-compose -f docker-compose.dev.yml up

# Зупинка контейнера
docker-compose -f docker-compose.dev.yml down

# Перезапуск після змін
docker-compose -f docker-compose.dev.yml restart

# Перегляд логів
docker-compose -f docker-compose.dev.yml logs -f
```

## 🏗️ Структура проекту

```
RetroConsole/
├── 📁 main/                    # Frontend файли
│   ├── 📄 index.html          # Головна сторінка
│   ├── 📁 css/                # Стилі
│   │   ├── styles.css         # Основні стилі
│   │   └── themes.css         # Теми оформлення
│   ├── 📁 js/                 # JavaScript код
│   │   ├── app.js             # Головний файл додатку
│   │   ├── managers/          # Менеджери
│   │   ├── models/            # Моделі даних
│   │   ├── storage/           # Робота з даними
│   │   └── terminal/          # UI терміналу
│   ├── 📁 data/               # База даних
│   │   └── tasks.json         # Файл з завданнями
│   └── 📁 assets/             # Ресурси
├── 📄 server.js               # Backend сервер (Node.js + Express)
├── 📄 package.json            # Залежності проекту
├── 🐳 Dockerfile.dev          # Docker конфігурація для розробки
├── 🐳 docker-compose.dev.yml  # Docker Compose конфігурація
└── 📁 docs/                   # Документація (API, архітектура)
```

## 🎮 Команди терміналу

- `ls` - Показати всі завдання
- `add <опис>` - Додати нове завдання
- `complete <id>` - Позначити завдання як виконане
- `delete <id>` - Видалити завдання
- `clear` - Очистити всі завдання
- `stats` - Показати статистику
- `help` - Показати довідку

## 🔌 API Endpoints

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/tasks` | Отримати всі завдання |
| POST | `/api/tasks` | Створити нове завдання |
| PUT | `/api/tasks/:id/complete` | Позначити як виконане |
| DELETE | `/api/tasks/:id` | Видалити завдання |

## 🧪 Тестування

```bash
# Запустити тести
npm test
```

---

**Особистий проект для управління завданнями з ретро-інтерфейсом**