---
name: prepare-issue
description: >-
  Fetches a GitHub issue by number, title search, or interactive pick from
  GaSalRUAG/SODC_NextGen, creates and checks out a work branch, and writes a
  detailed implementation prompt for the build phase. Use when the user invokes
  /prepare-issue, asks to prepare work from a GitHub issue, branch for an
  issue, or pick an issue and implement for sodcNg/SODC_NextGen.
disable-model-invocation: true
---

# Prepare Issue

Turn a GitHub issue into a ready-to-build workspace: resolve the issue, create a branch, output a structured implementation prompt.

**Invocation**: `/prepare-issue`, "prepare issue #42", "branch for the AIXM import bug", or attach this skill.

**Repository** (same as [create-issue-github](https://github.com/GaSalRUAG/SODC_NextGen)):

| | |
|---|---|
| Repo | `GaSalRUAG/SODC_NextGen` |
| Issues | https://github.com/GaSalRUAG/SODC_NextGen/issues |
| Local clone | `sodcNg` (typical; confirm `git remote get-url origin` if unsure) |

**Language**: Match the user's language for chat. **Implementation prompt in English** unless they ask otherwise.

---

## Branch naming

**Pattern** (always use unless the user overrides in chat):

```
issue/{n}-{developer}-{slug}
```

| Token | Meaning |
|-------|---------|
| `{n}` | GitHub issue number (no `#`) |
| `{developer}` | Developer identifier, preferably GitHub login; fallback to git user name |
| `{slug}` | Kebab-case from issue title |

**Example**: issue #42 *Fix AIXM import height parsing*, developer `gaetano` -> `issue/42-gaetano-fix-aixm-import-height-parsing`

**Developer rules**: resolve the developer identifier with `gh api user -q .login` when available; otherwise use `git config user.name`. Convert to lowercase kebab-case; letters, numbers, hyphens only; strip punctuation; collapse repeated hyphens; trim to **24 characters** max. If no developer can be resolved, ask the user for the developer name before creating the branch.

**Slug rules**: lowercase; letters, numbers, hyphens only; strip punctuation; collapse repeated hyphens; trim slug to **40 characters** max.

**Collision**: if the branch exists, append `-2`, `-3`, etc. before creating.

---

## Workflow

Copy and track:

```
- [ ] 1. Authenticate & resolve issue
- [ ] 2. Fetch full issue context
- [ ] 3. Prepare git (clean tree, default branch, pull)
- [ ] 4. Create and checkout branch
- [ ] 5. Deliver implementation prompt
```

### Step 1 - Resolve issue

Always use `--repo GaSalRUAG/SODC_NextGen`.

**A. User gave issue number** (e.g. `#42`, `42`):

```bash
gh issue view 42 --repo GaSalRUAG/SODC_NextGen
```

**B. User gave title or keywords** (not a bare number):

```bash
gh issue list --repo GaSalRUAG/SODC_NextGen --state open --limit 50 --search "keywords"
```

- One clear match -> use it.
- Several matches -> show a numbered list (number, title, labels); ask which to use.
- No match -> widen search or list open issues.

**C. User gave no issue**:

```bash
gh issue list --repo GaSalRUAG/SODC_NextGen --state open --limit 30
```

Present a numbered list. Ask the user to pick by number or title.

If `gh` fails:

```bash
gh auth status
```

### Step 2 - Fetch issue context

```bash
gh issue view <N> --repo GaSalRUAG/SODC_NextGen --json number,title,body,labels,state,url,assignees,milestone
```

Parse body sections when present. Do not invent requirements; mark gaps as **TBD - confirm with user**.

### Step 3 - Prepare git

1. `git status` - if dirty, **stop** and ask whether to stash, commit, or abort.
2. Get default branch:

```bash
gh repo view GaSalRUAG/SODC_NextGen --json defaultBranchRef -q .defaultBranchRef.name
```

3. `git fetch origin`
4. `git checkout <defaultBranch>`
5. `git pull --ff-only origin <defaultBranch>`

### Step 4 - Create and checkout branch

1. Resolve the developer identifier.
2. Build branch name from the pattern, developer identifier, and issue title.
3. If branch exists locally or on remote, ask: checkout existing, or use a suffix.
4. Create and switch:

```bash
git checkout -b <branch-name>
```

5. Call **SetActiveBranch** with repo path and branch name.
6. Confirm issue URL, branch name, base branch, developer identifier, and clean working tree.

Do **not** commit or push unless the user asks.

### Step 5 - Implementation prompt

Output one markdown block grounded in issue text:

```markdown
## Implementation brief - Issue #<N>: <title>

**Issue**: <url>
**Branch**: `<branch-name>` (checked out)
**Repo**: GaSalRUAG/SODC_NextGen / local sodcNg

### Goal
<1-3 sentences>

### Requirements
- <testable bullets from issue>

### Acceptance criteria
<copy checkboxes from issue>

### Technical context
- **Area**: <from labels/body>
- **Notes from issue**: <constraints/links>
- **Assumptions / TBD**: <explicit gaps>

### Suggested approach
1. <investigation + implementation steps>
2. ...
3. Verify: <manual test approach>

### Files / areas to inspect first
- <likely modules>

### Out of scope
- <what issue does not include>

### Definition of done
- [ ] Acceptance criteria met
- [ ] No unrelated changes
- [ ] Project checks completed
```

After the prompt, ask once: *"Start implementation now, or adjust the brief first?"*

---

## Rules

- Never invent issue content; quote/paraphrase from `gh issue view`.
- Never force-push, reset --hard, or skip hooks unless explicitly requested.
- Never commit secrets or change git config.
- Prefer `gh` over web scraping.
- If issue is **closed**, warn and confirm before branching.

