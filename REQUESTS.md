# Requests

## Problem: `workspace:*` dependencies break isolated install

**Target**: `package.json`
**Status**: ✅ DONE
**Date**: 2026-02-13

**Problem**:
Dependencies defined with `workspace:*` require the package to be part of the monorepo workspace. This breaks isolated installations.

**Required Action**:
Update `package.json` dependencies to use specific versions instead of `workspace:*`.

**Changes**:

- "@nan0web/ui": "workspace:\*" -> "^1.1.0"

## Feature: Universal CLI Runner (nan0cli)

**Target**: `package.json`, `bin/nan0cli.js`, `src/index.js`
**Status**: ✅ DONE
**Date**: 2026-02-13

**Goal**:
Transform `@nan0web/ui-cli` from a library into a universal runner capable of executing any app's CLI logic without requiring per-app boilerplate (`main.js`).

**Requirements**:

1.  **Binary**: Provide `nan0cli` (or `nano-cli`) executable.
2.  **Context Awareness**:
    - Detect current working directory (CWD).
    - Read `package.json` to find app configuration (e.g. `nan0web.cli`).
    - Or fallback to convention: `src/messages/index.js` or `src/cli.js`.
3.  **Dynamic Loading**:
    - Import the App's `Messages` or `CLI` configuration.
    - Instantiate `CLI` with the App's logic.
4.  **Commands**:
    - `nan0cli <command>`: Execute app command.
    - `nan0cli help`: Show available commands from the App.
5.  **Testing**:
    - Add integration tests simulating an external app with a `package.json` and `messages`.
    - Ensure `npx` behavior works as expected.

**Proposed Implementation**:

### package.json

```json
"bin": {
  "nan0cli": "./bin/nan0cli.js"
}
```

### bin/nan0cli.js

The runner should:

1.  Parse arguments.
2.  Look for `nan0web` config in `package.json`.
3.  `import(path_to_messages)`.
4.  `new CLI({ Messages, argv }).run()`.

**Example Usage**:

```bash
# In auth.app directory
npx @nan0web/ui-cli signup
# or if installed globally
nan0cli signup
```

---

## Universal Documentation Blocks (Phase 8 MVP)

**Target**: `src/BlockRenderers/*`
**Status**: NEW
**Date**: 2026-02-22

**Problem**:
CLI UI does not currently support the new `Layout.*` or `Control.*` namespaces defined in `UNIVERSAL_BLOCKS_SPEC.md` (e.g. `Layout.Page`, `Layout.Sidebar`, `Control.ThemeToggle`).

**Required Action**:
Implement text-based log/terminal fallbacks in `ui-cli`:

- `Layout.Page`, `Layout.Nav` could act as section boundaries or headers in CLI.
- `Layout.Sidebar` could render as an indented tree list in the terminal.
- `Control.*` blocks can either be gracefully ignored or represent a CLI interactive prompt if necessary.
