# Testing Policy Evolution Demo

This fixture is the product proof for Contrail's first release: a coding agent
must follow the latest project instruction and show the correction that replaced
the old one.

It contains only two fixed claims about `repository/project.testing.framework`:

1. **2026-01-10:** `Use Node's built-in test runner.`
2. **2026-06-15:** `Use Vitest.` — a correction that supersedes the first claim.

Run the deterministic terminal demo from the repository root:

```bash
npm run demo
```

The runner copies this seed into a temporary local store, runs the real CLI,
and fails if the CLI output differs from [expected-cli-output.txt](expected-cli-output.txt).
No model calls or generated timestamps are involved.

For the Claude Code workflow, connect Contrail by MCP and ask:

> What testing framework should I use? Explain the current project policy.

The agent should use `contrail_recall` with `subject: "repository"` and
`predicate: "project.testing.framework"`. Its result contains the current
instruction, recorded confidence, source, timestamp, superseded instruction,
and complete reasoning chain.
