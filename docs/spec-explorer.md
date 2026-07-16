# Spec Explorer — Annotated Walkthrough

This document explains every field in the Contrail Claim schema with rationale and examples.

---

## The Claim Object

```json
{
  "schema_version": "0.1.0",
  "id": "01J9Z8QK3N4R5S6T7V8W9X0Y1Z",
  "subject": "self",
  "predicate": "preference.code_style.paradigm",
  "value": "functional-composition",
  "value_type": "enum",
  "confidence": 0.9,
  "valid_from": "2026-06-01T00:00:00Z",
  "valid_until": null,
  "supersedes": "01J8X7QK2M3N4P5Q6R7S8T9U0V",
  "source": {
    "tool": "claude-code",
    "session_id": "sess_a1b2",
    "kind": "explicit-statement"
  },
  "visibility": "private",
  "signature": null
}
```

---

## Field by Field

### `schema_version` (required)

```json
"schema_version": "0.1.0"
```

SemVer of the Contrail spec this claim conforms to. Pattern: `^\d+\.\d+\.\d+$`.

Allows consumers to migrate gracefully when v0.2.0 adds fields.

---

### `id` (required)

```json
"id": "01J9Z8QK3N4R5S6T7V8W9X0Y1Z"
```

**ULID** — 26-character Crockford base32. Contains timestamp in first 10 chars, so claims are naturally sortable by creation time without a separate timestamp field.

Why not UUIDv4? ULID sorts chronologically. `ORDER BY id` = correct temporal order.

---

### `subject` (required)

```json
"subject": "self"
```

Who/what this claim is about. Default `"self"` for personal claims. Opaque string — Contrail does not define an identity system.

Examples:
- `"self"` — your own preference
- `"agent:claude-code"` — a belief about an agent
- `"project:contrail"` — a project-level fact
- `"team:platform"` — a team constraint

---

### `predicate` (required)

```json
"predicate": "preference.code_style.paradigm"
```

Namespaced key: `category.subcategory.key` (1–4 segments, lowercase + underscore).

**Pattern:** `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){1,4}$`

| Segment | Purpose |
|---------|---------|
| 1 (root) | Convention: `preference`, `belief`, `constraint`, `observation`, `goal` |
| 2+ | Subcategorization |

Not a controlled enum — no central registry. Structural validation only.

---

### `value` (required)

```json
"value": "functional-composition"
```

The claim's content. Any JSON value. Shape hinted by `value_type`.

---

### `value_type` (optional, default `"string"`)

```json
"value_type": "enum"
```

Informational hint for consumers. One of: `string`, `number`, `boolean`, `enum`, `list`.

**Not used for validation in v0.1.** A claim with `value_type: "number"` but string value passes validation.

---

### `confidence` (required)

```json
"confidence": 0.9
```

Float `[0.0, 1.0]`. Source's certainty **at moment of writing**.

**Critical:** No monotonicity requirement across `supersedes` chain.

- `0.9 → 0.95` = reinforced
- `0.9 → 0.3` = source became less sure (valid signal!)

Decay over time is **not in core**. Non-normative recipe:

```typescript
function decay(confidence: number, ageMs: number, halfLifeMs: number): number {
  return confidence * Math.pow(0.5, ageMs / halfLifeMs);
}
```

---

### `valid_from` (optional)

```json
"valid_from": "2026-06-01T00:00:00Z"
```

ISO 8601 UTC. When this claim became current. Defaults to claim creation time.

---

### `valid_until` (optional)

```json
"valid_until": null
```

ISO 8601 UTC or `null`. When claim ceased to be current. `null` = still current.

Rarely set explicitly — usually implicit via `supersedes` on new claim.

---

### `supersedes` (optional)

```json
"supersedes": "01J8X7QK2M3N4P5Q6R7S8T9U0V"
```

ULID of replaced claim. Forms the **Trajectory** chain.

Rules:
- Must reference existing claim in same store
- No branching — a claim can be superseded at most once
- Cycles invalid (validation error)

---

### `source` (optional)

```json
"source": {
  "tool": "claude-code",
  "session_id": "sess_a1b2",
  "kind": "explicit-statement"
}
```

Provenance — how this claim entered the system.

| Field | Type | Purpose |
|-------|------|---------|
| `tool` | string | Free-form writer identifier |
| `session_id` | string/null | Opaque session from writer |
| `kind` | enum | **Closed enum** — how produced |

#### `kind` enum values

| Value | Meaning |
|-------|---------|
| `explicit-statement` | Subject said it directly |
| `inferred` | System derived without direct statement |
| `imported` | Via adapter (Engram, OMP, etc.) |
| `corrected` | Subject explicitly corrected prior claim |

Closed because filtering by provenance requires known, finite set.

---

### `visibility` (optional, default `"private"`)

```json
"visibility": "private"
```

Label: `"private"` or `"shared"`. **Not enforced by Contrail** — same relationship JWT claims have to auth server.

---

### `signature` (optional, default `null`)

```json
"signature": null
```

**Unimplemented in v0.1.** Reserved for Ed25519. Do not rely on this field.

---

## Trajectory Resolution

```typescript
function resolveTrajectory(claims: Claim[], subject: string, predicate: string): Claim[] {
  const filtered = claims.filter(c => c.subject === subject && c.predicate === predicate);
  const heads = filtered.filter(c => !filtered.some(other => other.supersedes === c.id));
  if (heads.length !== 1) throw new Error("Zero or multiple heads");
  
  const chain = [];
  let current = heads[0];
  const visited = new Set<string>();
  
  while (current) {
    if (visited.has(current.id)) throw new Error("Cycle detected");
    visited.add(current.id);
    chain.push(current);
    const nextId = current.supersedes;
    current = nextId ? filtered.find(c => c.id === nextId) ?? null : null;
  }
  
  return chain; // newest first
}
```

---

## Storage Format

**Canonical:** JSONL (newline-delimited JSON), UTF-8, sorted keys, one claim per line.

```jsonl
{"schema_version":"0.1.0","id":"01J9Z8QK3N4R5S6T7V8W9X0Y1Z","subject":"self","predicate":"preference.editor","value":"neovim","value_type":"enum","confidence":0.95,"valid_from":"2026-07-16T11:00:00Z","valid_until":null,"supersedes":"01J9Z8QK3N4R5S6T7V8W9X0Y1Z","source":{"tool":"claude-code","session_id":"sess_c3d4","kind":"explicit-statement"},"visibility":"private","signature":null}
```

Why JSONL?
- `git diff` is readable
- Merges are line-based
- Streaming parsers work without buffering
- `wc -l` = claim count

---

## Engram Mapping

| Engram | Contrail |
|--------|----------|
| `IDENTITY` | `subject` + `predicate: "identity.*"` |
| `BELIEFS` | `predicate: "belief.*"` |
| `CONSTRAINTS` | `predicate: "constraint.*"`, `confidence: 1.0` |
| `CORRECTIONS` | `supersedes` chain |
| `EVOLUTION` | Resolved `Trajectory` |
| Ed25519 signature | `signature` field (v0.2+) |

---

## Non-Normative: Decay Recipe

```typescript
function decay(confidence: number, ageMs: number, halfLifeMs = 30 * 24 * 60 * 60 * 1000): number {
  // Half-life of 30 days by default
  return confidence * Math.pow(0.5, ageMs / halfLifeMs);
}
```

Every implementation chooses its own strategy (or none). This is just a starting point.