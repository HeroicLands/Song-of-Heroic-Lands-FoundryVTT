---
"sohl": patch
---

**Add required `sohl.archetype` frontmatter to creature and character content**

The actor-pack builder requires `sohl.archetype` on every `character`/`creature`
entry (archetype contract, #604 / #640) and drops any entry that lacks it from the
compiled actors compendium. The shipped content tree was out of compliance:

- Every `type: creature` file under `assets/content/Creatures/**` (236 files) now
  carries `sohl.archetype: 0`, marking each creature stat block as a seed-template
  archetype available in the Create-actor dialog.
- The three named characters that lacked the field (`Alverrik_Tarvallor`,
  `Brunjar_Skathhelm`, `Aldrik_Harvenar`) now carry `sohl.archetype: null` (not
  archetypes); `Basic_Folk` keeps its existing `0`.

The four `type: doc` lore overview pages under `Creatures/` are left untouched (they
are journal content, not actors). The actors pack now compiles with zero
`Missing required sohl.archetype` errors.

Closes #724
