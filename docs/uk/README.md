# @nan0web/ui-cli

[🇬🇧 English version](../../README.md)

Сучасний інтерактивний адаптер введення для Node.js проєктів.
Побудований на базі рушія `prompts`, він забезпечує преміальний "Lux-рівень" термінального досвіду.

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/ui-cli` перетворює базові CLI-взаємодії на захопливі інтерактивні сценарії, використовуючи філософію "One Logic, Many UI".

Ключові особливості:
- **Інтерактивні Промпти** — стильні списки вибору, масковані поля введення та автозаповнення з пошуком.
- **Схема-Керовані Форми** — генерація складних CLI-форм безпосередньо з ваших моделей даних.
- **Преміальна Естетика** — багаті кольори, чітка структура та інтуїтивно зрозуміла навігація.
- **Одна Логіка, Багато UI** — використання однакової логіки як для Web, так і для Терміналу.

## Встановлення

Як встановити пакет?
```bash
npm install @nan0web/ui-cli
```

## nan0cli — Універсальний CLI-Запускач (Runner)

Бінарний файл `nan0cli` забезпечує універсальну точку входу для будь-якого додатка nan0web.
Він зчитує `package.json` додатка, знаходить CLI точку входу та виконує команди.

Бінарний файл `nan0cli` зареєстровано та доступно для використання.

### Обробка Помилок

Коли точку входу не знайдено, `nan0cli` відображає стилізовану помилку `Alert` та завершує роботу з кодом 1.
Усі помилки відображаються через компоненти `Logger` + `Alert` — ми ніколи не використовуємо чистий `console.log`.

Усі помилки красиво відформатовані.

## Використання (Архітектура V2)

Починаючи з версії v2.0, ми рекомендуємо використовувати функцію `render()` разом із Компонованими Компонентами (Composable Components).

### Інтерактивні Промпти

#### Введення та Пароль

Як використовувати компоненти Input та Password?
```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = 'Alice'
console.info(`User: ${user}`)
```
#### Вибір та Мультиселект

Як використовувати компонент Select?
```js
import { render, Select } from '@nan0web/ui-cli'
const lang = { value: 'en' }
console.info(`Selected: ${lang.value}`)
```
#### Мультиселект

Як використовувати компонент Multiselect?
```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`)
```
#### Масковане Введення

Як використовувати компонент Mask?
```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`)
```
#### Автозаповнення

Як використовувати компонент Autocomplete?
```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`)
```
#### Повзунок (Slider), Перемикач (Toggle) та Дата/Час (DateTime)

Як використовувати Slider та Toggle?
```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`)
const active = true
console.info(`Active: ${active}`)
```
#### DateTime

Як використовувати компонент DateTime?
```js
import { render, DateTime } from '@nan0web/ui-cli'
const date = '2026-02-05'
console.info(`Date: ${date}`)
```
### Статичні Відображення (Static Views)

#### Сповіщення (Alerts)

Як відображати Alerts?
```js
import { Alert } from '@nan0web/ui-cli'
console.info('Success Operation')
```
#### Динамічні Таблиці

Як відображати Таблиці?
```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data)
```
### Зворотний Зв'язок (Feedback) та Прогрес

#### Спінер (Spinner)

Як використовувати Spinner?
```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Loading...')
```
#### Індикатори Прогресу (Progress Bars)

Як використовувати ProgressBar?
```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Progress: 100%')
```
## Legacy API

### CLiInputAdapter

Як створити запит форми через CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```
### Функціональні Утиліти

#### ask()

Як поставити запитання за допомогою ask()?
```js
import { ask } from "@nan0web/ui-cli"
```
#### Контроль Виконання

#### pause()

Як призупинити виконання коду?
```js
import { pause } from '@nan0web/ui-cli'
await pause(10)
console.info('Done')
```
## Пісочниця (Playground)

Як запустити пісочницю?
```bash
npm run play
```

## Ліцензія

Як перевірити ліцензію? - [ISC LICENSE](../../LICENSE) файл.
