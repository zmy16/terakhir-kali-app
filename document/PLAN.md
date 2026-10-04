# Delivery Plan: Terakhir Kali

Status: local-first mobile MVP includes local profile and manual backup. Optional account sync awaits provider setup.

## Proposed build order

### Phase 0: Approve decisions

Goal: lock behavior that changes data model, copy, or interaction.

Owner decisions:

Approved:

1. App name: `Terakhir Kali`.
2. Time wording: calendar-aware complete years, months, then days.
3. `Baru saja!`: confirmation, then one undo action.
4. Delete: confirmation only. No undo in MVP.
5. Corrupt local data: preserve raw payload, retry first, clear only after explicit consent.
6. Visual direction: follow `design/design.md` and `design/index-1.html` through `design/index-3.html`. Build dark plus fully working light theme.
7. Anti-slop: apply during planning and build.

8. Add form date: prefill current local calendar date. User may change it.

Exit: complete. `SPEC.md` approved for Phase 1.

### Phase 1: Technical foundation

Goal: create smallest Expo + TypeScript app shell.

Work:

- Scaffold Expo app only after Phase 0.
- Inspect generated scripts, SDK, navigation, test support.
- Select installed/native persistence path. Prefer Expo-supported local storage already included or official Expo module when necessary.
- Define validated persisted payload and migration version.
- Update `AGENTS.md` with verified commands.

Validation:

- App boots on target simulator/device.
- Typecheck/lint baseline passes.
- Persistence serialization self-check covers malformed payload.

### Phase 2: Domain logic

Goal: make time and ordering correct before UI.

Work:

- Validate title and local calendar date.
- Compute elapsed local calendar days.
- Format approved Indonesian elapsed text.
- Sort longest elapsed first with deterministic tie-breakers.
- Create, update, reset, delete operations.

Validation:

- Tests or runnable assertions cover today, one day, unit boundaries, leap-year/date-zone boundary, future-date rejection, sort ties, malformed stored data.

### Phase 3: Core screens

Goal: let user manage activity records end to end.

Work:

- List with elapsed status and unambiguous `Catat dilakukan hari ini` action.
- Add and edit forms with native date picker.
- Themed reset and delete confirmation surfaces plus themed notices.
- Empty, loading, and storage-error states.
- Persist after each data change.

Validation:

- Manual flow: add, edit, reset, delete, force-close/reopen.
- No dead controls.
- Keyboard/screen-reader labels and 44px targets verified.

### Phase 4: Visual direction and polish

Goal: make app calm, warm, and distinct without pressure mechanics.

Direction approved: dark editorial reference adapted for Terakhir Kali, with a fully working light theme. Anti-slop applies during build.

Work:

- Apply approved palette, type, spacing, and icon/logo policy.
- Write decision reasons in implementation notes.
- Check small and large phone layouts.
- If theme toggle approved, verify both themes.

Validation:

- Contrast check.
- Screen-size pass.
- Design review against approved direction.

### Phase 5: Local profile and manual backup

Goal: make local data portable without cloud account.

Delivered:

- Display-name profile stored only on device.
- Export versioned JSON backup via share sheet.
- Import and merge JSON backup. Current records stay; same IDs keep newest update.
- Explicit copy: deleting app removes local data unless user saved exported backup.

### Phase 6: Optional account sync

Goal: enable private cross-device backup without making core use depend on network.

Recommended stack:

- Supabase Auth via email magic link.
- Supabase Postgres `activities` table keyed by `user_id`.
- Row Level Security ownership policies.
- Local SQLite remains source available offline; sync runs after authenticated changes and handles retries.

Blocked by:

- Owner creates or connects Supabase project.
- Owner supplies public URL and publishable key through `.env`, never source control.
- Owner approves privacy copy and account UI.

### Phase 7: Release readiness

Goal: verify product behavior on device/emulator.

Work:

- Run typecheck, lint, tests, and production build supported by scaffold.
- Click every control.
- Verify restart persistence and failure paths.
- Produce short PASS report with commands and observed behavior.

Exit:

- All accepted criteria in `SPEC.md` pass.
- No unresolved data-loss or accessibility issue.

## Risks and protections

| Risk | Protection |
| --- | --- |
| Date changes around midnight or timezone | Store local calendar dates, test boundaries. |
| Corrupted local storage | Parse and validate before use; never silently wipe. |
| “Calm” UX becomes vague or inert | Keep one clear add action and immediate reset feedback. |
| Scope creep toward reminders or streaks | Treat them as explicit post-MVP features. |
| UI direction becomes generic | Get brand direction before UI work; document rationale. |

## Deferred backlog

Only after MVP works:

- Optional reminders, opt-in and fully controllable.
- Categories and filters.
- Search for large lists.
- Export/import backup.
- Widget.
- Cloud sync.

## No implementation yet

Current repo docs only:

- `overview.md`
- `SPEC.md`
- `PLAN.md`
- `AGENTS.md`
