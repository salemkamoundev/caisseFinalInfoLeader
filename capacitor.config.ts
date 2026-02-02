import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'infoleader.caisse',
  appName: 'IonicCaisse',
  webDir: 'www',
  server: {
    // 👇 TRÈS IMPORTANT pour le Live Reload
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
