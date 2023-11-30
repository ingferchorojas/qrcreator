import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    SplashScreen: {
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen"
    }
  },
  appId: 'com.frojasapps.generadorqr',
  appName: 'Generador y Escáner QR',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
