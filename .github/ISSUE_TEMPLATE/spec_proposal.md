---
name: Spec Proposal
about: Propose a change to the Contrail schema or semantics
title: "[SPEC] "
labels: ["spec-question"]
assignees: ""
---

## Summary

One-sentence summary of the proposed change.

## Motivation

Why is this change needed? What problem does it solve?

## Detailed Design

Describe the change in detail:
- New/changed fields
- Schema modifications
- Semantic changes
- Migration implications

## Backwards Compatibility

- [ ] Additive only (MINOR bump)
- [ ] Breaking change (MAJOR bump required)
- [ ] Requires migration script

## Engram/OMP/MCP Impact

Does this affect compatibility with other protocols?

## Alternatives Considered

What else was considered and why was it rejected?

## Checklist

- [ ] I have read the Anti-Patterns section of SPEC.md
- [ ] This does not introduce a controlled vocabulary for `predicate`
- [ ] This does not add embedding/vector fields
- [ ] This does not implement signing
- [ ] This does not add access control enforcement
- [ ] This does not blur the line with agent capability manifests (A2A/MCP)