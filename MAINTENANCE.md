# Maintenance Guide & Agent Instructions

This document serves as a reference for maintaining the UI-CLI package, ensuring consistency, and avoiding regressions in internationalization and testing.

## Internationalization (i18n) Rules

1. **Always use `t()`**: Every user-facing string (prompts, log messages, error messages, default values, titles) MUST be wrapped in the translation function `t()`.
2. **Pure Localization**:
   - Do NOT include the original English text in parentheses within the translated string.
   - Example: Use `'Autocomplete'` -> `'Автодоповнення'`, NOT `'Автодоповнення (Autocomplete)'`.
3. **Vocabulary Management**:
   - When introducing a new English string, IMMEDIATELY add a corresponding key-value pair to `play/vocabs/uk.js`.
   - Ensure keys match exactly (case-sensitive).
   - Use US English spelling for keys by default (e.g., `Color` vs `Colour`), or alias both if unsure.
4. **Type Safety in Translations**:
   - The default `t` function (identity) returns the input as-is. If the input is a number (e.g., `defaultValue: 18`), `t(18)` returns `18`.
   - When using the result of `t()` in string contexts (like `template.replace` or concatenation), explicitly cast to string: `String(t(value))`.

## Testing Protocol

1. **Automated Tests**:
   - Run `pnpm test:all` before submitting changes.
   - This runs Unit Tests (`node:test`), Documentation Tests (`test:docs`), and Playground Integration Tests (`test:play`).
2. **Manual Verification**:
   - For UI changes, verify using the Playground with `PLAY_DEMO_SEQUENCE`.
   - Example: `LANG=uk PLAY_DEMO_SEQUENCE='4,user,15' node play/main.js`
   - Check against "Raw English" leaks (e.g., ensure no `[demo]:` prefixes or untranslated prompts appearing in Ukrainian mode).

## Unified Return Contract

All `request*` methods in `CLiInputAdapter` and standalone UI utilities (like `select`, `confirm`, `input`, `tree`, etc.) MUST follow the unified return contract:

- **Success**: Return an object `{ value: any, cancelled: false }`.
- **Cancel**: Return an object `{ value: undefined, cancelled: true }`.
- **Standalone Utilities**: Standalone UI utilities MUST throw `CancelError` on user cancellation (e.g., Esc or Ctrl+C). 
- **Adapter Handling**: `CLiInputAdapter` MUST catch these `CancelError` exceptions and normalize them into `{ value: undefined, cancelled: true }`.

This ensures consistent behavior across interactive menu loops and automated test sequences.

## Common Pitfalls

- **Hardcoded Prefixes**: Avoid hardcoding `[demo]:` or similar prefixes in `options.prompt`. Let the `prompts` library handle styling or use a configurable prefix.
- **Form Defaults**: When using `Form.js`, ensure the `t` function is passed to the constructor options. `new Form(model, { t })`.

## Workflow for Agents

- **Read this file** before making UI changes.
- **Update this file** if new systemic issues or patterns are discovered.
