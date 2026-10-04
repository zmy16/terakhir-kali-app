# Terakhir Kali

## Product

Expo + React Native mobile app. Track meaningful activities and display time since last done. Product intent: `document/overview.md`. Approved behavior: `document/SPEC.md`. Delivery plan: `document/PLAN.md`.

Core promise: calm awareness. No streaks, goals, alarms, notifications, rankings, accounts, cloud sync, ads, or analytics in MVP.

## Commands

```bash
npm start
npm run android
npm run ios
npm run test
npm run typecheck
npx expo-doctor
```

Use `npx expo install <package>` for any Expo-native dependency. Expo SDK is `57`; fetch matching current Expo docs before using SDK APIs.

## Design

Read before UI work:

- `design/design.md`
- `design/ADAPTATION.md`
- `design/index-1.html`
- `design/index-2.html`
- `design/index-3.html`

Implement dark and light themes. Apply anti-slop during planning and build. Use calm editorial forest surfaces, coral only for primary actions and selected state, serif only for reflective headings, and one-column activity list. Do not port fitness content, avatar/profile UI, tabs, stats, charts, photos, mascots, or decorative emoji.

## Data contract

```ts
type Activity = {
  id: string;
  title: string;
  lastDoneAt: string; // local calendar date, YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
```

- Calendar dates, never elapsed 24-hour timestamps.
- Today reads `Baru saja`, never `0 hari`.
- Future dates invalid.
- Same titles allowed.
- Sort oldest `lastDoneAt` first. Tie: oldest `updatedAt`, then `id`.
- Keep raw corrupted storage. Retry first. Clear only after explicit consent.

## Build rules

- Mobile first. Native controls, 44px targets, accessibility labels, readable font scaling.
- Every data UI needs loading, empty, and error states.
- Every interactive control needs real behavior. Sheets/dialogs close with explicit cancel and Android back behavior where platform provides it.
- Use Expo SQLite key-value storage for this small local payload. Validate parsed persisted data before use.
- Test domain and persistence helpers first. Run tests and typecheck before completion.
- Keep non-route code in `src/`. Do not add navigation until a second screen needs it.
- Update this file when setup commands or architecture change.

## Documents

- `document/overview.md`: owner-owned product intent.
- `document/SPEC.md`: approved acceptance criteria.
- `document/PLAN.md`: implementation phases.
- `design/ADAPTATION.md`: approved visual translation.
