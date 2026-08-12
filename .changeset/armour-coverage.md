---
"sohl": patch
---

Correct every armour article's covered locations against the Armour & Clothing Articles
table, and add a guard so the class cannot recur.

**How it was verified.** The table's price column is a checksum for coverage: an article
costs its covered fraction of the body times the material's base rate, with one-sided
coverage at half because it is half the material. Cloth Cap 4 = 0.04 × 100, Coat 64 =
0.64, Robe 79 = 0.79, and so on across all nine materials. That makes each article's
correct coverage an arithmetic fact rather than a reading of the grid.

Checked that way, 29 material/article combinations were wrong, affecting 65 articles.
All now match: **200 of 200** verified against the checksum.

The recurring faults were a Sleeved Tunic missing its forearms, Breeches and Leggings
wrongly including the pelvis, an over-covered Surcoat, a Hauberk and Sleeved Byrnie short
of the mark, and — throughout gambeson — a missing neck, which the table gives every
gambeson article.

**Two coverage bugs fixed with them.** The Gambeson Shirt and Coat listed torso locations
in both the flexible and the rigid list, so those locations were counted twice and the
protection applied twice; the Coat also had its thighs marked rigid. All five Ring
articles recorded their coverage as flexible, though ring mail is rigid like the other
metal armours.

**A guard.** A content spec now fixes three rules: the two lists never overlap; rigidity
follows the material, with gambeson alone mixed — rigid over the torso, flexible on the
arms and neck; and every article the table prices matches the checksum. Note that the
plain grade of leather is **rawhide**, with "Leather" a better grade at twice the price,
so the checksum is applied against rawhide.

Part of #1336. Cloaks are corrected separately, and the encumbrance column and the Ring
material question remain open there.
