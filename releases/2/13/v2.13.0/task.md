[English Version](./task.en.md)

# Місія Релізу v2.13.0 — CLI Mount Protocol

Потрібно запускати пісочницю у такий самий декларативний спосіб як додаток і документацію.

## Scope

Впровадження стандартного протоколу монтування баз даних для `nan0cli` через декларативні CLI-прапорці. Ціль — зробити кожен запуск ізольованим, конфігурованим і data-driven без зміни коду.

## Мотивація (контекст)

Поточний стан: `--data play` — незадокументований shorthand, реалізований вручну в `bin/nan0cli.js`.
Потрібна: формальна, розширювана архітектура прапорців монтування, де source — це повноцінний DSN (не лише шлях до файлової системи).

## Дизайн: DB Mount Protocol

### Прапорці монтування

| Прапорець            | Mount dest | Призначення                             |
| -------------------- | ---------- | --------------------------------------- |
| `--mount play`       | `.` (root) | Shorthand: root mount без вказання dest |
| `--mount-data play`  | `.`        | Явний root data mount                   |
| `--mount-app .`      | `@app`     | Workspace root (код проекту)            |
| `--mount ~/path`     | `~`        | Home namespace mount                    |
| `--mount @app:./src` | `@app`     | Повний синтакс `dest:source`            |

### DSN як source

Source може бути не лише шляхом до директорії, а й повноцінним DSN-рядком для різних адаптерів `@nan0web/db-*`:

```
--mount-data redis://localhost:6379/myapp
--mount-data sqlite://./data.db
--mount-app  ./                           (DBFS — файлова система)
--mount      @cache:memcached://localhost
```

Таким чином `nan0cli` стає **Database-Agnostic Entry Point** — той самий додаток можна запустити проти Redis, SQLite, або локальних файлів, лише змінивши DSN у команді.

### package.json конфігурація (defaults)

```json
"nan0web": {
  "mounts": {
    ".": "data",
    "@app": ".",
    "~": "~/.myapp"
  },
  "cli": {
    "entry": "src/domain/App.js"
  }
}
```

CLI-прапорці **перевизначають** дефолти з `package.json`.

### Власний bin-файл = ізоляція

Кожен додаток має свій бінарник з мінімальним шаблоном:

```js
#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { CodingApp } from '../src/CodingApp.js'
import process from 'node:process'

bootstrapApp(CodingApp).catch((e) => {
	console.error(e)
	process.exit(1)
})
```

Через `bootstrapApp` передаються дефолтні монти, мова, root. Користувач запускає власний `myapp`, а не `nan0cli`. `nan0cli` — інструмент розробника.

### Store: реєстр додатків

URL-схема: `https://store.nan0web.yaro.page/{vendor}/{app}`, у майбутньому може бути власний домен типу `store.nan0web.dev`. Також кожен може запустити свій store і просто вказувати його URL як головний для додатків.

А значить нам потрібен ще правильний `~/.nan0web/config.nan0`, а саме 'store.url', який може бути рядком або масивом, якщо мИ хочемо підтримувати кілька магазинів.

```
nan0cli @nan0web/docs    → store lookup → завантаження → запуск
nan0cli https://nan0.app → thin-client  → потокова сесія
```

Store надає: `package.json`, ESM endpoint, DSN-конфігурацію.  
Локальний кеш: `~/.nan0web/store/`.  
Пошук і індексація — нативно через DB API.

## UI Components Stabilization (Tests)

Цей реліз також закриває борги по тестуванню базових візуальних компонентів:
- **Spinner**: Перевірка асихронного циклу, рендерінгу кадрів (frames) та зупинки.
- **ProgressBar**: Валідація прогресу, кастомних символів та завершення.
- **Toggle**: Логіка перемикання станів (ON/OFF).

## Definition of Done

- [x] `--mount play` → mounts root `.` to `play/` (DBFS)
- [x] `--mount-data <dsn>` → mounts `.` to any DSN
- [x] `--mount-app <dsn>` → mounts `@app` to any DSN
- [x] `--mount <dest>:<dsn>` → full format
- [x] DSN parser for `redis://`, `sqlite://`, `fs://`
- [x] Read defaults from `package.json["nan0web"].mounts`
- [x] CLI flags override `package.json` defaults
- [x] UI Components Stabilization:
  - [x] `Spinner` (Model & Prompt & Impl)
  - [x] `ProgressBar` (Model & Impl)
  - [x] `Toggle` (Model & Prompt & Impl)
- [x] Оновлення документації: `seed.md`, `system.md`
- [x] Тести релізу (task.test.js & task.ui.spec.js)

## Architecture Audit (Чекліст)

- [ ] Чи прочитано Індекси екосистеми?
- [ ] Чи існують аналоги в пакетах? (`@nan0web/db`, `@nan0web/db-fs`, `@nan0web/db-redis`)
- [ ] Джерела даних: DSN підтримує FS, Redis, SQLite, Memory?
- [ ] Чи відповідає UI-стандарту (Deep Linking)?
