# @nan0web/ui

A tiny, zero‑dependency UI input adapter for Java•Script projects.
It provides a CLI implementation that can be easily integrated
with application logic.

## Install
```bash
npm install @nan0web/ui
```

## Usage

Create a CLI input adapter and use it to request forms, selections, and inputs:
```js
import { CLIInputAdapter } from '@nan0web/ui'

const adapter = new CLIInputAdapter()

// Request form input
const result = await adapter.requestForm({
  title: 'User info',
  fields: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ],
  elementId: 'user-form'
})

if (result.action === 'form-submit') {
  console.log('Form submitted:', result.data)
}
```

## Features

- Form input with validation
- Selection menus
- Simple text input
- Cancel handling (Ctrl+C)
- Navigation commands (::prev, ::next, ::skip)

Supports various input patterns

## CLI Playground

There is also a CLI sandbox playground to try the library directly:
```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/ui.git
cd ui
npm install
npm run playground
```

## API

### `CLIInputAdapter`
Main class for handling CLI input.

Methods:
- `requestForm(form, options)` - Request form input
- `requestSelect(config)` - Request selection input
- `requestInput(config)` - Request simple text input

Exports CLIInputAdapter as main class

## Java•Script

Uses `d.ts` to provide autocomplete hints.
