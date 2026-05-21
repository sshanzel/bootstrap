---
name: pr-reviewer
description: Review a PR using the team's severity bar and post comments. Use when the user asks to "review the PR", "audit this PR", or wants `[blocker]`/`[important]`/`[suggestion]` style review comments.
---

# PR Reviewer Skill

Use this when the user wants a real code review on a PR.

## Source of truth

Always read and apply `.github/instructions/copilot.instructions.md` first. It
owns the severity bar, review philosophy, skip rules, and focus areas. Do not
restate those rules here — defer to that file. If it has changed since this
skill was last touched, the instructions file wins.

Use the repo's `AGENTS.md` (root and module-level) as the second reference for
conventions and invariants.

## Workflow

1. **Resolve the PR.**
   - Default to the current branch's PR: `gh pr view --json url,number,headRefName,baseRefName,title,body`.
   - Accept an explicit PR number or URL as an argument and pass it to `gh`.
   - Fail clearly if `gh` is unauthenticated.

2. **Pull the change set.**
   - `gh pr diff <pr>` for the unified diff.
   - `gh pr view <pr> --json files` for the file list with additions/deletions.
   - For non-trivial hunks, read the surrounding file in the working tree
     (not just the patch) before commenting.

3. **Classify each finding.** Apply the severity definitions from the Copilot
   instructions. When in doubt between two levels, pick the lower one. Only
   comment when confidence is high.

4. **Skip the noise.**
   - No nits, no formatting-only comments, no praise-only comments.
   - Do not flag correct TypeScript inference.
   - Skip stylistic preferences already covered by `eslint`/`format`.

5. **Apply extra scrutiny** to PRs that touch:
   - `packages/shared` schemas — verify API + web are aligned, and that drift
     is treated as `[blocker]`.
   - auth, sessions, cookies, OAuth callbacks.
   - write paths — require tests that assert final persisted state, not just
     mock interactions.
   - module-level invariants documented in `AGENTS.md` — flag stale docs.
   - entity hooks, transactions, migrations, and provider webhooks.
   - bug fixes — missing reproducing test is at least `[important]`.

6. **Post the review.** Group findings by file and post via
   `gh pr review <pr> --comment --body-file <tmp>` for a single summarizing
   review, or `gh pr review <pr> --comment` with inline `--body` for shorter
   reviews. Do not use `--approve` or `--request-changes` unless the user
   explicitly asks for it.

## Comment format

Each comment starts with exactly one severity label on its own line, per the
Copilot instructions:

```
[severity]
<one-sentence problem statement>
<why it matters, one sentence>
<suggested fix, one line>  // optional
```

Keep each comment focused on one issue. If a problem needs more context than
fits, link to the file/line and stop — do not expand the comment into an
essay.

## Pre-post check

Before posting, present the user a short summary:

- count of `[blocker]` / `[important]` / `[suggestion]` findings
- one-line per finding with `path:line` + headline

Wait for confirmation before calling `gh pr review`. Reviews are visible to
the team — do not post without explicit go-ahead.

## After posting

- Return the URL of the submitted review.
- If any `[blocker]` was posted, suggest the author can address with the
  `pr-review-responder` skill.
