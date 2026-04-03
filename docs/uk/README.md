# @nan0web/ui-cli

[🇺🇦 Українська версія](./docs/uk/README.md) | [🇬🇧 English version](../../README.md)

Сучасний, інтерактивний UI адаптер введення для проектів Node.js.
Працює на двигуні `prompts`, забезпечуючи преміальний термінальний досвід рівня "Lux".

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/ui-cli` перетворює базові CLI взаємодії на вражаючий інтерактивний досвід, використовуючи філософію "Одна логіка, багато інтерфейсів".

Ключові особливості:
- **Універсальний запуск** — Запускайте свій CLI додаток в 1 рядок коду з `bootstrapApp`.
- **Інтерактивні запити** — Елегантні списки вибору, масковане введення та пошуковий автокомпліт.
- **Форми на основі схем** — Генеруйте складні CLI форми прямо з моделей даних.
- **Преміальна естетика** — Насичені кольори, чітка структура та інтуїтивна навігація.
- **Одна логіка, багато інтерфейсів** — Використовуйте ту саму логіку для Web та Терміналу.

## Встановлення

Як встановити пакет?
```bash
npm install @nan0web/ui-cli
```

## Універсальний запуск CLI

`bootstrapApp` — це сучасний спосіб ініціалізації CLI додатків.
Він бере на себе парсинг моделей в аргументи, ініціалізацію i18n та керування життєвим циклом.

### Швидкий старт

### Безпека: Протокол seal()

Для забезпечення цілісності системи, `bootstrapApp` автоматично блокує базу даних за допомогою `db.seal()`.
Це запобігає будь-яким змінам структури БД або точок монтування після завершення ініціалізації.
**Вимога**: Необхідна сучасна версія `@nan0web/db` з підтримкою протоколу seal.

### Як запустити CLI додаток?

```js
import { bootstrapApp } from '@nan0web/ui-cli'
import { MyModel } from './models.js'
// await bootstrapApp(MyModel)
```

## Використання (Архітектура V2)

Починаючи з версії v2.0, ми рекомендуємо використовувати функцію `render()` з компонентами, що комбінуються.

### Інтерактивні запити

#### Введення та Пароль

Як використовувати компоненти Input та Password?
```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = 'Alice'
console.info(`User: ${user}`)
```

#### Вибір та Множинний вибір

Як використовувати компонент Select?
```js
import { render, Select } from '@nan0web/ui-cli'
const lang = { value: 'en' }
console.info(`Selected: ${lang.value}`)
```

#### Множинний вибір

Як використовувати компонент Multiselect?
```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`)
```

#### Масковане введення

Як використовувати компонент Mask?
```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`)
```

#### Автокомпліт

Як використовувати компонент Autocomplete?
```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`)
```

#### Слайдер, Перемикач та Дата/Час

Як використовувати Slider та Toggle?
```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`)
const active = true
console.info(`Active: ${active}`)
```

#### Вибір дерева
Зручний вибір ієрархічних даних.

Як використовувати компонент Tree?
```js
import { render, Tree } from '@nan0web/ui-cli'
const selected = '/src/index.js'
console.info(`Selected file: ${selected}`)
```

#### Списки, що сортуються
Перетягування елементів прямо в терміналі.

Як використовувати компонент Sortable?
```js
import { render, Sortable } from '@nan0web/ui-cli'
const items = ['First', 'Second', 'Third']
console.info(`Order: ${items.join(' > ')}`)
```

### Статичні представлення

#### Сповіщення (Alerts)

Як відобразити Alert?
```js
import { Alert } from '@nan0web/ui-cli'
console.info('Success Operation')
```

#### Динамічні таблиці

Як відобразити Table?
```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data)
```

### Фідбек та прогрес

#### Спінер (Spinner)

Як використовувати Spinner?
```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Loading...')
```

#### Прогрес-бари (ProgressBar)

Як використовувати ProgressBar?
```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Progress: 100%')
```

## Застарілий API (Legacy)

### CLiInputAdapter

Як запитати введення форми через CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```

## Пісочниця (Playground)

Як запустити пісочницю?
```bash
npm run play
```

## Ліцензія

Як перевірити ліцензію? - файл [ISC LICENSE](./LICENSE).
