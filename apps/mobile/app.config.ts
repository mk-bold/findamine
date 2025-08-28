declare const process: { env: { [key: string]: string | undefined } };

// why: allow setting EXPO_PUBLIC_API_BASE to force a specific API URL
export default {
  expo: {
    name: 'Findamine',
    slug: 'findamine',
    scheme: 'findamine',
    version: '1.0.0',
    sdkVersion: '53.0.0',
    platforms: ['ios', 'android', 'web'],
    ios: {
      bundleIdentifier: 'com.findamine.app'
    },
    android: {
      package: 'com.findamine.app'
    },
    web: { 
      bundler: 'webpack',
      favicon: './assets/favicon.png'
    },
    extra: {
      apiBase: process.env.EXPO_PUBLIC_API_BASE ?? null,
    },
  },
};