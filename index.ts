import type { ExtensionAPI, ProviderConfig, ProviderModelConfig } from "@earendil-works/pi-coding-agent";

function parseJsonEnv<T>(name: string): T | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`${name} is not valid JSON: ${error instanceof Error ? error.message : error}`);
  }
}

function parseBoolEnv(name: string): boolean | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  return raw === "1" || raw.toLowerCase() === "true";
}

function defaultModel(id: string): ProviderModelConfig {
  return {
    id,
    name: id,
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 8192,
  };
}

export default function (pi: ExtensionAPI) {
  const id = process.env.PI_PROVIDER_ID;
  const baseUrl = process.env.PI_PROVIDER_BASE_URL;
  if (!id || !baseUrl) return;

  const modelIds = process.env.PI_PROVIDER_MODEL_IDS?.split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  pi.registerProvider(id, {
    name: process.env.PI_PROVIDER_NAME ?? id,
    baseUrl,
    api: (process.env.PI_PROVIDER_API ?? "openai-completions") as ProviderConfig["api"],
    apiKey: process.env.PI_PROVIDER_API_KEY,
    authHeader: parseBoolEnv("PI_PROVIDER_AUTH_HEADER"),
    headers: parseJsonEnv<Record<string, string>>("PI_PROVIDER_HEADERS"),
    models: parseJsonEnv<ProviderModelConfig[]>("PI_PROVIDER_MODELS") ?? modelIds?.map(defaultModel),
  });
}
