<div align="center">
  <img src="assets/logo-mark.svg" alt="Terakhir Kali logo" width="96" height="96">

# Terakhir Kali

Track the things that matter to you and see how long it has been since you last did them.

</div>

## About

**Terakhir Kali** ("the last time" in Indonesian) is a mobile app that shows how long it has been since you last called your mother, met an old friend, or visited the dentist. The list is sorted so the thing you have gone longest without doing is always on top.

The app is deliberately calm. It states a fact and leaves the decision to you.

- No streaks, goals, scores, or guilt mechanics
- No reminders or push notifications
- No accounts, cloud sync, ads, or analytics
- All data stays on the device

> [!NOTE]
> The UI copy and `document/overview.md` are in Indonesian. The code and this README are in English.

## Download

Get the latest APK from the [Releases page](https://github.com/zmy16/terakhir-kali-app/releases/latest) and install it on an Android device. You may need to allow installs from your browser or file manager under **Install unknown apps**. Each release lists a SHA-256 checksum so you can verify the file.

## Features

- **Longest-overdue first.** Activities are sorted by oldest `lastDoneAt`, then oldest `updatedAt`, then `id`.
- **Calendar-aware durations.** Dates are compared as local calendar dates, not 24-hour spans. Today reads `Baru saja`, otherwise complete years, then complete months, then days.
- **Create, edit, delete.** Titles are limited to 80 characters and future dates are rejected. Dates come from the native date picker.
- **Mark as done today.** Asks for confirmation, then offers a single undo.
- **Local profile.** A display name only, used for a time-of-day greeting. It is not a login.
- **Dark and light themes**, toggled from the settings sheet.
- **JSON backup.** Export through the system share sheet. Import merges records and never clears existing data.
- **Loading, empty, and storage-error states** for the list, plus a retry path if stored data cannot be read.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Expo](https://expo.dev) SDK 57, React Native 0.86, React 19.2 |
| Language | TypeScript 6 (`strict`) |
| Storage | `expo-sqlite` key-value store, with a versioned and validated JSON payload |
| Backup | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| Date input | `@react-native-community/datetimepicker` |
| Graphics | `react-native-svg` for the logo and inline icons |
| Layout | `react-native-safe-area-context` |
| Unit tests | Node's built-in test runner (`node:test`) run through `tsx` |
| Builds | [EAS Build](https://docs.expo.dev/build/introduction/) |

There is no navigation library, state manager, or UI kit. The app is a single screen with bottom sheets, so none were added.

## Getting started

Prerequisites: Node.js and npm (developed on Node 24), plus [Expo Go](https://expo.dev/go) on an Android device or an Android emulator.

```bash
npm install
npm start
```

Scan the QR code with Expo Go. If your phone and computer are on different networks, use a tunnel:

```bash
npm run start:tunnel
```

> [!TIP]
> If Expo Go shows `Cannot connect to Expo CLI`, a stale tunnel is usually still running. Stop whatever is using port `8081`, start again, and scan the new QR code.

### Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run start:tunnel` | Dev server through a tunnel |
| `npm run start:lan` | Dev server over the local network |
| `npm test` | Run unit tests |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

## Project structure

```text
App.tsx                  Main screen, bottom sheets, and UI components
index.ts                 App entry point
src/
  activity.ts            Durations, validation, and sorting
  storage.ts             Load and save activities (Expo SQLite key-value)
  storage-codec.ts       Encode and validate the stored payload
  profile.ts             Local profile name
  backup.ts              Backup format and merge logic
  backup-file.ts         Export and import through the file system
  interaction-copy.ts    Copy for the "mark as done today" action
  *.test.ts              Unit tests for the modules above
assets/                  Logo and app icons
design/                  Visual references and their adaptation notes
document/                Product overview, spec, and delivery plan
scripts/                 App icon generator
eas.json                 EAS Build profiles
```

Business logic lives in `src/` as plain functions with no React dependency, which keeps it testable under Node without a device.

## Data model

```ts
type Activity = {
  id: string;
  title: string;
  lastDoneAt: string; // local calendar date, YYYY-MM-DD
  createdAt: string;  // ISO timestamp
  updatedAt: string;  // ISO timestamp
};
```

Activities are stored under a single key with a version field. Stored data is validated when read. If the payload is corrupt, the app shows a storage error with a retry button.

### Backup format

```json
{
  "version": 1,
  "exportedAt": "2026-10-04T16:09:58.000Z",
  "profileName": "Raid",
  "activities": []
}
```

On import, records are merged by `id`. When the same `id` exists on both sides, the record with the newer `updatedAt` wins.

> [!IMPORTANT]
> Data lives only on the device. Uninstalling the app or switching phones deletes it. Export a backup first.

## Building an APK

APKs are built with EAS Build. The `preview` profile in `eas.json` produces an installable APK and increments `versionCode` automatically.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

The build runs on Expo's servers and ends with a download link. The Android package name is `com.raidm.terakhirkali`.

> [!NOTE]
> `owner` and `extra.eas.projectId` in `app.json` point to the original author's Expo account. To build under your own account, run `npx eas-cli@latest init` and update those values.

## Testing

```bash
npm test
npm run typecheck
```

The unit tests cover duration formatting, input validation, sort order, the backup format and merge rules, the storage codec, and the action copy. UI tests are run separately with Katalon Studio against the installed APK and are not part of this repository.

## Platform status

| Platform | Status |
| --- | --- |
| Android | Built as an APK and tested on a physical device |
| iOS | Configured in `app.json`, but not built or tested |

## Documentation

- [Product overview](document/overview.md)
- [Specification](document/SPEC.md)
- [Delivery plan](document/PLAN.md)
- [Design adaptation](design/ADAPTATION.md)
- [Notes for AI coding agents](AGENTS.md)
