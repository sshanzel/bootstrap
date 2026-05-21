---
name: pr-review-responder
description: Fetch PR review comments, classify them, propose actions, apply fixes or replies, and resolve threads where appropriate.
---

# PR Review Responder Skill

Use this skill when the user wants to work through PR review feedback end-to-end.

## Workflow

1. Detect or receive the PR URL.
2. Fetch inline comments, issue comments, and unresolved review threads via `gh`.
   - Ignore automated deployment/status comments that do not require code review action, especially Vercel bot deployment/access comments. Do not number them, include them in the assessment table, reply to them, or include them in the final summary.
   - Treat low-confidence or suppressed review notes as regular feedback only the first time they appear or when they materially change. If a previous responder run already assessed or addressed that low-confidence note, do not list it again in later assessment tables or summary comments.
3. Classify each item as:
   - `bug`
   - `improvement`
   - `minor`
   - `stale`
   - `question`
   - `discuss`
   While classifying, use the `pr-review-documenter` skill for comments that express a reusable pattern, guardrail, or module invariant. If documentation should change, include that docs update in the proposed action.
4. Present an assessment table before changing code or replying, then stop.
   - Use a concise title such as `PR Feedback Assessment`; do not title the section `Review Work`.
   - Number the review items for the current responder run with plain row numbers such as `1`, `2`, `3`, etc. These numbers only need to stay consistent between this round's assessment, replies, commits, and summary comment.
   - List every current-round feedback item as its own numbered row, including low-confidence or suppressed review notes that are being assessed for the first time or have materially changed. Do this even when multiple comments share the same root cause, proposed code change, or commit.
   - Use assessment columns in this order: `Item`, `Feedback`, `Class`, `Proposed action`.
   - Each proposed action must briefly explain what will change and where the change is likely to be made.
   - If multiple items share the same root cause or must be fixed together, keep separate rows and mention the shared fix inside each relevant `Proposed action`, e.g. `Same root cause as item 2; update the shared parser and group both into one commit.`
   - Do not use one-word actions such as `Fix`, `Update`, or `Reply`; write a short phrase or sentence instead, such as `Adjust the token refresh guard to return early when the cookie is missing`.
   - For comments that do not need a code change, describe the intended response, verification, or reason for no change.
   - Explicitly ask the user to confirm before proceeding with the exact `go` signal. Use this template sentence: Please reply with `go` if you want me to apply these actions. I will not change code, reply, resolve threads, commit, push, or request review until you send `go`.
   - Do not perform any review-response actions after the assessment table until the user explicitly approves the proposed actions with `go`.
5. After explicit user confirmation, use this review-response loop:
   - apply fixes
   - run checks
   - commit per comment or per shared root cause
   - reply to each thread with the concrete fix, decision, or rationale
   - resolve fixed threads and threads that are not up for further discussion
   - leave unresolved any thread that still needs product/engineering discussion
   - verify that every review reply was submitted as an actual PR review/comment, not left in a pending review
   - submit any pending review with `COMMENT`, or delete it if it was created accidentally and contains no useful comments
   - add a formatted PR summary comment, similar in quality to the assessment table shown to the user, that reports the outcome and what was done
   - re-request review from the relevant reviewer(s), including Copilot when Copilot reviewed the PR
   - request Copilot review through `gh` or the GitHub API; do not post `@copilot review` or any other trigger comment
   - mention in the final response whether the review request succeeded or was unavailable

## Rules

- Do not accept review feedback blindly; verify it against the code and product direction.
- Proposed fixes should be complete, not incremental fragments.
- Commit per review item whenever the change is isolated. Group multiple items into one commit only when they converge on the same files, same root cause, or same coherent code change.
- Classify `discuss` only when the intended action is to reply or keep the thread open for discussion. If you propose a code or docs change, classify the item as `bug`, `improvement`, or `minor` instead.
- Run the repo checks before claiming a review item is fixed.
- Do not substitute a generic PR summary for the review round result summary; the result summary is an audit trail for the review round.
- Do not leave pending reviews or draft comments behind after resolving threads.
- Do not stop after resolving threads. A completed run ends with a summary comment and a re-review request unless the user explicitly says not to request review.
- Do not request Copilot review with a PR comment such as `@copilot review`; use reviewer assignment through the CLI or API.

## Requesting Copilot Re-Review

Prefer the GitHub CLI reviewer assignment path:

```bash
gh pr edit "$pr_number" --add-reviewer "@copilot"
```

For older Copilot reviewer identities, fall back to the explicit reviewer login
if `@copilot` is unavailable in the installed `gh` version:

```bash
gh pr edit "$pr_number" --add-reviewer copilot-pull-request-reviewer
```

If the CLI path does not work but authenticated API access is available, use the
pull request reviewer request endpoint with Copilot's reviewer login:

```bash
owner_repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
gh api \
  --method POST \
  "repos/$owner_repo/pulls/$pr_number/requested_reviewers" \
  -f reviewers[]=copilot-pull-request-reviewer
```

After requesting review, verify the request or resulting review activity with:

```bash
gh pr view "$pr_number" --json reviewRequests,reviews
```

## Summary Comment Format

The final PR comment must be formatted and outcome-oriented. It should include:

- a short opening line that says the review feedback has been addressed and is ready for re-review
- a concise table or clearly sectioned list mapping every current-round review item to its outcome, including items fixed by the same commit
- the same current-round item numbers used in the assessment table so each outcome maps back to the assessment
- the actual commit hash that fixed each item, included in the outcome text when useful
- commit summaries when useful
- any items intentionally left open for product or engineering discussion
- checks that passed
- a final line noting that threads were replied to/resolved and review was re-requested

Use one row per review item. Do not merge rows in the summary, even when
multiple comments were resolved by the same root cause or same intentional
decision. Instead, repeat the shared commit hash or rationale so each assessed
item stays auditable.

Prefer a table when there are several comments, for example:

| Item | Outcome |
| --- | --- |
| 1. Profile preview exposure | Fixed in `abc1234`: added visibility/safety gating and regression tests. |
| 2. Native purchase proof + restore schema | Fixed in `def5678`: required platform proof and gated placeholder verification outside production. |
| 3. Location exclusion discussion | Replied with product rationale and left the thread unresolved for discussion. |

## Posting Multiline GitHub Comments

When posting or editing PR summary comments with `gh`, preserve real newlines.
Do not pass a body string that contains literal escaped `\n` sequences, because
GitHub will render the table as one broken line.

Prefer a heredoc-backed temporary file and `--body-file` for issue comments:

```bash
summary_file="$(mktemp)"
cat > "$summary_file" <<'EOF'
Review feedback has been addressed and is ready for re-review.

| Item | Outcome |
| --- | --- |
| 1. Example item | Fixed in `abc1234`: describe the concrete outcome. |
| 2. Discussion item | Replied with rationale and left open for product decision. |

Checks passed:
- `pnpm --filter @bootstrap/web test`
- `pnpm format:check`

Threads were replied to and resolved; re-review has been requested.
EOF

gh pr comment "$pr_number" --body-file "$summary_file"
rm "$summary_file"
```

For GraphQL `updateIssueComment` or review-thread replies, build the body with
real newlines using ANSI-C shell quoting or a file read, not backslash-escaped
text inside normal quotes:

```bash
body=$'Review feedback has been addressed and is ready for re-review.\n\n| Item | Outcome |\n| --- | --- |\n| 1. Example item | Fixed in `abc1234`: describe the concrete outcome. |'
gh api graphql \
  -f query='mutation($id:ID!,$body:String!){ updateIssueComment(input:{id:$id,body:$body}){ issueComment{ url } } }' \
  -f id="$comment_id" \
  -f body="$body"
```

After posting or editing a formatted summary comment, verify the stored body
contains real newline characters before considering the review-response round
complete:

```bash
gh pr view "$pr_number" --json comments --jq '.comments[-1].body'
```

If the output shows visible `\n` text instead of line breaks, edit the comment
before finalizing.
