
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0ed00db3d6ae4eb29d5d7b10a5633d12',
  appName: 'spot-seeker-locale-vibes',
  webDir: 'dist',
  server: {
    url: 'https://0ed00db3-d6ae-4eb2-9d5d-7b10a5633d12.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      spinnerColor: "#0ea5e9"
    }
  }
};

export default config;
