import type { CapacitorConfig } from '@capacitor/cli';

// App iOS do Vonai: WebView apontando para o site em producao.
// O codigo web detecta window.Capacitor e usa o SDK nativo do RevenueCat
// (via VonaiNative) para a assinatura pela Apple.
const config: CapacitorConfig = {
  appId: 'com.vonai.app',
  appName: 'Vonai',
  webDir: 'www',
  server: {
    url: 'https://speakup-dusky.vercel.app',
    allowNavigation: ['speakup-dusky.vercel.app', 'vonai.com.br', 'www.vonai.com.br', '*.supabase.co'],
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#2E72D6',
  },
};

export default config;
