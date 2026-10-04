import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatElapsed,
  sortActivitiesByElapsed,
  validateActivityInput,
  type Activity,
} from './activity';

const today = '2026-10-03';

function activity(id: string, lastDoneAt: string, updatedAt = '2026-01-01T00:00:00.000Z'): Activity {
  return {
    id,
    title: id,
    lastDoneAt,
    createdAt: updatedAt,
    updatedAt,
  };
}

test('formats today as Baru saja', () => {
  assert.equal(formatElapsed('2026-10-03', today), 'Baru saja');
});

test('formats complete calendar month before days', () => {
  assert.equal(formatElapsed('2026-09-03', today), '1 bulan');
  assert.equal(formatElapsed('2026-09-04', today), '29 hari');
});

test('formats complete calendar year before months', () => {
  assert.equal(formatElapsed('2025-10-03', today), '1 tahun');
  assert.equal(formatElapsed('2025-10-04', today), '11 bulan');
});

test('rejects blank title and future date', () => {
  assert.deepEqual(validateActivityInput('   ', '2026-10-04', today), {
    title: 'Judul kegiatan wajib diisi.',
    lastDoneAt: 'Tanggal tidak boleh melewati hari ini.',
  });
});

test('rejects title longer than 80 characters', () => {
  assert.equal(validateActivityInput('x'.repeat(81), today, today).title, 'Judul kegiatan maksimal 80 karakter.');
});

test('sorts oldest activity first, then oldest update', () => {
  const sorted = sortActivitiesByElapsed(
    [
      activity('newer-update', '2026-01-03', '2026-02-01T00:00:00.000Z'),
      activity('oldest', '2025-10-03'),
      activity('older-update', '2026-01-03', '2026-01-01T00:00:00.000Z'),
    ],
    today,
  );

  assert.deepEqual(sorted.map(({ id }) => id), ['oldest', 'older-update', 'newer-update']);
});
