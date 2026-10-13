---
shortcode: crafting
name: {full: Crafting, aliases: []}
type: doc
subType: rules
data: {packFolder: rules}
---

**Crafting** is the making of a thing — a blade, a pot, a bow, a lock, a coat. Every trade that produces an article follows the same short routine, and the trades differ only in the detail they hang on it.

1. The crafter works in a [[#workshop|workshop]], rated one to five stars.
2. They spend the article's [[#craft-expense|expense]]: materials in money, labour in time.
3. They make one [[#craft-test|Success Value test]] of the trade's skill.
4. They read it on the [[#craft-result|result ladder]] — flawed, sound, or masterwork.
5. A masterwork result buys [[#masterwork|masterwork rolls]] or [[#fast-crafting|faster work]], as the crafter chooses.

What each trade adds to that frame is only ever the particulars: which skill is tested, how its cost and time are reckoned, what a flaw costs in that trade's own units, and how much fine work the material will take. Everything else is on these pages, and applies to every craft **whether or not that trade's own entry repeats it**.

Crafting is also how an article is put right again once it has been damaged; see [[#craft-repair|Repair]].

# The Workshop {#workshop}

A **workshop** is the place, the tooling and the stock a trade needs in order to work at all — a forge and its hammers, a kiln, a loom, a bench of files and picks. Every workshop is rated from **one to five stars** by how well it is found.

The rating does one thing: it sets the **Target Number** for [[#masterwork|masterwork rolls]]. A well-appointed shop does not make ordinary work come out better, and a poor one does not spoil it; what the shop decides is how far above ordinary the work can reach.

| Workshop  | Stars | TN  |
| --------- | ----- | --- |
| Makeshift | 1     | 1   |
| Sparse    | 2     | 2   |
| Standard  | 3     | 3   |
| Plentiful | 4     | 4   |
| Ideal     | 5     | 5   |

A trade may require a workshop of its own kind — a lock is not made at a tannery — and says so in its own entry.

# Expense {#craft-expense}

Before any test is made, the article's expense is spent. **Materials** are reckoned in money and **labour** in time, and a crafter puts in up to **ten hours a day**. Work measured in months is measured in the same working days.

Trades state that expense in one of two ways, and each says which it uses:

- **Per article.** A table gives the cost and the hours for each thing the trade makes — a dagger, a horseshoe, a saddle.
- **By price.** Cost and time are derived from what the finished article sells for, at a rate the trade gives — so many hours or days per so much of the sale price, at so much a day in materials.

**Cast work takes a quarter longer.** Where an article is founded rather than worked — melted, poured into a mould and then finished — add a quarter to the time the trade gives. Bronze, brass and pewter are cast; copper, silver, gold and iron are raised, drawn and hammered. This applies to every craft, whether or not the trade's own entry mentions it, and a trade that already prices its cast and wrought articles separately says so.

The expense is what the work costs when it goes normally. A [[#craft-result|Critical Failure]] adds to the time, [[#fast-crafting|fast crafting]] takes some of it away, and casting adds to it as above.

## Armour Expense {#armour-expense}

Armour materials and labour are derived from authored sale price and body coverage. The plain-grade price is coverage times the material base rate. Labour costs `(1 − materials share) × min(sale price, plain-grade price)`; materials cost the remainder of the sale price. Hours are labour cost divided by the daily rate, times ten. Luxury grades therefore add stock expense without adding hours; cheap grades reduce both.

| Material                | Plain-grade rate (d per full-body coverage) | Craft        |
| ----------------------- | ------------------------------------------: | ------------ |
| Cloth                   |                                         100 | Textilecraft |
| Padded                  |                                         200 | Textilecraft |
| Quilted                 |                                         400 | Textilecraft |
| Gambeson                |                                         800 | Textilecraft |
| Leather (Rawhide grade) |                                         400 | Hideworking  |
| Kûrbúl                  |                                         500 | Weaponcraft  |
| Scale                   |                                        1000 | Weaponcraft  |
| Mail                    |                                        1500 | Weaponcraft  |
| Ring                    |                                        1350 | Weaponcraft  |
| Plate                   |                                        2000 | Weaponcraft  |

| Craft        | Materials share | Pence per ten-hour day |
| ------------ | --------------: | ---------------------: |
| Textilecraft |             45% |                      3 |
| Hideworking  |             40% |                      4 |
| Weaponcraft  |             15% |                      5 |

These tables are generated at build. Coverage counts a location protected on only one side as half. Materials display to two decimal places in pence and hours to the nearest whole hour; derivation uses unrounded amounts. Display ties round upward. Fast crafting may reduce hours by up to 30%, without reducing materials.

### Textilecraft Armour {#textilecraft-armour-expense}

```sql
WITH weights(location, fraction) AS (VALUES ('skullloc', 0.04),
       ('neckloc', 0.02),
       ('lshldloc', 0.015),
       ('rshldloc', 0.015),
       ('lupaloc', 0.03),
       ('rupaloc', 0.03),
       ('lelbloc', 0.01),
       ('relbloc', 0.01),
       ('lfraloc', 0.025),
       ('rfraloc', 0.025),
       ('lhandloc', 0.025),
       ('rhandloc', 0.025),
       ('thrxloc', 0.12),
       ('abdmnloc', 0.12),
       ('plvisloc', 0.1),
       ('lthghloc', 0.07),
       ('rthghloc', 0.07),
       ('lkneeloc', 0.015),
       ('rkneeloc', 0.015),
       ('lcalfloc', 0.06),
       ('rcalfloc', 0.06),
       ('lfootloc', 0.035),
       ('rfootloc', 0.035),
       ('jawloc', 0.03 / 7),
       ('lcheekloc', 0.03 / 7),
       ('rcheekloc', 0.03 / 7),
       ('learloc', 0.03 / 7),
       ('rearloc', 0.03 / 7),
       ('mouthloc', 0.03 / 7),
       ('noseloc', 0.03 / 7)),
rates(material, base_rate, craft, share, day_rate) AS (VALUES ('Cloth', 100, 'Textilecraft', 0.45, 3), ('Padded', 200, 'Textilecraft', 0.45, 3), ('Quilted', 400, 'Textilecraft', 0.45, 3), ('Gambeson', 800, 'Textilecraft', 0.45, 3), ('Leather', 400, 'Hideworking', 0.40, 4), ('Kûrbúl', 500, 'Weaponcraft', 0.15, 5), ('Scale', 1000, 'Weaponcraft', 0.15, 5), ('Mail', 1500, 'Weaponcraft', 0.15, 5), ('Ring', 1350, 'Weaponcraft', 0.15, 5), ('Plate', 2000, 'Weaponcraft', 0.15, 5)),
articles AS (
    SELECT address.slug AS ref, name.full AS article, sohl.system.valueBase AS price, rates.*,
           coalesce(sohl.system.locations.flexible, []::VARCHAR[]) || coalesce(sohl.system.locations.rigid, []::VARCHAR[]) AS locations,
           coalesce(sohl.system.locations.facing, []) AS facing
    FROM notes JOIN rates ON sohl.system.material = rates.material
    WHERE type = 'armorgear' AND craft = 'Textilecraft'
), coverage AS (
    SELECT articles.*,
           (SELECT sum(fraction * CASE
               WHEN (SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc) = 0 THEN 1
               ELSE least((SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc), 2) / 2.0 END)
            FROM unnest(locations) AS covered(loc) JOIN weights ON location = loc) AS coverage
    FROM articles
), expenses AS (
    SELECT *, (1 - share) * least(price, coverage * base_rate) AS labour FROM coverage
)
SELECT ref AS _ref, article AS "Article", price AS "Price (d)",
       round(CAST(price - labour AS DECIMAL(30, 8)), 2) AS "Materials (d)", round(CAST(labour / day_rate * 10 AS DECIMAL(30, 8))) AS "Hours"
FROM expenses ORDER BY article COLLATE NOCASE
```

### Hideworking Armour {#hideworking-armour-expense}

```sql
WITH weights(location, fraction) AS (VALUES ('skullloc', 0.04),
       ('neckloc', 0.02),
       ('lshldloc', 0.015),
       ('rshldloc', 0.015),
       ('lupaloc', 0.03),
       ('rupaloc', 0.03),
       ('lelbloc', 0.01),
       ('relbloc', 0.01),
       ('lfraloc', 0.025),
       ('rfraloc', 0.025),
       ('lhandloc', 0.025),
       ('rhandloc', 0.025),
       ('thrxloc', 0.12),
       ('abdmnloc', 0.12),
       ('plvisloc', 0.1),
       ('lthghloc', 0.07),
       ('rthghloc', 0.07),
       ('lkneeloc', 0.015),
       ('rkneeloc', 0.015),
       ('lcalfloc', 0.06),
       ('rcalfloc', 0.06),
       ('lfootloc', 0.035),
       ('rfootloc', 0.035),
       ('jawloc', 0.03 / 7),
       ('lcheekloc', 0.03 / 7),
       ('rcheekloc', 0.03 / 7),
       ('learloc', 0.03 / 7),
       ('rearloc', 0.03 / 7),
       ('mouthloc', 0.03 / 7),
       ('noseloc', 0.03 / 7)),
rates(material, base_rate, craft, share, day_rate) AS (VALUES ('Cloth', 100, 'Textilecraft', 0.45, 3), ('Padded', 200, 'Textilecraft', 0.45, 3), ('Quilted', 400, 'Textilecraft', 0.45, 3), ('Gambeson', 800, 'Textilecraft', 0.45, 3), ('Leather', 400, 'Hideworking', 0.40, 4), ('Kûrbúl', 500, 'Weaponcraft', 0.15, 5), ('Scale', 1000, 'Weaponcraft', 0.15, 5), ('Mail', 1500, 'Weaponcraft', 0.15, 5), ('Ring', 1350, 'Weaponcraft', 0.15, 5), ('Plate', 2000, 'Weaponcraft', 0.15, 5)),
articles AS (
    SELECT address.slug AS ref, name.full AS article, sohl.system.valueBase AS price, rates.*,
           coalesce(sohl.system.locations.flexible, []::VARCHAR[]) || coalesce(sohl.system.locations.rigid, []::VARCHAR[]) AS locations,
           coalesce(sohl.system.locations.facing, []) AS facing
    FROM notes JOIN rates ON sohl.system.material = rates.material
    WHERE type = 'armorgear' AND craft = 'Hideworking'
), coverage AS (
    SELECT articles.*,
           (SELECT sum(fraction * CASE
               WHEN (SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc) = 0 THEN 1
               ELSE least((SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc), 2) / 2.0 END)
            FROM unnest(locations) AS covered(loc) JOIN weights ON location = loc) AS coverage
    FROM articles
), expenses AS (
    SELECT *, (1 - share) * least(price, coverage * base_rate) AS labour FROM coverage
)
SELECT ref AS _ref, article AS "Article", price AS "Price (d)",
       round(CAST(price - labour AS DECIMAL(30, 8)), 2) AS "Materials (d)", round(CAST(labour / day_rate * 10 AS DECIMAL(30, 8))) AS "Hours"
FROM expenses ORDER BY article COLLATE NOCASE
```

### Weaponcraft Armour {#weaponcraft-armour-expense}

```sql
WITH weights(location, fraction) AS (VALUES ('skullloc', 0.04),
       ('neckloc', 0.02),
       ('lshldloc', 0.015),
       ('rshldloc', 0.015),
       ('lupaloc', 0.03),
       ('rupaloc', 0.03),
       ('lelbloc', 0.01),
       ('relbloc', 0.01),
       ('lfraloc', 0.025),
       ('rfraloc', 0.025),
       ('lhandloc', 0.025),
       ('rhandloc', 0.025),
       ('thrxloc', 0.12),
       ('abdmnloc', 0.12),
       ('plvisloc', 0.1),
       ('lthghloc', 0.07),
       ('rthghloc', 0.07),
       ('lkneeloc', 0.015),
       ('rkneeloc', 0.015),
       ('lcalfloc', 0.06),
       ('rcalfloc', 0.06),
       ('lfootloc', 0.035),
       ('rfootloc', 0.035),
       ('jawloc', 0.03 / 7),
       ('lcheekloc', 0.03 / 7),
       ('rcheekloc', 0.03 / 7),
       ('learloc', 0.03 / 7),
       ('rearloc', 0.03 / 7),
       ('mouthloc', 0.03 / 7),
       ('noseloc', 0.03 / 7)),
rates(material, base_rate, craft, share, day_rate) AS (VALUES ('Cloth', 100, 'Textilecraft', 0.45, 3), ('Padded', 200, 'Textilecraft', 0.45, 3), ('Quilted', 400, 'Textilecraft', 0.45, 3), ('Gambeson', 800, 'Textilecraft', 0.45, 3), ('Leather', 400, 'Hideworking', 0.40, 4), ('Kûrbúl', 500, 'Weaponcraft', 0.15, 5), ('Scale', 1000, 'Weaponcraft', 0.15, 5), ('Mail', 1500, 'Weaponcraft', 0.15, 5), ('Ring', 1350, 'Weaponcraft', 0.15, 5), ('Plate', 2000, 'Weaponcraft', 0.15, 5)),
articles AS (
    SELECT address.slug AS ref, name.full AS article, sohl.system.valueBase AS price, rates.*,
           coalesce(sohl.system.locations.flexible, []::VARCHAR[]) || coalesce(sohl.system.locations.rigid, []::VARCHAR[]) AS locations,
           coalesce(sohl.system.locations.facing, []) AS facing
    FROM notes JOIN rates ON sohl.system.material = rates.material
    WHERE type = 'armorgear' AND craft = 'Weaponcraft'
), coverage AS (
    SELECT articles.*,
           (SELECT sum(fraction * CASE
               WHEN (SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc) = 0 THEN 1
               ELSE least((SELECT count(*) FROM unnest(facing) AS sides(f) WHERE f.location = covered.loc), 2) / 2.0 END)
            FROM unnest(locations) AS covered(loc) JOIN weights ON location = loc) AS coverage
    FROM articles
), expenses AS (
    SELECT *, (1 - share) * least(price, coverage * base_rate) AS labour FROM coverage
)
SELECT ref AS _ref, article AS "Article", price AS "Price (d)",
       round(CAST(price - labour AS DECIMAL(30, 8)), 2) AS "Materials (d)", round(CAST(labour / day_rate * 10 AS DECIMAL(30, 8))) AS "Hours"
FROM expenses ORDER BY article COLLATE NOCASE
```

# The Test {#craft-test}

The whole of the work is settled by a single [[doc-sccssvlt#success-value-test|Success Value test]] of the trade's skill, made once the expense has been spent.

Each trade names the test it takes, and names it in the ordinary way: a **Weaponcraft (Metalcraft, Mineralogy)** test is a Weaponcraft Success Value test carrying Metalcraft and Mineralogy as [[doc-scndryms#secondary-modifier|Secondary Modifiers]]. Where what is being made decides the skill rather than the trade — a wooden haft against an iron head, a padded coat against a mail one — the trade's entry gives a table of which test applies to what.

Up to **two others may assist**, provided they are present for the whole of the work.

# The Result {#craft-result}

The Success Value is read on the ladder below. It is the crafting reading of the [[doc-sccssvlt#success-value|standard Success Value scale]], and every trade uses it unless it says otherwise.

| SV  | Outcome                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 2 | **Flawed.** The article is finished, but short of the catalogue: it loses quality, and whatever second measure the trade keeps alongside it.                  |
| 3–4 | **Sound.** The base article, exactly as catalogued.                                                                                                           |
| 5+  | **Masterwork.** Each [[doc-sccssvlt#value-diamonds\|Value Diamond]] buys either one [[#masterwork\|masterwork roll]] or [[#fast-crafting\|10% off the time]]. |

**A flaw costs what the trade says it costs.** How much quality is lost, what else goes with it, and how fast the loss grows as the Success Value falls further below 3 are all particular to the trade, and are stated in its entry.

**A Critical Failure is a setback, not a ruin.** On a Critical Failure on the test's underlying Success Test, crafting time **increases by half**. A few trades are harsher than that, and say so.

# Masterwork {#masterwork}

A Success Value of 5 or better yields [[doc-sccssvlt#value-diamonds|Value Diamonds]] — one for each point past 4, to a maximum of five. Each diamond is spent, one way or the other: on a masterwork roll here, or on [[#fast-crafting|fast crafting]]. The crafter chooses for each diamond separately, and may split them between the two.

Each diamond committed to fine work rolls **one d10 against a Target Number equal to the [[#workshop|workshop's]] star rating**, each rolled separately. Every success is a **Masterwork Success (MWS)**, and the total decides what the article became.

| MWS | Result                  | Value |
| --- | ----------------------- | ----- |
| 0   | Base article            | ×1    |
| 1   | Quality +1              | ×2    |
| 2   | Quality +1, modifier +1 | ×3    |
| 3   | Quality +2, modifier +1 | ×4    |
| 4   | Quality +2, modifier +2 | ×5    |
| 5   | Quality +3, modifier +2 | ×6    |

**Quality** is the article's own quality rating. The **modifier** is the second measure the trade keeps beside it — a weapon's impact, a bow's range, a suit of armour's Armour Value — and each trade says what its modifier does. **Value** multiplies what the finished article is worth.

**Not every success can be applied.** However many are rolled, an article will only take so much fine work: a plain material or a modest design caps what the crafter can put into it, and the surplus is simply pride. Each trade states its own cap.

# Fast Crafting {#fast-crafting}

A [[doc-sccssvlt#value-diamonds|Value Diamond]] need not be spent on [[#masterwork|masterwork]]. It may instead be spent to cut the **time** the work takes by **10%**, to a maximum reduction of **30%** — so at most three diamonds can be spent this way, however many the test produced. Any others may still be rolled for masterwork.

Fast crafting is available to **every** craft, whether or not that trade's own entry mentions it. Only time is bought: the materials cost what they cost, and the article is otherwise exactly what the result ladder says it is.

# Repair {#craft-repair}

An article that has lost quality can have it put back. The test is a Success Value test of the same skill that would have made the article.

**In the field**, an article reduced by **only one** point of quality can be repaired without a workshop: the test is made **without Secondary Modifiers** and takes **10% of the article's listed crafting time**, at no cost in materials. **A Success Value of 1 or better restores the lost point.** Field repair therefore almost always works, and is limited by the hours it takes rather than by the roll.

**In a workshop**, the same test is made at **+2 SV**, and the quality restored is worked out through the [[#masterwork|masterwork]] steps above — never exceeding the article's undamaged rating.
