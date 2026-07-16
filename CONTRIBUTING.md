# Contributing to Contrail

Thank you for considering a contribution. This document explains how to work
with this repository effectively.

## Development Setup

```bash
# Prerequisites: Node.js >= 20, npm >= 10
git clone https://github.com/lukitadproxd-netizen/contrail.git
cd contrail
npm ci
npm run build
npm run test
```

## Commit Convention

All commits **must** be signed off per the Developer Certificate of Origin (DCO):

```bash
git commit -s -m "Your commit message"
```

This adds a `Signed-off-by: Your Name <email@example.com>` trailer.
Commits without this trailer will be rejected by CI.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `spec`

Scopes: `core`, `cli`, `mcp`, `spec`, `docs`, `ci`, `examples`

Example:
```
feat(core): add resolveTrajectory cycle detection

Resolves #42 by adding visited-set tracking during chain walk.

Closes #42
```

## Pull Requests

1. Fork the repo, create a branch from `main`
2. Make your changes with tests
3. Ensure `npm run lint`, `npm run typecheck`, `npm run test` pass
4. Open a PR with a clear description
5. Link related issues (`Fixes #123`, `Refs #456`)

### Spec Changes

Proposing a schema change? **Required steps:**

1. Open a `spec_proposal` issue first (use the template)
2. Discuss the change — do not skip this
3. If accepted, implement in a PR that touches:
   - `spec/schema/v0.x/claim.schema.json`
   - `spec/schema/v0.x/examples/valid/*.json` (new fixtures)
   - `spec/schema/v0.x/examples/invalid/*.json` (if new validation rules)
   - `spec/SPEC.md` (updated prose)
   - `spec/CHANGELOG.md` (spec version bump)
4. CI will validate all fixtures against the new schema

## Code Style

- TypeScript strict mode is enforced
- No `any` without a comment explaining why
- Prefer `unknown` over `any`
- Exhaustive `switch` on discriminated unions
- Pure functions where possible; side effects at boundaries

## Testing

- Unit tests for every public function in `contrail-core`
- Property-based tests for schema round-trips (valid fixtures)
- Integration tests for CLI commands
- MCP adapter tests against the official MCP inspector

## Issue Labels

- `spec-question` — question about schema or semantics
- `bug` — something is broken
- `good-first-issue` — suitable for new contributors
- `wontfix-out-of-scope` — explicitly not in scope (embeddings, signing, access control, agent manifests)