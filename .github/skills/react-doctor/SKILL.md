---
name: react-doctor
description: 'Use when: finishing a React feature, before commit, or when user asks /doctor, run react doctor, triage diagnostics, or cleanup warnings/errors. Fast path for regression checks first, full local triage only when explicitly requested.'
argument-hint: 'Describe the goal: regression check, changed-files triage, or full codebase cleanup'
---

# React Doctor

Use a fast non-interactive flow by default. Escalate only when requested.

## When to Use
- Before committing React code
- After a bug fix or feature branch changes
- When user asks for `/doctor`, "run react doctor", "triage", or "cleanup"
- When score regresses or user requests a target score

## Default Flow (Fast Path)

Use this path unless the user explicitly asks for a full cleanup pass.

1. Baseline:

```bash
npm run doctor
```

2. Diff diagnostics:

```bash
mkdir -p ./tmp/react-doctor
npx -y react-doctor@latest --json --yes --diff HEAD > ./tmp/react-doctor/diagnostics.json
```

3. Validate diagnostics payload:

```bash
test -s ./tmp/react-doctor/diagnostics.json
node -e 'const fs=require("fs");const p="./tmp/react-doctor/diagnostics.json";const j=JSON.parse(fs.readFileSync(p,"utf8"));if(!Array.isArray(j.diagnostics)) throw new Error("diagnostics array missing");console.log("diagnostics="+j.diagnostics.length)'
```

4. Fix order:
- Fix `severity: error` first.
- Re-run typecheck after risky fixes.
- Then fix `severity: warning`.

5. Re-check score:

```bash
npm run doctor
```

If score dropped, continue fixing before commit.

6. Cleanup:

```bash
rm -rf ./tmp/react-doctor
```

## Decision Points

Use the smallest scan scope that answers the current question.

| Intent | Command |
| --- | --- |
| Quick local check (default) | `npm run doctor` |
| Uncommitted edits only | `npx -y react-doctor@latest --json --yes --diff HEAD` |
| Whole branch vs base | `npx -y react-doctor@latest --json --yes --diff` |
| Full codebase sweep | `npx -y react-doctor@latest --json --yes` |

Mode:
- Working tree (default): no commit/push.
- PR mode: only when user explicitly asks.

## Score Target Workflow (e.g., "get to 95+")

Use this only when user asks for a specific score.

1. Run a baseline full scan and record score + issue totals.
2. Rank top rule families from JSON diagnostics.
3. Fix code issues first (errors before warnings) and re-measure.
4. If code-only fixes are unlikely to reach target, ask whether rule/category tuning is allowed.
5. If tuning is approved, apply the smallest config change and disclose that gain came from policy.

## Full Triage (Only on Explicit Request)

Use this only when user asks for full triage/cleanup, not for routine regression checks.

1. Confirm CLI options:

```bash
npx react-doctor@latest --help
```

If this skill conflicts with CLI help, follow CLI help.

2. Fetch canonical playbook:

```bash
curl --fail --silent --show-error \
  --header 'Cache-Control: no-cache' \
  https://www.react.doctor/prompts/react-doctor-agent.md
```

3. Run loop:
1. Scan (`--json`, chosen scope)
2. Filter false positives
3. Triage (errors before warnings)
4. Fix
5. Validate and summarize

4. Optional rule docs:

For each unique `<plugin>/<rule>` in surviving diagnostics, fetch rule guidance:

```bash
curl --silent --fail --create-dirs \
  --output "./tmp/react-doctor/rules/$plugin/$rule.md" \
  "https://www.react.doctor/prompts/rules/$plugin/$rule.md" || true
```

Use each rule file's validation/fix guidance where available.

## Interactive CLI (Advanced/Fallback)

Prefer non-interactive commands with `--yes`.
Use interactive terminal control only if React Doctor opens prompts.

1. Start command with `run_in_terminal`.
2. Use `mode: "sync"` for one-shot commands.
3. Use `mode: "async"` only for interactive prompts or long-running sessions.
4. Send responses one prompt at a time with `send_to_terminal(..., waitForOutput: true)`.
5. Stop unused terminal sessions with `kill_terminal`.

## Reliability Guardrails

Use shell-safe setup before complex parsing or heredocs:

```bash
set +H
set -euo pipefail
export CI=1
```

If any gate fails, surface stderr/stdout verbatim and stop.

## Deterministic CI Mode

Use this for CI or strict local gates where deterministic failure behavior is required.

```bash
export CI=1
npx -y react-doctor@latest --full --yes --fail-on warning --no-color
```

Use `--fail-on error` for a softer gate.

## Completion Criteria
- React Doctor score did not regress from baseline.
- Error diagnostics addressed first.
- Warnings fixed or explicitly deferred with reason.
- Validation commands pass for the intended workflow.
- In working-tree mode: no commit, no push.
