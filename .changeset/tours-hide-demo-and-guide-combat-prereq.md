---
"sohl": patch
---

**Hide the framework-demo tour and guide Assisted Combat's Being prerequisite**

Two fixes to the guided-tour setup as it appears in _Settings → Tour Management_.

- **The framework demo no longer shows up in the tour list.** The
  `sohl.framework-demo` tour is the SohlTour framework's worked example and e2e
  subject, not a player-facing content tour, but it was registered with
  `display: true` and so appeared alongside the real tours. It is now registered
  with `display: false` — still present in `game.tours` (the e2e suite drives it),
  but no longer listed for users.
- **Assisted Combat is always startable and coaches its prerequisite instead of
  silently refusing.** The tour needs a populated Being, but it gated `canStart`
  on owning one — so with no Being the **Start** button was greyed out with no
  explanation (Foundry shows no reason). The `canStart` guard is removed (matching
  the always-startable Character Creation tour) and a new first **prepare** step
  guides the user to a Being: keep the character you have, or import the
  _Áldrik Hárvenar_ pregen (Actors compendium → Pregens → right-click →
  _Import Entry_), or any populated Being. Its **Next** stays disabled until an
  owned Being exists, so the later sheet steps always have a subject.

Resolves #838
