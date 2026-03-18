# 🦅 UI-CLI Project & Architecture

> [!NOTE]
> 🇺🇦 This document has a [Ukrainian version](../../project.md).

> **Status:** ✅ COMPLIANT (Implementing [`@nan0web/ui/project.md`](../../../ui/project.md))  
> **Mission:** Data → Algorithms → App → Interfaces. Interaction as an Engine.

---

## 🧭 Phase 1: Philosophy & Identity

This package serves as the **Canonical Implementation** of the [nan•web UI standards](../../../ui/project.md).

### 1. Mission & Interaction Model

**UI-CLI** is not just a tool; it is a manifestation of the **"Interaction as an Engine"** principle:

- **Interaction as a Dialogue:** Every application is a continuous loop of asking and answering. UI-CLI formalizes this dialogue in the terminal.
- **The Minimalist Truth:** If a business logic cannot be expressed through the CLI (using `Input`, `Select`, `Table`, `Tree`), the logic is not yet fully formal.
- **Foundation for Chat:** Conversational AI interfaces (`ui-chat`) are built directly by **using `ui-cli` as the dialogue tool** (LLMs operate UI-CLI primitives rather than free-form text).

### 2. Implementation Boundaries

- **Logic Isolation:** All UI components are strictly stateless renderers of `props`.
- **Environment Agnostic:** The core logic lives in `InputAdapter`, which can be substituted for different terminal environments or test runners.
- **Golden Master Standard:** Perfect visual consistency across EN/UK locales is enforced via 34 automated snapshots.

---

## 🎨 Phase 2-4: Visual & Technical DNA

### 🛠️ Architecture: The "Constitution" Compliance

We strictly follow the models defined in [`ui/project.md`](../../../ui/project.md):

| Standard             | CLI Implementation                                          |
| :------------------- | :---------------------------------------------------------- |
| **SandboxVariant**   | Registered in `.cli-sandbox.json` with `props` persistence. |
| **SandboxConfig**    | Implements `list` view mode specialized for terminal.       |
| **Universal Blocks** | Maps standard AST nodes to `prompts` interactive elements.  |

### 🧩 Component Matrix

Our "Iron Registry" includes 19 active components:

- **Views (7):** Alert, Badge, Toast, Table, Tabs, Breadcrumbs, Steps.
- **Prompts (12):** Input, Password, Toggle, Confirm, Select, Multiselect, Slider, DateTime, Tree, Spinner, ProgressBar, Sortable.

### 🔧 Core Utilities

- **`resolvePositionalArgs(Model, args, named)`** — Universal mapper from CLI positional arguments to Model-as-Schema fields. Scans static field descriptors for `positional: true` and resolves by declaration order. Named options take priority over positionals.
- **`runGenerator(model, adapter)`** — OLMUI Generator Runner connecting `async *run()` models to `CLiInputAdapter`.
- **`runApp(EntryModel, adapter)`** — App-level loop for multi-command OLMUI applications.

---

## 🧪 Phase 5-6: Verification & Gallery

UI-CLI uses a dual verification system:

1. **Automated Snapshots (Golden Masters):**
   - 34 files verifying exact output for multiple locales.
   - 🗺️ [View Snapshot Map](../SNAPSHOT_MAP.md)

2. **OlmuiInspector (CLI Components Sandbox):**
   - Interactive CLI editor for real-time prop tweaking.
   - 🖼️ [View Sandbox Gallery](../../snapshots/sandbox/index.md)

---

## 📜 Legal & License

This project operates under the **ISC License**. Reference the root `LICENSE` for details.

---

> [!TIP]
> To verify the entire visual constitution of this package, run `npm run test:snapshot`. If any snapshot fails, the "Sovereign State" of the UI is considered broken.
