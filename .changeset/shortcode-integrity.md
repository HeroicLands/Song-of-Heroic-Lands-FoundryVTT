---
"sohl": minor
---

**Shortcode integrity: `(type, shortcode)` uniqueness across four scopes + `shortcodeDedupe`** (#766)

`shortcode` is the system's lookup key (with `type`). Its uniqueness is now enforced end-to-end.

- **Uniqueness on create *and* update**, across four scopes: all world items, each actor's embedded items, all world actors, and each compendium pack. A shared runtime guard (`enforceShortcodeOnCreate` / `enforceShortcodeOnUpdate`) resolves the scope and applies the key; the previously-missing update path (renaming a shortcode into a collision) is now caught, and compendium-pack creates are no longer skipped.
- **`shortcodeDedupe` create/update option.** A caller opts into automatic key management with `shortcodeDedupe: true`: a colliding shortcode is suffixed (`arrow` → `arrow2`) until unique, and a create with neither a shortcode nor a usable name gets a random 16-char id — so it never fails. Without it, a collision (or a name-less create) is rejected with a warning. System-generated item creation (`fvttCreateEmbeddedItems`, cross-actor gear drops) opts in; the human create path stays strict.
- **Create dialog** live-checks the entered shortcode and disables **Create** until it is unique (the runtime reject is the backstop).
- **Build-time `lint:packs`** fails the build on any duplicate `(type, shortcode)` within a compendium pack — the authoritative guard for authored pack content, which is seeded via the CLI and bypasses `_preCreate`.
- The pure decision logic lives in a reworked `resolveShortcodeKey` (fully unit-tested via an injected id generator), and the misleading base-schema comment (which claimed non-existent subtype overrides) is corrected.
