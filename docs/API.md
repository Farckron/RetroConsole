# 🔌 API Documentation

## Базова інформація

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Authentication**: Не потрібна (поки що)

## Endpoints

### 📋 Tasks

#### GET /api/tasks
Отримати всі завдання

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "description": "Купити молоко",
        "status": "pending",
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
}
```

#### POST /api/tasks
Створити нове завдання

**Request Body:**
```json
{
  "description": "Назва завдання"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "description": "Назва завдання",
    "status": "pending",
    "createdAt": "2025-07-18T20:05:00.000Z",
    "completedAt": null
  },
  "message": "Task 2 created successfully"
}
```

**Error Responses:**
- `400` - Відсутній або порожній опис
- `409` - Завдання з таким описом вже існує
- `500` - Помилка сервера

#### PUT /api/tasks/:id/complete
Позначити завдання як виконане

**Parameters:**
- `id` (number) - ID завдання

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "description": "Купити молоко",
    "status": "completed",
    "createdAt": "2025-07-18T20:00:00.000Z",
    "completedAt": "2025-07-18T20:10:00.000Z"
  },
  "message": "Task 1 marked as completed"
}
```

**Error Responses:**
- `400` - Невірний ID або завдання вже виконане
- `404` - Завдання не знайдено
- `500` - Помилка сервера

#### DELETE /api/tasks/:id
Видалити завдання

**Parameters:**
- `id` (number) - ID завдання

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "description": "Купити молоко",
    "status": "pending",
    "createdAt": "2025-07-18T20:00:00.000Z",
    "completedAt": null
  },
  "message": "Task 1 deleted successfully"
}
```

#### DELETE /api/tasks
Очистити всі завдання

**Response:**
```json
{
  "success": true,
  "message": "Cleared 5 task(s)"
}
```

### 📊 Statistics

#### GET /api/tasks/stats
Отримати статистику завдань

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 7,
    "pending": 3,
    "completionRate": 70
  }
}
```

### 📤 Export/Import

#### GET /api/tasks/export
Експортувати завдання у форматі JSON

**Response:**
```json
{
  "tasks": [...],
  "metadata": {...}
}
```

**Headers:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="tasks-2025-07-18.json"`

#### POST /api/tasks/import
Імпортувати завдання з JSON

**Request Body:**
```json
{
  "tasks": [
    {
      "description": "Завдання 1",
      "status": "pending"
    },
    {
      "description": "Завдання 2",
      "status": "completed"
    }
  ],
  "replaceExisting": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed: 2 imported, 0 skipped",
  "data": {
    "imported": 2,
    "skipped": 0,
    "errors": []
  }
}
```

## Коди помилок

| Код | Опис |
|-----|------|
| 200 | OK - Успішний запит |
| 201 | Created - Ресурс створено |
| 400 | Bad Request - Невірний запит |
| 404 | Not Found - Ресурс не знайдено |
| 409 | Conflict - Конфлікт даних |
| 500 | Internal Server Error - Помилка сервера |

## Структура помилок

```json
{
  "success": false,
  "error": "Опис помилки"
}
```

## Приклади використання

### JavaScript (Fetch API)

```javascript
// Отримати всі завдання
const getTasks = async () => {
  const response = await fetch('/api/tasks');
  const data = await response.json();
  return data;
};

// Створити завдання
const createTask = async (description) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });
  return await response.json();
};

// Виконати завдання
const completeTask = async (id) => {
  const response = await fetch(`/api/tasks/${id}/complete`, {
    method: 'PUT',
  });
  return await response.json();
};

// Видалити завдання
const deleteTask = async (id) => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
};
```

### cURL

```bash
# Отримати всі завдання
curl -X GET http://localhost:3000/api/tasks

# Створити завдання
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "Нове завдання"}'

# Виконати завдання
curl -X PUT http://localhost:3000/api/tasks/1/complete

# Видалити завдання
curl -X DELETE http://localhost:3000/api/tasks/1

# Отримати статистику
curl -X GET http://localhost:3000/api/tasks/stats
```

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:3000/api"

# Отримати всі завдання
def get_tasks():
    response = requests.get(f"{BASE_URL}/tasks")
    return response.json()

# Створити завдання
def create_task(description):
    data = {"description": description}
    response = requests.post(f"{BASE_URL}/tasks", json=data)
    return response.json()

# Виконати завдання
def complete_task(task_id):
    response = requests.put(f"{BASE_URL}/tasks/{task_id}/complete")
    return response.json()

# Видалити завдання
def delete_task(task_id):
    response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
    return response.json()
```

## Rate Limiting

Поки що не реалізовано, але планується:
- 100 запитів на хвилину на IP
- 1000 запитів на годину на IP

## Версіонування

Поточна версія: `v1`

Майбутні версії будуть доступні за шляхом `/api/v2/tasks`

## WebSocket (Планується)

Для real-time оновлень:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('task_created', (task) => {
  console.log('New task:', task);
});

ws.on('task_completed', (task) => {
  console.log('Task completed:', task);
});
```

## Аутентифікація (Планується)

```javascript
// JWT токен в заголовку
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

## Пагінація (Планується)

```javascript
// GET /api/tasks?page=1&limit=10
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```