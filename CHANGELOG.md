# Code Changelog

All notable changes to the Contrail codebase are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **CI/CD workflows**: GitHub Actions for CI, spec validation, and npm release
  - `.github/workflows/ci.yml` — lint, typecheck, build, test, spec validation on every PR
  - `.github/workflows/spec-validate.yml` — fixture validation on spec/schema changes
  - `.github/workflows/release.yml` — npm publish on tag push
- **Issue templates**: bug report, feature request, spec proposal (`.github/ISSUE_TEMPLATE/`)
- **PR template**: `.github/PULL_REQUEST_TEMPLATE.md` with DCO checklist
- **Core store module**: `@contrail-spec/core` now exports `createStore()` and `generateULID()`
  - `packages/core/src/store.ts` — canonical sync Store implementation
  - `packages/core/src/ulid.ts` — canonical ULID generator
  - CLI and MCP server now import these from core, eliminating duplication
- **Spec validation script**: `scripts/validate-examples.mjs` (ESM, replaces `.js` version)

### Changed
- **CLI imports consolidated**: `cli.ts` now imports all types and functions from `@contrail-spec/core` in a single statement
- **CLI `add` command**: Refactored nested ternary into explicit `parseValue()` function with `switch` for readability
- **MCP server `appendClaim`**: Removed redundant directory creation inside lock (already created by `ensureLockDir`)
- **`@contrail-spec/core` dependencies**: Added `proper-lockfile` (store module lives here now)
- **`@contrail-spec/cli` dependencies**: Removed `proper-lockfile` (inherited from core)
- **Root `package.json`**: Removed `proper-lockfile` from root dependencies (lives in core)

### Fixed
- **CLI store**: Removed unused import `unlockSync` from `proper-lockfile` (ESLint warning)
- **MCP server**: Removed unused import `unlock` from `proper-lockfile` (ESLint warning)
- **Core validator**: `date-time` format validator parameter type changed from `string` to `unknown` — the type guard `typeof str !== 'string'` is now semantically correct
- **MCP server**: `generateULID()` duplication removed — imported from `@contrail-spec/core` instead
- **CLI store**: `generateULID()` duplication removed — imported from `@contrail-spec/core` instead

### Previous entries

### Added (prior unreleased)
- **Engram Adapter (Phase 2.1)**: One-way conversion from Contrail Claims/Trajectories to Engram envelopes
  - `convertToEngram(claim, trajectory?)`: Maps identity/bid -> EngramEnvelope
  - `convertFromEngram(envelope)`: **STUB — not implemented** (requires confirmed Engram schema)
  - Identity claims -> IDENTITY, Beliefs -> BELIEFS, Constraints -> CONSTRAINTS (confidence forced to 1.0)
  - Supersedes chain -> CORRECTIONS, Full trajectory -> EVOLUTION
  - 8 tests covering all conversion paths
- **CLI Tests (Phase 1.4)**: 5 tests for store operations
  - init(), readAll() before/after init, append+roundtrip, supersedes chain, generateULID uniqueness
- **MCP Tests (Phase 1.5)**: 3 smoke tests for remember/recall/trajectory tools
  - Uses temporary store per test, accesses internal tool handlers for direct invocation
- **Engram Tests (Phase 1.6)**: 8 tests for adapter conversions
  - Identity, belief, constraint (with confidence 1.0), supersedes/CORRECTIONS, EVOLUTION round-trip
- **Test Coverage (Phase 2.3)**: Added `@vitest/coverage-v8` to all packages
  - Core: 93.65% statements, 73.58% branches, 92.59% functions, 97.19% lines
  - Test:coverage scripts added to all package.json files
- **Scope Migration (Phase 1.3)**: Renamed npm scope from `@contrailspec/*` to `@contrail-spec/*`
  - Updated all 4 package.json files, root package.json, schema $id, all markdown docs
- **Build Order Fix (Phase 1.1)**: Root build script now compiles in dependency order: core → engram → cli → mcp
- **Gitignore Fix (Phase 1.2)**: Removed `package-lock.json` from .gitignore (already tracked)
- **README Updates (Phase 2.2)**: Architecture diagram updated to show Engram adapter (one-way, experimental)

### Changed
- **Package scope**: `@contrailspec/*` -> `@contrail-spec/*` across all code and docs
- **Schema $id**: `https://contrailspec.dev/schema/...` -> `https://contrail-spec.github.io/contrail/schema/...`
- **All markdown docs**: Updated GitHub URLs, npm install commands, import paths
- **Core package**: vitest upgraded from 1.6.1 to 4.1.10 (matching @vitest/coverage-v8)
- **All packages**: vitest and @vitest/coverage-v8 aligned to 4.1.10

### Fixed
- **MCP Server**: File lock added to appendClaim() to prevent concurrent write races
- **Engram Adapter**: Fixed TS error on optional valid_from (now defaults to now)
- **CLI Build**: Fixed @contrailspec/core -> @contrail-spec/core imports
- **CLI Store**: generateULID() now produces valid 26-char Crockford Base32 ULIDs
- **MCP Tests**: Added registerTool() to expose handlers for direct test invocation
- **Engram Tests**: Fixed enum object literal syntax in test expectations

## [0.2.0] - 2026-07-22

### Added
- **Organization migration**: Renamed npm/GitHub org from `@lucas-contrial` / `lukitadproxd-netizen` to `@contrail-spec` / `contrail-spec`
  - Updated all package names, imports, schema $id, URLs, docs
  - Published 4 packages under `@contrail-spec`
  - Deprecated all `@lucas-contrial` packages

## [0.1.4] - 2026-07-22

### Fixed
- **Core validation**: Added try/catch around `validate()` call to handle edge cases where AJV throws instead of returning false (e.g., malformed input types). Error details now always include field and message, never an empty `"Validation failed: "` message.

## [0.1.3] - 2026-07-22

### Fixed
- **Core dependencies**: Added missing `ajv` to `dependencies` (was only in `devDependencies`). Monorepo hoisting hid this bug; caught by `scripts/verify-publish.mjs`.

## [0.1.2] - 2026-07-22

### Fixed
- **CLI shebang**: Added `#!/usr/bin/env node` to `packages/cli/src/cli.ts` so `npx @contrail-spec/cli` and `.bin/contrail` work correctly.

## [0.0.0] - 2026-07-16

### Added
- Initial Contrail specification v0.1.0 (Draft)
- Core library: parse, validate, resolveTrajectory, serialize
- CLI: init, add, log, validate, diff commands
- MCP Adapter: resource + 3 tools (remember, recall, trajectory)
- Engram Adapter: stub (now implemented)
- JSON Schema with 16 valid + 9 invalid fixtures
- CI workflow: lint, typecheck, test, spec validation
- Governance docs: GOVERNANCE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md
- License: Apache-2.0