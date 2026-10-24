/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Pesos spent building the site so far, shown in the footer
  readonly VITE_BUILD_COST?: string;
  // Facebook app ID added to pages as fb:app_id
  readonly VITE_FACEBOOK_APP_ID?: string;
}
