[Українська версія](./task.md)

# Release Mission v2.13.0 — CLI Mount Protocol

Require to run a playground the same declarative way as application and documentation.

## Scope

Implement a standardized DB mount protocol for `nan0cli` via declarative CLI flags. Goal: make every invocation isolated, configurable, and data-driven without changing application code.

## Motivation (context)

Current state: `--data play` — undocumented shorthand, implemented manually in `bin/nan0cli.js`.
Required: a formal, extensible mount flag architecture where source is a full DSN (not just a filesystem path).

## Design: DB Mount Protocol

### Mount Flags

| Flag                 | Mount dest | Purpose                                       |
| -------------------- | ---------- | --------------------------------------------- |
| `--mount play`       | `.` (root) | Shorthand: root mount without specifying dest |
| `--mount-data play`  | `.`        | Explicit root data mount                      |
| `--mount-app .`      | `@app`     | Workspace root (project code)                 |
| `--mount ~/path`     | `~`        | Home namespace mount                          |
| `--mount @app:./src` | `@app`     | Full `dest:source` format                     |

### DSN as source

Source can be not only a directory path, but a full DSN string for any `@nan0web/db-*` adapter:

```
--mount-data redis://localhost:6379/myapp
--mount-data sqlite://./data.db
--mount-app  ./                              (DBFS — filesystem)
--mount      @cache:memcached://localhost
```

This makes `nan0cli` a **Database-Agnostic Entry Point** — the same app can run against Redis, SQLite, or local files by simply changing the DSN in the command.

### package.json configuration (defaults)

```json
"nan0web": {
  "mounts": {
    ".": "data",
    "@app": ".",
    "~": "~/.myapp"
  },
  "cli": {
    "entry": "src/domain/App.js"
  }
}
```

CLI flags **override** defaults from `package.json`.

### Own bin file = isolation

Each app has its own binary with a minimal template:

```js
#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { CodingApp } from '../src/CodingApp.js'
import process from 'node:process'

bootstrapApp(CodingApp).catch((e) => {
	console.error(e)
	process.exit(1)
})
```

Via `bootstrapApp` the default mounts, locale, and root are passed in. The end user runs their own `myapp`, not `nan0cli`. `nan0cli` is a developer tool.

### Store: application registry

URL scheme: `https://store.nan0web.yaro.page/{vendor}/{app}`, in the future it may be a custom domain like `store.nan0web.dev`. Anyone can also run their own store and simply specify its URL as the primary store for their apps.

This means we also need a proper `~/.nan0web/config.nan0`, specifically `store.url`, which can be a string or an array if we want to support multiple stores.

```
nan0cli @nan0web/docs    → store lookup → download → run
nan0cli https://nan0.app → thin-client  → streaming session
```

Store provides: `package.json`, ESM endpoint, DSN configuration.  
Local cache: `~/.nan0web/store/`.  
Search and indexing — natively via DB API.

## Definition of Done

- [x] `--mount play` → mounts root `.` to `play/` (DBFS)
- [x] `--mount-data <dsn>` → mounts `.` to any DSN
- [x] `--mount-app <dsn>` → mounts `@app` to any DSN
- [x] `--mount <dest>:<dsn>` → full format
- [x] DSN parser for `redis://`, `sqlite://`, `fs://`
- [x] Read defaults from `package.json["nan0web"].mounts`
- [x] CLI flags override `package.json` defaults
- [x] Updated docs: `seed.md`, `system.md`
- [x] Release tests (task.test.js)

## Architecture Audit (Checklist)

- [ ] Have ecosystem indices been read?
- [ ] Are there analogues in packages? (`@nan0web/db`, `@nan0web/db-fs`, `@nan0web/db-redis`)
- [ ] Data sources: does DSN support FS, Redis, SQLite, Memory?
- [ ] Does it conform to the UI standard (Deep Linking)?
