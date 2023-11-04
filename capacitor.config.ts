import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    SplashScreen: {
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  },
  appId: 'io.ionic.starter',
  appName: 'QR Creador',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
