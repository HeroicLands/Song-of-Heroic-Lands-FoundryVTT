---
"sohl": patch
---

**Fix: de-race the migration-runner e2e reload spec (#1032)**

`migration-runner.cy.js` → "re-stamps a rewound (legacy) stored version on the
next load" failed intermittently: after rewinding `systemMigrationVersion` to
`0.0.0` and re-visiting the world, the spec read the stored version once,
immediately after `cy.login()` resolved, and saw the old `0.0.0`.

The reload and `ready` re-fire were working correctly — the spec was racing the
migration. The `ready` hook runs `void migrateWorld()` fire-and-forget, and the
stamp is a world-setting write that round-trips to the server, so `game.ready`
(what `cy.login()` waits on) can flip true before the stamp lands. The sibling
"on boot" spec passed only because the seed world was already stamped, so no
async write was pending.

Harness-only change (no system code touched): both specs now poll the setting
with a retry-able `cy.window({ timeout }).should(...)` instead of a single
immediate read, letting the async migration settle. This preserves the
end-to-end live-lifecycle coverage (reload → `ready` → `migrateWorld` →
`runWorldMigrations` → stamp).

Fixes #1032
