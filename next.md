# План дій для наступної сесії

## ✅ Виконано (2026-02-05)

### 1. Автоматизація Тестування Локалізації (I18n) ✅
- ✅ **Новий тест `test:i18n`**: Створено скрипт `scripts/check-i18n.js`, який сканує `src/**/*.js` на наявність викликів `t('...')` та перевіряє їх наявність у всіх файлах `play/vocabs/*.js`.
- ✅ **Multi-Locale Snapshots**: Підтверджено, що `snapshot.test.js` гарантовано запускається для всіх мов (uk, en) та порівнює результати.
- ✅ **Виправлення помилок**: Знайдено та виправлено друкарську помилку в українському словнику ("Вик" → "Вік").

### 2. Посилення Типізації Промптів ✅
- ✅ **Strict Props Validation**: Створено модуль `src/core/PropValidation.js` з валідаторами типів (validateDate, validateString, validateFunction, validateBoolean, validateNumber).
- ✅ **DateTime Auto-conversion**: Впроваджено автоматичну конвертацію рядків дат у об'єкти Date у компоненті `DateTime`.
- ✅ **Validation Integration**: Додано валідацію пропсів до компонентів `DateTime` та `Confirm`.

### 3. Виправлення V2 Demo ✅
- ✅ **Mock File System**: Додано статичні mock-дані для Tree компонента замість читання реальної файлової системи.
- ✅ **Test Sequence Fix**: Виправлено тестову послідовність для Multiselect у v2_components снепшоті.
- ✅ **Snapshot Update**: Оновити снепшоти для коректного відображення всіх полів.

### 4. V2 TDD Regression Fixes (Latest) ✅
- ✅ **Navigation**: Added Main Menu Loop to V2 Demo (Showcase/Exit), matching V1 UX.
- ✅ **Clean Exit**: Fixed process hang by implementing `pause()` instead of `resume()` in `ui/next.js` cleanup. Verified with regression test.
- ✅ **Deep Localization**: 
  - `Confirm`: Localized "yes/no" output in summary AND native prompts (`active`/`inactive`).
  - `Multiselect` & `Select`: Added localized hints support.
  - `Multiselect`: Extracted and localized default instructions (arrow keys, etc).
- ✅ **Regression Suite**: Added dedicated tests (`test/hang.test.js`, `test/confirm_format.test.js`, etc) to prevent regressions.

## 📋 Наступні кроки

### 5. Розширення Валідації та Локалізації ✅
- ✅ **Strict Prop Validation**: Added `validateString`, `validateNumber`, etc. to `Input`, `Select`, `Slider`, `TreeView`.
- ✅ **Deep Localization**: Localized `Table` filter/status messages and `Confirm` component defaults (yes/no).
- ✅ **Default Instructions**: Extracted instructions to vocabularies.

### 6. Рефакторинг Архітектури Пакетів ✅
- ✅ **InputAdapter Injection**: Updated `CLiInputAdapter` to inject `t` function into all component requests.
- ✅ **System.md Update**: Confirmed `system.md` standards are up-to-date.
- ✅ **Executable Documentation**: Updated `README.md.js` tests and verified `README.md`.
- ✅ **Type Definitions**: Rebuilt `d.ts` files with new JSDoc.

### 7. Покращення CI/CD ✅
- ✅ **Pre-commit Hook**: Added `test:i18n` to pre-commit checks.
- ⏭️ **Snapshot Diff Review**: *Skipped (requires repository admin).*

### 8. Документація ✅
- ✅ **Migration Guide**: Created `MIGRATION.md` covering strict validation and I18n.
- ✅ **Best Practices**: Documented in `MIGRATION.md`.

### 9. Виправлення Візуальних Дефектів (Mask) ✅
- ✅ **Manual Stdout Override**: `Mask` component now manually overwrites the final output line to ensure the formatted value (e.g. `+380...`) is displayed instead of raw input (`067...`).
- ✅ **Test-First Protocol**: Implemented strict `mask_visual.test.js` failing first, then passing.
- ✅ **TDD Verification**: Added "TEST-FIRST FOR BUGS" protocol to `system.md`.
- ✅ **Unit Tests**: Added `src/ui/mask_unit.test.js` verifying mask behavior, including the known "crooked" prefix handling (shifting).

## 📋 Наступні кроки

### 10. Покращення Логіки Маски (Smart Prefix)
- **Problem**: When user types prefix (e.g. `38067...`), it shifts data (`+38 (380)...`).
- **Solution**: Implement smart prefix detection in `formatMask` to ignore user-typed prefix if it matches the mask static prefix.
- **Reference**: See `src/ui/mask_unit.test.js` for reproduction case.

### 9. Реліз (Release)
- **Bump Version**: Update version in `package.json`.
- **Publish**: Run `npm publish`.
- **GitHub Release**: Create release tag.

## 🎯 Пріоритети

1. **High**: Publish Release.

## 📊 Статус Тестів

- ✅ Unit Tests: 122/122 passed
- ✅ Snapshot Tests: 26/26 passed (13 en + 13 uk)
- ✅ I18n Completeness: All 21 keys present in both locales
- ✅ Build: TypeScript compilation successful
- ✅ Knip: No unused exports found
