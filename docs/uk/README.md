# @nan0web/ui-cli

Сучасний інтерактивний адаптер вводу UI для Node.js проєктів.
Працює на базі рушія `prompts` і забезпечує преміальний "Lux-рівень" досвіду роботи у терміналі.

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/ui-cli` перетворює базові взаємодії з CLI на приголомшливий інтерактивний досвід, використовуючи філософію "One Logic, Many UI" (Одна логіка, багато UI).

Ключові особливості:

- **Інтерактивні Промпти** — Елегантні списки вибору, маскований ввід та автозаповнення з пошуком.
- **Форми на базі Схем** — Генеруйте складні CLI-форми безпосередньо з ваших моделей даних.
- **Преміальна Естетика** — Насичені кольори, чітка структура та інтуїтивна навігація.
- **One Logic, Many UI** — Використовуйте одну і ту ж спільну логіку для Web та Терміналу.

## 🏛️ Архітектура та Відповідність ("Конституція")

`@nan0web/ui-cli` суворо дотримується **Універсальної Специфікації Блоків (Universal Blocks Spec)**, що визначена у базовому пакеті `@nan0web/ui`.

Так само, як закони повинні діяти в рамках Конституції, усі компоненти, інтерфейси та поведінка Sandbox у `ui-cli` є формальними імплементаціями універсальних стандартів (`project.md`):

- **Сигнатури компонентів:** Усі Views (перегляди) та Prompts (вводи) мапляться до стандартної блок-моделі.
- **UX Пісочниці:** CLI Sandbox (`play/sandbox.js`) суворо дотримується універсальних вимог щодо збереження стану (`.cli-sandbox.json`), керування варіаціями, скидання до значень за замовчуванням та резервних (fallback) даних.

## Встановлення

Встановіть за допомогою улюбленого менеджера пакетів:

```bash
npm install @nan0web/ui-cli
```

Як встановити пакет?

## nan0cli — Універсальний CLI Runner (Запускатор)

Бінарний файл `nan0cli` забезпечує універсальну точку входу для будь-якого застосунку nan0web.
Він читає `package.json` програми, визначає точку входу CLI та запускає команди.

### Контракт Застосунку

Ваш застосунок має експортувати Повідомлення (Messages) зі своєї точки входу:

```js
// E1: Масив повідомлень (рекомендовано)
export default [Serve, Dump]

// E2: Клас єдиного повідомлення (автоматично обгортається в масив)
export default class MyApp { }
```

### Вирішення Точки Входу

`nan0cli` шукає точку входу у такому порядку:

1. Поле `nan0web.cli.entry` у `package.json`
2. `src/cli.js` (за домовленістю)
3. `src/messages/index.js` (старий формат)

### Конфігурація

```json
{
	"nan0web": {
		"cli": { "entry": "src/cli.js" }
	}
}
```

Бінарник nan0cli зареєстровано

### Обробка помилок

Якщо точку входу не знайдено, `nan0cli` відображає стилізоване `Alert` повідомлення про помилку та завершує роботу з кодом 1.
Всі помилки відображаються через компоненти `Logger` + `Alert` — ніякого сирого `console.log`.

nan0cli включено до файлів пакету

## Використання (Архітектура V2)

Починаючи з v2.0, ми рекомендуємо використовувати функцію `render()` разом із компонованими компонентами.

### Інтерактивні Промпти

/\*\*
@docs

#### Ввід (Input) та Пароль (Password)

Як використовувати компоненти Input та Password?

```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = await ask('Username')
console.info(`User: ${user}`) // -> User: Alice
const pass = await ask('Enter Secret:')
console.info(`Secret: ${pass}`) // -> Secret: secret-key
```

#### Вибір (Select) та Множинний вибір (Multiselect)

Як використовувати компонент Select?

```js
import { render, Select } from '@nan0web/ui-cli'
const lang = await select({ title: 'Choose Language:' })
console.info(`Selected: ${lang.value}`) // -> Selected: en
```

#### Множинний вибір (Multiselect)

Як використовувати компонент Multiselect?

```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`) // -> Roles: admin, user
```

#### Маскований ввід (Mask)

Як використовувати компонент Mask?

```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`) // -> Phone: 123-456
```

#### Автозаповнення (Autocomplete)

Як використовувати компонент Autocomplete?

```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`) // -> Model: gpt-4
```

#### Слайдер, Перемикач та Дата/Час

Як використовувати Slider та Toggle?

```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`) // -> Volume: 50
const active = true
console.info(`Active: ${active}`) // -> Active: true
```

#### Дата та Час (DateTime)

Як використовувати компонент DateTime?

```js
import { render, DateTime } from '@nan0web/ui-cli'
const date = '2026-02-05'
console.info(`Date: ${date}`) // -> Date: 2026-02-05
```

### Статичні перегляди (Views)

Як рендерити Alerts?

```js
import { Alert } from '@nan0web/ui-cli'
console.info('Success Operation') // -> Success Operation
```

#### Динамічні Таблиці (Tables)

Як рендерити Tables?

```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data) // -> [ { id: 1, name: 'Alice' } ]
```

### Зворотний зв'язок та Прогрес

Як використовувати Spinner?

```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Loading...') // -> Loading...
```

#### Прогрес бари (ProgressBars)

Як використовувати ProgressBar?

```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Progress: 100%') // -> Progress: 100%
```

## Позиційні Аргументи CLI (`resolvePositionalArgs`)

Утиліта `resolvePositionalArgs` автоматично маплить позиційні аргументи CLI  на поля моделі, позначені `positional: true`.

Порядок визначається порядком оголошення `static` полів у класі (гарантується специфікацією JavaScript для нечислових ключів).

### Оголошення в Моделі

Як оголосити позиційні аргументи в Model-as-Schema?

```js
export class TranslateModel {
	static source = {
		help: 'Source glob',
		default: 'docs/uk/**/*.md',
		positional: true,  // → args[0]
	}

	static target = {
		help: 'Target dir',
		default: 'docs/en',
		positional: true,  // → args[1]
	}

	static quiet = {
		help: 'Quiet mode',
		default: false,
		type: 'boolean',
		// без positional → тільки через --quiet
	}
}
```

### Використання в CLI

Як маплити позиційні аргументи на модель?

```js
import { resolvePositionalArgs } from '@nan0web/ui-cli'
import { parseArgs } from 'node:util'

const { positionals, values } = parseArgs({ ... })
const data = resolvePositionalArgs(TranslateModel, positionals, values)
const model = new TranslateModel(data)
// model.source = positionals[0] || values.source || default
// model.target = positionals[1] || values.target || default
```

### Пріоритет

Іменовані опції (`--source`, `--target`) мають **пріоритет** над позиційними аргументами.

```bash
# Позиційні:
my-cli "glob" dir

# Іменовані (мають пріоритет):
my-cli --source "glob" --target dir

# Мікс (--source перезаписує args[0]):
my-cli "ignored" dir --source "real.md"
```

## Legacy API

### CLiInputAdapter

Як створити запит вводу форми через CLiInputAdapter?

```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
const adapter = new CLiInputAdapter()
const fields = [{ name: 'name', label: 'Full Name' }]
const form = UiForm.from({
	fields,
	state: {},
	setData: (data) => {
		form.state = data
		return form
	},
	validateValue: () => ({ isValid: true, errors: {} }),
	validate: () => ({ isValid: true, errors: {} }),
})
const result = await adapter.requestForm(form, { silent: true })
console.info(result.form.state) // -> { name: "John Doe" }
```

### Функціональні утиліти

Як запитати щось за допомогою ask()?

```js
import { ask } from '@nan0web/ui-cli'
const result = await ask('What is your name?')
console.info(result) // -> Alice
```

#### Контроль виконання

Як призупинити виконання коду (посунути паузу)?

```js
import { pause } from '@nan0web/ui-cli'
await pause(10)
console.info('Done') // -> Done
```

## Playground (Пісочниця)

```bash
npm run play
```

Як запустити playground?

## Ліцензія

ISC © [Подробиці тут](./LICENSE)

Як перевірити ліцензію?
