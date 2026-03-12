# Release v2.4.0 — Universal Snapshot Output Normalizer

## Місія

Створити загальну утиліту нормалізації CLI виводу для snapshot порівняння.
Кожен проєкт, що використовує CLI snapshot тести, має перестати дублювати
логіку ANSI strip, spinner frames, progress bars, duration timestamps.

## Scope

1. **`src/test/normalize.js`** — модуль з функціями `normalize(str, replacements=[])` та `collectReplacements(...components)`
2. **`Spinner.snapshotReplacements`** — статична властивість із regex-замінами для spinner frame/animation/duration
3. **`ProgressBar.snapshotReplacements`** — статична властивість із regex-замінами для progress bar
4. **Export via `@nan0web/ui-cli/test`** — `normalize` та `collectReplacements` мають бути доступні через sub-path `./test`
5. **Types** — `.d.ts` для `normalize.js`
6. **Рефакторинг `play/snapshot.test.js`** — замінити локальну `normalizeOutput()` на імпорт з `normalize`

## Acceptance Criteria (Definition of Done)

- [ ] `normalize(str)` видаляє ANSI коди та провідні пробіли
- [ ] `normalize(str, Spinner.snapshotReplacements)` нормалізує spinner frames, animation, та duration
- [ ] `normalize(str, ProgressBar.snapshotReplacements)` нормалізує progress bars
- [ ] `collectReplacements(Spinner, ProgressBar)` збирає всі replacements з обох компонентів
- [ ] `collectReplacements(Spinner, {})` ігнорує компоненти без `snapshotReplacements`
- [ ] `import { normalize, collectReplacements } from '@nan0web/ui-cli/test'` — працює
- [ ] `play/snapshot.test.js` використовує `normalize` замість локальної `normalizeOutput`
- [ ] Всі існуючі snapshot тести залишаються зеленими (регресія = 0)
- [ ] Компоненти `Spinner` та `ProgressBar` мають `snapshotReplacements` як статичну властивість

## Architecture Audit

- [x] Чи прочитано Індекси екосистеми? — Так, `src/test/index.js`, `package.json` exports
- [x] Чи існують аналоги в пакетах? — Ні, `normalizeOutput` дублюється локально
- [x] Джерела даних: не потребує YAML/DB
- [x] Чи відповідає UI-стандарту? — Так, це test utility, не UI
