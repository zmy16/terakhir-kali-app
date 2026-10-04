import type { Activity } from './activity';

type PersistedActivities = {
  version: 1;
  activities: Activity[];
};

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  return typeof record.id === 'string'
    && record.id.length > 0
    && typeof record.title === 'string'
    && record.title.trim().length > 0
    && isCalendarDate(record.lastDoneAt)
    && isIsoTimestamp(record.createdAt)
    && isIsoTimestamp(record.updatedAt);
}

export function decodeActivities(raw: string): Activity[] {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('Data tersimpan tidak dapat dibaca.');
  }

  if (!payload || typeof payload !== 'object') throw new Error('Data tersimpan tidak valid.');
  const record = payload as Partial<PersistedActivities>;

  if (record.version !== 1 || !Array.isArray(record.activities) || !record.activities.every(isActivity)) {
    throw new Error('Data tersimpan tidak valid.');
  }

  return record.activities;
}

export function encodeActivities(activities: Activity[]): string {
  return JSON.stringify({ version: 1, activities } satisfies PersistedActivities);
}
