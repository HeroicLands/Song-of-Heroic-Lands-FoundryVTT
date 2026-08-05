---
"sohl": minor
---

**Built-in calendars and astrology traditions load from `assets/` data files at runtime, and a new `sohl.fetchJson` API lets modules do the same**

The shipped built-in **calendars** and the built-in **astrology tradition** were
authored as JSON data files but pulled into the code by static `import`, which
**inlined them into the bundle** — they were never really loaded dynamically, and
took a different path than the one a module uses to add its own.

Now they are true, runtime-loaded data files, loaded exactly the way a module
loads its own:

- **Relocated to the standard assets locations** — `assets/calendar/*.json` and
  `assets/astrology/astrokyklos.json` (deployed to `systems/sohl/assets/...`).
  They ship as **loose, fetchable files** and are no longer bundled into
  `sohl.js`.
- **Two-stage load.** Stage one fetches the file at the Foundry boundary; stage
  two hands the parsed JSON to a **Foundry-free** registry API. The system fetches
  its own built-ins at load and registers them during `init`, and the registries
  (`sohl.astrologyRegistry.register(json)`, `SohlSystem.registerCalendar(id, cfg)`)
  stay pure.
- **New `sohl.fetchJson(path)`** — the public fetch stage, so a module's `init`
  hook uses the identical pattern:

    ```js
    Hooks.once("init", async () => {
        sohl.astrologyRegistry.register(
            await sohl.fetchJson("modules/my-module/data/my-traditions.json"),
        );
    });
    ```

No world data or content changes; the shipped calendars and Astrokýklos tradition
are byte-for-byte the same, only relocated and loaded differently.

Closes #1048
