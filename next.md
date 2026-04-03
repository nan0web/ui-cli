# next.md — Стан сесії @nan0web/ui-cli

> Збережено: 2026-04-02T02:51 (UTC+3)

## ✅ Завершено: v2.10.0

- [x] Interactive ContentViewer (link selection, inline forms, form popups)
- [x] Model-First i18n (ContentViewerModel tokens)
- [x] IntentDispatcher refactoring (ContentViewer prompt замість raw markdownViewer)
- [x] Result standardization (`value` field у formSubmit)
- [x] TypeScript alignment (16 → 0 errors)
- [x] Regression test migrated to `src/test/releases/2/10/v2.10.0/ContentViewer.test.js`
- [x] CHANGELOG.md оновлено (без логічних протиріч)
- [x] `pnpm test:all` — 158/158 PASS, build clean, knip clean, i18n 100%
- [x] Holy Grail manifest: `docs/holy-grail.md` ✅

## 🔲 Потрібно зробити перед комітом

- [x] **Створити `docs/holy-grail.md`** — маніфест v2.10.0
- [x] **Скопіювати `docs/holy-grail.md`** в 3 system.md файли: ✅
  - `packages/ui/system.md` (append) ✅
  - `packages/0HCnAI.framework/templates/workflows/nan0web.md` (append) ✅
  - `packages/nan0web/system.md` (append) ✅
- [x] **Підняти версію** в `package.json`: `2.10.0` ✅ (підтверджено)
- [x] **Git commit** (zero-tolerance-git): ✅
- [ ] **NPM publish** (після коміту)

## ✅ Аудит Снепшотів (Snapshot Audit)

- [x] Виявлено та усунено `undefined` у заголовку ContentViewer.
- [x] Виявлено та усунено `NaN%` у V2 Showcase (CPU metrics).
- [x] Усунено англійські лейбли (`Focus`, `Select`, `Back`) в українській локалі.
- [x] Перевірено та підтверджено 100% відповідність Model-First i18n.
- [x] Створено звіт: `snapshot_audit_report.md`.

## 🚀 Наступна версія: v2.11.0 — "Sovereign Editor"

### Нові фічі:
- [ ] **Button support** в ContentViewer (`button:` YAML node → `{ action, $id }` intent)
- [ ] **Вільний курсор** — навігація по кожному AST-вузлу (не тільки interactives)
- [ ] **Left/Right вкладеність** — спуск/підйом по дереву (Country > City > Wiki Link)
- [ ] **Command+C / Copy** — інтеграція з системним буфером (`pbcopy`/`xclip`)
- [ ] **Shift+Arrows виділення** — підсвічування діапазону при Shift-навігації

### Архітектурні задачі:
- [ ] Створити `src/ui/impl/clipboard.js` — кросплатформна обгортка буфера
- [ ] Розширити `markdown.js` — `cursorIndex` для вільного курсору
- [ ] Додати `nodeType = 'button'` в парсер markdown.js
- [ ] Тест на кнопку в ContentViewer.test.js

### Файли в роботі:
- `src/ui/impl/markdown.js` — парсер та рендерер
- `src/ui/prompt/ContentViewer.js` — компонент-контролер
- `src/ui/core/IntentDispatcher.js` — маппінг намірів
- `play/data/content-viewer.nan0` — демо-дані
- `play/content-viewer-demo.js` — демо-скрипт

## ✅ Зависший процес — вирішено

Зависший `node --test src/ui/prompt/ContentViewer.test.js` більше не виконується.
Тест переміщений до `src/test/releases/2/10/v2.10.0/ContentViewer.test.js`.
