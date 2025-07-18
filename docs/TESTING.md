# 🧪 Testing Guide

## Огляд тестування

Цей документ описує стратегію тестування для Retro Console Task Manager, включаючи різні типи тестів та інструменти.

## Структура тестів

```
tests/
├── unit/                   # Юніт тести
│   ├── TaskManager.test.js
│   ├── TaskStorage.test.js
│   └── TerminalUI.test.js
├── integration/            # Інтеграційні тести
│   ├── api.test.js
│   └── storage.test.js
├── e2e/                   # End-to-end тести
│   ├── user-flows.test.js
│   └── commands.test.js
├── fixtures/              # Тестові дані
│   └── tasks.json
└── helpers/               # Допоміжні функції
    └── setup.js
```

## Налаштування тестового середовища

### Встановлення залежностей

```bash
npm install --save-dev jest supertest puppeteer
```

### Конфігурація Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'main/js/**/*.js',
    'server.js',
    '!main/js/vendor/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.js']
};
```

### Налаштування тестового середовища

```javascript
// tests/helpers/setup.js
const fs = require('fs');
const path = require('path');

// Створення тестової директорії для даних
const testDataDir = path.join(__dirname, '../fixtures');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Глобальні налаштування для тестів
global.TEST_DATA_DIR = testDataDir;

// Очищення після кожного тесту
afterEach(() => {
  // Очистити тестові файли
  const testFiles = fs.readdirSync(testDataDir);
  testFiles.forEach(file => {
    if (file.startsWith('test-')) {
      fs.unlinkSync(path.join(testDataDir, file));
    }
  });
});
```

## Юніт тести

### Тестування TaskManager

```javascript
// tests/unit/TaskManager.test.js
const TaskManager = require('../../main/js/managers/TaskManager');

describe('TaskManager', () => {
  let taskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  describe('createTask', () => {
    it('should create a new task with valid description', async () => {
      const description = 'Test task';
      const task = await taskManager.createTask(description);

      expect(task).toHaveProperty('id');
      expect(task.description).toBe(description);
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeDefined();
    });

    it('should reject empty description', async () => {
      await expect(taskManager.createTask('')).rejects.toThrow('Description cannot be empty');
    });

    it('should reject duplicate tasks', async () => {
      const description = 'Duplicate task';
      await taskManager.createTask(description);
      
      await expect(taskManager.createTask(description)).rejects.toThrow('Task already exists');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      const task = await taskManager.createTask('Test task');
      const completedTask = await taskManager.completeTask(task.id);

      expect(completedTask.status).toBe('completed');
      expect(completedTask.completedAt).toBeDefined();
    });

    it('should reject invalid task ID', async () => {
      await expect(taskManager.completeTask(999)).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', async () => {
      const task = await taskManager.createTask('Test task');
      const deletedTask = await taskManager.deleteTask(task.id);

      expect(deletedTask.id).toBe(task.id);
      
      const tasks = await taskManager.getAllTasks();
      expect(tasks).not.toContainEqual(expect.objectContaining({ id: task.id }));
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array initially', async () => {
      const tasks = await taskManager.getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all created tasks', async () => {
      await taskManager.createTask('Task 1');
      await taskManager.createTask('Task 2');

      const tasks = await taskManager.getAllTasks();
      expect(tasks).toHaveLength(2);
    });
  });
});
```

### Тестування TaskStorage

```javascript
// tests/unit/TaskStorage.test.js
const TaskStorage = require('../../main/js/storage/TaskStorage');

describe('TaskStorage', () => {
  let storage;

  beforeEach(() => {
    storage = new TaskStorage();
  });

  describe('saveTasks', () => {
    it('should save tasks to storage', async () => {
      const tasks = [
        { id: 1, description: 'Task 1', status: 'pending' }
      ];

      await expect(storage.saveTasks(tasks)).resolves.toBe(true);
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from storage', async () => {
      const tasks = [
        { id: 1, description: 'Task 1', status: 'pending' }
      ];

      await storage.saveTasks(tasks);
      const loadedTasks = await storage.loadTasks();

      expect(loadedTasks).toEqual(tasks);
    });

    it('should return empty array if no tasks exist', async () => {
      const tasks = await storage.loadTasks();
      expect(tasks).toEqual([]);
    });
  });
});
```

## Інтеграційні тести

### Тестування API

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('GET /api/tasks', () => {
    it('should return empty tasks list initially', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toEqual([]);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = { description: 'Test task' };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.status).toBe('pending');
    });

    it('should reject empty description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Description is required');
    });
  });

  describe('PUT /api/tasks/:id/complete', () => {
    it('should complete existing task', async () => {
      // Створити завдання
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Test task' });

      const taskId = createResponse.body.data.id;

      // Виконати завдання
      const response = await request(app)
        .put(`/api/tasks/${taskId}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete existing task', async () => {
      // Створити завдання
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Test task' });

      const taskId = createResponse.body.data.id;

      // Видалити завдання
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Перевірити, що завдання видалено
      const getResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      const taskExists = getResponse.body.data.tasks.some(t => t.id === taskId);
      expect(taskExists).toBe(false);
    });
  });
});
```

## End-to-End тести

### Налаштування Puppeteer

```javascript
// tests/e2e/setup.js
const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: process.env.CI === 'true',
    slowMo: process.env.CI ? 0 : 50
  });
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterAll(async () => {
  await browser.close();
});

module.exports = { page };
```

### Тестування користувацьких сценаріїв

```javascript
// tests/e2e/user-flows.test.js
const { page } = require('./setup');

describe('User Flows', () => {
  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector('.terminal-input');
  });

  it('should create and complete a task', async () => {
    // Додати завдання
    await page.type('.terminal-input', 'add "Buy groceries"');
    await page.keyboard.press('Enter');

    // Перевірити, що завдання створено
    await page.waitForSelector('.task-item');
    const taskText = await page.$eval('.task-item', el => el.textContent);
    expect(taskText).toContain('Buy groceries');

    // Виконати завдання
    await page.type('.terminal-input', 'complete 1');
    await page.keyboard.press('Enter');

    // Перевірити, що завдання виконано
    await page.waitForFunction(() => {
      const taskItem = document.querySelector('.task-item');
      return taskItem && taskItem.textContent.includes('COMPLETED');
    });
  });

  it('should show help when help command is entered', async () => {
    await page.type('.terminal-input', 'help');
    await page.keyboard.press('Enter');

    await page.waitForFunction(() => {
      const output = document.querySelector('.terminal-output');
      return output && output.textContent.includes('Available commands');
    });
  });

  it('should navigate command history with arrow keys', async () => {
    // Ввести кілька команд
    await page.type('.terminal-input', 'ls');
    await page.keyboard.press('Enter');
    
    await page.type('.terminal-input', 'help');
    await page.keyboard.press('Enter');

    // Очистити поле вводу
    await page.click('.terminal-input');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');

    // Навігація по історії
    await page.keyboard.press('ArrowUp');
    let inputValue = await page.$eval('.terminal-input', el => el.value);
    expect(inputValue).toBe('help');

    await page.keyboard.press('ArrowUp');
    inputValue = await page.$eval('.terminal-input', el => el.value);
    expect(inputValue).toBe('ls');
  });
});
```

## Тести продуктивності

### Навантажувальні тести

```javascript
// tests/performance/load.test.js
const request = require('supertest');
const app = require('../../server');

describe('Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const requests = [];
    const numRequests = 100;

    for (let i = 0; i < numRequests; i++) {
      requests.push(
        request(app)
          .post('/api/tasks')
          .send({ description: `Task ${i}` })
      );
    }

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // Всі запити мають бути успішними
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Час виконання має бути розумним
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(5000); // 5 секунд
  });

  it('should handle large task lists efficiently', async () => {
    // Створити багато завдань
    const tasks = [];
    for (let i = 0; i < 1000; i++) {
      tasks.push({ description: `Task ${i}` });
    }

    // Імпортувати завдання
    const startTime = Date.now();
    const response = await request(app)
      .post('/api/tasks/import')
      .send({ tasks });
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(response.body.data.imported).toBe(1000);

    // Час імпорту має бути розумним
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(2000); // 2 секунди
  });
});
```

## Тести доступності

```javascript
// tests/accessibility/a11y.test.js
const { page } = require('../e2e/setup');

describe('Accessibility Tests', () => {
  it('should be navigable with keyboard only', async () => {
    await page.goto('http://localhost:3000');
    
    // Перевірити, що можна навігувати табом
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.className);
    expect(focusedElement).toContain('terminal-input');
  });

  it('should have proper ARIA labels', async () => {
    await page.goto('http://localhost:3000');
    
    const inputLabel = await page.$eval('.terminal-input', el => el.getAttribute('aria-label'));
    expect(inputLabel).toBeTruthy();
  });

  it('should have sufficient color contrast', async () => {
    await page.goto('http://localhost:3000');
    
    // Перевірити контраст кольорів
    const styles = await page.evaluate(() => {
      const terminal = document.querySelector('.terminal');
      const computed = window.getComputedStyle(terminal);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });

    // Тут можна додати логіку перевірки контрасту
    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();
  });
});
```

## Запуск тестів

### Команди для запуску

```bash
# Всі тести
npm test

# Тільки юніт тести
npm run test:unit

# Тільки інтеграційні тести
npm run test:integration

# Тільки e2e тести
npm run test:e2e

# Тести з покриттям
npm run test:coverage

# Тести в режимі спостереження
npm run test:watch

# Тести продуктивності
npm run test:performance
```

### Скрипти в package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:performance": "jest tests/performance"
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Start server for e2e tests
      run: |
        npm start &
        sleep 5
        
    - name: Run e2e tests
      run: npm run test:e2e
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## Мокування та фікстури

### Мокування API відповідей

```javascript
// tests/helpers/mocks.js
const mockApiResponse = (data, success = true) => ({
  success,
  data,
  ...(success ? {} : { error: 'Mock error' })
});

const mockTasks = [
  {
    id: 1,
    description: 'Mock task 1',
    status: 'pending',
    createdAt: '2025-07-18T20:00:00.000Z'
  },
  {
    id: 2,
    description: 'Mock task 2',
    status: 'completed',
    createdAt: '2025-07-18T19:00:00.000Z',
    completedAt: '2025-07-18T20:30:00.000Z'
  }
];

module.exports = {
  mockApiResponse,
  mockTasks
};
```

### Тестові фікстури

```json
// tests/fixtures/tasks.json
{
  "tasks": [
    {
      "id": 1,
      "description": "Sample task 1",
      "status": "pending",
      "createdAt": "2025-07-18T20:00:00.000Z",
      "completedAt": null
    },
    {
      "id": 2,
      "description": "Sample task 2",
      "status": "completed",
      "createdAt": "2025-07-18T19:00:00.000Z",
      "completedAt": "2025-07-18T20:30:00.000Z"
    }
  ],
  "metadata": {
    "version": "1.0",
    "totalTasks": 2,
    "completedTasks": 1,
    "pendingTasks": 1
  }
}
```

## Звітність та метрики

### Покриття коду

Мета: мінімум 80% покриття коду

### Метрики якості

- **Успішність тестів**: > 95%
- **Час виконання тестів**: < 2 хвилини
- **Стабільність e2e тестів**: > 90%

### Звіти

- HTML звіт покриття: `coverage/lcov-report/index.html`
- JSON звіт: `coverage/coverage-final.json`
- Текстовий звіт в консолі