# 🚀 Посібник з розгортання

## Огляд

Цей документ описує різні способи розгортання Retro Console Task Manager у продакшн середовищі.

## Підготовка до розгортання

### 1. Перевірка коду

```bash
# Запустіть тести
npm test

# Перевірте покриття тестів
npm run test:coverage

# Аудит безпеки
npm audit

# Лінтинг коду
npm run lint
```

### 2. Оптимізація

```bash
# Мініфікація файлів
npm run build

# Оптимізація зображень
npm run optimize

# Аналіз розміру бандлу
npm run analyze
```

## Варіанти розгортання

### 🐳 Docker (Рекомендовано)

#### Створення продакшн Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
USER node

CMD ["npm", "start"]
```

#### Docker Compose для продакшену

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/main/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/tasks"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

#### Запуск

```bash
# Збірка та запуск
docker-compose -f docker-compose.prod.yml up --build -d

# Перегляд логів
docker-compose -f docker-compose.prod.yml logs -f

# Зупинка
docker-compose -f docker-compose.prod.yml down
```

### ☁️ Хмарні платформи

#### Heroku

1. **Підготовка:**
   ```bash
   # Встановіть Heroku CLI
   npm install -g heroku
   
   # Увійдіть в акаунт
   heroku login
   ```

2. **Створення додатку:**
   ```bash
   # Створіть новий додаток
   heroku create your-app-name
   
   # Встановіть змінні середовища
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3000
   ```

3. **Розгортання:**
   ```bash
   # Додайте Heroku remote
   git remote add heroku https://git.heroku.com/your-app-name.git
   
   # Розгорніть
   git push heroku main
   ```

4. **Procfile:**
   ```
   web: npm start
   ```

#### Railway

1. **Підключення GitHub:**
   - Зайдіть на railway.app
   - Підключіть GitHub репозиторій
   - Оберіть гілку для розгортання

2. **Налаштування:**
   ```bash
   # Встановіть Railway CLI
   npm install -g @railway/cli
   
   # Увійдіть в акаунт
   railway login
   
   # Ініціалізуйте проект
   railway init
   
   # Розгорніть
   railway up
   ```

3. **Змінні середовища:**
   ```
   NODE_ENV=production
   PORT=3000
   ```

#### Render

1. **Створення сервісу:**
   - Зайдіть на render.com
   - Створіть новий Web Service
   - Підключіть GitHub репозиторій

2. **Налаштування:**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Змінні середовища:**
   ```
   NODE_ENV=production
   ```

#### Vercel (Serverless)

1. **Встановлення:**
   ```bash
   npm install -g vercel
   ```

2. **Конфігурація vercel.json:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       },
       {
         "src": "main/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/main/$1"
       }
     ]
   }
   ```

3. **Розгортання:**
   ```bash
   vercel --prod
   ```

### 🖥️ VPS/Dedicated Server

#### Налаштування сервера (Ubuntu)

1. **Оновлення системи:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Встановлення Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Встановлення PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Встановлення Nginx:**
   ```bash
   sudo apt install nginx -y
   ```

#### Розгортання додатку

1. **Клонування коду:**
   ```bash
   git clone https://github.com/yourusername/RetroConsole.git
   cd RetroConsole
   npm install --production
   ```

2. **Конфігурація PM2:**
   ```json
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'retro-console',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'development',
         PORT: 3000
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Запуск з PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

#### Налаштування Nginx

```nginx
# /etc/nginx/sites-available/retro-console
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активація конфігурації
sudo ln -s /etc/nginx/sites-available/retro-console /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL сертифікат (Let's Encrypt)

```bash
# Встановлення Certbot
sudo apt install certbot python3-certbot-nginx -y

# Отримання сертифікату
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматичне оновлення
sudo crontab -e
# Додайте: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Моніторинг та логування

### PM2 Monitoring

```bash
# Перегляд статусу
pm2 status

# Перегляд логів
pm2 logs

# Моніторинг ресурсів
pm2 monit

# Перезапуск
pm2 restart retro-console
```

### Логування

```javascript
// server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check

```javascript
// Додайте в server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Backup та відновлення

### Автоматичний backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
APP_DIR="/path/to/RetroConsole"

# Створення backup
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/retro-console-$DATE.tar.gz -C $APP_DIR main/data/

# Видалення старих backup (старше 30 днів)
find $BACKUP_DIR -name "retro-console-*.tar.gz" -mtime +30 -delete

echo "Backup completed: retro-console-$DATE.tar.gz"
```

```bash
# Додайте в crontab для щоденного backup
0 2 * * * /path/to/backup.sh
```

### Відновлення

```bash
# Відновлення з backup
tar -xzf /backups/retro-console-20250718_020000.tar.gz -C /path/to/RetroConsole/
pm2 restart retro-console
```

## Безпека

### Firewall (UFW)

```bash
# Базові правила
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Fail2Ban

```bash
# Встановлення
sudo apt install fail2ban -y

# Конфігурація
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Оновлення безпеки

```bash
# Автоматичні оновлення безпеки
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Поширені проблеми

1. **Додаток не запускається:**
   ```bash
   # Перевірте логи
   pm2 logs retro-console
   
   # Перевірте порт
   sudo netstat -tlnp | grep :3000
   ```

2. **Nginx помилки:**
   ```bash
   # Перевірте конфігурацію
   sudo nginx -t
   
   # Перевірте логи
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Проблеми з SSL:**
   ```bash
   # Перевірте сертифікат
   sudo certbot certificates
   
   # Оновіть сертифікат
   sudo certbot renew
   ```

### Корисні команди

```bash
# Перевірка використання ресурсів
htop
df -h
free -h

# Перевірка мережі
curl -I http://localhost:3000/health
wget -O- http://localhost:3000/api/tasks

# Перевірка процесів
ps aux | grep node
```

## Масштабування

### Горизонтальне масштабування

```bash
# Додавання нових інстансів PM2
pm2 scale retro-console +2

# Load balancer з Nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

### Вертикальне масштабування

```bash
# Збільшення ресурсів сервера
# CPU, RAM, SSD

# Оптимізація Node.js
node --max-old-space-size=4096 server.js
```