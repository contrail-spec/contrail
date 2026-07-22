# Governance

## Current Model: BDFL (v0.x)

Through all `v0.x` releases, the project is governed by a **Benevolent Dictator For Life (BDFL)** — the original author. This means:

- The BDFL has final say on all spec changes, code merges, and releases
- No formal voting process exists
- No working group or steering committee is formed
- The BDFL may delegate review/merge authority to trusted maintainers at any time

This model is chosen deliberately: a spec for personal AI memory requires coherent design vision to avoid the "design by committee" fragmentation that plagues adjacent standards. The BDFL model ensures the spec stays small, focused, and internally consistent during its most volatile period.

## Transition Triggers

Governance **will transition** from BDFL to a formal working-group model when **either** condition is met:

1. **Version 1.0.0 is released** — a stable, non-breaking spec with production adopters
2. **Three (3) external production adopters** exist — independent organizations running Contrail in production, confirmed by public case study or maintainer attestation

Whichever comes first triggers the transition. The BDFL may also initiate transition earlier at their discretion.

## Post-Transition Model (Intent)

After transition, the intent is to adopt a lightweight working-group model inspired by the [Agentic AI Foundation (AAIF) SEP process](https://github.com/agentic-ai-foundation/sep):

- **Steering Committee**: 3–7 members (BDFL + 2+ external adopters + elected contributors)
- **Spec Evolution Proposals (SEPs)**: RFC-style process for schema changes
- **Consensus-seeking** with fallback to simple majority vote
- **Annual review** of governance effectiveness

The exact charter will be drafted *at* transition time with input from then-active adopters — not pre-engineered now.

## Spec Versioning

- The **spec** (`spec/`) is SemVer'd independently of code packages
- Spec version appears in every claim's `schema_version` field
- Spec changelog: `spec/CHANGELOG.md`
- Code packages (`@contrail-spec/core`, `@contrail-spec/cli`, `@contrail-spec/mcp`) follow their own SemVer but pin the spec version they implement in their README

## Decision Making (v0.x)

| Decision Type | Authority |
|---------------|-----------|
| Schema field additions/removals | BDFL |
| Breaking spec changes (MAJOR) | BDFL |
| Code implementation details | BDFL (delegates to maintainers) |
| Release timing | BDFL |
| Security disclosures | BDFL (coordinates privately) |
| Conduct enforcement | BDFL |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for DCO sign-off and spec proposal process.

## License

Apache-2.0 — see [LICENSE](LICENSE). This license applies to both the spec and all code.