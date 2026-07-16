# Contrail Documentation

## Quick Start

```bash
# Install
npm install -g @contrailspec/cli

# Initialize a store
contrail init

# Add a claim
contrail add preference.editor "neovim" --confidence 0.95

# View trajectory
contrail log preference.editor
```

## Connect to Claude Code

```bash
# Add MCP server
claude mcp add contrail -- npx @contrailspec/mcp

# In Claude Code:
# "What's my editor preference?"
# "Show me my code style history"
# "What are my hard constraints?"
```

## Documentation

- [Spec Explorer](spec-explorer.md) — Annotated walkthrough of the claim schema
- [FAQ](faq.md) — "Why not Engram/OMP/MCP/Mem0?"

## Specification

The normative spec lives in `spec/SPEC.md` with JSON Schema at `spec/schema/v0.1/claim.schema.json`.

## License

Apache-2.0