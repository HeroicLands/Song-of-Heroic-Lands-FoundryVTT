---
"sohl": minor
---

Give the rules a Resolution chapter that defines the terms the rest of them use
([#1290](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1290)).

The mechanics that resolve every uncertain action — the d100 test, success
levels, opposed tests, Success Value, Secondary Mastery, Fate — were filed under
**Skills**, though attributes, mystical abilities, combat and trauma all test the
same way. A reader wanting to know how a test works had to know to look inside
the Skills chapter first, and once there found the terms used but not defined:
"Mastery Level" appeared in eleven documents and was formally defined in none of
them.

**A new Resolution chapter**, read before Characters, now owns them. The five
existing documents move into it unchanged in shortcode — so every inbound link
keeps working — and are joined by a chapter introduction and a new **Mastery
Level** page:

| Page                | Defines                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Mastery Level       | `mastery-level`, `skill-base`, `attribute-mastery-level`, `index`, `effective-mastery-level`, `assistance`, `competence` |
| Success Tests       | `success-test`, `success-level`, `extended-levels`, `basic-test`                                                         |
| Opposed Tests       | `opposed-test`, `victory-stars`, `ties`, `tiebreaks`                                                                     |
| Success Value Tests | `success-value-test`, `success-value`, `value-diamonds`                                                                  |
| Secondary Mastery   | `secondary-mastery`, `secondary-modifier`, `secondary-roll`                                                              |
| Fate                | `fate`, `fate-exclusions`, `fate-test`, `fate-mastery-level`                                                             |

Each definition sits on a heading carrying an explicit `{#anchor}`, which the
page model turns into its own addressable journal page, and documents across the
corpus now link their first use of a term to it.

**Skill Base is written down for the first time.** It was named in three
documents and defined in none. One attribute gives its own value; two give their
average, rounded up when the first is the greater and down otherwise; three or
more round to nearest. The first attribute a skill names is the primary one, so
the order matters. A Skill Base sets where a skill opens and caps it at SB × 7
thereafter.

**Fate leaves Mysteries for Resolution.** It acts on any test at all, so it
belongs with the rules for testing rather than with the Mystery that holds the
points; the Mysteries introduction points across to it. Its duplicated opening
paragraph and its self-referential `[[Fate]]` link — which resolved to the
Divination stub — are gone.

The Skills chapter keeps what is peculiar to skills and hands testing to
Resolution; the rules root lists Resolution first.
