# @nan0web/ui-cli

[🇬🇧 English](../en/README.md) | [🇺🇦 Українська](../uk/README.md)

Сучасний інтерактивний UI-адаптер для проектів на Node.js. 
Працює на базі рушія `prompts`, забезпечуючи преміальний досвід терміналу рівня "Lux".

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/ui-cli` перетворює базові взаємодії в командному рядку на приголомшливий інтерактивний досвід, використовуючи філософію "One Logic, Many UI".

Ключові особливості:
- **Універсальний запуск** — Запуск CLI-додатку в 1 рядок коду через `bootstrapApp`.
- **Інтерактивні запити** — Списки вибору, маскований ввід та пошук з автодоповненням.
- **Естетичні стандарти** — Піксельно-точний 5-символьний відступ (`{}  |`) для всіх компонентів.
- **Форми на базі Схем** — Генерація складних CLI-форм безпосередньо з ваших моделей даних.
- **Оптимізація збірки** — Надшвидка перевірка типів у монорепозиторії завдяки ізоляції глибини пакетів.
- **One Logic, Many UI** — Використання єдиної бізнес-логіки для Web та Терміналу.

## Встановлення

Як встановити пакет?
```bash
npm install @nan0web/ui-cli
```

## Універсальний CLI-раннер

`bootstrapApp` — це сучасний спосіб запуску CLI-додатків. 
Він автоматизує парсинг аргументів (model-to-argv), ініціалізацію i18n та керування життєвим циклом додатку.

### Безпека: Протокол seal()

Для забезпечення цілісності системи, `bootstrapApp` автоматично блокує базу даних за допомогою `db.seal()`.
Це запобігає будь-яким змінам структури БД або точок монтування під час роботи.
**Вимога**: Потрібна сучасна версія `@nan0web/db` з підтримкою протоколу seal.

## Model-as-App (Рекомендовано)

Клас `ModelAsApp` забезпечує єдину архітектуру як для доменної логіки, так і для UI-презентації.
Він автоматично генерує текст допомоги (help), маршрутизацію підкоманд та змінні i18n.

Як запустити CLI-додаток?
```js
import { bootstrapApp, ModelAsApp, show } from '@nan0web/ui-cli'
class StatusApp extends ModelAsApp {
	static UI = { title: 'Статус', fine: 'Все гаразд' }
	static debug = { type: 'boolean', help: 'Режим налагодження', default: false }
	async *run() {
		yield show(StatusApp.UI.fine)
	}
}
class RootApp extends ModelAsApp {
	static command = { positional: true, type: [StatusApp] }
}
await bootstrapApp(RootApp)
```

### Фонове виконання та вбудовані додатки

Ви можете виконувати OLMUI-модель програмно без інтерактивного UI-адаптера через `ModelAsApp.execute()`. 
Це ідеально підходить для скриптів автоматизації, таких як генератор документації `ReadmeMd`.

Також стандартні інструменти мають нативні аліаси в `nan0cli`:

Як запустити вбудовані додатки, наприклад ReadmeMd?
```js
/* Програмне виконання:
import { ReadmeMd } from '@nan0web/ui-cli/domain/ReadmeMd.js'
await ReadmeMd.execute({ data: 'docs' })
*/
/* Або через аліас у терміналі:
nan0cli docs --data=docs
*/
```

## Використання (Архітектура V2)

Починаючи з версії v2.0, ми рекомендуємо використовувати функцію `render()` з компонентами, що комбінуються.

### Інтерактивні запити

#### Ввід та Пароль

Як використовувати компоненти Input та Password?
```js
import { render, Input, Password } from '@nan0web/ui-cli'
const user = 'Alice'
console.info(`Користувач: ${user}`)
```

#### Вибір та Множинний вибір

Як використовувати компонент Select?
```js
import { render, Select } from '@nan0web/ui-cli'
const lang = { value: 'uk' }
console.info(`Вибрано: ${lang.value}`)
```

#### Множинний вибір

Як використовувати компонент Multiselect?
```js
import { render, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Ролі: ${roles.join(', ')}`)
```

#### Маскований ввід

Як використовувати компонент Mask?
```js
import { render, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Телефон: ${phone}`)
```

#### Автодоповнення

Як використовувати компонент Autocomplete?
```js
import { render, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Модель: ${model}`)
```

#### Слайдер, Перемикач та Дата/Час

Як використовувати Slider та Toggle?
```js
import { render, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Гучність: ${volume}`)
const active = true
console.info(`Активно: ${active}`)
```

#### Вибір у дереві

Зручний вибір ієрархічних даних.

Як використовувати компонент Tree?
```js
import { render, Tree } from '@nan0web/ui-cli'
const selected = '/src/index.js'
console.info(`Вибраний файл: ${selected}`)
```

#### Списки з сортуванням

Перетягування елементів прямо в терміналі.

Як використовувати компонент Sortable?
```js
import { render, Sortable } from '@nan0web/ui-cli'
const items = ['Перший', 'Другий', 'Третій']
console.info(`Порядок: ${items.join(' > ')}`)
```

### Статичні представлення

#### Сповіщення (Alerts)

Як відображати Alert?
```js
import { Alert } from '@nan0web/ui-cli'
console.info('Операція успішна')
```

#### Динамічні таблиці

Як відображати таблиці?
```js
import { Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
console.info(data)
```

### Зворотній зв'язок та Прогрес

#### Спінер (Spinner)

Як використовувати Spinner?
```js
import { render, Spinner } from '@nan0web/ui-cli'
console.info('Завантаження...')
```

#### Прогрес-бари

Як використовувати ProgressBar?
```js
import { render, ProgressBar } from '@nan0web/ui-cli'
console.info('Прогрес: 100%')
```

### Експорт підшляхів (OLMUI)

Пакет використовує архітектуру "One Logic, Many UI" (OLMUI), експортуючи лише суворі архітектурні межі.

- `import { ModelAsApp } from '@nan0web/ui-cli/domain'` — базові класи домену.
- `import { App } from '@nan0web/ui-cli/app'` — головна модель додатку та роутер.
- `import { playground } from '@nan0web/ui-cli/test'` — утиліти для тестування та знімків (snapshots).

Як використовувати ізольовані моделі домену та UI-адаптери?

## Legacy API

### CLiInputAdapter

Як запитувати ввід через CLiInputAdapter?
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
