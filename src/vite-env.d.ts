/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAJAONGKIR_API_KEY: string;
  readonly VITE_PB_URL: string;
  readonly VITE_ORIGIN_CITY_ID: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
