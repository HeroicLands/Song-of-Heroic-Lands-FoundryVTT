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
 * Creation-time offers for the recurring timed effects (#579 / #595): a lasting
 * condition's recurring check is OFFERED when it is created, not auto-armed. Two
 * are covered here — a bleeder's **blood-loss advance** (offered as the wound is
 * inflicted) and an infection's **recovery course** (offered when a
 * critical-failure healing test contracts the infection).
 *
 * These specs are **about the offer**, so per the testing-doc rule of thumb they
 * press the REAL dialog button to model what the player now expects, rather than
 * pre-answering through a scripted `scope`. Three non-obvious facts shape how:
 *
 * 0. **RNG-gated creations are forced deterministic.** The infection only appears
 *    on a critical-failure healing test, so `SimpleRoll.forceValues(100)` (#598)
 *    drives that d100 to a critical failure — no flakiness.
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
    afterEach(() => {
        // Clear any leftover forced dice (the course test seeds one) so a stray
        // value can't leak into the next spec — see #598.
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

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

    // The recovery-course offer (#595) fires when a lasting condition is created —
    // here an INFECTION from a critical-failure healing test. That outcome is
    // RNG-gated, so this drives it deterministically with the forced-dice seam
    // (#598): forcing the healing test's d100 to 100 (a critical failure, digits
    // [0,5]) on an infectable wound contracts the infection, which then offers its
    // course check. Then we model the player pressing Schedule on that offer.
    it("a critical-failure healing test contracts an infection and offers its course check — pressing Schedule arms it (models the player)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                // A treated, infectable injury whose healing check is anchored in
                // the past, so performing it now rolls exactly one healing test.
                const created = await a.createEmbeddedDocuments(
                    "Item",
                    win.structuredClone([
                        {
                            type: "trauma",
                            name: "Wound",
                            system: {
                                subType: "physical",
                                levelBase: 3,
                                healingRateBase: 4,
                                treatmentDate: 0,
                                infectable: true,
                                scheduledActions: [
                                    {
                                        actionName: "healingCheck",
                                        anchor: 0,
                                        interval: 100,
                                    },
                                ],
                            },
                        },
                    ]),
                );
                const wound = created.find((i) => i.type === "trauma");
                await win.game.time.advance(150); // one interval elapsed → one test
                // Force that healing test's d100 to 100 — a critical failure that,
                // on an infectable wound, contracts an infection.
                win.sohl.entity.roll.SimpleRoll.forceValues(100);
                win.__perf = wound.logic.executeAction("healingCheck", {});
                return null;
            });
            // Two offers fire in order: the new infection's course check, then the
            // wound's next healing check. Answer each by content (per-effect
            // titles, #595): schedule the course (the subject), decline the
            // healing reschedule (incidental).
            cy.submitDialogMatching("Recovery Check", "yes");
            cy.submitDialogMatching("Healing Check", "no");
            cy.foundry((win) =>
                win.__perf.then(() => {
                    const a = win.game.actors.get(actor.id);
                    const infection = a.itemTypes.trauma.find(
                        (t) => t.system.subType === "infection",
                    );
                    return {
                        infectionExists: !!infection,
                        courseEntries:
                            infection ?
                                (
                                    infection.system.scheduledActions || []
                                ).filter((e) => e.actionName === "courseCheck")
                                    .length
                            :   -1,
                        courseArmed:
                            infection ?
                                win.sohl.events.isScheduled(
                                    infection.uuid,
                                    "courseCheck",
                                )
                            :   false,
                        remaining:
                            win.sohl.entity.roll.SimpleRoll.forcedRemaining,
                    };
                }),
            ).should((r) => {
                expect(
                    r.infectionExists,
                    "the critical-failure healing test contracted an infection",
                ).to.be.true;
                expect(
                    r.courseEntries,
                    "pressing Schedule armed the infection's course check",
                ).to.eq(1);
                expect(r.courseArmed, "the course check is live on the queue")
                    .to.be.true;
                expect(
                    r.remaining,
                    "the forced healing-test value was consumed",
                ).to.eq(0);
            });
        });
    });
});
