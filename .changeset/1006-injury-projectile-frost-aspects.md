---
"sohl": patch
---

**Injury rules: drop the projectile and frost treatment aspects the system cannot apply**

The Injury treatment tables listed **projectile** and **frost** impact aspects (with
their `EXT`/`WRM`/`AMP` treatments and the grievous-frost amputation path) as live
rules, but the system's impact aspects are **blunt**, **edged**, **piercing**, and
**fire** only. The published rules now match what the system does:

- The _Treatment actions_ table lists only the four supported aspects.
- The _required treatment_ code table drops the now-unreachable `EXT`, `WRM`, and
  `AMP` codes.
- _Special Injury Effects_ no longer references projectile or frost wounds.

Closes #1006
