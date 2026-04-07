# Release Mission: @nan0web/ui-cli v2.12.1

## 🎯 Scope
OLMUI Hardening: Update `@nan0web/types` to 1.7.1 and verify `verifySnapshot` integration in CLI standards.

## ✅ Acceptance Criteria (Definition of Done)
1. [x] `@nan0web/types` v1.7.1 must be added/updated in `package.json` (devDependencies).
2. [x] `ui-cli` must successfully build with new types.
3. [x] `verifySnapshot` utility from `@nan0web/ui` must be tested for compatibility with CLI outputs.
4. [x] All existing tests must pass (`npm run test:all`).

## 🛡️ Architecture Audit
- [x] ECOSYSTEM: No duplication with existing packages.
- [x] DATA: Uses `DB` as source of truth.
- [x] STANDARDS: Compliant with `ui-cli-standards`.
- [x] SNAPSHOTS: Uses `verifySnapshot` for logical verification.
