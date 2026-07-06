---
"sohl": minor
---

**Rename `SohlDomains` to `DomainRegistry`**

The domain registry class is renamed from `SohlDomains` to `DomainRegistry` and
moved to `src/entity/domain/DomainRegistry.ts`. Its static surface is unchanged
under the new name — `DomainRegistry.getAll()`, `.get(shortcode)`,
`.getByFamily(family)`, `.getChoices(family?)`, `.register(...)`, and
`.remove(shortcode)`.

The Domain Manager app and its view model are updated to the new name; behavior
is otherwise unchanged.
