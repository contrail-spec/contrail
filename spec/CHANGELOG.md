# Spec Changelog

All notable changes to the Contrail specification are documented here.

The spec follows [Semantic Versioning](https://semver.org/) independently of code packages.

## [0.1.0] - 2026-07-16 (Draft)

### Added
- Initial specification draft
- `Claim` object with required fields: `schema_version`, `id`, `subject`, `predicate`, `value`, `confidence`
- Optional fields: `value_type`, `valid_from`, `valid_until`, `supersedes`, `source`, `visibility`, `signature`
- ULID-based `id` format for sortable, coordination-free generation
- `predicate` namespacing convention with structural validation only (no controlled vocabulary)
- `confidence` semantics: float 0.0–1.0, no monotonicity requirement
- `supersedes` chain forming linear `Trajectory` with cycle detection
- `source.kind` closed enum: `explicit-statement`, `inferred`, `imported`, `corrected`
- `visibility` label: `private` | `shared` (not enforced)
- `signature` reserved placeholder (unimplemented)
- Engram compatibility mapping table
- Anti-patterns section (7 explicit prohibitions)
- Conformance levels: Minimal, Standard, Full