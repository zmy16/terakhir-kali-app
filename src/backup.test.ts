import assert from 'node:assert/strict';
import test from 'node:test';
import { createBackup, mergeActivities, readBackup } from './backup';
import type { Activity } from './activity';

const first: Activity = { id: 'call-mom', title: 'Telepon Ibu', lastDoneAt: '2026-09-01', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' };
const newer: Activity = { ...first, title: 'Telepon Mama', updatedAt: '2026-10-01T00:00:00.000Z' };

test('creates and reads a versioned backup', () => {
  const backup = readBackup(createBackup('Raid', [first], '2026-10-03T00:00:00.000Z'));
  assert.equal(backup.profileName, 'Raid');
  assert.deepEqual(backup.activities, [first]);
});

test('rejects an invalid backup', () => {
  assert.throws(() => readBackup('{"version":1}'), /File backup tidak valid/);
});

test('merges by ID and keeps newest record', () => {
  const result = mergeActivities([first], [newer]);
  assert.deepEqual(result.activities, [newer]);
  assert.equal(result.added, 0);
  assert.equal(result.updated, 1);
});
