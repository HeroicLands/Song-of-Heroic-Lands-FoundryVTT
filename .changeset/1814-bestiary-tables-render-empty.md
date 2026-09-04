---
"sohl": patch
---

**The Bestiary's animal table lists its 91 beings again.** All eight of the
Bestiary's category tables selected on `type = "creature"`, a content type retired
when `character` and `creature` were merged into a single `being` (#1580). No note
has carried it since, so every table published as a header row and a rule with
nothing beneath — on the knowledgebase page and in the compiled journal alike.

The eight queries now select `type = "being"`. The animal table fills with its 91
entries; the remaining seven categories — construct, dreadspawn, elemental, goblin,
helspawn, mythic and spirit — stay empty because no note has been written for them
yet, and will populate as that content lands.

Closes #1814.
