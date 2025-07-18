# 🤝 Contributing to Retro Console Task Manager

Дякуємо за інтерес до внеску в розвиток Retro Console Task Manager! Цей документ містить інструкції для контрибуторів.

## 📋 Зміст

- [Кодекс поведінки](#кодекс-поведінки)
- [Як допомогти](#як-допомогти)
- [Процес розробки](#процес-розробки)
- [Стандарти коду](#стандарти-коду)
- [Тестування](#тестування)
- [Документація](#документація)

## 🤝 Кодекс поведінки

### Наші зобов'язання

Ми зобов'язуємося створити відкрите та дружнє середовище для всіх учасників, незалежно від:
- Віку, розміру тіла, інвалідності
- Етнічної приналежності, статевої ідентичності
- Рівня досвіду, національності
- Особистого вигляду, раси, релігії
- Сексуальної ідентичності та орієнтації

### Наші стандарти

**Позитивна поведінка:**
- Використання дружньої та інклюзивної мови
- Повага до різних точок зору та досвіду
- Конструктивне сприйняття критики
- Фокус на тому, що краще для спільноти
- Емпатія до інших учасників

**Неприйнятна поведінка:**
- Використання сексуалізованої мови або образів
- Тролінг, образливі коментарі, особисті атаки
- Публічні або приватні домагання
- Публікація приватної інформації без дозволу
- Інша неетична або непрофесійна поведінка

## 🛠️ Як допомогти

### Звіти про баги

Перед створенням звіту про баг:
1. Перевірте [існуючі issues](https://github.com/yourusername/RetroConsole/issues)
2. Переконайтеся, що використовуєте останню версію
3. Спробуйте відтворити баг в чистому середовищі

**Шаблон звіту про баг:**
```markdown
**Опис бага**
Короткий та зрозумілий опис проблеми.

**Кроки для відтворення**
1. Перейдіть до '...'
2. Натисніть на '...'
3. Прокрутіть до '...'
4. Побачите помилку

**Очікувана поведінка**
Що мало б статися.

**Скріншоти**
Якщо можливо, додайте скріншоти.

**Середовище:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

### Пропозиції функцій

**Шаблон пропозиції:**
```markdown
**Чи пов'язана ваша пропозиція з проблемою?**
Опишіть проблему. Наприклад: "Мене дратує, що..."

**Опишіть рішення**
Що ви хочете бачити.

**Альтернативи**
Інші варіанти, які ви розглядали.

**Додаткова інформація**
Скріншоти, мокапи, посилання.
```

### Внесок у код

1. **Fork** репозиторію
2. **Створіть гілку** для вашої функції (`git checkout -b feature/AmazingFeature`)
3. **Зробіть зміни** та додайте тести
4. **Переконайтеся**, що всі тести проходять
5. **Зробіть коміт** (`git commit -m 'Add some AmazingFeature'`)
6. **Push** до гілки (`git push origin feature/AmazingFeature`)
7. **Створіть Pull Request**

## 🔄 Процес розробки

### Налаштування середовища

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/yourusername/RetroConsole.git
   cd RetroConsole
   ```

2. **Встановіть залежності:**
   ```bash
   npm install
   ```

3. **Запустіть в режимі розробки:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Структура гілок

- `main` - стабільна версія для продакшену
- `develop` - основна гілка розробки
- `feature/*` - нові функції
- `bugfix/*` - виправлення багів
- `hotfix/*` - критичні виправлення

### Workflow

1. **Створіть issue** для обговорення змін
2. **Створіть гілку** від `develop`
3. **Розробляйте** з частими комітами
4. **Тестуйте** ваші зміни
5. **Створіть PR** до `develop`
6. **Пройдіть code review**
7. **Merge** після схвалення

## 📝 Стандарти коду

### JavaScript

#### Стиль коду

```javascript
// Використовуйте const/let замість var
const taskManager = new TaskManager();
let currentTask = null;

// Функції стрілки для коротких функцій
const isCompleted = (task) => task.status === 'completed';

// Деструктуризація
const { id, description, status } = task;

// Async/await замість промісів
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        return await response.json();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        throw error;
    }
}

// Коментарі для складної логіки
/**
 * Calculates task completion rate
 * @param {Array} tasks - Array of task objects
 * @returns {number} Completion rate as percentage
 */
function calculateCompletionRate(tasks) {
    if (tasks.length === 0) return 0;
    
    const completed = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
}
```

#### Іменування

```javascript
// Змінні та функції - camelCase
const taskManager = new TaskManager();
const getUserTasks = () => { /* ... */ };

// Константи - UPPER_SNAKE_CASE
const MAX_TASKS_PER_PAGE = 50;
const API_BASE_URL = '/api';

// Класи - PascalCase
class TaskManager {
    constructor() { /* ... */ }
}

// Приватні методи - префікс _
class TaskManager {
    _validateTask(task) { /* ... */ }
}
```

### CSS

#### Методологія BEM

```css
/* Block */
.terminal {
    background: #000;
    color: #00ff00;
}

/* Element */
.terminal__input {
    border: none;
    background: transparent;
}

/* Modifier */
.terminal__input--focused {
    outline: 1px solid #00ff00;
}

.terminal--theme-amber {
    color: #ffb000;
}
```

#### CSS змінні

```css
:root {
    /* Кольори */
    --color-primary: #00ff00;
    --color-secondary: #008000;
    --color-background: #000000;
    
    /* Розміри */
    --font-size-base: 14px;
    --font-size-large: 18px;
    --spacing-small: 8px;
    --spacing-medium: 16px;
    
    /* Анімації */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
}
```

### HTML

#### Семантична розмітка

```html
<!-- Використовуйте семантичні теги -->
<main class="terminal-container">
    <section class="terminal-output" role="log" aria-live="polite">
        <!-- Вивід терміналу -->
    </section>
    
    <form class="terminal-input-form">
        <label for="terminal-input" class="sr-only">Command input</label>
        <input 
            id="terminal-input" 
            class="terminal-input"
            type="text"
            autocomplete="off"
            aria-label="Enter command"
        >
    </form>
</main>
```

#### Доступність

```html
<!-- ARIA атрибути -->
<div role="button" tabindex="0" aria-label="Clear all tasks">
    Clear
</div>

<!-- Alt текст для зображень -->
<img src="icon.png" alt="Task completed successfully">

<!-- Заголовки для структури -->
<h1>Retro Console Task Manager</h1>
<h2>Available Commands</h2>
<h3>Task Management</h3>
```

## 🧪 Тестування

### Обов'язкові тести

Кожен PR повинен включати:
- **Юніт тести** для нової функціональності
- **Інтеграційні тести** для API змін
- **E2E тести** для UI змін

### Запуск тестів

```bash
# Всі тести
npm test

# Тести з покриттям
npm run test:coverage

# Тільки змінені файли
npm test -- --changedSince=main
```

### Мінімальне покриття

- **Загальне покриття**: 80%
- **Нові файли**: 90%
- **Критичні функції**: 100%

## 📚 Документація

### Коментарі в коді

```javascript
/**
 * Creates a new task with the given description
 * @param {string} description - Task description
 * @param {Object} options - Additional options
 * @param {string} options.priority - Task priority (low, medium, high)
 * @param {Date} options.dueDate - Task due date
 * @returns {Promise<Object>} Created task object
 * @throws {Error} When description is empty or invalid
 * 
 * @example
 * const task = await createTask('Buy groceries', { 
 *   priority: 'high',
 *   dueDate: new Date('2025-07-20')
 * });
 */
async function createTask(description, options = {}) {
    // Implementation
}
```

### README оновлення

При додаванні нових функцій:
- Оновіть розділ "Features"
- Додайте приклади використання
- Оновіть команди та API документацію

### Changelog

Ведіть CHANGELOG.md у форматі [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.0] - 2025-07-20

### Added
- New search functionality for tasks
- Keyboard shortcuts for common commands
- Export tasks to CSV format

### Changed
- Improved terminal UI responsiveness
- Updated color scheme for better accessibility

### Fixed
- Fixed task deletion confirmation dialog
- Resolved memory leak in task storage
```

## 🔍 Code Review

### Що перевіряємо

**Функціональність:**
- Код працює як очікується
- Покриває всі edge cases
- Не ламає існуючу функціональність

**Якість коду:**
- Читабельність та зрозумілість
- Відповідність стандартам проекту
- Відсутність дублювання коду

**Тестування:**
- Достатнє покриття тестами
- Тести проходять успішно
- Тести покривають edge cases

**Документація:**
- Код задокументований
- README оновлено при потребі
- API документація актуальна

### Процес review

1. **Автор** створює PR з детальним описом
2. **Reviewer** перевіряє код та залишає коментарі
3. **Автор** вносить правки
4. **Reviewer** схвалює зміни
5. **Maintainer** робить merge

## 🏷️ Версіонування

Використовуємо [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Несумісні зміни API
- **MINOR** (0.1.0): Нова функціональність (зворотно сумісна)
- **PATCH** (0.0.1): Виправлення багів

## 🎉 Визнання

Всі контрибутори будуть додані до:
- README.md в розділі Contributors
- CONTRIBUTORS.md з детальним описом внеску
- Release notes для значних внесків

## 📞 Зв'язок

- 🐛 **Баги та пропозиції**: [GitHub Issues](https://github.com/yourusername/RetroConsole/issues)
- 💬 **Обговорення**: [GitHub Discussions](https://github.com/yourusername/RetroConsole/discussions)
- 📧 **Email**: your.email@example.com
- 💬 **Discord**: [Посилання на сервер]

## 📄 Ліцензія

Внесок у цей проект означає згоду з умовами [MIT License](LICENSE).

---

**Дякуємо за ваш внесок у розвиток Retro Console Task Manager! 🚀**