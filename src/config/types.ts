export interface AppConfig {
  apiBaseUrl: string;
  apiRankPath: string;
  useMockApi: boolean;
}

export interface RuntimeConfigFile {
  apiBaseUrl?: string;
  apiRankPath?: string;
  useMockApi?: boolean;
}
