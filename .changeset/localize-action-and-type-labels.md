---
"sohl": patch
---

**Localize action, context-menu, type, and item-tab labels (#527)**

Intrinsic action names, item context-menu entries, item type subtitles
(`TYPE.ITEM.*` / `TYPE.ACTOR.*`), and item-sheet tab labels (`SOHL.Item.tab.*`)
rendered as raw localization keys because the keys were missing from
`lang/en.json` (and the Actions tab printed the title without localizing it). The
missing keys are added and the Actions template now localizes the title, so all
of these show readable text.
