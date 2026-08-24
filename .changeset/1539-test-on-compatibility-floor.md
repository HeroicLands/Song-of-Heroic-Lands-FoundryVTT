---
"sohl": patch
---

**The e2e suite now runs on the oldest Foundry the system claims to support.**
The test container was pinned to 14.367 while `compatibility.minimum` declared
14.359, so nothing exercised the floor: a regression that broke the declared
minimum while working on the newer build would have passed the suite in silence,
and the compatibility claim was unfalsified by anything the project ran.

- **Default track — the floor.** `DEFAULT_STAGE_VERSIONS` in
  the container harness now pins the `test` stage to **14.359**, matching
  `compatibility.minimum`. Raising it is henceforth a decision to raise the
  supported floor, taken together with `compatibility.minimum` in
  `assets/templates/system.template.json` — not a test-configuration tweak.
- **Sweep track — the newest release.** `npm run e2e:sweep -- <build>` runs the
  full suite against any build, roughly weekly and before shipping, so breakage
  from a new Foundry release is caught by the suite rather than by a user. It
  takes the build as an argument and has **no default**: "the newest release" is
  not a constant the repository can hold without rotting, and a sweep's product
  is a citable result, which requires naming the build. It uses `e2e:full`
  because changing build requires a reseed — Foundry refuses to auto-launch a
  world stamped by a different one.
- **`.env.local` still wins.** `FOUNDRYVTT_TEST_VERSION` overrides the committed
  default for any run, unchanged.
- **`compatibility.verified` is now evidence, not aspiration.** It declared
  14.367 — a build the suite had never completed on. It now names the newest
  build the full suite has actually passed.
- **`cy.login()` spans the supported range.** Foundry renamed the `/join` POST
  body field `userid` → `userId` in 14.367, so the harness's login read as
  `undefined` there and every spec failed its `before` hook with a 401
  `JOIN.ErrorUserDoesNotExist`. It now sends both keys — each build destructures
  the one it wants — which is a precondition for a policy that logs in on both an
  old floor and a new release.

(Closes #1539.)

(Closes #1537.)
