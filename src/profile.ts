import Storage from 'expo-sqlite/kv-store';

const PROFILE_KEY = 'terakhir-kali.profile-name.v1';

export async function loadProfileName(): Promise<string> {
  return (await Storage.getItem(PROFILE_KEY))?.trim() ?? '';
}

export async function saveProfileName(name: string): Promise<void> {
  await Storage.setItem(PROFILE_KEY, name.trim());
}
