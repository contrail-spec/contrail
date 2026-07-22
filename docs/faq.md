# FAQ

## Is Contrail a general AI memory engine?

Not in its first release. Contrail is for coding agents that need to follow
project conventions which change over time. The first workflow is intentionally
narrow: record an instruction, correct it, and explain the current policy.

## Why not put the latest instruction in a prompt or `AGENTS.md` file?

That works for the current instruction, but it loses the correction trail.
Contrail lets an agent say which instruction is current, what it replaced, who
recorded the change, and when it became current. It is useful when the history
is part of deciding or reviewing an action.

## Does Contrail decide whether a source is trustworthy?

No. `confidence` is the confidence recorded with a claim; Contrail does not
calibrate it or apply a trust algorithm. The product shows that value alongside
the source and correction chain so an agent and developer can assess it.

## How does an instruction change?

Create a new claim whose `supersedes` field references the prior claim. The new
claim becomes current, while the old one remains in the append-only history.

## What happens if two instructions conflict?

The system detects `MULTIPLE_HEADS`: two or more claims that supersede the same
parent without a clear replacement order. The conflict is reported as an error
rather than silently resolved — this is by design (see "Why not auto-resolve
conflicts?" below).

However, there is a known limitation: **once detected, a `MULTIPLE_HEADS`
conflict cannot be fully resolved within the current data model.**

### Why it can't be resolved today

The `supersedes` field is a single claim ID, not an array. A new claim can only
point to one parent. If claim A has two children (B and C, both claiming to
replace A), creating a new claim D that supersedes C eliminates C as a head, but:

- **B is still a head** pointing to A
- **D is still a head** pointing to A (via C)
- Two heads still reach A by different paths → MULTIPLE_HEADS persists

Creating two resolution claims (D supersedes C, E supersedes B) just creates a
new MULTIPLE_HEADS between D and E. It's a structural dead end, not a bug in the
code — the code does exactly what the model allows.

### Ways this could be resolved in a future version

| Approach | How it works | Tradeoff |
|----------|-------------|----------|
| Array `supersedes` | `supersedes: [B, C]` lets one claim retire both heads | Breaks linearity, complicates resolution algorithm |
| Conflict-resolution claim type | A special claim that marks N heads as "retired" and names the canonical successor | More ceremonial, but keeps simple case simple |
| Manual edit | Delete one conflicting claim from `.contrail/claims.jsonl` | Works today, but violates immutability |

None of these are implemented. For now, MULTIPLE_HEADS detection is read-only:
the system tells you there's a conflict, and the only resolution path is manual
(file edit) or waiting for a future schema extension.

## Why not auto-resolve conflicts?

Contrail deliberately does not pick a "winner" between conflicting claims.
Any automatic rule (latest timestamp, highest confidence, semantic scoring)
would hide information from the agent and produce answers that appear
definitive but are based on arbitrary heuristics. The engine's job is to
**store and retrieve faithfully**; resolving ambiguity is the caller's
responsibility, because only the caller has semantic context.

This is analogous to how `git` reports merge conflicts instead of auto-resolving
them: the tool surfaces the problem, the user fixes it.

## Is the store shared with a team?

The store is a repository-local `.contrail/claims.jsonl` file. It can be kept in
version control if that fits the repository's workflow, but collaboration and
synchronization features are not part of this release.

## Does Contrail use embeddings or semantic search?

No. The first release optimizes for an explainable exact lookup of a known
project instruction. Semantic search, indexing, and compression are postponed.

## Which coding assistant is supported?

The golden path is Claude Code through MCP. More IDE integrations and SDKs are
out of scope until this workflow is proven with users.

## What is deliberately postponed?

SQLite and other storage engines, dashboards, embeddings, semantic search,
indexing, compression, synchronization, collaboration, enterprise features,
ACLs, identities, signatures, SDKs, a VS Code extension, analytics, web UI,
confidence calibration, trust algorithms, **a structural MULTIPLE_HEADS
resolution mechanism** (see "What happens if two instructions conflict?" above),
and conflict-resolution research.
