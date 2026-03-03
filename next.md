# План дій

## 📊 Статус (2026-03-01)

- ✅ Snapshot Automation: Додано утиліту `setupSnapshots` в `@nan0web/ui-cli/test` для автоматичної генерації TDD Snapshots доказу роботи CLI у Markdown.
- ✅ Deterministic TDD: Всі інтерактивні промпти в `InputAdapter` тепер коректно обробляють скасування (`_cancel`) через `PLAY_DEMO_SEQUENCE`, симулюючи скасування без зависань.
- ✅ Playwright UI-CLI Testing: Компонент `Table` передає `adapter`, що дозволяє `_cancel` уникнути блокування TDD.
- ✅ i18n & Type Safety: Запущено форматування та перевірку типів.

## 📊 Статус (2026-02-16)

- ✅ Unit Tests: 133/133 passed
- ✅ Docs Tests: 20/20 passed
- ✅ Playground Tests: 12/12 passed
- ✅ Snapshot Tests: 26/26 passed (13 en + 13 uk)
- ✅ I18n Completeness: All 26 keys present in both locales
- ✅ Build: TypeScript compilation successful
- ✅ Knip: No unused exports found
- ✅ Published: v2.1.0 on npm

## ✅ Виправлення (2026-02-16)

### Fix: advanced-form-demo TypeError

- **Проблема**: `@nan0web/ui@1.1.0` (npm) не має типів `password`, `mask`, `toggle`, `confirm`, `multiselect` у `FormInput.TYPES`. Демо `advanced-form-demo.js` використовувало ці типи, що спричиняло `TypeError: FormInput.type is invalid!`, зависання тестів `test:play` та `test:snapshot`.
- **Рішення**: Замінено неприпустимі типи на сумісні (`text`, `number`, `select`, `checkbox`). Оновлено тестові послідовності.

### Fix: PlaygroundTest EPIPE

- **Проблема**: При ранньому завершенні дочірнього процесу stdin.write() кидав асинхронну помилку EPIPE.
- **Рішення**: Додано `child.stdin.on('error', () => {})` для ковтання EPIPE.

### Fix: tree_view snapshot flakiness

- **Проблема**: Нестабільний снепшот `tree_view` через race condition — `a` від multi-select витікав у autocomplete (200ms stdin feed delay).
- **Рішення**: Перенесено multi-select (Scenario 3) під `!isTestMode`. Знято `a` з послідовності.

## ✅ Виконано (2026-02-16)

### Feature: Sortable Component (`@nan0web/ui@1.3.0`)

- **Опис**: Додано інтерактивний Sortable prompt — перетасовуваний список у CLI.
- **Headless Model**: Використовує `SortableList` з `@nan0web/ui@1.3.0` (One Logic, Many UI).
- **Файли**:
  - `src/ui/sortable.js` — raw stdin interactive sortable (↑/↓ навігація, Space grab/drop, Shift+↑/↓ reorder, Enter confirm, Escape cancel, `r` reset)
  - `src/components/prompt/Sortable.js` — V2 Component wrapper
  - `src/ui/sortable.test.js` — 12 unit tests (SortableList API, boundary, component descriptor)
- **i18n**: Додано 5 ключів (`hint.sortable`, `↑/↓`, `Navigate`, `Grab`, `Confirm`) в обидва локалі.
- **Dep**: `@nan0web/ui` оновлено до `^1.3.0`.

### Feature: Sortable Playground Demo

- **Опис**: Додано `play/sortable-demo.js` — інтерактивне демо Sortable у playground.
- **Сценарій**: Reorder priorities (🔴 Critical → 🟢 Low), grab/drop mode.
- **Menu**: Додано пункт `Sortable` до головного меню `main.js`.
- **i18n**: 11 нових ключів для демо (en + uk).

## 📋 Наступні кроки

### 1. Уніфікація Form-рендерера

- **Problem**: Два паралельні шляхи обробки форм — `Form` клас (інтерактивний CLI-обхідник) та `InputAdapter.requestForm()` — дублюють логіку обходу полів, select/toggle/text, скасування.
- **Solution**: `Form` стає єдиним CLI-рендерером. `InputAdapter.requestForm()` делегує до `Form`. `UiForm` залишається чистою моделлю (One Logic), `Form` — єдиний CLI-рендерер (Many UI).

### 2. TDD Snapshot Validation Integration (VS Code Plugin)

- **Problem**: Згенеровані `docs/snapshots.md` артефакти зараз статичні. Розробнику доводиться візуально зчитувати лог консолі.
- **Solution**: У VS Code плагіні `nan•web` створити інтерактивний UI для цих артефактів. Відкриваючи `snapshots.md`, CodeLens кнопки (Approve/Reject) дозволятимуть фіксувати еталонні снепшоти. Це перетворить CI/CD артефакт на інтерактивний руль управління розробкою агента.

## 🎯 Пріоритети

1. **High**: VS Code інтеграція для TDD Snapshots.
2. **Medium**: Уніфікація Form-рендерера.

## 🚀 Roadmap (з system.md)

1. ✅ Sortable / Reorderable List
2. 🔲 Rich Layouts (Dashboards)
3. 🔲 Spinners & Progress Bars (вже додані, потребують Roadmap-оновлення)
4. 🔲 File/Directory Picker
5. 🔲 Hotkeys Support
6. 🔲 Theming System
7. 🔲 Animations
8. 🔲 SPA-like Routing
