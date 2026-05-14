---
name: pr-review-responder
description: Fetch PR review comments, classify them, propose actions, apply fixes or replies, and resolve threads where appropriate.
---

# PR Review Responder Skill

Use this skill when the user wants to work through PR review feedback end-to-end.

## Workflow

1. Detect or receive the PR URL.
2. Fetch inline comments, issue comments, and unresolved review threads via `gh`.
3. Classify each item as:
   - `bug`
   - `improvement`
   - `minor`
   - `stale`
   - `question`
   - `discuss`
4. Present an assessment table before changing code or replying.
5. After confirmation:
   - apply fixes
   - run checks
   - commit per comment or per shared root cause
   - reply and resolve when appropriate

## Rules

- Do not accept review feedback blindly; verify it against the code and product direction.
- Proposed fixes should be complete, not incremental fragments.
- Run the repo checks before claiming a review item is fixed.
