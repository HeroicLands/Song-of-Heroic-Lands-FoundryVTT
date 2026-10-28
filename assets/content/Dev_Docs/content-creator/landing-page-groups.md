---
shortcode: landingpagegroups
name: {full: Documentation Landing Groups}
type: doc
subType: reference
description: "Editorial tags that place documentation pages in generated landing lists."
tags: [dev-content-creator, dev-docs-content-creator-conventions]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Documentation Landing Groups

Documentation landings keep their editorial headings, reading advice and explanatory prose. Their page directories use grouping tags, so adding a page to a group means adding its tag to that page's frontmatter. A page may belong to several groups. Preserve any other content or engineering tags already present.

Write the directory with the toolchain's fenced `pagelist` construct, not a shortcode:

````markdown
```pagelist {tag="rules-combat" type=doc sort=name descriptions=true}

```
````

The fence body is empty. `sort=name` lists page names alphabetically; `descriptions=true` adds a page's existing description when available. The same expansion supplies the website, Foundry journal and book. See the installed package-build authoring reference for the directive's remaining options.

Tags follow the existing chapter names and landing headings, with a context prefix to keep identically named sections separate. The ordered reading introductions remain editorial guidance; generated directories are alphabetic indexes within those groups. A new page needs the broad chapter tag and any subsection tags appropriate to its subject.

| Grouping tag                                             | Landing group                                          |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `rules-resolution`                                       | [[doc-rulesintro\|Resolution]]                         |
| `rules-attributes`                                       | [[doc-rulesintro\|Attributes]]                         |
| `rules-skills`                                           | [[doc-rulesintro\|Skills]]                             |
| `rules-affiliations`                                     | [[doc-rulesintro\|Affiliations]]                       |
| `rules-characters`                                       | [[doc-rulesintro\|Characters]]                         |
| `rules-gear`                                             | [[doc-rulesintro\|Gear]]                               |
| `rules-crafting`                                         | [[doc-rulesintro\|Crafting]]                           |
| `rules-combat`                                           | [[doc-rulesintro\|Combat]]                             |
| `rules-trauma`                                           | [[doc-rulesintro\|Trauma]]                             |
| `rules-esoterica`                                        | [[doc-rulesintro\|Esoterica]]                          |
| `rules-glossary`                                         | [[doc-rulesintro\|Glossary]]                           |
| `guide-quickstart`                                       | [[doc-userguide\|Quickstart]]                          |
| `guide-setting-up-a-world`                               | [[doc-userguide\|Setting up a world]]                  |
| `guide-understanding-sheets`                             | [[doc-userguide\|Understanding Sheets]]                |
| `guide-actors`                                           | [[doc-userguide\|Actors]]                              |
| `guide-items`                                            | [[doc-userguide\|Items]]                               |
| `guide-making-tests`                                     | [[doc-userguide\|Making tests]]                        |
| `guide-scenes-and-tokens`                                | [[doc-userguide\|Scenes and tokens]]                   |
| `guide-combat-basics`                                    | [[doc-userguide\|Combat Basics]]                       |
| `guide-afflictions-and-injuries`                         | [[doc-userguide\|Afflictions and Injuries]]            |
| `guide-mystical-powers`                                  | [[doc-userguide\|Mystical Powers]]                     |
| `guide-customizing-the-system`                           | [[doc-userguide\|Customizing the system]]              |
| `user-guide-items-what-a-character-is`                   | [[doc-ugitems\|What a character is]]                   |
| `user-guide-items-the-supernatural`                      | [[doc-ugitems\|The supernatural]]                      |
| `user-guide-items-gear`                                  | [[doc-ugitems\|Gear]]                                  |
| `user-guide-items-shared-by-every-item`                  | [[doc-ugitems\|Shared by every item]]                  |
| `user-guide-actors-sections`                             | [[doc-ugactors\|Sections]]                             |
| `dev-docs-content-creator-start-here`                    | [[doc-contentcreator\|Start here]]                     |
| `dev-docs-content-creator-per-type-references`           | [[doc-contentcreator\|Per-type references]]            |
| `dev-docs-content-creator-conventions`                   | [[doc-contentcreator\|Conventions]]                    |
| `dev-docs-content-creator-also-relevant-filed-elsewhere` | [[doc-contentcreator\|Also relevant, filed elsewhere]] |
| `rules-esoterica-mysteries-and-mystical-abilities`       | [[doc-estrcint\|Mysteries and Mystical Abilities]]     |
| `rules-resolution-sections`                              | [[doc-resolutionintro\|Sections]]                      |
| `rules-trauma-forms-of-trauma`                           | [[doc-traumaintro\|Forms of trauma]]                   |
| `rules-combat-kinds-of-attack`                           | [[doc-combatintro\|Kinds of Attack]]                   |
| `rules-combat-sections`                                  | [[doc-combatintro\|Sections]]                          |
| `rules-trauma-spirit-sections`                           | [[doc-sprttraumaintro\|Sections]]                      |
| `rules-trauma-mind-sections`                             | [[doc-mindtraumaintro\|Sections]]                      |
| `rules-trauma-body-sections`                             | [[doc-bodytrmaintro\|Sections]]                        |
| `rules-trauma-body-injury-sections`                      | [[doc-injintro\|Sections]]                             |
| `rules-esoterica-mystical-abilities-arcane-mysteries`    | [[doc-mystabilintro\|Arcane Mysteries]]                |
| `rules-esoterica-mystical-abilities-divine-mysteries`    | [[doc-mystabilintro\|Divine Mysteries]]                |
| `rules-esoterica-mystical-abilities-spirit-mysteries`    | [[doc-mystabilintro\|Spirit Mysteries]]                |
| `rules-esoterica-mysteries-sections`                     | [[doc-mysteryintro\|Sections]]                         |
| `rules-esoterica-mystical-abilities-divination-the-arts` | [[doc-divintro\|The arts]]                             |
| `dev-concepts`                                           | [[doc-devdocs\|Concepts]]                              |
| `dev-how-to`                                             | [[doc-devdocs\|How-to]]                                |
| `dev-content-creator`                                    | [[doc-devdocs\|Content Creator]]                       |
| `dev-reference`                                          | [[doc-devdocs\|Reference]]                             |
| `dev-contributing`                                       | [[doc-devdocs\|Contributing]]                          |

## Maintaining a group

Add or remove tags on the page itself; do not enumerate its link in the generated directory. Moving a file does not change its grouping tags. When a heading's intent changes, update the corresponding directive and its member tags together. An unknown or empty group is a build finding; do not hide a spelling mistake with `allow-empty=true`.

Generated references declare their grouping tags in their canonical generator: the Type Catalog header is in `utils/build-type-catalog.mjs`, and Item Note Frontmatter's header is configured by `docs.itemFields.frontmatter` in `package-build.config.mjs`. Regenerate those pages rather than editing their generated headers alone.

See also: [[doc-contentcreator|Content Creator]], [[doc-authoringworkflow|The Authoring Workflow]], [[doc-contenttables|Generated Content Tables]]
