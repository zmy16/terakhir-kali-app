export type Activity = {
  id: string;
  title: string;
  lastDoneAt: string;
  createdAt: string;
  updatedAt: string;
  reminderAt?: string;
  notificationId?: string;
};

export type ActivityInputErrors = Partial<Record<'title' | 'lastDoneAt' | 'reminderAt', string>>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseLocalDate(value: string): Date | null {
  if (!datePattern.test(value)) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function calendarDaysBetween(start: Date, end: Date): number {
  return Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86_400_000);
}

function completeMonthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

export function validateActivityInput(title: string, lastDoneAt: string, today: string, reminderAt?: string, now = new Date()): ActivityInputErrors {
  const errors: ActivityInputErrors = {}; 
  const date = parseLocalDate(lastDoneAt);
  const currentDate = parseLocalDate(today);

  if (!title.trim()) errors.title = 'Judul kegiatan wajib diisi.';
  else if (title.trim().length > 80) errors.title = 'Judul kegiatan maksimal 80 karakter.';
  if (!date) errors.lastDoneAt = 'Tanggal tidak valid.';
  else if (currentDate && date > currentDate) errors.lastDoneAt = 'Tanggal tidak boleh melewati hari ini.';
  if (reminderAt && (Number.isNaN(Date.parse(reminderAt)) || new Date(reminderAt) <= now)) {
    errors.reminderAt = 'Waktu pengingat harus setelah sekarang.';
  }

  return errors;
}

export function formatElapsed(lastDoneAt: string, today: string): string {
  const start = parseLocalDate(lastDoneAt);
  const end = parseLocalDate(today);
  if (!start || !end || start > end) return 'Tanggal tidak valid';

  const days = calendarDaysBetween(start, end);
  if (days === 0) return 'Baru saja';

  const months = completeMonthsBetween(start, end);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return `${years} tahun`;
  }
  if (months >= 1) return `${months} bulan`;
  return `${days} hari`;
}

export function sortActivitiesByElapsed(activities: Activity[], today: string): Activity[] {
  return [...activities].sort((left, right) => {
    const leftDate = parseLocalDate(left.lastDoneAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightDate = parseLocalDate(right.lastDoneAt)?.getTime() ?? Number.POSITIVE_INFINITY;

    if (leftDate !== rightDate) return leftDate - rightDate;
    if (left.updatedAt !== right.updatedAt) return left.updatedAt.localeCompare(right.updatedAt);
    return left.id.localeCompare(right.id);
  });
}

export function localCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
