---
aliases: []
tags: []
name:
    full: Script
    aliases: []
description: "Reading, writing, and interpreting text in specific writing systems."
id: gWcGga86UIFpqRsG
img: icons/game-icons/lorc/scroll-unfurled.svg
shortcode: script
type: skill
package: sohl
sohl:
    kbcat: script
    archetype: 0
    subType: script
    skillBaseFormula: "sb(attr.rea, attr.per)"
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 0
    masteryLevelBase: null
    improveFlag: false
    impairedByRoles:
        - core
        - vital
folder: RgFGiT3LqmNP0uRB
---

Script is the ability to write and to read a particular **writing system**. Languages and scripts are separate things: a tongue may have no written form at all, or several, and one script may serve a number of unrelated languages. To read a text, a character needs **both** the relevant Language and the relevant Script.

A given piece of work may only be re-attempted once the character's Script has improved by 10 Mastery Level, for scribing, or their Language by 10, for reading. A second look does not help; a better education does.

**Scribing.** Legibility is a **Script (Language, Drawing)** Success Value test. Copying an existing work may instead be attempted as a **Drawing** Success Value test at **−2 SV**, on the reasoning that a copyist who cannot read the exemplar is drawing letters rather than writing them. A scribe taking dictation from the author works at **−20**.

| SV  | The hand                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 4 | Unclear — a −5 penalty to reading tests for every point of Success Value below 4, to a maximum of −20.                                                                                    |
| 5+  | Clear — no penalty to reading. Each Value Diamond may instead raise the text's base sale value by 10% through illumination and finer presentation, or, when copying, cut the time by 10%. |

**Reading.** Reading takes about five minutes per page, often much longer where the reader is working to draw insight out of the text. Comprehension is a **Language (Script)** Success Value test, modified by the hand it is written in (0 to −20, above) and by the state of the document: **−2 SV** if damaged, **−1 SV** if degraded, nothing if pristine.

| SV  | Comprehension                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 0 | None. The script is recognised as script; nothing is understood.                                                                                                                                                                                                      |
| 1–2 | Limited. The general subject of a short missive is grasped, but not that of a longer text.                                                                                                                                                                            |
| 3–4 | Basic. A simple missive is understood word for word; of a longer missive or a text, only the general subject.                                                                                                                                                         |
| 5+  | Advanced. The work is understood. Each Value Diamond may cut reading time by 10%, or — for texts only — roll one d10 against a Target Number equal to the reader's Index in the subject the author wrote on. Each success uncovers one insight the author left there. |

Gaining each insight beyond the first takes a further **d6 days** of reflection; a Value Diamond may be traded to remove one of those dice, and a successful Creativity test halves that time on a Marginal Success or quarters it on a Critical Success.
