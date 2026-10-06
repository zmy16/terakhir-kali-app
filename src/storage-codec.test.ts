import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeActivities, encodeActivities } from './storage-codec';

test('decodes valid persisted activities', () => {
  const activities = decodeActivities(
    JSON.stringify({
      version: 1,
      activities: [
        {
          id: 'call-mom',
          title: 'Telepon Ibu',
          lastDoneAt: '2026-09-01',
          createdAt: '2026-09-01T09:00:00.000Z',
          updatedAt: '2026-09-01T09:00:00.000Z',
        },
      ],
    }),
  );

  assert.equal(activities[0]?.title, 'Telepon Ibu');
  assert.equal(activities[0]?.reminderAt, undefined);
});

test('rejects corrupt persisted activities', () => {
  assert.throws(() => decodeActivities('{not json}'), /Data tersimpan tidak dapat dibaca/);
  assert.throws(() => decodeActivities(JSON.stringify({ version: 1, activities: [{}] })), /Data tersimpan tidak valid/);
});

test('encodes a versioned activity payload', () => {
  const activity = {
    id: 'call-mom', title: 'Telepon Ibu', lastDoneAt: '2026-09-01', createdAt: '2026-09-01T09:00:00.000Z', updatedAt: '2026-09-01T09:00:00.000Z',
    reminderAt: '2026-10-05T09:00:00.000Z', notificationId: 'notice-1',
  };
  assert.deepEqual(JSON.parse(encodeActivities([activity])), { version: 1, activities: [activity] });
});
