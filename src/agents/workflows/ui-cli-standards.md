---
description: Стандарти використання UI-CLI компонентів для вводу та виводу інформації
---

# UI-CLI Component Standards

All console inputs and outputs in CLI applications, agents, or CLI generators (like `generate.js`) MUST use the official `@nan0web/ui-cli` components.

## Rules

1. **Output Information**
   - NEVER use raw `console.log` for structure or tables.
   - USE: `Alert`, `Table`, `ProgressBar`, `Spinner`, and other view components available in `@nan0web/ui-cli`.

2. **Input Information**
   - NEVER use raw `readline` directly if `ui-cli` is accessible.
   - USE: `Input`, `Select`, `renderForm` and other interactive prompt components from `@nan0web/ui-cli`.

3. **Application to Other UI Frameworks**
   - This strict schema-driven input/output interface pattern also extends to other environments.
   - `ui-lit`, `ui-chat`, `ui-swift`, and others should implement an equivalent logical `Model as Schema` (e.g., `AppConfig` class) directly into standardized visual UI components.

## Example (Model as Schema inside AppConfig)

```javascript
import { createT } from '@nan0web/i18n'
import { select } from '@nan0web/ui-cli'

// словник має завантажуватись з data/*/t.yaml, наприклад:
// const doc = await db.fetch('uk/index', {})
const t = createT(doc.t)

export class AppConfig {
  static overwrite = { help: t('Overwrite (replace everything)'), default: false }
  static merge = { help: t('Merge (add missing files only)'), default: false }
}

async function askAction() {
  const res = await select({
    label: t('Directory already exists. What should we do?'),
    options: [
      { label: t(AppConfig.overwrite.help), value: 'overwrite' },
      { label: t(AppConfig.merge.help), value: 'merge' },
    ],
  })
  return res.value
}
```
