/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAND_NAME?: string;
  readonly VITE_BRAND_SLUG?: string;
  readonly VITE_KEY_PREFIX?: string;
  readonly VITE_ACCENT_COLOR?: string;
  readonly VITE_DISCORD_URL?: string;
  readonly VITE_WHATSAPP_URL?: string;
  readonly VITE_TELEGRAM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
