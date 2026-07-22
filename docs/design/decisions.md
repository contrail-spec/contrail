# Design Decisions

Record of architectural tradeoffs and rationale. Updated as decisions are made.

---

## SUPERSEDES as a single ID (not an array)

**Status:** Current (v0.1–v0.2). Subject to future revision.

### Decision
`supersedes` is a single optional claim ID (string), not an array. A claim can
replace exactly one parent.

### Rationale
- **Simplicity**: The resolution algorithm is a linear walk: read the head,
  follow `supersedes` until null. No branching, no cycles (detected separately),
  no ambiguity.
- **Determinism**: Given a chain, there is exactly one path. Different traversals
  cannot produce different results.
- **Forces explicit agent responsibility**: If an agent writes two claims that
  both supersede the same parent, the engine reports `MULTIPLE_HEADS` rather
  than silently ranking them. The agent must resolve the ambiguity — not the
  engine.

### Tradeoff accepted
`MULTIPLE_HEADS` conflicts **cannot be structurally resolved** within this
model. Any attempt to "fix" a `MULTIPLE_HEADS` with a single `supersedes`
either moves the conflict (the new claim and the untouched head still converge
on the same ancestor) or creates a new `MULTIPLE_HEADS` between multiple
resolution claims.

This is a deliberate limitation: we prioritize faithful storage and retrieval
over conflict resolution. The engine tells the truth about what it has; it does
not paper over ambiguity.

### Future alternatives
If structural resolution becomes necessary, candidates are:

| Approach | Pros | Cons |
|----------|------|------|
| Array `supersedes` | One claim can retire all conflicting heads atomically | Breaking change; resolution algorithm becomes a DAG walk |
| Conflict-resolution claim | Non-breaking add-on; keeps common case simple | Ceremony; new claim type in schema |
| Manual edit (current workaround) | Works today | Violates immutability; not automated |

None are planned before user feedback suggests they are needed.

### Related
- `docs/faq.md` — "What happens if two instructions conflict?" and
  "Why not auto-resolve conflicts?"
- `packages/core/src/trajectory.ts` — `resolveTrajectory()` and
  `MULTIPLE_HEADS` detection
