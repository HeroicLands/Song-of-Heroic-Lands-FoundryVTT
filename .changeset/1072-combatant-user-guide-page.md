---
"sohl": patch
---

**Docs: a Combatant page in the User Guide, documenting its Intrinsic Actions**

The combat tracker's row is a **Combatant**, and it carries actions no other page
described — a player who right-clicked a row, or met a defense button on an attack
card, had nothing to read. A new `User_Guide/Combatant.md` covers them:

- **The combatant row** — the group and computed-move chips, the **Move Factor** and
  **Tracker Medium** settings on the combatant configuration sheet, and how a
  combatant is first placed in a group from the actor's **Default Combat Group**.
- **Automated Combat** (`automatedCombatStart`) and **Move to Group…**
  (`moveToGroup`) — each with its shortcode, icon, API link, how it is invoked, what
  it asks for, what it does, and when it refuses. The Move to Group dialog's
  **Group** and **New group name** fields are described field by field.
- **The four defense responses** (`automatedBlockResume`, `automatedDodgeResume`,
  `automatedCounterstrikeResume`, `automatedIgnoreResume`) — documented and flagged
  as _hidden_: they are offered only as buttons on the defender's attack card, never
  in the Actions context menu, and each is gated on what that character can do.

**Combat Basics** gains the matching detail and links back: the attack dialog's
**Aim** and **Additional Modifier** fields, what the attack card and the result card
show (including the per-side **Calculate … Injury** buttons), and the corrected way
to start an automated attack — right-click the attacker's tracker row.

Automated Combat remains outside the frozen Being-centric beta path; the page says
so, and notes the two gaps found while writing it (#1079, #1080).

Closes #1072
