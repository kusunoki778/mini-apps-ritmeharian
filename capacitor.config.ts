import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.nadi.app',
  appName: 'Nadi',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
