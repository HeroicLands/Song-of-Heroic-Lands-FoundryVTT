---
"sohl": patch
---

**The bundle-loading check runs from the command line.** `package-build` 0.4.0
gives it a command, so `utils/check-bundle-globals.mjs` is gone and
`lint:bundle-globals` is `package-build bundle check`.

It was the last capability either toolchain exposed only as a library function,
which meant a consumer wanting it had to write the script the command line
exists to remove: read the manifest, read the bundle, call the function, decide
how to print findings, choose an exit code.

The one thing the check cannot derive is stated: Vite emits `sohl.js`, not the
`<packageId>.mjs` the toolchain assumes, so `packageBuild.bundle.entry` says so.
It is deliberately not read out of the generated manifest — a value taken from
there would agree with itself by construction, and the check's whole question is
whether the manifest declares that file the way Foundry needs it.

Also moves to `@heroiclands/content-build` 1.2.0, whose command line now rejects
what it used to accept and ignore: a bare command, an unknown command, a missing
action, an unknown option. Every invocation this repository makes already named
its action, so nothing here changes shape.
