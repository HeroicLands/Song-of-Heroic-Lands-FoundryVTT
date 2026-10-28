---
shortcode: weaponadjudication
name: {full: Weapon Crew and Ammunition Guidance}
type: doc
subType: howto
description: "Authoring descriptive crew requirements and GM-adjudicated ammunition recovery."
tags: [dev-content-creator]
data: {pack: none}
sohl: {kbcat: devdocs}
---

## Weapon crew requirements

State a weapon's crew requirement in its description, including the operator in the total. The [[doc-strkmds#crewed-weapons|Crewed Weapons]] table records the siege engines' counts. Crew selection, eligibility, location, participation and action expenditure are GM-adjudicated. Author no automatic crew checks or action costs.

`minParts` describes a single wielder's grip. Do not encode a multi-person crew in this field: its reader checks the body parts holding one weapon. Crew requirements introduce no data-model field or runtime availability gate.

## Spent ammunition

Use the [[doc-msslattc#spent-ammunition|Spent Ammunition]] outcomes as GM guidance. Head type and target material can inform the ruling without numeric modifiers; arrows and bolts share the same recovery and maintenance rules. Do not infer recovery or durability changes from firing a projectile.

Keep [[skill-fltch#crafting|Fletching]] maintenance and re-making distinct. Maintenance restores a dozen damaged shafts in about two hours without materials; broken shafts use the listed bench time. Neither rule creates an automatic repair or inventory mutation.
