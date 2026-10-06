import type { Activity } from './activity';
import { decodeActivities } from './storage-codec';

export type Backup = {
  version: 1;
  exportedAt: string;
  profileName: string;
  activities: Activity[];
};

export function createBackup(profileName: string, activities: Activity[], exportedAt = new Date().toISOString()): string {
  return JSON.stringify({ version: 1, exportedAt, profileName: profileName.trim(), activities } satisfies Backup);
}

export function backupFilename(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `terakhir-kali-backup-${date}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
}

export function readBackup(raw: string): Backup {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('File backup tidak dapat dibaca.'); }
  if (!value || typeof value !== 'object') throw new Error('File backup tidak valid.');
  const record = value as Partial<Backup>;
  if (record.version !== 1 || typeof record.exportedAt !== 'string' || typeof record.profileName !== 'string' || !Array.isArray(record.activities)) {
    throw new Error('File backup tidak valid.');
  }

  try { decodeActivities(JSON.stringify({ version: 1, activities: record.activities })); }
  catch { throw new Error('File backup tidak valid.'); }

  return { version: 1, exportedAt: record.exportedAt, profileName: record.profileName.trim(), activities: record.activities };
}

export function mergeActivities(current: Activity[], incoming: Activity[]) {
  const merged = new Map(current.map((activity) => [activity.id, activity]));
  let added = 0;
  let updated = 0;

  for (const item of incoming) {
    const existing = merged.get(item.id);
    if (!existing) { merged.set(item.id, item); added += 1; continue; }
    if (item.updatedAt > existing.updatedAt) { merged.set(item.id, item); updated += 1; }
  }

  return { activities: [...merged.values()], added, updated };
}
