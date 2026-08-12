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

**Ring becomes a real material.** The source table has no ring mail at all, so its five
articles had nothing to price against. Ring is now defined against mail — a tenth cheaper
and a fifth heavier, giving a base rate of 1350 and a base weight of 54 — and all five
articles are priced from it.

**The articles SoHL adds beyond the table** are brought onto the same footing. Each
material has grade multipliers that its table-priced articles establish exactly: homespun
at 0.30 of the plain rate, linen 0.50, serge 0.60, russet 1.20, worsted 2.41, velvet 3.51,
silk 9.00; rawhide 1.00, leather 2.00, beaver and sealskin 3.00, ermine 6.00. Applying
those to the 84 added articles that were priced independently puts every article in the
tree on one rule: coverage × the material rate × the grade.

Straw is priced as cloth at a quarter, which the table does not cover.

**Encumbrance and perception** are reconciled with the table's ENC column. Fourteen arm
pieces carried 1.67 — five thirds — standing in for the rule that three or more arm
articles cost ENC 5 between them. That is only correct at exactly three: one piece charged
1.67 and five charged 8.35. Those are now 0, which is what an arm piece costs on its own;
the article still carries its weight, and the ENC column is a surcharge for awkwardness
beyond weight rather than the whole burden. Applying the threshold needs logic and is left
for its own change. Perception penalties already matched, including the great helm's −10.

Part of #1336. Cloaks are corrected separately; the encumbrance column remains open there.
