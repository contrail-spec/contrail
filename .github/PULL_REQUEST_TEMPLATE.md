---
name: Pull Request Template
about: Template for PRs
title: ""
labels: ""
assignees: ""
---

## Summary

Brief description of what this PR does.

## Related Issues

Fixes #123
Refs #456

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Spec change (must link spec_proposal issue)
- [ ] Refactoring
- [ ] Test improvements
- [ ] CI/Build changes

## Testing

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing performed (describe)

## Spec Changes (if applicable)

- [ ] `spec/schema/v0.1/claim.schema.json` updated
- [ ] Valid fixtures added to `spec/schema/v0.1/examples/valid/`
- [ ] Invalid fixtures added to `spec/schema/v0.1/examples/invalid/`
- [ ] `spec/SPEC.md` updated
- [ ] `spec/CHANGELOG.md` updated with version bump

## Checklist

- [ ] Commits are signed off (`git commit -s`)
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run validate:spec` passes
- [ ] No `any` types without explanatory comment
- [ ] No breaking changes without MAJOR version discussion