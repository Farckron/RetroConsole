# 🔒 Security Policy

## Підтримувані версії

Ми надаємо підтримку безпеки для наступних версій Retro Console Task Manager:

| Версія | Підтримка         |
| ------ | ----------------- |
| 1.x.x  | ✅ Повна підтримка |
| 0.9.x  | ⚠️ Критичні виправлення |
| < 0.9  | ❌ Не підтримується |

## Звітування про вразливості

Ми серйозно ставимося до безпеки нашого програмного забезпечення. Якщо ви виявили вразливість безпеки, будь ласка, повідомте нас відповідальним чином.

### Як повідомити

**🚨 НЕ створюйте публічні GitHub issues для вразливостей безпеки**

Замість цього:

1. **Email**: Надішліть деталі на security@retroconsole.dev
2. **Encrypted**: Використовуйте наш PGP ключ для шифрування (ID: XXXX-XXXX)
3. **GitHub Security**: Використовуйте [GitHub Security Advisories](https://github.com/yourusername/RetroConsole/security/advisories)

### Інформація для включення

Будь ласка, включіть наступну інформацію:

- **Тип вразливості** (XSS, SQL injection, CSRF, тощо)
- **Локація** (файл, функція, endpoint)
- **Кроки для відтворення**
- **Потенційний вплив**
- **Пропоновані виправлення** (якщо є)
- **Ваші контактні дані**

### Приклад звіту

```
Subject: [SECURITY] XSS вразливість в терміналі

Тип: Cross-Site Scripting (XSS)
Серйозність: Висока
Локація: main/js/terminal/TerminalUI.js, функція displayOutput()

Опис:
Користувацький ввід не санітизується перед відображенням в терміналі,
що дозволяє виконання довільного JavaScript коду.

Кроки відтворення:
1. Відкрийте термінал
2. Введіть: add "<script>alert('XSS')</script>"
3. Скрипт виконується

Потенційний вплив:
- Крадіжка cookies/tokens
- Виконання дій від імені користувача
- Перенаправлення на шкідливі сайти

Пропоноване виправлення:
Використовувати textContent замість innerHTML для відображення
користувацького контенту.
```

## Процес обробки

### Наша відповідь

1. **Підтвердження** (протягом 24 годин)
   - Підтверджуємо отримання звіту
   - Призначаємо унікальний ID
   - Надаємо орієнтовні терміни

2. **Оцінка** (протягом 72 годин)
   - Аналізуємо вразливість
   - Визначаємо серйозність
   - Плануємо виправлення

3. **Виправлення** (залежно від серйозності)
   - Критичні: 24-48 годин
   - Високі: 1-2 тижні
   - Середні: 2-4 тижні
   - Низькі: наступний релізний цикл

4. **Розкриття**
   - Координоване розкриття після виправлення
   - Публікація security advisory
   - Визнання дослідника (за бажанням)

### Класифікація серйозності

#### 🔴 Критична (CVSS 9.0-10.0)
- Віддалене виконання коду
- Повний компроміс системи
- Масова витік даних

#### 🟠 Висока (CVSS 7.0-8.9)
- Підвищення привілеїв
- Обхід аутентифікації
- Значний витік даних

#### 🟡 Середня (CVSS 4.0-6.9)
- XSS, CSRF
- Витік обмеженої інформації
- DoS атаки

#### 🟢 Низька (CVSS 0.1-3.9)
- Витік мінімальної інформації
- Проблеми конфігурації
- Незначні DoS

## Заходи безпеки

### Поточні заходи

#### Frontend
- **Content Security Policy (CSP)**
  ```javascript
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  ```

- **Input Sanitization**
  ```javascript
  function sanitizeInput(input) {
      return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
  }
  ```

- **XSS Protection**
  ```javascript
  // Використання textContent замість innerHTML
  element.textContent = userInput;
  ```

#### Backend
- **Input Validation**
  ```javascript
  const validateTaskDescription = (description) => {
      if (typeof description !== 'string') {
          throw new Error('Description must be a string');
      }
      if (description.length > 1000) {
          throw new Error('Description too long');
      }
      return description.trim();
  };
  ```

- **Rate Limiting**
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 хвилин
      max: 100 // максимум 100 запитів
  });
  ```

- **CORS Configuration**
  ```javascript
  app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
      credentials: true
  }));
  ```

#### Infrastructure
- **HTTPS Only** (в продакшені)
- **Security Headers**
  ```javascript
  app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
  });
  ```

### Планові покращення

- [ ] Аутентифікація та авторизація
- [ ] Шифрування даних в спокої
- [ ] Аудит логи безпеки
- [ ] Регулярні security scans
- [ ] Dependency vulnerability scanning

## Безпечна розробка

### Checklist для розробників

#### Перед комітом
- [ ] Валідація всіх користувацьких вводів
- [ ] Санітизація виводу
- [ ] Перевірка на SQL injection (якщо використовується БД)
- [ ] Перевірка на XSS
- [ ] Перевірка на CSRF (якщо є форми)

#### Перед релізом
- [ ] Запуск security тестів
- [ ] Перевірка залежностей на вразливості
- [ ] Code review з фокусом на безпеку
- [ ] Тестування на staging середовищі

### Інструменти безпеки

```bash
# Аудит npm залежностей
npm audit

# Виправлення вразливостей
npm audit fix

# Перевірка з Snyk
npx snyk test

# ESLint security правила
npm install --save-dev eslint-plugin-security
```

### Конфігурація ESLint для безпеки

```javascript
// .eslintrc.js
module.exports = {
    plugins: ['security'],
    extends: ['plugin:security/recommended'],
    rules: {
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-regexp': 'error',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'error',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'security/detect-non-literal-require': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'security/detect-pseudoRandomBytes': 'error'
    }
};
```

## Відповідальне розкриття

### Наші зобов'язання

- **Швидка відповідь** на звіти про вразливості
- **Прозорість** в процесі виправлення
- **Визнання** дослідників безпеки
- **Координоване розкриття** для захисту користувачів

### Для дослідників

- **Не завдавайте шкоди** користувачам або даним
- **Дотримуйтесь законів** вашої юрисдикції
- **Повідомляйте відповідально** через приватні канали
- **Дайте нам час** на виправлення перед публічним розкриттям

### Hall of Fame

Ми визнаємо дослідників, які допомогли покращити безпеку:

| Дослідник | Дата | Вразливість | Серйозність |
|-----------|------|-------------|-------------|
| TBD       | TBD  | TBD         | TBD         |

## Контакти

- **Security Email**: security@retroconsole.dev
- **PGP Key**: [Публічний ключ]
- **Response Time**: 24 години для підтвердження
- **Languages**: English, Українська

---

**Дякуємо за допомогу в забезпеченні безпеки Retro Console Task Manager! 🔒**