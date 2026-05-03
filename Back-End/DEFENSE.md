# LiteracyBee — Preparation Guide for Project Defense

Этот документ — исчерпывающий справочник для вас и вашего напарника перед защитой. В нём собрано: как запустить и продемонстрировать систему, какие команды выполнить, где в коде находятся ключевые части, и подробные ответы на типичные вопросы комиссии с привязкой к файлам.

Содержание
- Быстрая подготовка окружения
- Пошаговый сценарий демонстрации (Phase 1)
- Архитектурный разбор и ERD (Phase 2)
- Подробные ответы на вопросы (Phase 3) — с прямыми ссылками на файлы
- Технические детали: транзакции, миграции, тесты, CI
- Список команд (PowerShell) для быстрой демонстрации
- FAQ и сценарии отладки

---

## 1. Быстрая подготовка окружения

1. Убедитесь, что в `Back-End/.env` заданы:
   - `DATABASE_URL` — URL к PostgreSQL
   - `JWT_SECRET` — секрет для подписи JWT
   - `JWT_EXPIRES_IN` (опционально)
   - `REFRESH_TOKEN_DAYS` (опционально, по умолчанию 30)
   - `BCRYPT_ROUNDS` (опционально)

2. Поднять БД и установить зависимости:
```powershell
cd C:\Users\while\Documents\Back-end\Back-End
npm install
# если используете docker-compose, запустите:
docker-compose up -d
```

3. Применить миграции (если нужно):
```powershell
npx prisma migrate status
# если миграции не применены:
npx prisma migrate dev --name ensure_schema
```

4. Запустить seed бейджей:
```powershell
node scripts/seedBadges.js
```

5. Запустить backend и frontend:
```powershell
# backend
node index.js
# frontend
cd C:\Users\while\Documents\Back-end\literacybee-frontend
npm install
npm start
```

6. Запустить тесты (локально):
```powershell
cd C:\Users\while\Documents\Back-end\Back-End
npm test
```

---

## 2. Скрипт Live Demo (Phase 1) — пошагово и с командами

Цель: показать полный flow — регистрация родителя → создание ребёнка → вход ребёнка → прохождение упражнения → начисление XP и выдача бейджа.

Рекомендуемая последовательность (время ~7 минут):

1) Health check (10s)
```powershell
curl http://localhost:3000/
```
Ожидание: { status: 'ok' }

2) Register parent (30s)
```powershell
curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"parent@example.com","password":"password123","name":"Parent"}' -i | jq
```
Обратите внимание: сервер устанавливает httpOnly cookie `refreshToken` (Set-Cookie в заголовках). В теле ответа возвращается `user` и `token` (access token).
Файл: `Back-End/services/authService.js` — `registerParent` вызывает `generateTokens`; установка cookie выполняется в `Back-End/controllers/authController.js`.

3) Login parent (20s)
```powershell
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"parent@example.com","password":"password123"}' -i | jq
```
Сохраните `token` из тела ответа в переменную `TOKEN`. Сервер установит httpOnly cookie `refreshToken` — его не видно в JS (проверяйте Set-Cookie в заголовках или в DevTools → Application → Cookies).

4) Create child (20s)
```powershell
curl -s -X POST http://localhost:3000/api/auth/children -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Kid","pin":"1234"}' | jq
```
Ответ: создан child (id). Файл: `Back-End/controllers/authController.js` и `Back-End/services/authService.js::createChild`.

5) Child login (20s)
```powershell
curl -s -X POST http://localhost:3000/api/auth/child/login -H "Content-Type: application/json" -d '{"childId":"<childId>","pin":"1234"}' | jq
```
Получите `CHILD_TOKEN`. Для child-login refresh cookie также устанавливается при успешном входе.

6) Show lessons & ETag (30s)
```powershell
curl -I -H "Authorization: Bearer $CHILD_TOKEN" http://localhost:3000/api/lessons
```
Покажите заголовки `ETag` и `Cache-Control`. Код: `Back-End/controllers/lessonController.js`.

7) Get exercises and submit (1–2 min)
```powershell
curl -s -H "Authorization: Bearer $CHILD_TOKEN" http://localhost:3000/api/lessons/<lessonId>/exercises | jq
# submit answer
curl -s -X POST http://localhost:3000/api/lessons/child/<childId>/exercise/<exerciseId> -H "Authorization: Bearer $CHILD_TOKEN" -H "Content-Type: application/json" -d '{"answer":"the answer"}' | jq
```
Ожидание: JSON с { isCorrect, xpEarned, newScore, isCompleted }
Код: `Back-End/services/lessonService.js` (tx и прогресс), `Back-End/services/gamificationService.js`.

8) Check badges (30s)
```powershell
curl -s -H "Authorization: Bearer $CHILD_TOKEN" http://localhost:3000/api/badges/for-child/<childId> | jq
```
Ожидание: список бейджей с полем `earned`.
Код: `Back-End/services/badgeService.js` и `Back-End/controllers/badgeController.js`.

9) Show audit_log (30s)
- Откройте Prisma Studio:
```powershell
npx prisma studio
```
- В Studio откройте таблицу `audit_log` и покажите недавние записи.
Код: `Back-End/models/auditLogModel.js`, `Back-End/services/auditLogService.js`.

10) Show CI (10–20s)
- Откройте GitHub Actions → ваш репозиторий → workflow CI — покажите, что тесты запускаются.
Workflow: `.github/workflows/ci.yml`.

---

## 3. Architecture Walkthrough (Phase 2) — что говорить и что открыть

1) Layers & flow (30–40s)
- Покажите дерево `Back-End/` с папками `controllers`, `services`, `models`, `middleware`, `routes`.
- Объясните: Controller = HTTP handling + validation + error mapping; Service = business logic; Model = DB access via Prisma.

2) ERD (1 min)
- Сущности: `users` (parent/child/admin), `units` → `lessons` → `exercises`, `exercise_attempts`, `progress` (unique child+lesson), `streaks`, `badges`, `user_badges`, `audit_log`, `refresh_tokens`.
- Файлы: `Back-End/prisma/schema.prisma` — откройте и пролистайте.

3) Concurrency & Transactions (40s)
- Объясните атомарную операцию submit: `LessonService.submitExercise` использует `prisma.$transaction` для записи attempt и progress, затем (за пределами tx) запускает gamification (`updateStreak` / `refreshBadges`) — это снижает шанс долгих транзакций и предотвращает откат прогресса при сбое нотификаций.

4) Security (30s)
- JWT auth: `Back-End/services/authService.js::generateToken` и `middleware/authMiddleware.js`.
- Bcrypt hashing: `authService` перед сохранением паролей/PIN.
- RBAC middleware: `requireRole('admin')` в `adminRoutes.js`.
- Rate limiting + Helmet + CORS in `index.js`.

---

## 4. Подробные ответы на вопросы (с привязкой к коду)

Ниже — развёрнутые ответы, которые стоит заучить и уметь озвучить. Для каждого ответа я указал ключевые файлы и (по возможности) номера функций.

### Вопрос: Как считается ежедневный streak?
- Код: `Back-End/services/gamificationService.js::updateStreak`
- Алгоритм:
  1. Берём текущую дату (UTC, без времени).
  2. Получаем `streak` для `childId` (StreakModel.findByChild).
  3. Если нет записи — создаём с current=1.
  4. Если last_activity_date === today → ничего не делаем.
  5. Если разница 1 день → current_streak++.
  6. Иначе → current_streak = 1.
  7. Если current % 7 === 0 → checkAndAwardBadge(childId, 'streak_days', current).
  8. Сохраняем через `StreakModel.createOrUpdate`.
- Где хранится: `schema.prisma` модель `streaks`.

### Вопрос: Как предотвращается доступ родителя к чужим детям?
- Код: `Back-End/middleware/authMiddleware.js::authorizeChildAccess`
- Логика:
  - Если роль 'child' → требуем совпадение userId===childId.
  - Если роль 'parent' → загружаем child и сравниваем `child.parent_id === req.userId`.
  - Админ имеет доступ.
- Роуты применяют middleware: `lessonRoutes.js` использует `authorizeChildAccess` на /progress и /dashboard.

### Вопрос: Что происходит на бэкенде при submit exercise? (подробно)
- Контроллер: `Back-End/controllers/lessonController.js::submitExercise` — проверка body и делегирование в `LessonService.submitExercise`.
- Сервис: `Back-End/services/lessonService.js`:
  1. Открываем транзакцию (`prisma.$transaction`).
  2. Проверяем существование exercise.
  3. Проверяем, был ли уже верный attempt (чтобы избежать повторного начисления XP).
  4. Создаём `exercise_attempts` запись.
  5. Считаем progress по уроку: получаем все упражнения урока, собираем последние попытки по каждому, вычисляем процент верных.
  6. Upsert в `progress` (уникальность child+lesson).
  7. Коммит транзакции.
  8. После транзакции вызываем `GamificationService.updateStreak` и `refreshBadges` (отдельно, в try/catch), чтобы при падении этих операций не откатывался прогресс.
- Gamification: `Back-End/services/gamificationService.js` — ищет бейджи по критериям (BadgeModel.findByCriteria) и вызывает `UserBadgeModel.award`, создаёт `notifications`.

### Вопрос: Как работает бейдж система — event-driven или polling?
- Текущая реализация — event-driven: на событие submitExercise вызываем `refreshBadges` для ребёнка — это фактически обработка события в том же потоке.
- Для production-готовности рекомендуется асинхронный подход: пушить событие в очередь (Bull/Redis или RabbitMQ) и иметь воркер для выдачи бейджей и нотификаций, с retry и мониторингом.

### Вопрос: Что если background job, считающий бейджи, упадёт?
- В текущей реализации ошибку логируем, но основная операция (submit) уже завершена, потому что gamification выполняется после tx. Поэтому прогресс не потеряется; бейджи могут не выдать — требуется фоновые retry.

### Вопрос: Почему Prisma + Postgres + Node.js?
- Node.js — быстрый I/O для API, большой экосистемный стек, общность с frontend (JS).
- Prisma — удобный client API, миграции и хорошая интеграция с TypeScript; генерирует client для моделей.
- Postgres — реляционная модель подходит для сложных отношений (parent-child, unique constraints, transactions).

### Вопрос: Где и как хранятся refresh tokens?
- Мы добавили модель `refresh_tokens` в `schema.prisma`.
- Код: `Back-End/models/refreshTokenModel.js` — create/find/revoke.
- `Back-End/services/authService.js::generateTokens` создаёт accessToken (JWT) и refreshToken (случайная строка, 32 байта hex), сохраняет refreshToken в таблице с `expires_at`.
- Endpoint `/api/auth/refresh` (`Back-End/controllers/authController.js::refreshToken`) принимает refreshToken и возвращает новый accessToken после проверки.
- Endpoint `/api/auth/logout` удаляет refresh token.

### Вопрос: Пример unit-теста для gamification
- Файл теста: `Back-End/tests/gamification.test.js`.
- Тест мокирует `BadgeModel.findByCriteria`, `UserBadgeModel.award`, `NotificationModel.create`, вызывает `GamificationService.checkAndAwardBadge`, проверяет вызовы.

---

## 5. Технические детали: транзакции, миграции, тесты, CI

### Транзакции
- Используем Prisma transactions (`prisma.$transaction`) для атомарных изменений (exercise_attempts + progress). Код в `Back-End/services/lessonService.js`.

### Миграции
- Prisma schema находится в `Back-End/prisma/schema.prisma`.
- Убедитесь, что `prisma.config.ts` указывает на `DATABASE_URL`.
- Команды для миграций: `npx prisma migrate dev --name <name>` / `npx prisma migrate status`.

### Тесты и CI
- Jest настроен в `Back-End/package.json` (скрипт `npm test`).
- Basic unit test added: `Back-End/tests/gamification.test.js`.
- GitHub Actions workflow: `.github/workflows/ci.yml` запускает `npm test` в папке `Back-End`.

---

## 6. Список команд (PowerShell) для быстрой демонстрации

Регистрация и логины (пример):
```powershell
# Register
curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"parent@example.com","password":"password123","name":"Parent"}' | jq
# Login parent, save token
$TOKEN = (curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"parent@example.com","password":"password123"}' | jq -r '.token')
# Create child
curl -s -X POST http://localhost:3000/api/auth/children -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Kid","pin":"1234"}' | jq
# Child login
$CHILD_TOKEN = (curl -s -X POST http://localhost:3000/api/auth/child/login -H "Content-Type: application/json" -d '{"childId":"<childId>","pin":"1234"}' | jq -r '.token')
# Submit exercise
curl -s -X POST http://localhost:3000/api/lessons/child/<childId>/exercise/<exerciseId> -H "Authorization: Bearer $CHILD_TOKEN" -H "Content-Type: application/json" -d '{"answer":"..."}' | jq
# Get badges for child
curl -s -H "Authorization: Bearer $CHILD_TOKEN" http://localhost:3000/api/badges/for-child/<childId> | jq
```

---

## 7. FAQ и отладочные сценарии

Q: Если миграции не применяются — что делать?
- Проверь `DATABASE_URL`, `prisma.config.ts`, запусти `npx prisma migrate status`. Если ошибка про `datasource.url` — убедись, что запускаешь в каталоге `Back-End` и что `prisma.config.ts` доступен.

Q: Если тесты падают в CI, но локально проходят?
- Проверь environment variables, убедись, что CI запускает в правильной рабочей директории (`defaults.run.working-directory: Back-End`).

Q: Где посмотреть audit_log?
- `npx prisma studio` → таблица `audit_log`. Или прямой SQL через psql: `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;`.

---

## Заключение

Этот документ покрывает всё, что нужно для демонстрации и последующих технических вопросов. Если хотите, я могу:
- сгенерировать PDF из этого Markdown-файла (скачаем на машину),
- расширить unit + integration тесты и настроить CI так, чтобы запускал миграции и integration tests в containerized Postgres,
- или помочь практиковать ответы (я могу сгенерировать карточки вопросов).

Удачи на защите — если хотите, начну сразу расширять тестовое покрытие и CI (напишите "делай тесты"), или подготовлю PDF шпаргалку (напишите "делай PDF").

