---
shortcode: automatedcombattour
name: {full: Automated Combat Tour, aliases: []}
type: doc
subType: reference
description: "The two-exchange Automated Combat walkthrough and its deterministic fixture contract."
tags: [dev-reference]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Automated Combat Tour

See also: [[doc-guidedtours|Guided Tours]]

`buildAutomatedCombatTour()` registers `sohl.automated-combat` through the normal
system tour registry. It is GM-only and always restarts from the beginning. The
GM plays both sides because Foundry tours run on one client.

The tour resolves the `sohl.tutorial-adventures` Adventure by its indexed name,
imports it using the existing drive primitive, then resolves the imported scene
and token actors by tutorial identities. Subsequent drive steps activate that
scene, start its two-token encounter, advance the turn, and swap targets. Missing
fixture documents fail explicitly rather than borrowing another scene or actor.

The stock Automated Attack macro must occupy hotbar slot 1. The gate checks its
exact script command, allowing localized names. The stock macro dispatches the
current combatant’s `automatedCombatStart` action through `executeAction`; the
tour supplies an explicit context for its captured encounter and defender.
Switching the active encounter stops preparation instead of attacking elsewhere. The two tutorial combatants record
Club Crush as their last attack and blocking mode through normal Combatant update
methods, giving the attack dialogs and default Block actions the intended mode.
The tutorial human has
initiative 36 against the orc's 35; initiative comes from the ordinary skill.
The start drive fills initiative before starting turn zero. Rolling after
starting would preserve the unrolled current combatant rather than choose the
first combatant in the final order.
Both tutorial bodies have reach 1 foot. With the Club’s 4-foot length, their
5-foot reach covers the adjacent tokens on the 5-foot map grid. This is fixture
calibration; ordinary combat range rules apply.

`SohlTour` owns the seeded stream lease and restores the pre-tour state on all
exit paths. Within that lease, the two exchanges use separate seeds so unrelated
setup draws cannot shift the lesson. The first demonstrates a successful attack
and Block, producing no injury offer. The second demonstrates marginal attack
success against critical defense failure and automatic impact. No Tactical
Advantage spending is performed by the tour.

The injury gate observes a newly created, actor-owned injury Trauma of level 2.
It does not create a placeholder wound or change the world's recording setting:
the user checks the recording option in the actual Resolve Injury dialog.

The focused Cypress script drives the original Adventure → encounter → both
exchanges → recorded S2 path and compares the restored RNG state with its exact
pre-tour snapshot. Seed and default-mode calibration must accompany any fixture
or combat-rule change that alters the demonstrated outcomes.

Adventure import uses its native pre-import hook to reject foreign ID collisions
and attach tutorial ownership flags before persistence. Restarts may reset only
verified tutorial-owned fixtures; a same-name foreign scene is never selected.
The encounter receives its Adventure UUID and a unique run marker in the actual
start-drive creation payload, with the captured scene UUID so a viewport
change cannot create the encounter on another scene. The creation observer only captures that marker;
it never marks a concurrently created encounter. Turn advancement resolves the
captured encounter UUID.

Preparation uses generation guards across every await. Exiting or restarting
cancels old attack-dialog observers, prevents late seeding, and prevents stale
preparation failures from terminating a newer run. Base preparation failures
restore the RNG lease before propagating the error.
