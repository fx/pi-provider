# pi-provider

A [pi](https://github.com/earendil-works/pi) harness extension that registers exactly one
model provider from environment variables, so a provider can be added on the fly without
editing `models.json`. If `PI_PROVIDER_ID` or `PI_PROVIDER_BASE_URL` is unset the extension
does nothing and throws nothing, which makes it safe to load unconditionally — for example
from a globally configured extension path.

## Install

```sh
pi install npm:pi-provider
```

## Usage

```sh
PI_PROVIDER_ID=my-provider \
PI_PROVIDER_BASE_URL=https://my-provider.example.com/v1 \
PI_PROVIDER_API_KEY=$MY_PROVIDER_API_KEY \
PI_PROVIDER_MODEL_IDS=my-model-id \
  pi --provider my-provider --model my-model-id
```

Or, without installing, straight from a checkout:

```sh
pi --extension ./index.ts --provider my-provider --model my-model-id
```

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
| `PI_PROVIDER_MODEL_IDS` | no | Comma-separated model ids, each expanded with placeholder defaults. |
| `PI_PROVIDER_MODELS` | no | JSON array string of full model definitions. Takes precedence over `PI_PROVIDER_MODEL_IDS` when both are set. |

Ids given via `PI_PROVIDER_MODEL_IDS` are expanded with placeholder cost, context window,
and reasoning metadata — see [`docs/specs/env-provider/index.md`](docs/specs/env-provider/index.md) for the exact defaults. Use
`PI_PROVIDER_MODELS` when that metadata needs to be accurate.

## License

MIT
