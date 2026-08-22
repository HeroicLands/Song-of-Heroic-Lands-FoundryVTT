---
"sohl": patch
---

**Fixed: the release job could not package a build.** `npm run build:pack-release`
failed at _import_, before writing a byte — `archiver` 8 is pure ESM and exports
classes rather than a default factory. The release workflow runs that script and
uploads the archive Foundry installs from, so no release could be cut; nothing
else imports it, so every other build, lint and deploy path passed while it was
broken (#1683).

Two further defects in the same step are fixed with it. The packaging returned
once the archive had finished _appending_ entries rather than once its bytes had
reached disk, so a fast-enough run hid a truncated archive; and a recoverable
archiver warning was ignored, yielding an archive that was not the tree that had
been asked for, silently. Both now fail loudly.

Staging a package — copying its assets, clearing the build tree, and archiving it
— also moves into the shared `@heroiclands/package-build` toolchain, so a listed
asset path that does not exist now fails the build instead of shipping a package
that quietly lacks its localization or its templates.
