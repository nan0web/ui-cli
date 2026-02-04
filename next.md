# UI-CLI 2.0: Component Architecture Revolution

## 🏛️ Council of Thinkers (The Verdict)

The consensus is clear. To achieve true "One Logic — Many UI" and seamless integration across CLI, Web, and Voice, we must shift from **Imperative Functions** to **Declarative Components**.

*   **Socrates (Logic):** Logic should describe *truth* (State), not issue commands. Functions bind logic to implementation; Objects (Components) free it.
*   **Da Vinci (Engineering):** Complex interfaces are built from simple, reusable, stylable parts. An `Alert` is a concept that can be a CLI Box or a Web Modal.
*   **Tesla (System):** Data must flow as energy (Objects/JSON) without hard coupling. Wireless transmission of UI requires a protocol of Objects, not function calls.
*   **Jobs (Experience):** Make it familiar. Developers think in Components (React-like). If CLI looks like React, we win.
*   **Paton (Reliability):** A single standardized "welding joint" (Interface) for all platforms ensures structural integrity.

## 🎯 The Goal

Transform `@nan0web/ui-cli` from a collection of helper functions into a **Component-Based Rendering Engine**.

### Current (Legacy - Imperative)
```javascript
import { alert } from './ui/alert.js';
// Function computes string immediately or writes to stdout
const output = alert("Hello"); 
console.log(output);
```

### Future (Target - Declarative)
```javascript
// Components return a descriptor (Virtual DOM), not a side-effect
import { Alert, render } from '@nan0web/ui-cli';

// 1. Describe the UI
const element = Alert({ 
    variant: 'warning', 
    title: 'Battery Low', 
    children: 'Please connect power source.' 
});

// 2. Render it (Side-effect happens here)
await render(element); 
```

## 🛠️ Implementation Roadmap

### Phase 1: Component Definition
Refactor existing UI files (`alert.js`, `spinner.js`, `table.js`, `select.js`) to export **Component Functions**.
These functions should return a **Component Descriptor** (Plain Object), DO NOT write to stdout directly.

**Structure of a Component Descriptor:**
```javascript
{
  $$typeof: Symbol.for('ui.element'),
  type: 'Alert', // or Function
  props: {
    variant: 'success',
    title: 'Done',
    ...props
  },
  children: []
}
```

### Phase 2: The Renderer (`render`)
Create a core `render` function that:
1.  Takes a Component Descriptor.
2.  Recursively traverses children.
3.  Transforms the tree into an ANSI string (for static output) or starts an interactive session (for `Select`, `Input`).
4.  Manages `stdout` writing.

### Phase 3: Interactive Components
For components like `Spinner` or `ProgressBar`:
- They must support a `mount/unmount` lifecycle handled by the Renderer.
- The Renderer manages the refresh loop (clearing lines, redrawing).

### Phase 4: Integration
- Update `SunCLI` to use the new `render` function.
- The `SunCLI` loop becomes the state manager, yielding descriptors that `render` draws.

## 📝 Success Criteria (Acceptance)
1.  **Zero Side-Effects in Components:** Calling `Alert()` never prints anything.
2.  **Tree Composition:** Can nest components (e.g., `Box({ children: [Text(), Alert()] })`).
3.  **Universal Protocol:** The output objects are serializable (JSON), allowing them to be sent over API to a Web Client if needed.
