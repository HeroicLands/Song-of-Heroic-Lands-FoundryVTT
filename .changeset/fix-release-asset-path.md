---
"sohl": patch
---

**Fix the release workflow so GitHub Releases include the system archive**

Fixes [#120](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/120):
the release workflow uploaded its assets from `build/release/`, but the packaging
step writes `system.zip` and `system.json` to `build/dist/`. The upload now points
at `build/dist/`, so published Releases carry the installable system files that
Foundry's manifest/download URLs reference.
