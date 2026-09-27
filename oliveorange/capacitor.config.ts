import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oliveorange.stockmanagement',
  appName: 'OliveOrange Stock Management',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3D4A1E',
      showSpinner: false
    }
  }
};

export default config;
