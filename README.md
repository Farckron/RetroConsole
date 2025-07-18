# 🖥️ Retro Console Task Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Ретро-стильний менеджер завдань з інтерфейсом терміналу. Створений для тих, хто любить естетику старих комп'ютерних терміналів та ефективне управління завданнями.

![Retro Console Preview](https://via.placeholder.com/800x400/1a1a2e/16213e?text=Retro+Console+Task+Manager)

## ✨ Особливості

- 🎨 **Ретро дизайн** - Автентичний вигляд старого терміналу
- ⚡ **Швидкість** - Мінімалістичний інтерфейс без зайвих елементів
- 🐳 **Docker Ready** - Легке розгортання в контейнері
- 📱 **Адаптивність** - Працює на всіх пристроях
- 🔄 **Live Reload** - Автоматичне оновлення при розробці
- 💾 **Файлова база даних** - Прості JSON файли для зберігання
- 🌐 **REST API** - Повноцінний API для інтеграцій

## 🚀 Швидкий старт

### Використання Docker (Рекомендовано)

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/yourusername/RetroConsole.git
   cd RetroConsole
   ```

2. **Запустіть з Docker:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Відкрийте браузер:**
   ```
   http://localhost:3000
   ```

### Локальна установка

1. **Встановіть залежності:**
   ```bash
   npm install
   ```

2. **Запустіть сервер:**
   ```bash
   npm run dev
   ```

## 🐳 Docker команди

### Основні команди

```bash
# Запуск контейнера
docker-compose -f docker-compose.dev.yml up

# Запуск у фоновому режимі
docker-compose -f docker-compose.dev.yml up -d

# Зупинка контейнера
docker-compose -f docker-compose.dev.yml down

# Перезапуск після змін
docker-compose -f docker-compose.dev.yml restart

# Перебудова після змін в package.json
docker-compose -f docker-compose.dev.yml up --build
```

### Корисні команди для дебагу

```bash
# Переглянути логи
docker-compose -f docker-compose.dev.yml logs

# Переглянути логи в реальному часі
docker-compose -f docker-compose.dev.yml logs -f

# Зайти в контейнер
docker-compose -f docker-compose.dev.yml exec retro-console sh

# Переглянути статус контейнерів
docker-compose -f docker-compose.dev.yml ps
```

## 🏗️ Архітектура проекту

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
├── 📄 .dockerignore          # Файли, які Docker ігнорує
└── 📁 docs/                   # Документація
```

## 🔧 Розробка

### Структура коду

- **Backend (server.js)**: Express.js сервер з REST API
- **Frontend (main/)**: Vanilla JavaScript з модульною архітектурою
- **Database (tasks.json)**: Файлова база даних у форматі JSON

### Як працює Live Reload

1. **Змініть код** в будь-якому файлі
2. **Збережіть файл** - Docker автоматично підхопить зміни
3. **Оновіть браузер** - побачите результат

### API Endpoints

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/tasks` | Отримати всі завдання |
| POST | `/api/tasks` | Створити нове завдання |
| PUT | `/api/tasks/:id/complete` | Позначити як виконане |
| DELETE | `/api/tasks/:id` | Видалити завдання |
| DELETE | `/api/tasks` | Очистити всі завдання |
| GET | `/api/tasks/stats` | Отримати статистику |
| GET | `/api/tasks/export` | Експортувати завдання |
| POST | `/api/tasks/import` | Імпортувати завдання |

### Структура даних

```json
{
  "tasks": [
    {
      "id": 1,
      "description": "Назва завдання",
      "status": "pending", // або "completed"
      "createdAt": "2025-07-18T20:00:00.000Z",
      "completedAt": null
    }
  ],
  "metadata": {
    "version": "1.0",
    "totalTasks": 1,
    "completedTasks": 0,
    "pendingTasks": 1,
    "lastModified": "2025-07-18T20:00:00.000Z"
  }
}
```

## 🎮 Використання

### Основні команди терміналу

- `ls` - Показати всі завдання
- `add <опис>` - Додати нове завдання
- `complete <id>` - Позначити завдання як виконане
- `delete <id>` - Видалити завдання
- `clear` - Очистити всі завдання
- `stats` - Показати статистику
- `help` - Показати довідку
- `export` - Експортувати завдання
- `import` - Імпортувати завдання

### Приклади використання

```bash
# Додати завдання
$ add Купити молоко

# Переглянути завдання
$ ls

# Виконати завдання
$ complete 1

# Видалити завдання
$ delete 1

# Показати статистику
$ stats
```

## 🚀 Розгортання

### GitHub Pages (Статичні файли)

1. Скопіюйте файли з папки `main/` до кореня репозиторію
2. Увімкніть GitHub Pages в налаштуваннях репозиторію

### Heroku (Повний стек)

```bash
# Встановіть Heroku CLI
npm install -g heroku

# Увійдіть в Heroku
heroku login

# Створіть додаток
heroku create your-app-name

# Розгорніть
git push heroku main
```

### Railway/Render

1. Підключіть GitHub репозиторій
2. Встановіть команду запуску: `npm start`
3. Встановіть змінну середовища: `PORT=3000`

## 🧪 Тестування

```bash
# Запустити тести
npm test

# Запустити тести з покриттям
npm run test:coverage

# Запустити тести в режимі спостереження
npm run test:watch
```

## 📝 Ліцензія

Цей проект ліцензовано під [MIT License](LICENSE).

## 🤝 Внесок у проект

1. Форкніть проект
2. Створіть гілку для нової функції (`git checkout -b feature/AmazingFeature`)
3. Зробіть коміт змін (`git commit -m 'Add some AmazingFeature'`)
4. Запушіть гілку (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📞 Підтримка

Якщо у вас виникли питання або проблеми:

- 🐛 [Створіть Issue](https://github.com/yourusername/RetroConsole/issues)
- 💬 [Обговорення](https://github.com/yourusername/RetroConsole/discussions)
- 📧 Email: your.email@example.com

## 🙏 Подяки

- Натхнення від класичних Unix терміналів
- Спільнота розробників за відгуки та пропозиції

---

**Зроблено з ❤️ для любителів ретро естетики та ефективного управління завданнями**