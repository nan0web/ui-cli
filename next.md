# UI-CLI 2.0: Component Architecture Revolution

## 🏛️ Council of Thinkers (The Verdict)

The consensus is clear. To achieve true "One Logic — Many UI" and seamless integration across CLI, Web, and Voice, we must shift from **Imperative Functions** to **Declarative Components**.

*   **Socrates (Logic):** Logic should describe *truth* (State), not issue commands. Functions bind logic to implementation; Objects (Components) free it.
*   **Da Vinci (Engineering):** Complex interfaces are built from simple, reusable, stylable parts. An `Alert` is a concept that can be a CLI Box or a Web Modal.
*   **Tesla (System):** Data must flow as energy (Objects/JSON) without hard coupling. Wireless transmission of UI requires a protocol of Objects, not function calls.
*   **Jobs (Experience):** Make it familiar. Developers think in Components (React-like). If CLI looks like React, we win.
*   **Paton (Reliability):** A single standardized "welding joint" (Interface) for all platforms ensures structural integrity.

## 🎯 The Goal

Transform `@nan0web/ui-cli` from a collection of helper functions into a **Component-Based Rendering Engine** with a strict separation between **View** (Static) and **Prompt** (Interactive) components.

### Architecture: View vs Prompt

We categorize UI elements into two distinct types based on their behavior:

1.  **View Components (Static/Sync)**
    *   **Purpose:** Display information, layout, structure.
    *   **Behavior:** Synchronous. Pure functions of state.
    *   **Capability:** Can be stringified directly via `.toString()`. Valid in `console.log`.
    *   **Examples:** `Alert`, `Box`, `Table`, `Text`, `Badge`.
    *   **Usage:** `console.log(Alert({ title: 'Hi' }))` OR `await render(Alert({ title: 'Hi' }))`.

2.  **Prompt Components (Interactive/Async)**
    *   **Purpose:** Gather input, user decisions.
    *   **Behavior:** Asynchronous. Pause execution awaiting user action.
    *   **Capability:** Cannot be stringified significantly. Must be `render()`-ed.
    *   **Examples:** `Select`, `Input`, `Confirm`, `Multiselect`.
    *   **Usage:** `await render(Select({ options: [...] }))`.

### Current (Legacy - Imperative)
```javascript
import { alert } from './ui/alert.js';
// Side-effect immediately
alert("Hello"); 
```

### Future (Target - Declarative)
```javascript
import { render } from '@nan0web/ui-cli';
import { Alert } from '@nan0web/ui-cli/view';
import { Select } from '@nan0web/ui-cli/prompt';

// 1. Static View (Instant)
console.log(Alert({ title: 'Welcome', variant: 'success' }));

// 2. Interactive Prompt (Async)
const choice = await render(
    Select({ 
        message: 'Choose mode:',
        options: ['Dev', 'Prod']
    })
);
```

## 🛠️ Implementation Roadmap

### Phase 1: Core Foundation
- [ ] Create `src/core/Component.js`: Base factory for components (handling `toString` logic).
- [ ] Create `src/core/render.js`: The engine that distinguishes between Static and Interactive components.
- [ ] Define folder structure: `src/components/view/` and `src/components/prompt/`.

### Phase 2: View Components (Migration)
- [ ] `Alert`: Port `ui/alert.js` to `components/view/Alert.js`.
- [ ] `Table`: Port `ui/table.js` to `components/view/Table.js`.
- [ ] Ensure `toString()` works for `console.log` compatibility.

### Phase 3: Prompt Components (Migration)
- [ ] `Select`: Port `select` logic to `components/prompt/Select.js`.
- [ ] `Input`: Port `text` logic to `components/prompt/Input.js`.
- [ ] `Confirm`: Port `confirm` logic.
- [ ] Ensure `render()` correctly handles the promise/prompts loop.

### Phase 4: Integration & Testing
- [ ] Update `index.js` exports.
- [ ] Create `play/v2_demo.js` to verify the new paradigm.
- [ ] Unit tests for `toString()` rendering and `render()` flow.

## 📝 Success Criteria (Acceptance)
1.  **Strict Separation:** Views and Prompts are physically and logically separateds.
2.  **Stringifiable Views:** `String(Alert())` returns valid ANSI output.
3.  **Render Engine:** `await render()` works for both types (prints Views, executes Prompts).
4.  **No Side-Effects in Constructors:** Calling `Alert()` or `Select()` does nothing visible until used.
