import Storage from 'expo-sqlite/kv-store';

import type { Activity } from './activity';
import { decodeActivities, encodeActivities } from './storage-codec';

const STORAGE_KEY = 'terakhir-kali.activities.v1';

export async function loadActivities(): Promise<Activity[]> {
  const raw = await Storage.getItem(STORAGE_KEY);
  return raw ? decodeActivities(raw) : [];
}

export async function saveActivities(activities: Activity[]): Promise<void> {
  await Storage.setItem(STORAGE_KEY, encodeActivities(activities));
}

export async function clearActivities(): Promise<void> {
  await Storage.removeItem(STORAGE_KEY);
}
