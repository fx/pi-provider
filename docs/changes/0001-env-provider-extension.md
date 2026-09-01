# 0001: Environment-Configured Provider Extension

## Summary

Implements the environment-configured provider extension and the packaging and release automation needed to ship it as `pi-provider` on the public npm registry. This is the first change in the repository; `main` currently contains documentation only.

**Spec:** [Environment-Configured Provider](../specs/env-provider/)
**Status:** draft
**Depends On:** —

## Motivation

The repository has a specified provider extension and no implementation of it. Nothing on `main` reads `PI_PROVIDER_*`, and there is no package manifest, so the extension cannot be installed by the `pi install npm:pi-provider` flow the spec documents. This change closes the whole gap: the extension itself, plus the publishing path that makes it reachable.

## Requirements

### Testing Requirements

**This project has no documented testing conventions.** There is no test framework, no coverage configuration, and no quality-gate document to reference — this is a known gap, tracked below as an open question. Until the project codifies its rules, this change MUST satisfy the following minimal baseline:

- CI MUST run on pull requests and on pushes to `main`.
- A type check MUST pass over the whole package and MUST block merge on failure.
- Behavior the spec describes MUST be exercised before the PR is marked ready — by an automated test where one exists, otherwise by a manual run recorded in the PR description.
- The release job MUST re-run the same gate against the released tag rather than trusting the pre-merge run.

Skipping or weakening any of these rules to land the PR MUST be treated as a bug in the PR, not in the rule.

### Functional requirements

The [Environment-Configured Provider spec](../specs/env-provider/) owns the registration behavior, the environment variable contract, model list resolution, the model default values, and its scenarios. Those scenarios are this change's acceptance criteria and are NOT restated here. What implementing them requires of this change:

- The package MUST publish as `pi-provider` with its entry point resolving to `index.ts`, because pi loads extension TypeScript at runtime and no compiled artifact is shipped.
- The published tarball MUST NOT contain a build output directory.
- Release automation MUST publish from a tag rather than from a maintainer's workstation, so that the published artifact corresponds to a reviewed commit.
- The repository's placeholder `README.md` MUST be replaced with install and usage documentation that points at the spec for the model default values.
- The free-form `docs/spec.md` this change document supersedes MUST NOT survive alongside the spec — a second copy of the same contract will drift.

#### Scenario: The published tarball carries no build output

- **GIVEN** the package manifest and its `files` list
- **WHEN** the package contents are inspected before publishing
- **THEN** the tarball contains the extension source and its metadata files, and no build output directory

## Design

### Approach

A single-file extension at the package root, a manifest that ships that file verbatim, and two GitHub Actions workflows — one gating pull requests, one driving release and publish.

### Decisions

- **Decision**: Ship TypeScript source with no build step.
  - **Why**: pi loads extension `.ts` files at runtime through its own loader, so a compile step would produce an artifact nothing consumes.
  - **Alternatives considered**: Publishing a compiled `dist/` with the source as a secondary export — rejected as pure overhead for a single file.
- **Decision**: A missing required variable is a silent no-op rather than an error.
  - **Why**: The spec's central use case is loading the extension unconditionally from a global extension path, where most processes will have no provider configured. Throwing there would break every unrelated pi invocation.
  - **Alternatives considered**: Warning on stderr — rejected as noise on the common path.
- **Decision**: Type check is the only automated gate.
  - **Why**: The package is one file with no runtime dependencies of its own; a linter and test harness would be most of the repository's tooling surface for very little coverage.
  - **Alternatives considered**: Adding a test runner up front — deferred to the open question below rather than decided here.

### Non-Goals

- No test framework or coverage tooling is introduced by this change.
- No linter is introduced by this change.
- The out-of-scope behaviors listed in the spec's Constraints section are not revisited here.

## Tasks

- [ ] Implement and ship the extension
  - [ ] Add `index.ts` implementing the spec's registration behavior, configuration contract, model resolution, and default expansion
  - [ ] Add the package manifest publishing as `pi-provider` with the entry point and `files` list pointing at `index.ts`
  - [ ] Add TypeScript configuration and a type check script
  - [ ] Add the pull-request CI workflow running the type check
  - [ ] Add release and publish automation, publishing from the release tag
  - [ ] Add `LICENSE` and supporting repository metadata files
  - [ ] Replace the placeholder `README.md` with install and usage documentation linking to the spec
  - [ ] Verify the published tarball contents before release
  - [ ] Flip this document's status to `complete` and tick these tasks in the same PR

## Open Questions

- [ ] Should the extension carry an automated test suite, and should the project adopt a documented testing-conventions document? — options: keep typecheck-only CI (current default), or add a test runner and a conventions section this change document can reference instead of restating a baseline.

## References

- Spec: [Environment-Configured Provider](../specs/env-provider/)
