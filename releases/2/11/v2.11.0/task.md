# Реліз v2.11.0: Universal App-as-a-Model Runner (bootstrapApp)

## 🎯 Місія
Реалізація та стандартизація `bootstrapApp` у ядрі `@nan0web/ui-cli` для повної ліквідації шаблонного коду (Zero-Boilerplate) у CLI-утилітах. Це дозволяє створювати повноцінні CLI-додатки одним імпортом доменної моделі.

## ✅ Критерії приймання (DoD)
1. **Universal Runner**: `bootstrapApp` експортується з `@nan0web/ui-cli` і доступний для використання.
2. **Auto-mounting**: `bootstrapApp` автоматично монтує:
	- `_` (Sovereign Local) → `data/`
	- `~` (Home DB) → `~/.{appName}` або поточна директорія (у тестах).
3. **I18n Protocol**: `bootstrapApp` автоматично ініціалізує `I18nDb` та створює функцію `t()` для поточного `LANG`.
4. **Model-as-Schema v2 Argument Parsing**: Будь-яка `Model` з метаданими `help`, `default`, `alias` автоматично парситься з `process.argv` через `util.parseArgs`.
5. **Lifecycle Management**: `bootstrapApp` автоматично запускає `runGenerator`, обробляє `CancelError` та коректно завершує процес з відповідним exit code (0 для успіху, 1 для помилки).
6. **Zero Boilerplate**: Типовий `bin/cli.js` має містити лише 2-3 рядки коду (import + bootstrapApp).

## 🔍 Architecture Audit (Чекліст)
- [x] Чи прочитано Індекси екосистеми? (Так, `packages/index.md`)
- [x] Чи існують аналоги в пакетах? (Ні, це базовий оркестратор для UI-CLI)
- [x] Джерела даних: YAML, nano, md, json, csv? (Так, через DB та Model)
- [x] Чи відповідає UI-стандарту (Deep Linking)? (Так, через Universal URL Addressing)
