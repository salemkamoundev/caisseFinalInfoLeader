import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'infoleader.caisse',
  appName: 'IonicCaisse',
  webDir: 'www',
  server: {
    // ⚠️ Mettez VOTRE IP locale ici (ex: 192.168.1.15)
    url: 'http://192.168.1.24:8100', 
    cleartext: true
  }
};

export default config;
