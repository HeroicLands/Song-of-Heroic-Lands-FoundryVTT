---
"sohl": major
---

**Remove the Domain and DomainRegistry concept**

The `Domain` / `DomainRegistry` concept is removed in full. It was a
world-setting-backed registry (`sohl.domains`) with a GM **Domain Manager**
settings menu, a `DOMAIN_FAMILY` enum, built-in seed data, and a set of
localization keys, intended to back a `domainCode` / `domain` field on Mystery,
MysticalAbility, and Skill items. That field was never added to any DataModel,
so the only remaining consumers were orphaned sheet-context reads that always
resolved to `undefined`.

The astrology-traditions model (epic #1018) supersedes it: birthsign and
magic-school modifiers are keyed on skill shortcodes via a Traditions registry
on Affiliations, not on Domains.

**Removed**

- The `sohl.entity.domain` module (`DomainRegistry`, `DomainEntry`,
  `BUILTIN_DOMAINS`), the `DomainManagerApp`, and its `domain-manager` view/template.
- The `sohl.domains` world setting, the `domainsMenu` settings menu, and the
  built-in domain seeding at world start.
- The `DOMAIN_FAMILY` / `DomainFamily` enum and helpers in `constants.ts`.
- The `SOHL.Domain.*`, `SOHL.DomainEntry.*`, `SOHL.DomainManager.*`,
  `SOHL.Settings.domains*`, and `*.FIELDS.domainCode.*` localization keys, plus
  the orphaned `system.domain` / `system.domainCode` reads on the Mystery and
  MysticalAbility sheets.

This supersedes the interim `SohlDomains` → `DomainRegistry` rename and the
`DomainManagerApp` stored-XSS fix (#160): the code carrying both is gone, so the
vulnerability is eliminated with it.

Any world that saved GM overrides under the `sohl.domains` setting will find the
setting inert; no per-item data referenced it, so no world migration is required.

Closes #1019
