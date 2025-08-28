// why: pick the right API base depending on platform & dev server context
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function inferLanHost(): string | null {
  // Try multiple places Expo may expose the host when running via dev server
  const expoCfg: any = (Constants as any)?.expoConfig ?? {};
  const hostUri: string | undefined = expoCfg.hostUri ?? expoCfg.host ?? undefined;
  // Legacy fallbacks some SDKs expose under Constants
  const legacy = (Constants as any)?.manifest2?.extra?.expoClient?.hostUri
    || (Constants as any)?.manifest?.debuggerHost;
  const raw = hostUri || legacy;
  if (!raw) return null;
  // raw examples: "192.168.1.23:8081" or "192.168.1.23:19000"
  const host = String(raw).split(':')[0];
  return host && host !== 'localhost' ? host : null;
}

const envOverride = (Constants as any)?.expoConfig?.extra?.apiBase as string | null;

export const API_BASE = (() => {
  if (envOverride) return envOverride;
  if (Platform.OS === 'web') return 'http://localhost:4000';
  const host = inferLanHost();
  return host ? `http://${host}:4000` : 'http://localhost:4000';
})();