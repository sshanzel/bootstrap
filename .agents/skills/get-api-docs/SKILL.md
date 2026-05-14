---
name: get-api-docs
description: Fetch third-party library or API docs with chub before writing against an external API or SDK.
---

# Get API Docs via chub

Use `chub` rather than relying on memory for third-party APIs.

## Workflow

1. Find the doc id:

```bash
chub search "<library name>" --json
```

2. Fetch the docs:

```bash
chub get <id> --lang ts
```

3. Base the code or answer on the fetched documentation.

4. If you learned a local gotcha, save it:

```bash
chub annotate <id> "short actionable note"
```
