# 🏗️ Architecture Audit — Healing Report

**Score: {passed}/{total} ({pct}%)**

## Issues Found
- [x] [feature] `resolvePositionalArgs`: Preserves unused args into `_positionals` for subcommands
- [x] [phase] CONTRIBUTING.md: `Missing fundamental file: {file}`
- [x] [exports] src/index.js: `Default export found in {file} — only named exports allowed`
- [x] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [x] [exports] exports["./ui/BlockRenderers"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/blueprint"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/core"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/impl"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/prompt"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/test"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/utils"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [exports] exports["./ui/view"]: `UI adapter dir {dir}/ exists but not declared in package.json exports`
- [x] [domain] /Users/i/src/nan.web/packages/ui-cli/src/ui/CLI.js: `Class field outside constructor in {file} (line {line})`
- [x] [domain] /Users/i/src/nan.web/packages/ui-cli/src/ui/CLI.js: `Class field outside constructor in {file} (line {line})`
- [x] [domain] /Users/i/src/nan.web/packages/ui-cli/src/ui/core/AnswerQueue.js: `Class field outside constructor in {file} (line {line})`
- [x] [domain] /Users/i/src/nan.web/packages/ui-cli/src/ui/impl/input.js: `Class field outside constructor in {file} (line {line})`
- [x] [domain] /Users/i/src/nan.web/packages/ui-cli/src/ui/impl/input.js: `Class field outside constructor in {file} (line {line})`

## Recommended Subagents
- `@[/inspect-structure]`
- `@[/inspect-anti-pattern]`
- `@[/inspect-models]`
