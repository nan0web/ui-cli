# Реліз v2.10.0: Domain Views & Terminal Visuals

## 🎯 Місія
Оновлення `@nan0web/ui-cli` для повної підтримки OLMUI Domain Views з покращеною естетикою, підтримкою локалізації через `this.t` та візуалізацією медіа-контенту у сучасних терміналах (iTerm2/Kitty).

## ✅ Критерії приймання (DoD)
1. **Gallery support**: Компонент `Gallery` підтримує протоколи `iTerm2` та `Kitty` для виводу зображень, якщо файл локальний.
2. **Pricing Aesthetics**: Покращено відображення списку фіч (замість простого `✓` — структурована лінія `│ ✓`).
3. **Colored Ratings**: Рейтинги (`★`) у `Testimonials` відображаються жовтим кольором.
4. **I18n Context**: Усі компоненти (`Hero`, `Stats`, `Pricing`, `Gallery` тощо) передають контекст (`props` або `item`) у функцію `t()` для підтримки ICU plurals.
5. **Agnostic Intent Handlers**: `CLiInputAdapter` має методи `ask`, `log`, `progress`, `result` для сумісності з `runGenerator`.
6. **Centered EmptyState**: Символ `∅` у `EmptyState` відцентрований відносно текстового контенту.

## 🔍 Architecture Audit (Чекліст)
- [x] Чи прочитано Індекси екосистеми? (Так, `packages/index.md`)
- [x] Чи існують аналоги в пакетах? (Ні, це базовий CLI адаптер)
- [x] Джерела даних: YAML, nano, md, json, csv? (Так, через OLMUI Models)
- [x] Чи відповідає UI-стандарту (Deep Linking)? (Так, через Universal URL Addressing)
