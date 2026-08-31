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
 * Affliction onset creation offer (#602, closing out #579): catching an
 * affliction no longer auto-arms its onset check — `BeingLogic.contagionTest`
 * OFFERS it. This spec is **about the offer**, so it presses the real dialog
 * button.
 *
 * The full contraction flow is a three-dialog chain, driven here end to end:
 *   1. the Contagion Test dialog (affliction dropdown keyed by shortcode, plus
 *      the modifiers and the record-on-sheet checkbox);
 *   2. the success-test pre-roll dialog — the contagion d100 is forced to 100 via
 *      `SimpleRoll.forceValues` (#598) so the roll FAILS and the affliction is
 *      contracted deterministically;
 *   3. the onset offer ("Set an Affliction Onset Reminder?") — pressed by content
 *      via `cy.submitDialogMatching`.
 *
 * Exposure itself is never rescheduled: nothing offers another contagion test.
 */

describe("Affliction onset creation offer (#602)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    function contractSeededDisease(actor, onsetAnswer) {
        // A world disease so the contagion dialog has a selectable option. The
        // dropdown is keyed by SHORTCODE, and `onsetFormula` (in days) is what
        // the test rolls for the incubation it records.
        cy.createWorldItem("affliction", {
            name: "Marsh Fever",
            system: {
                shortcode: "marshfever",
                subType: "disease",
                contagionIndexBase: 3,
                onsetFormula: "7",
                onsetDurationFormula: "604800", // 7 days
            },
        });
        cy.prepare(actor);
        cy.foundry((win) => {
            const a = win.game.actors.get(actor.id);
            // Force the contagion d100 to 100 → the roll fails → contracted.
            win.sohl.entity.roll.SimpleRoll.forceValues(100);
            win.__perf = a.logic.executeAction("contagionTest", {});
            return null;
        });
        // Three dialogs in a row, all sharing an "ok"/"yes" button, so each is
        // matched by content. The three matchers must be **disjoint**: a dialog
        // that has been submitted but not yet torn down still reports
        // `rendered === true`, so a token shared with the previous dialog can
        // press the wrong one and strand the chain. In particular "Situational
        // Modifier" appears on BOTH the Contagion Test dialog and the standard
        // pre-roll dialog — hence "Target:", which only the pre-roll has.
        cy.submitDialogMatching("Contagion Test", "ok"); // Contagion Test dialog
        cy.submitDialogMatching("Target:", "ok"); // success-test pre-roll dialog
        cy.submitDialogMatching("Affliction Onset", onsetAnswer); // the offer
    }

    it("pressing Schedule on the onset offer arms the onset check (models the player)", () => {
        cy.importActor().then((actor) => {
            contractSeededDisease(actor, "yes");
            cy.foundry((win) =>
                win.__perf.then(() => {
                    const a = win.game.actors.get(actor.id);
                    const aff = a.itemTypes.affliction.at(-1);
                    return {
                        contracted: !!aff,
                        entries:
                            aff ?
                                (aff.system.scheduledActions || []).filter(
                                    (e) => e.actionName === "onsetCheck",
                                ).length
                            :   -1,
                        armed: aff ? win.sohl.events.isScheduled(aff.uuid, "onsetCheck") : false,
                    };
                }),
            ).should((r) => {
                expect(r.contracted, "the disease was contracted").to.be.true;
                expect(r.entries, "pressing Schedule armed the onset check").to.eq(1);
                expect(r.armed, "the onset check is live on the queue").to.be.true;
            });
        });
    });

    it("pressing Not Now on the onset offer leaves it unarmed (models the player)", () => {
        cy.importActor().then((actor) => {
            contractSeededDisease(actor, "no");
            cy.foundry((win) =>
                win.__perf.then(() => {
                    const a = win.game.actors.get(actor.id);
                    const aff = a.itemTypes.affliction.at(-1);
                    return {
                        contracted: !!aff,
                        entries:
                            aff ?
                                (aff.system.scheduledActions || []).filter(
                                    (e) => e.actionName === "onsetCheck",
                                ).length
                            :   -1,
                        armed: aff ? win.sohl.events.isScheduled(aff.uuid, "onsetCheck") : false,
                    };
                }),
            ).should((r) => {
                // Declining the schedule does not undo the contraction.
                expect(r.contracted, "the disease was still contracted").to.be.true;
                expect(r.entries, "declining leaves no onset store entry").to.eq(0);
                expect(r.armed, "declining does not arm the onset check").to.be.false;
            });
        });
    });
});
