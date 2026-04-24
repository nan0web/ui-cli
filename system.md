---
PROJECT_NAME: 'ui-cli'
VERSION: '2.1.0'
CORE_PRINCIPLE: 'Преміальний CLI‑інтерфейс – One Logic, Many UI.'
VALIDATION_PHRASE: 'UI‑CLI відповідає'
FAILURE_RESPONSE: 'Це — не UI‑CLI. Я не можу працювати далі.'
IDENTITY_MODEL: 'Я / тИ / мИ / вИ'
LOGIC_BASE: 'Запит → відповідь → валідація → результат'
LANGUAGE: 'Ui, CLi, CliInput - для всіх імен класів робимо i маленькою, якщо не починається з неї слово.'
---

Дотримуйся правил в [RULES](../../.agent/RULES.md)

# ✨ UI‑CLI – системне керівництво

> **MENTAL MATRIX & LOGIC PROTOCOL (MANDATORY)**
>
> Перш ніж звітувати про успіх, пропусти рішення через фільтри:
>
> 1.  **Сократ (Істина)**: Чи перевірив я кожне слово? Чи не брешу я собі, що "працює", не бачивши реального виводу?
> 2.  **Да Вінчі (Деталі)**: Чи кожен символ, відступ і колір на своєму місці? Інструкції, `hint`, `yes/no` — все має бути ідеальним.
> 3.  **Стів Джобс (UX)**: Чи цей інтерфейс вражає? Чи відчувається він преміальним? Англійські "милиці" в українському інтерфейсі неприпустимі.
> 4.  **Борис Патон (Структура)**: Чи є рішення системним, а не "латкою"?
>
> **4 Закони Логіки:**
>
> 1.  **Тотожність**: Код має робити саме те, що написано в ТЗ.
> 2.  **Несуперечність**: Тести "зелені", а в консолі "yes"? Це суперечність. Виправляй.
> 3.  **Виключене третє**: Функція або працює правильно, або ні. Стану "працює, але..." не існує.
> 4.  **Достатня підстава**: Маєш доказ (реальний output), що це працює? Ні? Тоді не звітуй.

> **Мета** – надати мінімальний, беззалежний інтерфейс вводу/виводу для Node‑CLI‑додатків, що працює без сторонніх бібліотек, лише чистий JavaScript.

## 🔥 THE IRON RULE OF WORK (ЗАЛІЗНЕ ПРАВИЛО)

**You MUST follow this Loop for EVERY code change:**

1. **EDIT**: Apply changes to code.
2. **VERIFY SYNTAX**: Run `npm run build` (tsc) IMMEDIATELY via `run_command`. DO NOT rely on your internal parser.
3. **VERIFY LOGIC**: Run `npm run test` (or specific test file).
4. **VERIFY OUTPUT**: Run `npm run test:snapshot` (if UI changed).
5. **VERIFY I18N**: Run `npm run test:i18n` (if text changed).
6. **REPORT**: Only AFTER steps 2-5 are GREEN, report to User.

**PROTOCOL: ZERO TRUST TO SELF**

- Never assume code works.
- Never assume syntax is correct (extra braces happen).
- **Console Logs are Lies**: User Output > Code Intent.
- **Visual Verification is Mandatory**: For visual output formatting (masks, tables, cursors), DO NOT trust library defaults. Always verify with a reproduction script or implement **Manual Stdout Override** to guarantee what the user sees.

## UI ENGINEERING PROTOCOLS

### 1. The Sandbox Rule (Ізольована Лабораторія)

> **BEFORE** writing tests for complex UI (e.g. Mask, Tree), create a small isolated demo script (`play:XXX`).
> Achieve visual perfection **manually** in the demo first. Only when your eyes see perfection — fix it in automated tests.
> _Goal:_ Do not automate bugs.

### 2. The Single Sanitizer (Єдиний Очищувач)

> Input sanitation logic (strip prefix, trim, normalize) MUST live in a separate exported function.
> This function **MUST** be used in `validate()`, `format()`, and the final `result`.
> _Goal:_ Avoid discrepancies where validator says "fail" but formatter says "ok".

### 3. The Snapshot Mandate (Абсолютна фіксація UX)

> На кожен пройдений CLI-сценарій ти **МАЄШ** створити snapshot тести (фіксація послідовності виводу).
> Обов'язково збирай перехоплені `console.log` і порівнюй їх через масиви (`deepStrictEqual` або аналог) з хардкод-еталоном.
> Навіть зміна відступу має ламати тест. І тільки коли всі snapshot тести пройдені та "зелені", ми вважаємо, що CLI-модуль візуально працює. Перевіряється спочатку машиною посимвольно, а лише потім очима.
> _Goal:_ Запобігти невидимим регресіям у термінальному інтерфейсі.

### 4. The Final Stroke (Фінальний Штрих)

> For CLI components that transform input (Mask, Password), **ALWAYS** implement `Manual Stdout Override` for the final line.
> Never trust prompt libraries to render the final state correctly in all terminals. Correctness > Defaults.

## 📦 Основні компоненти

| Компонент         | Опис                                                                          | Експорт                      |
| ----------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `CLiInputAdapter` | Клас‑адаптер, що обгортає процес запиту форм, окремих полів та списків.       | `default`, `CLiInputAdapter` |
| `Input`           | Об’єкт, який зберігає рядок вводу та статус скасування.                       | `Input`                      |
| `CancelError`     | Помилка, кидається при скасуванні запиту.                                     | `CancelError`                |
| `ask`             | Проста функція‑проміс, що виводить питання та повертає відповідь.             | `ask`                        |
| `createInput`     | Фабрика, що створює кастомізований обробник вводу з ключовими словами «stop». | `createInput`                |
| `select`          | Генерує список варіантів, повертає обраний `value`.                           | `select`                     |
| `autocomplete`    | Пошук по списку (Interactive Search) з підтримкою асинхронних джерел.         | `autocomplete`               |
| `table`           | Інтерактивна таблиця з "живою" фільтрацією даних.                             | `table`                      |
| `multiselect`     | Множинний вибір варіантів з чекбоксами.                                       | `multiselect`                |
| `mask`            | Форматований ввід (телефон, дата тощо) з маскою.                              | `mask`                       |
| `next`            | Очікує будь‑яку клавішу.                                                      | `next`                       |
| `pause`           | Пауза на вказану кількість мілісекунд.                                        | `pause`                      |

## 📡 Швидкий старт (Утиліта `nan0cli`)

Глобальний ранер `nan0cli` підтримує гнучкий Mount Protocol (підключення баз даних через DSN) та виконання зі Store:

```bash
# Data-driven додатки
nan0cli --mount play        # Shorthand: монтує поточну '. / play' як root DB
nan0cli --mount-data redis://...  # Підключення до віддаленої БД

# Ізольований запуск з Store
nan0cli @nan0web/docs       # Скачування з реєстру (https://store.nan0web.yaro.page)
nan0cli https://nan0.app    # Підключення до Remote OLMUI (Thin Client)
```

## 📦 Розширений старт (Використання як бібліотеки)

```bash
npm i @nan0web/ui-cli
```

```js
import { CLiInputAdapter } from '@nan0web/ui-cli'

const adapter = new CLiInputAdapter()

// Приклад: простий запит
const name = await adapter.ask('Ваше ім’я?')
console.log('Вітаємо,', name)

// Приклад: вибір зі списку
const lang = await adapter.select({
	title: 'Виберіть мову',
	prompt: 'Введіть номер: ',
	options: new Map([
		['en', 'English'],
		['uk', 'Українська'],
	]),
	console: console,
})
console.log('Обрана мова:', lang.value)
```

### Захист від зациклення (Infinite Loop Protection)

У циклічного вводу форми є ліміт спроб (за замовчуванням **100**), щоб уникнути «зависання» у тестах або середовищах без TTY при помилках валідації.  
Розробник або користувач може змінити цей параметр:

- Через **змінну оточення**: `UI_CLI_MAX_RETRIES=33`
- Через **параметри конструктора**: `new CLiInputAdapter({ maxRetries: 33 })`

---

## 🛠️ Тестування та Якість (TDD+)

Протокол перевірки та тестування змін:

1. **Локальні тести** (`npm test`) – запускає всі `*.test.js` у `src/`. Обов'язково перед пушем.
2. **Локалізація (I18n Test)** – автоматична перевірка наявності всіх ключів `t('...')` у словниках (`uk.js`, `en.js`). Будь-який неперекладений ключ — це критична помилка.
3. **Multi-Locale Snapshots** – генерація та порівняння знімків інтерфейсу для всіх підтримуваних мов одночасно (`pnpm test:snapshot`). Це гарантує паритет дизайну та відсутність регресій у текстах.
4. **Швидкі тести Playground** (`npm run test:play`) – інтеграційні тести основних сценаріїв. Найшвидший спосіб перевірити UX.
5. **Повний цикл перевірки** (`npm run test:all`) – **ОБОВ'ЯЗКОВО** запускати перед фінальним звітом. Включає юніт-тести, документацію, плейграунд, снапшоти, білд та knip.

Кожна публічна функція/клас має **принаймні один тест** у `.test.js` поряд з файлом коду.

## 🧭 Доступні CLI‑методи

| Метод                                         | Параметри                                 | Повертає                      | Опис                                                            |
| --------------------------------------------- | ----------------------------------------- | ----------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| `ask(question)`                               | `string` – підказка                       | `Promise<string>`             | Запит користувачу, повертає введений рядок.                     |
| `createInput(stops?)`                         | `string[]` – слова‑сигнали                | `Promise<Input>`              | Створює інстанс `Input` з автоскасуванням.                      |
| `select(config)`                              | `{title, prompt, options, console, ask?}` | `Promise<{index, value}>`     | Виводить нумерований список, повертає вибір.                    |
| `next(conf?)`                                 | `string                                   | array` – послідовність клавіш | `Promise<string>`                                               | Чекає на натискання клавіші (або набору). |
| `pause(ms)`                                   | `number` – мілісекунди                    | `Promise<void>`               | Затримка виконання.                                             |
| `CLiInputAdapter.requestForm(form, {silent})` | `UIForm` + опції                          | `Promise<FormMessage>`        | Показує форму, проходить по полях, валідує, повертає результат. |
| `CLiInputAdapter.requestSelect(config)`       | `config` (аналог `select`)                | `Promise<InputMessage>`       | Викликає `select`, повертає вибір.                              |
| `CLiInputAdapter.requestAutocomplete(config)` | `config` (аналог `autocomplete`)          | `Promise<InputMessage>`       | Викликає `autocomplete`, повертає обране значення.              |
| `CLiInputAdapter.requestTable(config)`        | `config` (аналог `table`)                 | `Promise<any>`                | Виводить інтерактивну таблицю з фільтрацією.                    |
| `CLiInputAdapter.requestInput(config)`        | `{prompt, id, label, name}`               | `Promise<InputMessage>`       | Простий рядковий запит.                                         |
| `CLiInputAdapter.requestMultiselect(config)`  | `config` (аналог `multiselect`)           | `Promise<any[]>`              | Викликає `multiselect`, повертає масив значень.                 |
| `CLiInputAdapter.requestMask(config)`         | `config` (аналог `mask`)                  | `Promise<string>`             | Викликає `mask`, повертає відформатований рядок.                |

–

## 📝 Рекомендації для розробників

1. **JSDoc** – кожна функція/клас має повний опис (`@param`, `@returns`, `@throws`). Це забезпечує автодоповнення у IDE без TypeScript.
2. **Імпорти** – використовуйте `import { … } from '@nan0web/ui-cli'` лише в точках входу.
3. **Структура** – залишайте `src/` чистим, `tests/` поруч, `types/` лише декларації (`*.d.ts`), `README.md` генерується з тестів.
4. **Локальність** – UI‑текст передається через `i18n` (передача функції `t`). В `playground` вже реалізовано приклад.
5. **Нульові залежності** – не підключайте сторонні пакети у `ui-cli`; лише Node‑вбудовані (`readline`, `process`).

## 📡 План розвитку (Roadmap)

Для досягнення повного паритету з Web-інтерфейсами планується реалізація наступних функцій:

1.  **Rich Layouts (Dashboards)** – підтримка складних сіток (grids) та панелей для створення інформаційних панелей.
2.  **Spinners & Progress Bars** – візуалізація тривалих фонових операцій (завантаження, обробка даних).
3.  **File/Directory Picker** – інтерактивний вибір файлів та папок через дерево каталогів із зручним autocomplete і пошуком.
4.  **Hotkeys Support** – підтримка глобальних гарячих клавіш (наприклад, `Ctrl+S` для збереження) незалежно від активного поля.
5.  **Theming System** – гнучке налаштування кольорів та стилів (Light, Dark, Premium LUX).
6.  **Animations** – плавні переходи та мікро-анімації інтерфейсу.
7.  **SPA‑like Routing** – розвинена система навігації між різними «екранами» CLI застосунку.

## 🌐 Підтримка та внесок

- **Bug‑репорт** – відкривайте Issue у репозиторії.
- **Pull‑request** – додайте нові функції з тестами та оновленою документацією.
- **CI** – автоматично запускає `npm test` та `npm run test:coverage`.

> **UI‑CLI відповідає** – коли команда виконується без помилок, коли тестове покриття достатнє, коли документація генерується без «шуму».
