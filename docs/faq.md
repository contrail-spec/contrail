# FAQ

## Why not just use Engram?

Engram is a **signed envelope format with HTTP API**. Contrail is a **temporal claim shape** that rides on MCP.

| Aspect | Engram | Contrail |
|--------|--------|----------|
| Core primitive | Envelope (IDENTITY/BELIEFS/CONSTRAINTS/CORRECTIONS/EVOLUTION) | Claim with `supersedes` chain |
| Transport | HTTP API + MCP | MCP native (resource + tools) |
| Temporal model | `EVOLUTION` changelog field | First-class `supersedes` graph |
| Confidence | Not modeled | Native `0.0–1.0` on every claim |
| Signing | Ed25519 (core) | v0.2+ (placeholder in v0.1) |
| Adoption | Early, pre-v1 | Early, pre-v1 |

**They compose:** Contrail's Engram adapter (`@lukitadproxd-netizen/engram`) round-trips claims ↔ envelopes. Engram's `CORRECTIONS` map directly to Contrail's `supersedes`.

---

## Why not OMP (Open Memory Protocol)?

OMP is an **MCP-native memory store with CLI and adapters** — excellent if flat memories suffice.

Contrail adds what OMP doesn't model:
- Temporal supersession chains (`supersedes`)
- Confidence scores on every claim
- Trajectory resolution as a first-class operation

**They compose:** OMP could adopt Contrail's claim format as its storage schema in v0.2+. Contrail's JSONL is a valid OMP ingestion source today.

---

## Why not just use MCP directly?

MCP solves **tool connectivity** (Resources/Tools/Prompts). It doesn't define **what a personal memory claim looks like**.

Contrail defines the *shape of a belief*. The MCP adapter (`@lukitadproxd-netizen/mcp`) exposes that shape as:
- **Resource:** `contrail://claims` (read-only JSONL)
- **Tool:** `contrail_remember(predicate, value, confidence?)`
- **Tool:** `contrail_recall(predicate)` → current claim
- **Tool:** `contrail_trajectory(predicate)` → full chain

---

## Why not Mem0 / Zep / MemMachine?

Those are **retrieval engines** — they compete on embedding quality, ranking, benchmark scores (LoCoMo, LongMemEval).

Contrail is a **data format**. Its JSONL log is a valid ingestion source for any retrieval engine.

| Layer | Examples |
|-------|----------|
| Format | **Contrail** |
| Transport | MCP |
| Retrieval | Mem0, Zep, MemMachine |
| Storage | JSONL, SQLite, PostgreSQL, OMP |
| Signing | Engram (envelope) |

---

## Why not RDF / Solid / ActivityPub?

15+ years of evidence: generalized triple stores lose to flat JSON + REST for developer adoption outside government/academia.

Contrail is **JSON-pragmatic, RDF-inspired**:
- `predicate` ≈ RDF predicate
- `subject` ≈ RDF subject
- `supersedes` ≈ named graph versioning
- But: flat objects, JSON Schema, no SPARQL endpoint required

Solid pods *can* store Contrail JSONL — it's just a file format.

---

## Why ULID not UUIDv4?

| Property | ULID | UUIDv4 |
|----------|------|--------|
| Sortable by time | ✅ (first 10 chars) | ❌ |
| No coordination | ✅ | ✅ |
| Compact | 26 chars | 36 chars |
| Case-insensitive | ✅ (Crockford) | ❌ |

`ORDER BY id` = correct temporal order. No separate `created_at` needed.

---

## Why is `predicate` not a controlled enum?

A controlled vocabulary requires a spec change for every new fact type — the centralized-ontology bottleneck that limited RDF/OWL adoption.

Structural validation (pattern match) gives:
- Extensibility without spec changes
- Namespacing convention prevents collisions
- Tooling can suggest, not enforce

---

## Why is `confidence` not monotonic?

Real belief revision isn't monotonic.

- `0.9 → 0.95` = "I'm more sure now"
- `0.9 → 0.3` = "I was overconfident / context changed / I was wrong"

Both are valid signal. Rejecting the second loses information.

---

## Why no embeddings in the claim?

Embeddings belong to the **retrieval layer** (Mem0, Zep, etc.). Contrail's JSONL is a valid ingestion source.

Adding vectors to the claim:
- Bloats the portable format
- Couples to a specific embedding model
- Makes `git diff` unreadable

---

## Why no access control enforcement?

`visibility: "private" | "shared"` is a **label**, like JWT claims. Enforcement belongs to the system storing/serving the claims (file perms, database RLS, proxy auth).

---

## Why no agent capability manifests?

That's **A2A's Agent Card** and **MCP's server descriptor**. Contrail only ever describes *what is believed about a subject* — never *what an agent can do*.

---

## Why Apache-2.0?

Explicit patent grant. Enterprise-safe. The only defensible license for infrastructure asking to be adopted by tools its author doesn't control.

---

## What's the roadmap?

| Version | Target | Key Deliverable |
|---------|--------|-----------------|
| v0.1 | Aug 17, 2026 | Spec freeze, core lib, CLI, MCP adapter, demo |
| v0.2 | Q4 2026 | Ed25519 signing, SQLite backend, OMP adapter, Python SDK |
| v1.0 | 2027 | 3 external production adopters → governance transition |

See `GOVERNANCE.md` for transition triggers.