---
name: Spec Proposal
about: Propose a change to the Contrail specification or schema
title: '[spec] '
labels: 'spec-question'
---

## Summary

One sentence describing the proposed spec change.

## Current behavior

What the spec says today (include section reference, e.g. "SPEC.md §2.1").

## Proposed change

Be specific: which fields, what types, what validation rules.

## Rationale

Why this change? What use case does it enable that the current spec handles poorly?

## Backward compatibility

- [ ] This is additive-only (new optional field) — MINOR bump
- [ ] This changes existing field semantics — MAJOR bump + migration note
- [ ] This removes a field — MAJOR bump + migration note

## Affected areas

- [ ] `spec/SPEC.md`
- [ ] `spec/schema/v0.1/claim.schema.json`
- [ ] `spec/schema/v0.1/examples/valid/` (new fixtures)
- [ ] `spec/schema/v0.1/examples/invalid/` (if new validation rules)
- [ ] `spec/CHANGELOG.md`
- [ ] `packages/core/src/validator.ts`
- [ ] `packages/core/src/types.ts`

## Discussion

> Per CONTRIBUTING.md, spec changes must be discussed in this issue before a PR is opened. Do not skip this step.
