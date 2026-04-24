# 🚀 Пул завдань @nan0web/ui-cli (next.md)

## ✅ Завершено (Release v2.13.0)
- [x] **Identity-Aware Runner**: `bootstrapApp` тепер автоматично визначає пакет та модель додатка.
- [x] **Mount Protocol**: Реалізовано DSN-монтування (`fs://`, `memory://` тощо) та стандартні системні префікси.
- [x] **Secure Bootstrap**: Впроваджено обов'язковий `db.seal()` драйвера для захисту VFS при запуску додатків.
- [x] **Refactored modelFromArgv**: Покращено парсинг аргументів з підтримкою рекурсивних команд.
- [x] **TypeScript Stability**: Виправлено всі помилки типізації у `ui-cli`.

## 🛠 Поточні завдання
- [ ] **Config Persistence**: Реалізувати `~/.nan0web/config.nan0` для збереження кастомних маунтів.
- [ ] **CLI Component Gallery**: Оновити галерею знімків (snapshots) для нових компонентів та VFS-шляхів.
- [ ] **I18n Context**: Стабілізувати передачу контексту перекладів у вкладені моделі через `modelFromArgv`.

## 📅 Roadmap
- [ ] **Unified Error Handling**: Впровадження `ModelError` як єдиного стандарту доставки помилок валідації в CLI.
- [ ] **Background Progresses**: Оптимізація `IntentDispatcher` для паралельного відображення декількох прогрес-барів.

---
*Останнє оновлення: 2026-04-20 15:47 (Antigravity Stabilization)*
