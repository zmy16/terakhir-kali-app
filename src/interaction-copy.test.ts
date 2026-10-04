import assert from 'node:assert/strict';
import test from 'node:test';
import { resetCopy } from './interaction-copy';

test('names reset action so it cannot be confused with elapsed status', () => {
  assert.deepEqual(resetCopy('Telepon Ibu'), {
    confirmTitle: 'Catat dilakukan hari ini?',
    confirmBody: 'Telepon Ibu akan dicatat dilakukan hari ini.',
    confirmAction: 'Ya, lakukan hari ini',
    success: 'Telepon Ibu dicatat dilakukan hari ini.',
    resetAction: 'Tandai hari ini',
  });
});
