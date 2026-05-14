---
name: pr-creator
description: Draft, prepare, create, or update PR descriptions using the team's standard structure.
---

# PR Skill

Use this when the user wants to open a PR, draft a description, or clean up PR presentation.

## Default behavior

- If `gh` is available and authenticated, create or update the PR directly.
- Default to ready-for-review unless the user explicitly asks for draft/WIP.
- If the current branch already has a PR, update it rather than creating a duplicate.

## PR template

```markdown
## What changed

## Entity changes

| Entity | Field | Change | Before | After |
| ------ | ----- | ------ | ------ | ----- |

## Schema changes

| Schema | Field | Change | Before | After |
| ------ | ----- | ------ | ------ | ----- |

## Endpoints

| Method | Path | Status | Description |
| ------ | ---- | ------ | ----------- |

## Breaking changes

## Linked issues

## Checklist

- [ ] Lint passes locally
- [ ] Tests added / updated
- [ ] Docs updated (if needed)
```

## Notes

- Organize changes by concern, not by file list.
- Keep "What changed" short and readable.
- Drop template sections that are irrelevant to the PR.
