# pi-provider spec

## Purpose

A pi harness extension that registers exactly one model provider from environment
variables, so a provider can be added on the fly without editing `models.json`.
If `PI_PROVIDER_ID` or `PI_PROVIDER_BASE_URL` is unset the extension does nothing
and throws nothing, which makes it safe to load unconditionally — for example
from a globally configured extension path.

## Environment variables

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

Each object in `PI_PROVIDER_MODELS` needs at minimum `id`, `name`, `reasoning`,
`input`, `cost`, `contextWindow`, and `maxTokens`, per pi's `ProviderModelConfig`.

## Model defaults

pi's `ProviderModelConfig` requires more than an id, so a bare `{ id }` object is
not valid. Every id listed in `PI_PROVIDER_MODEL_IDS` is therefore expanded to:

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

These are placeholders. Use `PI_PROVIDER_MODELS` when accurate cost, context
window, or reasoning metadata matters.

## Package

Published as `pi-provider` on the public npm registry. There is no build step:
pi loads extension `.ts` files directly at runtime through its jiti-based loader,
so the package ships `index.ts` as-is and has no `dist/`.

## Usage

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

## Non-goals

- No OAuth support.
- No custom `streamSimple`.
- No `refreshModels`.
- No multi-provider registration — the env vars describe exactly one provider per process.
