# Environment-Configured Provider

## Overview

`pi-provider` is a pi harness extension that registers exactly one model provider from environment variables, so a provider MAY be added on the fly without editing `models.json`. The extension MUST be safe to load unconditionally — for example from a globally configured extension path — which means an incomplete environment MUST produce a silent no-op rather than an error.

## Background

pi discovers providers through `models.json`. Editing that file is fine for a stable set of providers, but it is awkward for short-lived or per-process providers: an endpoint that only exists for one session, a locally hosted model, a provider under evaluation. This spec covers the extension that closes that gap by reading a provider definition out of the process environment instead.

The extension is currently unimplemented on `main`. Change [0001-env-provider-extension](../../changes/0001-env-provider-extension.md) implements it.

## Requirements

### Conditional Registration

- The extension MUST register exactly one provider when both `PI_PROVIDER_ID` and `PI_PROVIDER_BASE_URL` are set.
- The extension MUST register nothing when either is unset.
- The extension MUST NOT throw when either is unset.

#### Scenario: Both required variables are set

- **GIVEN** `PI_PROVIDER_ID` and `PI_PROVIDER_BASE_URL` are both set
- **WHEN** pi loads the extension
- **THEN** one provider is registered under the configured id

#### Scenario: A required variable is missing

- **GIVEN** `PI_PROVIDER_BASE_URL` is unset
- **WHEN** pi loads the extension
- **THEN** no provider is registered and no error is raised

### Environment Configuration Contract

The environment variables below are the extension's entire public interface. The extension MUST accept them as described and MUST NOT require any other configuration.

| Variable | Required | Description |
| --- | --- | --- |
| `PI_PROVIDER_ID` | yes | Provider id, e.g. `my-provider`. |
| `PI_PROVIDER_BASE_URL` | yes | Base URL, e.g. `https://my-provider.example.com/v1`. |
| `PI_PROVIDER_NAME` | no | Display name. Defaults to the value of `PI_PROVIDER_ID`. |
| `PI_PROVIDER_API` | no | API driver id. Defaults to `openai-completions`; any string pi's `Api` type accepts is passed through as-is. |
| `PI_PROVIDER_API_KEY` | no | Literal key, or pi's own `$ENV_VAR` / `${ENV_VAR}` interpolation syntax (that interpolation is pi's feature, not this extension's). |
| `PI_PROVIDER_AUTH_HEADER` | no | `1` or `true` (case-insensitive) to send `Authorization: Bearer <apiKey>`. |
| `PI_PROVIDER_HEADERS` | no | JSON object string of extra request headers. |
| `PI_PROVIDER_MODEL_IDS` | no | Comma-separated model ids, each expanded with the defaults below. |
| `PI_PROVIDER_MODELS` | no | JSON array string of full model definitions. Takes precedence over `PI_PROVIDER_MODEL_IDS` when both are set. |

#### Scenario: Display name falls back to the id

- **GIVEN** `PI_PROVIDER_ID=my-provider` and `PI_PROVIDER_NAME` is unset
- **WHEN** the provider is registered
- **THEN** its display name is `my-provider`

#### Scenario: Bearer authentication is opted into

- **GIVEN** `PI_PROVIDER_API_KEY` is set and `PI_PROVIDER_AUTH_HEADER=TRUE`
- **WHEN** a request is made to the provider
- **THEN** it carries `Authorization: Bearer <apiKey>`

### Model List Resolution

- `PI_PROVIDER_MODELS` MUST take precedence over `PI_PROVIDER_MODEL_IDS` when both are set.
- Each object in `PI_PROVIDER_MODELS` MUST supply at minimum `id`, `name`, `reasoning`, `input`, `cost`, `contextWindow`, and `maxTokens`, per pi's `ProviderModelConfig`.

#### Scenario: Both model variables are set

- **GIVEN** `PI_PROVIDER_MODELS` and `PI_PROVIDER_MODEL_IDS` are both set
- **WHEN** the provider is registered
- **THEN** its model list comes from `PI_PROVIDER_MODELS` and `PI_PROVIDER_MODEL_IDS` is ignored

### Model Default Expansion

pi's `ProviderModelConfig` requires more than an id, so a bare `{ id }` object is not valid. Every id listed in `PI_PROVIDER_MODEL_IDS` MUST therefore be expanded to:

```json
{
  "id": "<id>",
  "name": "<id>",
  "reasoning": false,
  "input": ["text"],
  "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
  "contextWindow": 128000,
  "maxTokens": 8192
}
```

These values are placeholders. `PI_PROVIDER_MODELS` SHOULD be used instead whenever accurate cost, context window, or reasoning metadata matters.

#### Scenario: An id list is expanded

- **GIVEN** `PI_PROVIDER_MODEL_IDS=my-model-id` and `PI_PROVIDER_MODELS` is unset
- **WHEN** the provider is registered
- **THEN** it exposes one model whose id and name are both `my-model-id` and whose remaining fields are the placeholder defaults above

## Design

### Architecture

The extension resolves its configuration from the process environment at load time and makes exactly one provider registration call. It holds no state beyond that call and performs no I/O of its own — every request to the configured endpoint is issued by pi's own API driver.

### Packaging

The package is published as `pi-provider` on the public npm registry. There is no build step: pi loads extension `.ts` files directly at runtime through its jiti-based loader, so the package ships `index.ts` as-is and has no `dist/`.

### Usage

```sh
pi install npm:pi-provider

PI_PROVIDER_ID=my-provider \
PI_PROVIDER_BASE_URL=https://my-provider.example.com/v1 \
PI_PROVIDER_API_KEY=$MY_PROVIDER_API_KEY \
PI_PROVIDER_MODEL_IDS=my-model-id \
  pi --provider my-provider --model my-model-id
```

Locally, before publishing:

```sh
pi --extension ./index.ts --provider my-provider --model my-model-id
```

## Constraints

The following are explicitly out of scope for this system, not merely unimplemented:

- OAuth is NOT supported.
- A custom `streamSimple` is NOT provided.
- `refreshModels` is NOT provided.
- Multi-provider registration is NOT supported — the environment variables describe exactly one provider per process.

## Open Questions

- [ ] The project has no documented testing conventions and no test framework. Should the extension carry an automated test suite, or does typecheck-only CI remain the intended gate? — current default: typecheck only.

## References

- Change: [0001-env-provider-extension](../../changes/0001-env-provider-extension.md)

## Changelog

| Date | Change | Document |
|------|--------|----------|
| 2026-09-01 | Initial spec created from the free-form `docs/spec.md` | [0001-env-provider-extension](../../changes/0001-env-provider-extension.md) |
