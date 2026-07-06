---
"sohl": patch
---

**Document the entity-serialization and chat-card scope contracts**

Capture the serialization and action-context patterns as developer reference so
they don't have to be re-derived.

- **Entity serialization contract** (new section in `docs/reference/runtime-contracts.md`).
  How a `SohlEntity` serializes: ownership by a transient `parent`, the
  `defaultToJSON` / `defaultFromJSON` pair (no reflective serializer), curated
  `Data`-shaped `toJSON` in persisted representation (uuids/shortcodes, not
  resolved objects) with the rule that `toJSON()` output must be valid
  constructor `data`, `registerKind` for revival, explicit `clone(parent)`, and
  `SohlLogic` serializing as a `{ uuid, name, kind }` reference.
- **Chat-card scope model** (extends the existing _Chat-card dispatch contract_).
  The three kinds of button data (display fields, routing metadata, scope), and
  how an action's `scope` crosses the client boundary as a single `data-scope`
  blob written by the card logic and revived by `buildActionScope` so flows read
  live `context.scope` objects rather than per-payload JSON strings.
- **`SohlActionContext` as a runtime value object** — why it is not a
  `SohlEntity`, and why `scope` stays a `ContextScope` interface.
- **Extension how-to** (`docs/how-to/extension-points.md`). _Adding a chat-card
  button_ now instructs authors to carry payloads in `data-scope` rather than a
  bespoke `data-*-json` attribute, cross-linking both reference sections.

Documentation only; no runtime change.
