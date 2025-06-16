# Permissions Service

Микросервис управления правами на Node.js + TypeScript с использованием NATS.io и PostgreSQL.

## Особенности

- **RPC через NATS.io**: Общение по протоколу request/reply
- **PostgreSQL**: Хранение прав через raw SQL запросы
- **Кэширование**: Использование NATS Key-Value для кэширования
- **Типизированная библиотека**: Экспорт TypeScript типов и helper-функций
- **Структурированное логирование**: JSON логи с Winston
- **Обработка ошибок**: Graceful fallback и кодированные ошибки

## Архитектура

```
src/
├── index.ts                 # Точка входа приложения
├── types/                   # TypeScript типы и интерфейсы
├── services/
│   ├── permissions.service.ts  # Бизнес-логика управления правами
│   ├── cache.service.ts        # Сервис кэширования NATS KV
│   └── nats-rpc.server.ts      # NATS RPC сервер
├── repository/
│   └── permissions.repository.ts # Работа с PostgreSQL
├── utils/
│   └── logger.ts               # Логирование
├── client.ts                   # Типизированный клиент
└── database.ts                 # Подключение к БД
```

## API Endpoints

### permissions.grant
Назначить право API-ключу.
```json
// Запрос
{
  "apiKey": "abcd-1234",
  "module": "trades",
  "action": "create"
}

// Ответ
{ "status": "ok" }
```

### permissions.revoke
Отозвать право у API-ключа.
```json
// Запрос
{
  "apiKey": "abcd-1234", 
  "module": "trades",
  "action": "create_manual"
}

// Ответ
{ "status": "ok" }
```

### permissions.check
Проверить наличие права у ключа.
```json
// Запрос
{ 
  "apiKey": "abcd-1234",
  "module": "trades", 
  "action": "create"
}

// Ответ
{ "allowed": true }
```

### permissions.list
Получить все права по ключу.
```json
// Запрос
{ "apiKey": "abcd-1234" }

// Ответ
{
  "permissions": [
    { "module": "trades", "action": "create" },
    { "module": "trades", "action": "create_manual" }
  ]
}
```

## Установка и запуск

### Предварительные требования
- Node.js 18+
- Docker и Docker Compose
- NATS CLI (для тестирования)

### Шаги запуска

1. **Клонировать репозиторий**
   ```bash
   git clone <repository-url>
   cd permissions-service
   ```

2. **Установить зависимости**
   ```bash
   npm install
   ```

3. **Запустить PostgreSQL и NATS**
   ```bash
   docker-compose up -d postgres nats
   ```

4. **Собрать и запустить сервис**
   ```bash
   npm run build
   npm start
   ```

### Конфигурация

Создайте `.env` файл или используйте переменные окружения:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=permissions_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# NATS
NATS_URL=nats://localhost:4222

# Logging
LOG_LEVEL=info
```

## Тестирование

### С помощью NATS CLI

```bash
# Установить NATS CLI
go install github.com/nats-io/natscli/nats@latest

# Запустить тесты
./scripts/test.sh
```

### Ручное тестирование

```bash
# Grant permission
nats req permissions.grant '{"apiKey": "test-key", "module": "trades", "action": "create"}'

# Check permission
nats req permissions.check '{"apiKey": "test-key", "module": "trades", "action": "create"}'

# List permissions
nats req permissions.list '{"apiKey": "test-key"}'

# Revoke permission
nats req permissions.revoke '{"apiKey": "test-key", "module": "trades", "action": "create"}'
```

## Использование клиентской библиотеки

```typescript
import { PermissionsClient, ErrorCode } from './src/client';

async function example() {
  const client = await PermissionsClient.create('nats://localhost:4222');
  
  try {
    // Grant permission
    await client.grant({
      apiKey: 'my-api-key',
      module: 'trades',
      action: 'create'
    });
    
    // Check permission
    const result = await client.check({
      apiKey: 'my-api-key',
      module: 'trades', 
      action: 'create'
    });
    
    console.log('Allowed:', result.allowed);
    
    // List permissions
    const permissions = await client.list({ apiKey: 'my-api-key' });
    console.log('Permissions:', permissions.permissions);
    
  } catch (error) {
    if (error.error?.code === ErrorCode.API_KEY_NOT_FOUND) {
      console.log('API key not found');
    }
  } finally {
    await client.close();
  }
}
```

## Обработка ошибок

Сервис возвращает структурированные ошибки:

```json
{
  "error": {
    "code": "api_key_not_found",
    "message": "API key not found"
  }
}
```

### Коды ошибок
- `api_key_not_found` - API ключ не найден
- `db_error` - Ошибка базы данных
- `cache_error` - Ошибка кэша
- `invalid_payload` - Некорректные данные
- `permission_already_exists` - Право уже существует
- `permission_not_found` - Право не найдено
- `nats_error` - Ошибка NATS
- `validation_error` - Ошибка валидации
- `internal_error` - Внутренняя ошибка

## Docker

### Запуск всего стека
```bash
docker-compose up -d
```

### Только инфраструктура
```bash
docker-compose up -d postgres nats
```

## Производительность

- **Кэширование**: Все запросы check/list сначала проверяют NATS KV
- **Индексы БД**: Оптимизированные индексы для быстрого поиска
- **Connection pooling**: Пул соединений с PostgreSQL
- **Graceful shutdown**: Корректное завершение работы

## Мониторинг

Логи в JSON формате содержат:
- Входящие запросы
- Результаты операций  
- Обновления кэша
- Ошибки с контекстом

## Лицензия

MIT
