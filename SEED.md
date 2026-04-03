# 🌱 SEED: @nan0web/ui-cli v2.10.0

> **Release Manifest**: Interactive ContentViewer, OLMUI Form Popups, Model-First i18n.

## 🚀 Що нового
- **Interactive ContentViewer**: ПовноекраннийMarkdown Viewer з підтримкою посилань, кнопок та навігації по фокусу.
- **Form Popups**: Можливість відкривати форми як popup-вікна прямо з Markdown-контенту.
- **Model-First i18n**: Повна інтеграція з `@nan0web/i18n` — усі лейбли футера та Explorer керуються через доменні моделі.
- **Universal Auditor Migration**: Перехід на стандартизований інспектор архітектури `i18n inspect`.

## 🛠 Ключові виправлення (Snapshot Audit)
- **Undefined Title**: Вирішено проблему рендерингу заголовка (ANSI leaked).
- **NaN% CPU Metrics**: Виправлено відображення метрик продуктивності у V2 Demo.
- **UK Footer Fix**: Лейбли `Focus`, `Select`, `Back`, `Scroll` тепер коректно локалізовуються українською.

---
> _"UI — це не статичний екран. Це вікно в систему наміру."_
> **— АрхіТехноМаг**

## 🏗 Впроваджено: Universal App-as-a-Model Runner (cliApp) ✅ DONE
- **Намір**: Реалізовано `cliApp` у ядрі `ui-cli` для повної ліквідації шаблонного коду в CLI-утилітах (Zero-Boilerplate).
- **Результат**: Створено універсальний оркестратор `import { cliApp } from '@nan0web/ui-cli'`, який:
  1. Приймає на вхід Data-Driven `Model`.
  2. Автоматично парсить `process.argv` через `modelFromArgv`.
  3. Розгортає системні залежності (`db`, `fs`) та монтує `~` (Home DB).
  4. Автоматично ініціалізує `I18nDb` та стандартизований `CLiInputAdapter`.
  5. Керує життєвим циклом `runGenerator` та статусом виходу (`process.exit`).
