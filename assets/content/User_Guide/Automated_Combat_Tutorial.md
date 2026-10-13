---
shortcode: automatedcombatframing
name: {full: The Ambush on the Path, aliases: []}
type: doc
subType: userguide
tags: [tutorial, guide-combat-basics]
data: {pack: journals}
sohl: {kbcat: userguide}
---

# The Ambush on the Path

For the guided walkthrough, launch the tour directly from **Tour Management**
as described below, in a world where this tutorial has not been imported
manually. The tour handles its own import. The following manual setup is for
exploring the scene yourself.

In Foundry, open the Compendium Directory, expand **Tutorial Adventures**, select **Automated Combat Tutorial**, and choose **Import Adventure**. This adds two actors, the path scene, and both journals to your world. Open the scene when ready; it has no active encounter, so the referee can start combat.

A traveler walks along a quiet path when a grukar-uk steps out to block the way. The two opponents are now close enough to fight. The encounter is ready for a referee to start combat and demonstrate the system's attack and defense sequence.

# Guided Automated Combat

The **Automated Combat** guided tour is for the GM. Launch it from **Tour
Management**. It imports the tutorial and activates the path, then walks through
two exchanges. You play both the traveler and the grukar-uk on one screen; in a
normal game, each player controls only their own combatant.

The walkthrough teaches the **Automated Attack** macro in hotbar slot 1, starting
combat, and targeting the opposing token. An automated attack requires the
active combatant, ownership of that combatant, and exactly one target. The tour
provides a known sequence: the human's attack is stopped by Block, then the
orc's attack gets through and causes an **S2** injury on the human.

Impact is calculated automatically when an attack gets through. The defender
then uses **Calculate Injury**, which takes location and armour into account.
Check **create injury on character sheet** in the injury dialog so the tutorial
records the wound regardless of the world's normal setting. The GM can see and
operate both sides' controls during this lesson.

**Assisted Combat** leaves adjudication to the players: its independent rolls
can be used without a started encounter or a target. **Automated Combat** drives
the attack, defense, impact, and injury sequence using tokens and turn order.

The tour's rolls are reproducible while it runs. Completion or leaving the tour
restores the random stream so ordinary play resumes normally. Imported tutorial
documents and the recorded injury remain in the world for you to inspect.

Restarting the tour resets only its own imported tutorial documents and
encounter. Use a separate scene for ordinary play, and keep the tutorial
encounter selected while following its steps.
