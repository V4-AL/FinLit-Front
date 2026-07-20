import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  hasOnboarded: 'finlit:hasOnboarded',
  currentUser: 'finlit:currentUser',
  progress: 'finlit:progress',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort persistence; a failed write shouldn't crash the app.
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
