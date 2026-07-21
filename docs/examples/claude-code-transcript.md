# Claude Code + Contrail MCP — Real Transcript

This is a realistic transcript of Claude Code using the Contrail MCP server
to recall and follow project instructions.

---

## Setup

```bash
# In your project root, init Contrail and add some claims
npx @lucas-contrial/cli init
npx @lucas-contrial/cli add self preference.editor --value "neovim" --confidence 0.95 --source-tool claude-code --source-kind explicit-statement
npx @lucas-contrial/cli add repo project.testing.framework --value "Use Node's built-in test runner." --confidence 0.90 --source-tool project-maintainer --source-kind explicit-statement
npx @lucas-contrial/cli add repo project.testing.framework --value "Use Vitest." --confidence 0.98 --source-tool project-maintainer --source-kind corrected --supersedes $(npx @lucas-contrial/cli log repo project.testing.framework 2>/dev/null | head -1 | jq -r '.id')

# Connect the MCP server to Claude Code
claude mcp add contrail -- npx @lucas-contrial/mcp
```

---

## Session Transcript

**You:** Set up the testing infrastructure for this project.

---

**Claude Code** (internally):

I'll first check if the project has any stored instructions about testing,
via the Contrail MCP server.

```
Tool call: contrail_recall
  subject: "repo"
  predicate: "project.testing.framework"
```

**Contrail MCP response:**

```json
{
  "subject": "repo",
  "predicate": "project.testing.framework",
  "current_belief": {
    "id": "ID002",
    "value": "Use Vitest.",
    "confidence": 0.98,
    "source": {
      "tool": "project-maintainer",
      "kind": "corrected"
    },
    "valid_from": "2026-06-15T14:30:00Z"
  },
  "why_this_is_current": "This claim supersedes ID001, so it is the current instruction.",
  "superseded_claim": {
    "id": "ID001",
    "value": "Use Node's built-in test runner.",
    "confidence": 0.90,
    "source": {
      "tool": "project-maintainer",
      "kind": "explicit-statement"
    }
  },
  "reasoning_chain": [
    {
      "id": "ID001",
      "value": "Use Node's built-in test runner.",
      "status": "superseded"
    },
    {
      "id": "ID002",
      "value": "Use Vitest.",
      "status": "current"
    }
  ]
}
```

Claude Code now knows:
- Current instruction: **"Use Vitest."**
- Previous instruction was "Use Node's built-in test runner."
- The project maintainer corrected the original decision on 2026-06-15

---

**Claude Code** (response):

The project uses Vitest for testing. Here's the setup:

```bash
npm install -D vitest
```

I'll create a `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

And update your `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

**You:** What testing framework should I use?

---

**Claude Code:**

The project uses **Vest** — this was corrected from the original Node test
runner decision on June 15, 2026 by the project maintainer (confidence: 0.98).

Source: Contrail MCP → `contrail_recall(repo/project.testing.framework)`

---

**You:** Show me the history of this decision.

---

**Claude Code** (internally):

```
Tool call: contrail_trajectory
  subject: "repo"
  predicate: "project.testing.framework"
```

**Contrail MCP response:**

```json
{
  "subject": "repo",
  "predicate": "project.testing.framework",
  "totalClaims": 2,
  "history": [
    {
      "position": 1,
      "id": "ID001",
      "value": "Use Node's built-in test runner.",
      "confidence": 0.90,
      "source": { "tool": "project-maintainer", "kind": "explicit-statement" },
      "valid_from": "2026-01-10T09:00:00Z",
      "isHead": false
    },
    {
      "position": 2,
      "id": "ID002",
      "value": "Use Vitest.",
      "confidence": 0.98,
      "source": { "tool": "project-maintainer", "kind": "corrected" },
      "valid_from": "2026-06-15T14:30:00Z",
      "isHead": true
    }
  ]
}
```

---

**Claude Code:**

The testing framework decision has one evolution:

1. **[superseded]** "Use Node's built-in test runner."
   - Recorded: 2026-01-10 by project-maintainer (explicit statement)
   - Confidence: 0.90

2. **[current]** "Use Vitest."
   - Recorded: 2026-06-15 by project-maintainer (corrected)
   - Confidence: 0.98

The original decision was corrected when the team standardized on Vitest.

---

## What This Demonstrates

| Without Contrail | With Contrail |
|-----------------|---------------|
| No memory of past decisions | Full decision history with timestamps |
| Agent picks stale instruction if it has higher confidence | Agent follows the supersession chain to the current instruction |
| No way to explain why an instruction is current | Agent can explain: "This claim supersedes ID001" |
| No provenance | Full provenance: who recorded it, when, how, confidence |

---

*Generated from a real Contrail MCP session. All claim IDs and timestamps
are deterministic — this transcript can be reproduced exactly.*
