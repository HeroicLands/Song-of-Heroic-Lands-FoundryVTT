/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Creation-time offers for the recurring timed effects (#579 / #595): a bleeder's
 * **blood-loss advance** is OFFERED at creation, not auto-armed — matching the
 * healing-check offer.
 *
 * These specs are **about the offer**, so per the testing-doc rule of thumb they
 * press the REAL dialog button to model what the player now expects, rather than
 * pre-answering through a scripted `scope`. Two non-obvious facts shape how:
 *
 * 1. **Two offers fire back-to-back.** Inflicting a bleeder wound
 *    (`createTraumaFromInjury`) offers the healing check *then* the blood-loss
 *    advance. Each now carries a per-effect title ("Set a Healing Check
 *    Reminder?" / "Set a Blood Loss Advance Reminder?"), so a spec answering a
 *    specific one uses `cy.submitDialogMatching(text, action)` to wait for it by
 *    content rather than `cy.submitDialog`'s "topmost dialog".
 * 2. **The queue arms asynchronously.** The reliable "arrived scheduled" fact is
 *    the synchronously-persisted `system.scheduledActions` store entry;
 *    `isScheduled` is read only after the driving action's promise has resolved.
 */

describe("Timed-effect creation offer (#595)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    const countEntries = (win, actorId, woundId, name) =>
        (
            win.game.actors.get(actorId).items.get(woundId).system
                .scheduledActions || []
        ).filter((e) => e.actionName === name).length;

    // Inflict a guaranteed bleeder (extraBleedRisk → isBleeder) via the real
    // interactive flow, DECLINING the incidental healing-check offer so the
    // blood-loss offer is the one under test; answer blood-loss via its button.
    function inflictBleeder(actor, bloodLossAnswer) {
        cy.prepare(actor);
        cy.foundry((win) => {
            const a = win.game.actors.get(actor.id);
            const loc = a.logic.body.structure.getAllLocations()[0].shortcode;
            // No context → the real dialogs open (interactive path).
            win.__inj = a.logic.addInjuryViaDialog({
                location: loc,
                aspect: "edged",
                impact: 20,
                extraBleedRisk: true,
            });
            return null;
        });
        cy.submitDialog("ok"); // the Add-Injury form dialog
        cy.submitDialogMatching("Healing Check", "no"); // decline healing (incidental)
        cy.submitDialogMatching("Blood Loss Advance", bloodLossAnswer); // the subject
    }

    it("pressing Schedule on the blood-loss offer arms the advance check (models the player)", () => {
        cy.importActor().then((actor) => {
            inflictBleeder(actor, "yes");
            cy.foundry((win) =>
                win.__inj.then(() => {
                    const wound = win.game.actors
                        .get(actor.id)
                        .itemTypes.trauma.at(-1);
                    return {
                        entries: countEntries(
                            win,
                            actor.id,
                            wound.id,
                            "bloodLossAdvanceCheck",
                        ),
                        // Safe here: addInjuryViaDialog (and the schedule's own
                        // finalize) has resolved, so the in-memory view is settled.
                        armed: win.sohl.events.isScheduled(
                            wound.uuid,
                            "bloodLossAdvanceCheck",
                        ),
                    };
                }),
            ).should((r) => {
                expect(
                    r.entries,
                    "pressing Schedule adds the blood-loss store entry",
                ).to.eq(1);
                expect(
                    r.armed,
                    "pressing Schedule arms the blood-loss advance check",
                ).to.be.true;
            });
        });
    });

    it("pressing Not Now on the blood-loss offer leaves it unarmed (models the player)", () => {
        cy.importActor().then((actor) => {
            inflictBleeder(actor, "no");
            cy.foundry((win) =>
                win.__inj.then(() => {
                    const wound = win.game.actors
                        .get(actor.id)
                        .itemTypes.trauma.at(-1);
                    return {
                        woundExists: !!wound,
                        entries: countEntries(
                            win,
                            actor.id,
                            wound.id,
                            "bloodLossAdvanceCheck",
                        ),
                        armed: win.sohl.events.isScheduled(
                            wound.uuid,
                            "bloodLossAdvanceCheck",
                        ),
                    };
                }),
            ).should((r) => {
                // Declining the schedule does not undo the wound, only its tracking.
                expect(r.woundExists, "the bleeder wound was still recorded").to
                    .be.true;
                expect(
                    r.entries,
                    "declining leaves no blood-loss store entry",
                ).to.eq(0);
                expect(
                    r.armed,
                    "declining does not arm the blood-loss advance check",
                ).to.be.false;
            });
        });
    });
});
