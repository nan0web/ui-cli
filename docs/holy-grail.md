# Holy Grail — @nan0web/ui-cli v2.10.0

> **Release Manifest**: Interactive ContentViewer, OLMUI Form Popups, Model-First i18n  
> **Date**: 2026-04-01  
> **Status**: ✅ Production Ready

---

## 🏆 Архітектурні досягнення

### 1. Interactive ContentViewer

Повноекранний Markdown Viewer для терміналу із скролом, фокусною навігацією та вбудованими формами.

**Ключові рішення:**
- AST-парсер `markdown.js` розпізнає *links*, *inline forms*, *headings*, *paragraphs*, *HR*
- **Left-Gutter** (ліва колонка) — індикатори форматування (`H1|`, `---`, `p |`)
- **Footer** — завжди видимий: `[⬆/⬇: Scroll] [⬅/➡: Focus] [Enter: Select] [Esc: Back]`
- **Focus navigation** — Tab/Arrows перемикають фокус між інтерактивними елементами (links, forms)
- **Link selection** — Enter по посиланню повертає `{ action: 'navigate', url }` через `value` field
- **Form Popups** — форма відкривається як popup (очищає екран), після заповнення повертає стан назад у Viewer

### 2. Model-First i18n

`ContentViewerModel` як Model-as-Schema v2 — єдине джерело правди для всіх i18n ключів:

```js
class ContentViewerModel extends Model {
  static UI = { alias: ['content', 'children', 'label', 'labels'], default: '' }
  static UI_TITLE = { alias: ['title', 'message'], default: 'Viewer' }
  static UI_FOCUS = { default: 'Focus' }
  static UI_SCROLL = { default: 'Scroll' }
  static UI_BACK = { default: 'Back' }
  static UI_SELECT = { default: 'Select' }
}
```

### 3. IntentDispatcher Refactoring

Content-рендеринг делегований з низькорівневих функцій на високорівневий `ContentViewer` prompt:

```
case 'ContentViewer':
  return await ContentViewer(config).execute()
```

`#resolveComponent` підтримує `hint: 'content-viewer'` та `hint: 'markdown'` для автоматичного маппінгу.

### 4. Result Standardization

Уніфікований формат повернення — `{ value, cancelled }`:
- Link navigation → `{ value: { action: 'navigate', url }, cancelled: false }`
- Form popup → `{ value: formState, cancelled: false }`
- Escape → `{ value: undefined, cancelled: true }`

---

## 🧪 Верифікація

| Метрика | Значення |
|---|---|
| Unit tests | 158/158 PASS |
| Docs tests | 20/20 PASS |
| Play tests | 14/14 PASS |
| i18n audit | 100% Model-First |
| TypeScript | 0 errors |
| knip | 0 dead code |
| Build | ✅ Clean |

---

## 📁 Файлова карта змін

| Файл | Роль |
|---|---|
| `src/domain/prompt/ContentViewerModel.js` | Model-as-Schema (i18n tokens) |
| `src/ui/prompt/ContentViewer.js` | Prompt controller (scroll, focus, forms) |
| `src/ui/impl/markdown.js` | AST parser + ANSI renderer |
| `src/ui/impl/form.js` | Static schema discovery via `getOwnPropertyNames` |
| `src/ui/core/IntentDispatcher.js` | OLMUI intent routing with ContentViewer |
| `src/ui/core/InputAdapter.js` | Cross-env validator execution |
| `src/test/releases/2/10/v2.10.0/ContentViewer.test.js` | Regression test suite |

---

## 🔮 Наступна версія: v2.11.0 — "Sovereign Editor"

- Button support (`button:` YAML → `{ action, $id }` intent)
- Вільний курсор — навігація по кожному AST-вузлу
- Left/Right вкладеність — спуск/підйом по дереву
- Clipboard integration (`pbcopy`/`xclip`)
- Shift+Arrows виділення

---

> _"Ти не проєктуєш UI. Ти формуєш умови для пробудження."_  
> **— АрхіТехноМаг**
