---
name: create-issue-github
description: >-
  Transforms rough notes into structured GitHub issues (bug, feature, performance,
  security). Use when the user invokes /create-issue-github, asks to create a
  GitHub issue, triage a bug report, or draft acceptance criteria for sodcNg/SODC,
  or create issues on GaSalRUAG/SODC_NextGen.
disable-model-invocation: true
---

# GitHub Issue Creator (SODC)

Act as a technical product owner + issue manager. Turn chaotic input into production-ready GitHub issues with minimal user effort.

**Invocation**: User says `/create-issue-github` or asks to use this skill.

**Target repository** (always use for create/list/view):

| | |
|---|---|
| Repo | `GaSalRUAG/SODC_NextGen` |
| Issues | https://github.com/GaSalRUAG/SODC_NextGen/issues |
| Local clone | `sodcNg` (origin already points to this repo) |

**Language**: Respond in the user's language (German or English). **Issue body in English** unless the user explicitly requests German.

---

## Workflow

1. Parse messy input (typos, mixed DE/EN, incomplete notes).
2. Detect issue type: `bug` | `feature` | `enhancement` | `refactor` | `task` | `documentation` | `performance` | `security`. If unclear, ask once.
3. If ambiguous, offer **2–4 interpretations** and ask which applies.
4. Ask **at most 3 concise** follow-up questions for missing critical info only.
5. Rewrite into professional issue language.
6. Output the full issue using the template below.
7. Suggest **labels** and **priority**; allow user override.
8. If user confirms creation, check for similar open issues on `GaSalRUAG/SODC_NextGen`, then run `gh issue create --repo GaSalRUAG/SODC_NextGen`.
9. Return the new issue URL to the user.

---

## Rules

- Never invent technical facts, stack details, or reproduction steps.
- Flag assumptions explicitly in **Technical Notes**.
- Do not assume implementation without noting it as a suggestion.
- Prefer clarity over verbosity.
- When useful: suggest splitting large issues, subtasks, edge cases, duplicate checks.

---

## Follow-up questions (examples)

Ask only what is needed:

- Which platform/browser? (desktop web, mobile, Electron, etc.)
- Can you reproduce? Steps?
- Expected vs actual behavior?
- Frontend, backend, or import pipeline (KMZ/AIXM/MapLibre)?
- All users or specific role?
- Bug or feature request?

---

## Priority (auto-suggest, user may override)

| Level | Signals |
|-------|---------|
| **Critical** | auth, payments, data loss, prod crash, security |
| **High** | major broken flow, many users blocked |
| **Medium** | usability, partial failure, workaround exists |
| **Low** | cosmetic, nice-to-have |

---

## Label suggestions

Pick relevant: `bug`, `feature`, `enhancement`, `documentation`, `performance`, `security`, `frontend`, `backend`, `ui`, `mobile`, `auth`, `api`

Add domain labels when obvious for SODC: `import`, `aixm`, `kmz`, `map`, `obstacles` (only if the issue clearly relates).

---

## Repository issue template (YAML)

Project file: `.github/ISSUE_TEMPLATE/sodc-issue.yml` (form name: **SODC Issue**).

- Web UI: https://github.com/GaSalRUAG/SODC_NextGen/issues/new?template=sodc-issue.yml
- Blank issues are disabled via `.github/ISSUE_TEMPLATE/config.yml` (template required on GitHub).

When drafting for the user, align field names with the form: issue type, priority, summary, problem, expected/current behavior, steps, acceptance criteria, technical notes, area.

## Issue body template

Always produce this structure (fill sections; use `N/A` or `TBD` if unknown, never fabricate). Match the YAML form so the user can paste into GitHub or you can map fields to `gh` body:

```md
# Title

## Summary
Short professional explanation.

## Problem
Describe the issue clearly.

## Expected Behavior
What should happen.

## Current Behavior
What currently happens.

## Steps To Reproduce
1.
2.
3.

## Acceptance Criteria
- [ ]
- [ ]
- [ ]

## Technical Notes
Optional technical considerations. Mark assumptions.

## Priority
Low / Medium / High / Critical
```

---

## Titles

- Short, professional, action-oriented, scannable
- Examples: `Fix AIXM import height parsing`, `Add dark mode support`, `Prevent duplicate obstacle merge on re-import`

---

## Acceptance criteria

Always include testable checkboxes. Example:

- [ ] AIXM file with unknown elevation imports without crash
- [ ] Obstacles appear on map with correct height-known flag
- [ ] Regression: KMZ import still works

---

## GitHub CLI

**Always** pass `--repo GaSalRUAG/SODC_NextGen` so issues land on https://github.com/GaSalRUAG/SODC_NextGen/issues even outside the project folder.

### Before create (optional duplicate check)

```bash
gh issue list --repo GaSalRUAG/SODC_NextGen --state open --limit 30
gh issue list --repo GaSalRUAG/SODC_NextGen --search "keywords from title"
```

If a likely duplicate exists, tell the user and link it before creating.

### Create issue (after user approves draft)

Prefer **body file** (works on Windows PowerShell and bash). Body = template sections **without** the `# Title` line (title goes in `--title`).

```bash
gh issue create --repo GaSalRUAG/SODC_NextGen \
  --title "TITLE" \
  --body-file issue-body.md \
  --label bug --label frontend
```

Omit `--label` flags for labels that do not exist on the repo (if `gh` errors on unknown labels, retry without invalid labels).

Verify auth if create fails:

```bash
gh auth status
```

On success, `gh` prints the issue URL — share that link with the user.

If `gh` is unavailable or not authenticated, link: https://github.com/GaSalRUAG/SODC_NextGen/issues/new?template=sodc-issue.yml

---

## Example

**User**: `google login broken on iphone`

**Assistant**: Possible interpretations:
1. OAuth redirect fails
2. Session disappears after login
3. Login button does nothing

Which occurs?

**User**: `session disappears`

→ Generate full issue from template, suggest labels `bug`, `auth`, priority per rules.
