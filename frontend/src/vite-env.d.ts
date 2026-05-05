/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_BUILDING_ID?: string;
  readonly VITE_OPERATOR_TOKEN?: string;
  readonly VITE_OPERATOR_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
