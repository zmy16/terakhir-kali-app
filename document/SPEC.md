# Product Spec: Terakhir Kali

## 1. Product statement

Terakhir Kali helps people notice how long it has been since meaningful activities in their lives last happened.

It presents facts without pressure. User decides what matters and when to do it again.

## 2. Target user

Primary:

- Busy people who forget to contact family or friends.
- People living away from parents or hometown.
- Anyone wanting gentle awareness of meaningful, non-scheduled activities.

## 3. Product principles

- Calm, not urgent.
- Personal, not prescriptive.
- Local and private by default.
- Fast enough to update in one tap.
- Honest about time and storage errors.

## 4. MVP user stories

### Activity list

As a user, I can see every tracked activity and how long ago I last did it.

Acceptance criteria:

- List opens from local data.
- Each row shows activity title and human-readable elapsed time.
- Entries sort longest elapsed first.
- Empty state explains first action and offers one working action to add activity.
- Loading state appears while local data is read.
- Storage error state explains problem and offers retry.

### Create activity

As a user, I can add an activity with last-done date.

Acceptance criteria:

- Title required after trimming whitespace.
- Title length cap: 80 characters.
- Last-done date prefilled with current local calendar date. User may change it.
- Last-done date required.
- Future date rejected with clear Indonesian message.
- Valid record saves locally and appears in correct sorted position.
- Creation cancellation saves nothing.

### Update activity

As a user, I can change activity title or last-done date.

Acceptance criteria:

- Existing values prefill form.
- Same validation as creation.
- Save updates local record and re-sorts list.
- Cancel keeps old data.

### Reset activity

As a user, I can tap `Baru saja!` after doing activity again.

Acceptance criteria:

- Tapping action first opens a confirmation that names activity.
- Confirm sets `lastDoneAt` to current local calendar date.
- List re-sorts immediately.
- Feedback confirms reset without shame-oriented wording and provides one undo action.
- Undo restores exact previous `lastDoneAt` once.

### Delete activity

As a user, I can remove an activity I no longer need.

Acceptance criteria:

- Destructive confirmation names activity.
- Confirm removes local record.
- Cancel preserves local record.
- List shows empty state when last record is removed.
- No undo in MVP. Confirmation protects against accidental deletion without retaining deleted personal data in temporary state.

### Persistence

As a user, my activities remain after closing and reopening app.

Acceptance criteria:

- App restores valid local records after restart.
- Corrupt or incomplete stored records do not crash app.
- Preserve raw local payload. Show storage error with retry.
- Clearing corrupted local data requires explicit user confirmation and warns that recovery may not be possible.

## 5. Time-display contract

Source date is a local calendar date, `YYYY-MM-DD`.

| Difference from today | Display |
| --- | --- |
| 0 days | `Baru saja` |
| 1 day | `1 hari` |
| 2-30 days | `N hari` |
| 31-59 days | `1 bulan` |
| 60-364 days | `N bulan` |
| 365+ days | `N tahun` |

Approved rule: use calendar-aware units. Compare local calendar dates, then show complete calendar years, else complete calendar months, else days. This avoids calling one calendar month `30 hari`.

## 6. Draft navigation

One main list screen.

Supported screens or surfaces:

- List.
- Add activity form.
- Edit activity form.
- Delete confirmation.
- Loading, empty, and storage-error states.

No extra tabs, settings, profile, or dead navigation in MVP.

## 7. Data model

```ts
type Activity = {
  id: string;
  title: string;
  lastDoneAt: string;
  createdAt: string;
  updatedAt: string;
};
```

Storage requirements:

- Local device persistence.
- Single app-owned storage key or native local database, chosen during technical setup.
- Version stored with persisted payload if migration becomes needed.

## 8. Non-functional requirements

- Offline-first. Core usage works without network.
- No account or collected personal profile data.
- Accessible labels and touch targets.
- Indonesian-first UI copy.
- Responsive across common phone sizes.
- Fast startup with a small local dataset.

## 9. Explicit non-goals

- Notifications and reminders.
- Streaks, scores, goals, due dates, or guilt mechanics.
- Calendar scheduling.
- Cloud sync and cross-device login. Deferred until account provider and privacy model are approved.
- Local profile plus manual export/import backup are included. These do not recover data after app deletion unless user exported a backup file first.
- Analytics, ads, subscriptions.

## 10. Approved decisions

1. App name: `Terakhir Kali`.
2. Time wording: calendar-aware complete years, then months, then days.
3. Reset: confirmation first, then one undo action.
4. Delete: confirmation only, no undo in MVP.
5. Local storage failure: preserve raw payload, retry first, clear only after explicit consent.
6. Visual direction: use `design/design.md` and `design/index-1.html` through `design/index-3.html` as references. Build dark theme plus a fully working light theme.
7. Anti-slop: apply during planning and build.
8. App mark: non-letter, green nested open circles representing passing time and a remembered moment. Use as in-app loading mark, splash mark, and app icon.
9. Date entry: use platform-native date picker. No manual date text input.
10. Reset label: status remains `Baru saja`; action becomes `Catat dilakukan hari ini` to distinguish current state from user action.
11. Feedback: show themed in-app confirmation and notice surfaces for reset and delete, not system-default dialogs.

## 11. Local profile and backup

- Local profile stores a display name only. It is not login, does not use a password, and cannot recover deleted app data.
- Export creates a versioned JSON backup file through system share sheet.
- Import reads a JSON backup and merges records. Existing IDs keep newest `updatedAt`; current data is never cleared by import.
- User must store exported backup in a safe place. Deleting app clears local data and local profile.

## 12. Deferred account sync

Cross-device login and automatic backup are feasible, but are not part of local-only MVP until owner approves identity provider and cloud data policy. Recommended first version: Supabase email magic link, private per-user records, Row Level Security, and local-first sync. Do not add credentials or network calls before a Supabase project exists.

## 13. Visual adaptation

Implementation follows `design/ADAPTATION.md`, derived from owner-provided `design/design.md` and HTML references. It preserves the editorial dark visual language while adding a separately designed, fully working light theme.
