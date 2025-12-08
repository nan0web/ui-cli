# @nan0web/ui-cli

Маленький, беззалежний UI‑адаптер вводу для JavaScript‑проєктів.  
Надає CLI‑реалізацію, яку легко інтегрувати у логіку застосунку.

|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Тестове покриття|Фічі|Версія npm|
|---|---|---|---|---|
|🟢 `96.1%`|🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/ui-cli/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/ui-cli/blob/main/docs/uk/README.md)|🟡 `77.9%`|✅ d.ts 📜 system.md 🕹️ playground|—|

## Опис

Пакет `@nan0web/ui-cli` надає набір інструментів для обробки вводу користувача в CLI через
структуровані форми, вибір варіантів та підказки.
Використовує патерн адаптера для безшовної інтеграції з моделями даних застосунку.

### Основні класи

- **`CLIInputAdapter`** — обробляє запити форм, вводу та вибору в CLI.  
- **`Input`** — обгортає введене користувачем значення та статус скасування.  
- **`CancelError`** — викидається, коли користувач скасовує операцію.

Ці класи ідеальні для створення підказок, майстрів, форм та інтерактивних інструментів CLI з мінімальними накладними витратами.

## Встановлення

### Через npm
```bash
npm install @nan0web/ui-cli
```

### Через pnpm
```bash
pnpm add @nan0web/ui-cli
```

### Через yarn
```bash
yarn add @nan0web/ui-cli
```

## Приклади використання

### CLIInputAdapter

Адаптер містить методи для роботи з формами, ввідними та вибірковими запитами.

#### `requestForm(form, options)`

Відображає форму та послідовно збирає ввід полів з валідацією.

```js
import { UiForm } from '@nan0web/ui'
import { CLIInputAdapter } from '@nan0web/ui-cli'

const adapter = new CLIInputAdapter()

const fields = [
  { name: "name", label: "Повне ім’я", required: true },
  { name: "email", label: "Email", type: "email", required: true },
]

const validateValue = (name, value) => {
  if (name === "email" && !value.includes("@")) {
    return { isValid: false, errors: { email: "Некоректний email" } }
  }
  return { isValid: true, errors: {} }
}
const setData = (data) => {
  const newForm = { ...form }
  newForm.state = data
  return newForm
}
const form = UiForm.from({
  title: "Профіль користувача",
  fields,
  id: "user-profile-form",
  validateValue,
  setData,
  state: {},
  validate: () => ({ isValid: true, errors: {} }),
})

const result = await adapter.requestForm(form, { silent: true })

console.info(result.form.state) // ← { name: "John Doe", email: "John.Doe@example.com" }
```

#### `requestSelect(config)`

Показує список варіантів і повертає обраний елемент.

```js
import { CLIInputAdapter } from '@nan0web/ui-cli'

const adapter = new CLIInputAdapter()
const config = {
  title: "Виберіть мову:",
  prompt: "Мова (1‑2): ",
  id: "language-select",
  options: new Map([
    ["en", "English"],
    ["uk", "Ukrainian"],
  ]),
}

const result = await adapter.requestSelect(config)
console.info(result.value) // ← Message { body: "en", head: {} }
```

### Утиліти вводу

#### Клас `Input`

Зберігає введене значення і відстежує скасування.

```js
import { Input } from '@nan0web/ui-cli'

const input = new Input({ value: "test", stops: ["quit"] })
console.info(String(input))      // ← test
console.info(input.value)        // ← test
console.info(input.cancelled)    // ← false

input.value = "quit"
console.info(input.cancelled)    // ← true
```

#### `ask(question)`

Виводить питання та повертає відповідь у вигляді промісу.

```js
import { ask } from "@nan0web/ui-cli"

const result = await ask("Яке ваше ім’я?")
console.info(result)
```

#### `createInput(stops)`

Створює налаштовуваний обробник вводів зі словами‑стопами.

```js
import { createInput } from '@nan0web/ui-cli'

const handler = createInput(["cancel"])
console.info(typeof handler === "function") // ← true
```

#### `select(config)`

Показує список варіантів та повертає обраний елемент.

```js
import { select } from '@nan0web/ui-cli'

const config = {
  title: "Оберіть варіант:",
  prompt: "Вибір (1‑3): ",
  options: ["Варіант A", "Варіант B", "Варіант C"],
  console: console,
}

const result = await select(config)
console.info(result.value)
```

#### `next(conf)`

Чекає натискання клавіші (або послідовності клавіш) для продовження процесу.

```js
import { next } from '@nan0web/ui-cli'

const result = await next()
console.info(typeof result === "string")
```

#### `pause(ms)`

Повертає проміс, який виконується після заданої затримки.

```js
import { pause } from '@nan0web/ui-cli'
const before = Date.now()
await pause(10)
const after = Date.now()
console.info(after - before >= 10) // ← true
```

### Помилки

#### `CancelError`

Викидається, коли користувач перериває процес.

```js
import { CancelError } from '@nan0web/ui-cli'

try {
  // ... код, який може бути скасований
} catch (err) {
  if (err instanceof CancelError) {
    console.error(err.message) // ← Операція скасована користувачем
  }
}
```

## API

### `CLIInputAdapter`

- **Методи**
  - `requestForm(form, options)` — асинхронно обробляє запит форми.
  - `requestSelect(config)` — асинхронно обробляє запит вибору.
  - `requestInput(config)` — асинхронно обробляє запит одиничного вводу.

### `Input`

- **Властивості**
  - `value` – (string) поточне введене значення.
  - `stops` – (array) ключові слова‑стопи.
  - `cancelled` – (boolean) чи було скасовано ввід.
- **Методи**
  - `toString()` – повертає поточне значення як рядок.
  - `static from(input)` – створює інстанс з об’єкта вводу.

### `ask(question)`

- **Параметри**
  - `question` (string) – текст підказки.
- **Повертає**
  - `Promise<string>` – відповідь користувача.

### `createInput(stops)`

- **Параметри**
  - `stops` (array) – значення, при яких ввід скасовується.
- **Повертає**
  - функція‑обробник.

### `select(config)`

- **Параметри**
  - `config.title` (string) – заголовок вибору.
  - `config.prompt` (string) – підказка.
  - `config.options` (array | Map) – варіанти вибору.
- **Повертає**
  - `Promise<{ index, value }>` – обраний елемент.

### `next([conf])`

- **Параметри**
  - `conf` (string) – приймана послідовність клавіш.
- **Повертає**
  - `Promise<string>` – натиснута клавіша.

### `pause(ms)`

- **Параметри**
  - `ms` (number) – затримка у мілісекундах.
- **Повертає**
  - `Promise<void>`.

### `CancelError`

Розширює `Error`, викидається при скасуванні вводу.

## Тестування

Усі експортовані класи та функції повинні проходити базові тести.

## JavaScript

Для автодоповнення використовується `d.ts` (type‑definition) файли.

## Playground

Як запустити скрипт Playground?

```bash
# Клонуємо репозиторій і запускаємо CLI playground
git clone https://github.com/nan0web/ui-cli.git
cd ui-cli
npm install
npm run playground
```

## Спільна розробка

Як долучитися? – [дивіться тут](./CONTRIBUTING.md)

## Ліцензія

Як задокументовано у файлі ліцензії ISC – [дивіться тут](./LICENSE)
