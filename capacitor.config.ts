import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.talentgraph.app',
  appName: 'TalentGraph',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
