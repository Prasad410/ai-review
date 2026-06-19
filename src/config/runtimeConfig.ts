import type { AppConfig, RuntimeConfigFile } from './types';

const DEFAULTS: AppConfig = {
  apiBaseUrl: 'https://aireview.com',
  apiRankPath: '/v1/rank',
  useMockApi: false,
};

let cachedConfig: AppConfig | null = null;

function fromEnv(): Partial<AppConfig> {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || undefined,
    apiRankPath: import.meta.env.VITE_API_RANK_PATH || undefined,
    useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true' || undefined,
  };
}

function mergeConfig(
  base: AppConfig,
  overrides: Partial<AppConfig>
): AppConfig {
  return {
    apiBaseUrl: overrides.apiBaseUrl?.replace(/\/$/, '') || base.apiBaseUrl,
    apiRankPath: overrides.apiRankPath || base.apiRankPath,
    useMockApi: overrides.useMockApi ?? base.useMockApi,
  };
}

async function loadRuntimeFile(): Promise<Partial<AppConfig>> {
  try {
    const response = await fetch('/config.json', { cache: 'no-store' });
    if (!response.ok) return {};

    const file = (await response.json()) as RuntimeConfigFile;
    return {
      apiBaseUrl: file.apiBaseUrl,
      apiRankPath: file.apiRankPath,
      useMockApi: file.useMockApi,
    };
  } catch {
    return {};
  }
}

export async function initConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig;

  const runtime = await loadRuntimeFile();
  const env = fromEnv();

  cachedConfig = mergeConfig(DEFAULTS, { ...env, ...runtime });
  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = mergeConfig(DEFAULTS, fromEnv());
  }
  return cachedConfig;
}

export function getRankEndpoint(): string {
  const { apiBaseUrl, apiRankPath } = getConfig();
  return `${apiBaseUrl}${apiRankPath}`;
}
