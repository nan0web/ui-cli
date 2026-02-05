# Migration Guide to v2.0 (Strict Validation & I18n)

## 1. Strict Prop Validation

In v2.0, all UI components (`text`, `select`, `confirm`, `slider`, `tree`) now enforce strict prop type validation. Invalid types will throw a `TypeError`.

### Changes Required:
- Ensure all required props (e.g., `message`, `title`) are provided.
- Ensure correct types (e.g., `limit` must be a number).
- `validate` and `format` must be functions if provided.

**Example (Incorrect):**
```javascript
// Throws TypeError: "limit" must be a number
await select({ title: 'Choose', limit: '10', options: [...] })
```

**Example (Correct):**
```javascript
await select({ title: 'Choose', limit: 10, options: [...] })
```

## 2. Localization (I18n) Support

All components now accept an optional `t` (translation) function. This is required for localizing internal component text (like "Yes/No", hints).

### Changes Required:
- Pass your translation function (e.g., from `@nan0web/i18n`) to component calls if you want localized defaults.
- `CLiInputAdapter` automatically passes its `t` to underlying components.

**Example:**
```javascript
import { i18n } from './my-i18n.js'

// "Yes" / "No" will be localized using i18n('yes') / i18n('no')
await confirm({ 
    message: 'Proceed?', 
    t: i18n.t 
})
```

## 3. Confirm Component Defaults

The `confirm` component now defaults `active`/`inactive` labels to localized "yes"/"no" keys if `t` is provided.

- **Old behavior**: defaulted to 'Yes'/'No'.
- **New behavior**: defaults to `t('yes')`/`t('no')` or fallback to 'Yes'/'No'.

## 4. InputAdapter Injection

The `CLiInputAdapter` now injects the configured `t` function into all request methods (`requestSelect`, `requestConfirm`, etc.). No manual change is needed if you use `CLiInputAdapter`.
