---
name: merge-target-conflicts
description: Resolve merge conflicts against a PR target branch or base branch while preserving both sides of the work, using a dedicated worktree when appropriate, backing up the branch first, validating the result, and stopping for user decisions when product or engineering intent truly conflicts.
---

# Merge Target Conflicts

Use this when the user asks to fix merge conflicts against `main`, a PR base
branch, or another target branch.

## Core Rules

1. Preserve work from both sides unless the user explicitly chooses one side.
2. Prefer a dedicated worktree for PR conflict work, especially when the main
   checkout is the user's active workspace.
3. Never use `git reset --hard`, amend, rebase, or force push unless the user
   explicitly asks for that exact operation.
4. Create a backup ref before merging the target branch.
5. If uncommitted work exists, inspect it and stop unless it is clearly yours
   for this task or the user already approved how to preserve it. Do not hide
   unknown user changes in a stash.
6. Treat conflict markers as incomplete work. Do not commit until
   `git diff --name-only --diff-filter=U` and a conflict-marker search are
   clean.
7. If the branches express different product behavior, data semantics,
   lifecycle rules, copy direction, or API contracts that cannot be safely
   combined, stop and ask the user to decide.
8. Do not edit ignored local `.env` files to make checks pass. Pass required
   test env vars inline for the command, or tell the user when a real local
   service is missing.

## Workflow

1. Identify the current branch and target branch.
   - Prefer an explicit user-provided branch or PR URL.
   - Otherwise use `gh pr view --json baseRefName` for the current branch.
   - Fall back to `main` only when no PR base can be found.
2. Choose the worktree.
   - Run `git worktree list` and `git status --short --branch`.
   - If a suitable branch worktree already exists, use it.
   - If the main checkout is on the user's normal branch, create or reuse a
     sibling worktree for the conflict branch.
3. Fetch the target branch:
   - `git fetch origin <target>`
4. Confirm the worktree is safe to touch:
   - `git status --short --branch`
   - If dirty, inspect `git diff`, `git diff --staged`, and untracked files.
   - Continue only when dirty work is clearly yours for this task or the user
     approved how to preserve it.
5. Create a backup branch before attempting the merge:
   - Use a name like `codex/backup-<current-branch>-before-<target>-merge`.
   - Point it at the pre-merge `HEAD`.
6. Merge the fetched target branch into the current branch:
   - `git merge origin/<target>`
7. If conflicts appear, list them:
   - `git diff --name-only --diff-filter=U`
   - For each conflicted file, inspect all three stages when helpful:
     - `git show :1:<file>` for the merge base
     - `git show :2:<file>` for current branch intent
     - `git show :3:<file>` for target branch intent
8. Resolve by intent, not by side.
   - Keep target-branch behavior when it is the newer broad platform behavior.
   - Keep current-branch behavior when it is the PR's feature intent and the
     target changed adjacent structure, imports, tests, or docs.
   - Combine tests so both target-branch behavior and PR behavior remain
     covered.
   - Preserve documentation additions from both sides unless they directly
     contradict each other.
9. For true conflicts, stop with a compact decision table:
   - file
   - current branch intent
   - target branch intent
   - why they cannot both be true
   - smallest decision needed from the user
10. After resolving, validate:
    - `git diff --name-only --diff-filter=U`
    - `rg -n "<<<<<<<|=======|>>>>>>>" .`
    - `git diff --check`
    - Run focused checks for touched packages.
    - Run broader repo checks when the merge touched shared contracts, core
      flows, infra, or multiple apps.
11. Commit the merge resolution with the default merge commit message unless
    the repo/user asks for a specific message.
12. Push when the user's request is to fix a remote PR merge conflict or when
    they explicitly ask to update the branch. Otherwise ask before pushing.
13. Re-check PR status when resolving a PR branch:
    - Confirm GitHub no longer reports merge conflicts.
    - Report queued checks, review requirements, or other blockers separately.

## Resolution Heuristics

- Prefer the clean canonical contract over compatibility shims in this pre-MVP
  repo unless the user asks for a compatibility window.
- When one side changes copy and the other changes loading, animation, layout,
  accessibility, or data flow, combine them instead of choosing one file whole.
- When both sides edit tests, keep the stricter combined expectations and add
  regression coverage for the resolved behavior if an edge case caused the
  conflict.
- When module `AGENTS.md` files conflict, preserve both reusable guardrails and
  remove only duplicated wording.
- Do not resolve by accepting all `ours` or all `theirs` for an entire file
  unless the file is generated or the user explicitly asked for that choice.
- If a merge brings in broad target-branch changes unrelated to the PR, do not
  review or rewrite them unless needed to make the PR branch compile.

## Final Report

Tell the user:

- which target branch was merged
- whether any true conflicts needed a user decision
- which files were manually resolved
- which checks passed or could not be run
- whether the branch was pushed
- any remaining PR blockers that are not merge conflicts
