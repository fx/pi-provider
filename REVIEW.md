# PR Review

## Task Cross-Reference

Cross-reference every PR against task lists in `docs/changes/` and `docs/tasks.md`. If the PR completes work tracked in those files, the task checkboxes MUST be updated in this same PR. Request changes if missing.

## PR Review Checklist (CRITICAL)

- `package-manager-cache` IS a real, valid input on `actions/setup-node@v7` (`Set to false to disable automatic caching...`, default `true`) — do not flag it as unsupported or as a typo for `cache`. This repo sets it to `false` deliberately.
