# 🛠️ Посібник розробника

## Налаштування середовища розробки

### Вимоги
- Node.js 18+ 
- Docker & Docker Compose
- Git
- Текстовий редактор (VS Code рекомендовано)

### Перше налаштування

1. **Клонування репозиторію:**
   ```bash
   git clone https://github.com/yourusername/RetroConsole.git
   cd RetroConsole
   ```

2. **Встановлення залежностей:**
   ```bash
   npm install
   ```

3. **Запуск в режимі розробки:**
   ```bash
   # З Docker (рекомендовано)
   docker-compose -f docker-compose.dev.yml up --build
   
   # Або локально
   npm run dev
   ```

## Структура проекту

```
RetroConsole/
├── main/                   # Frontend код
│   ├── index.html         # Головна сторінка
│   ├── css/               # Стилі
│   ├── js/                # JavaScript модулі
│   └── data/              # Локальні дані
├── server.js              # Express сервер
├── tests/                 # Тести
├── docs/                  # Документація
├── docker-compose.dev.yml # Docker конфігурація
└── package.json           # Залежності
```

## Робочий процес розробки

### 1. Створення нової функції

```bash
# Створіть нову гілку
git checkout -b feature/new-feature

# Внесіть зміни
# ...

# Зробіть коміт
git add .
git commit -m "feat: add new feature"

# Запушіть зміни
git push origin feature/new-feature
```

### 2. Конвенції коду

#### JavaScript
```javascript
// Використовуйте const/let замість var
const taskManager = new TaskManager();

// Функції стрілки для коротких функцій
const isCompleted = (task) => task.status === 'completed';

// Деструктуризація об'єктів
const { id, description, status } = task;

// Async/await замість промісів
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        return await response.json();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}
```

#### CSS
```css
/* Використовуйте CSS змінні */
:root {
    --primary-color: #00ff00;
    --secondary-color: #ffffff;
}

/* BEM методологія для класів */
.terminal__input {
    /* стилі */
}

.terminal__input--focused {
    /* модифікатор */
}
```

### 3. Тестування

```bash
# Запуск всіх тестів
npm test

# Запуск конкретного тесту
npm test -- --grep "TaskManager"

# Тести з покриттям
npm run test:coverage

# Тести в режимі спостереження
npm run test:watch
```

#### Написання тестів

```javascript
// tests/unit/TaskManager.test.js
const TaskManager = require('../../main/js/managers/TaskManager');

describe('TaskManager', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
    });

    it('should create a new task', async () => {
        const task = await taskManager.createTask('Test task');
        expect(task.description).toBe('Test task');
        expect(task.status).toBe('pending');
    });
});
```

## Docker розробка

### Основні команди

```bash
# Запуск контейнера
docker-compose -f docker-compose.dev.yml up

# Запуск у фоні
docker-compose -f docker-compose.dev.yml up -d

# Перебудова після змін в package.json
docker-compose -f docker-compose.dev.yml up --build

# Зупинка
docker-compose -f docker-compose.dev.yml down

# Перегляд логів
docker-compose -f docker-compose.dev.yml logs -f
```

### Налагодження в Docker

```bash
# Зайти в контейнер
docker-compose -f docker-compose.dev.yml exec retro-console sh

# Переглянути файли в контейнері
docker-compose -f docker-compose.dev.yml exec retro-console ls -la

# Перевірити змінні середовища
docker-compose -f docker-compose.dev.yml exec retro-console env
```

## API розробка

### Додавання нового endpoint

1. **Додайте маршрут в server.js:**
   ```javascript
   app.get('/api/tasks/search', async (req, res) => {
       try {
           const { query } = req.query;
           const tasksData = await readTasksFromFile();
           const filteredTasks = tasksData.tasks.filter(task =>
               task.description.toLowerCase().includes(query.toLowerCase())
           );
           
           res.json({
               success: true,
               data: filteredTasks
           });
       } catch (error) {
           res.status(500).json({
               success: false,
               error: 'Search failed'
           });
       }
   });
   ```

2. **Додайте метод в TaskStorage.js:**
   ```javascript
   async searchTasks(query) {
       const response = await fetch(`/api/tasks/search?query=${encodeURIComponent(query)}`);
       return await response.json();
   }
   ```

3. **Додайте тест:**
   ```javascript
   it('should search tasks', async () => {
       const result = await request(app)
           .get('/api/tasks/search?query=test')
           .expect(200);
       
       expect(result.body.success).toBe(true);
   });
   ```

## Frontend розробка

### Додавання нової команди терміналу

1. **Створіть обробник команди:**
   ```javascript
   // main/js/terminal/commands/SearchCommand.js
   class SearchCommand {
       constructor(taskManager) {
           this.taskManager = taskManager;
       }

       async execute(args) {
           const query = args.join(' ');
           if (!query) {
               return 'Usage: search <query>';
           }

           const tasks = await this.taskManager.searchTasks(query);
           return this.formatResults(tasks);
       }

       formatResults(tasks) {
           if (tasks.length === 0) {
               return 'No tasks found';
           }

           return tasks.map(task => 
               `${task.id}: ${task.description} [${task.status}]`
           ).join('\n');
       }
   }
   ```

2. **Зареєструйте команду:**
   ```javascript
   // main/js/terminal/TerminalUI.js
   this.commands.set('search', new SearchCommand(this.taskManager));
   ```

### Стилізація

```css
/* Використовуйте CSS Grid/Flexbox */
.terminal-container {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100vh;
}

/* Адаптивний дизайн */
@media (max-width: 768px) {
    .terminal {
        font-size: 14px;
        padding: 10px;
    }
}

/* Анімації */
@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.cursor {
    animation: blink 1s infinite;
}
```

## Налагодження

### Логування

```javascript
// Використовуйте структуроване логування
console.log('Task created:', {
    taskId: task.id,
    description: task.description,
    timestamp: new Date().toISOString()
});

// Різні рівні логів
console.error('Critical error:', error);
console.warn('Warning:', warning);
console.info('Info:', info);
console.debug('Debug:', debug);
```

### Інструменти розробника

```javascript
// Додайте глобальні змінні для налагодження
if (process.env.NODE_ENV === 'development') {
    window.DEBUG = {
        taskManager,
        terminalUI,
        storage
    };
}
```

## Оптимізація продуктивності

### Lazy Loading

```javascript
// Динамічний імпорт модулів
async loadCommand(commandName) {
    const module = await import(`./commands/${commandName}Command.js`);
    return new module.default();
}
```

### Кешування

```javascript
// Кешування API відповідей
class TaskStorage {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5 секунд
    }

    async getTasks() {
        const cached = this.cache.get('tasks');
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const data = await this.fetchTasks();
        this.cache.set('tasks', {
            data,
            timestamp: Date.now()
        });

        return data;
    }
}
```

## Розгортання

### Підготовка до продакшену

1. **Оптимізація коду:**
   ```bash
   # Мініфікація CSS/JS
   npm run build

   # Оптимізація зображень
   npm run optimize-images
   ```

2. **Перевірка безпеки:**
   ```bash
   # Аудит залежностей
   npm audit

   # Виправлення вразливостей
   npm audit fix
   ```

3. **Тестування продакшн збірки:**
   ```bash
   # Збірка Docker образу для продакшену
   docker build -f Dockerfile.prod -t retro-console:prod .

   # Запуск продакшн контейнера
   docker run -p 3000:3000 retro-console:prod
   ```

## Поширені проблеми

### Docker не бачить зміни в коді
```bash
# Перевірте volume mapping в docker-compose.dev.yml
volumes:
  - .:/app
  - /app/node_modules
```

### Помилки CORS
```javascript
// Переконайтеся, що CORS налаштований правильно
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://yourdomain.com'
}));
```

### Проблеми з файловими правами
```bash
# Виправлення прав доступу
sudo chown -R $USER:$USER .
```

## Корисні ресурси

- [Express.js документація](https://expressjs.com/)
- [Docker документація](https://docs.docker.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Jest тестування](https://jestjs.io/)

## Отримання допомоги

- 🐛 [GitHub Issues](https://github.com/yourusername/RetroConsole/issues)
- 💬 [Discussions](https://github.com/yourusername/RetroConsole/discussions)
- 📧 Email команди розробки