---
"sohl": patch
---

Rules documents describe the game, not the VTT that implements it
([#1291](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1291)).

Nine rules documents explained a mechanic by describing the interface that
presents it. `Bleeding.md` told the reader that "the system first presents a
request … a dialog announcing that the character is bleeding, with an **Accept**
button", and that "the physician sees a card in the chat log". `Afflictions.md`
declared its outcome in two named authored fields and appealed to "everything the
system automates". A reader who is not sitting in front of Foundry could not use
them, and a reader who is would be misled the moment the interface changes.

**The rules are the specification the VTT implements, and now read as though no
VTT exists.** Every mechanic that was described as an interface is restated as
what happens at the table, and nothing was lost in the move — the automation
prose it replaced is already documented, in more detail, in the User Guide:

| Was described in the rules as…                     | Restated as                                                                 | Already in the User Guide                |
| -------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| A dialog with an **Accept** button before bleeding | The chance to staunch comes first, and lapses at the end of the round       | _Trauma_ → Request/Accept Blood Stoppage |
| A card in the chat log requesting stoppage         | A stoppage test names one injury and applies to that injury alone           | _Trauma_ → Accept Blood Stoppage         |
| "As with everything the system automates…"         | Exposure and contraction are different; the roll is the exposed character's | _Being_ → Contagion Check / Test         |
| Two authored fields and a Safe Expression          | An affliction ends in **Death** or **Cured**, and may leave a trauma        | _Affliction_ → The Outcome               |
| The shock state as a set of Active Effects         | A creature is in exactly one shock state; a change replaces it              | _Being_ → Status indicators              |
| Anatomy stored as three flat lists on the actor    | Anatomy is intrinsic to what a creature _is_                                | _Being_ → Body-part grid                 |

Two smaller repairs came with it: `Bleeding.md` opened by linking the word
"Injury" to the User Guide rather than to the Injury rules, and the birthsign
pages described the signs as "droppable items in the compendium".

**`npm run lint:rules-vtt`** (new, and part of `npm run lint`) keeps it that way,
failing the build on a click, button, dialog, chat log, or "the system" anywhere
under `assets/content/Rules/`. The User Guide is deliberately exempt: that is
where automation behaviour belongs.
