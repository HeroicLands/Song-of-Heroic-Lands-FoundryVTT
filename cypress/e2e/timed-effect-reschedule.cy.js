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
 * Offer-to-reschedule (#579): after a recurring timed effect is performed it does
 * NOT auto-re-arm — it OFFERS the next occurrence. Proven end to end against real
 * Foundry two ways, matching the two sanctioned ways to answer a consent dialog:
 *
 * 1. **Headless, via the schedule scope (`scope.schedule`)** — the right tool when
 *    the offer is incidental to what a spec is setting up:
 *    - **accept** → the next healing check is armed on the generic
 *      `scheduledActions` store, and the run record (`system.lastRun.healingCheck`)
 *      is stamped;
 *    - **decline** → the schedule is cleared, but the record survives (so "when was
 *      my last healing test?" is still answerable, #356).
 * 2. **By pressing the real dialog button** (`cy.submitDialog`) — modelling the
 *    player, for when the offer itself is the subject under test: clicking
 *    **Schedule** on the offer is what arms the check.
 */

describe("Timed-effect reschedule (#579)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("accept re-arms + records the check; decline clears the schedule but keeps the record", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // A treated wound. _preCreate seeds a healingCheck schedule on the
                // generic store (anchor = creation world time), so it arrives armed.
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
                            },
                        },
                    ]),
                );
                const woundId = created.find((i) => i.type === "trauma").id;
                const uuid = a.items.get(woundId).uuid;

                // Advance to before the first scheduled check, so performing runs
                // NO healing test (level stays 3) — this isolates the scheduling.
                await win.game.time.advance(100);

                const snap = () => {
                    const sys = a.items.get(woundId).system;
                    return {
                        scheduled: win.sohl.events.isScheduled(
                            uuid,
                            "healingCheck",
                        ),
                        // The generic run record (system.lastRun), stamped at the
                        // action chokepoint — not a bespoke field.
                        record: sys.lastRun?.healingCheck,
                        entries: (sys.scheduledActions || []).filter(
                            (e) => e.actionName === "healingCheck",
                        ).length,
                    };
                };

                // ACCEPT the reschedule — driven through the action chokepoint
                // (executeAction) so the run record is stamped, headless via scope.
                await a.items.get(woundId).logic.executeAction("healingCheck", {
                    skipDialog: true,
                    scope: { schedule: true },
                });
                const afterAccept = snap();

                // DECLINE the reschedule.
                await a.items.get(woundId).logic.executeAction("healingCheck", {
                    skipDialog: true,
                    scope: { schedule: false },
                });
                const afterDecline = snap();

                return { afterAccept, afterDecline };
            }).should((r) => {
                // Accept: the next check is armed and the record is stamped.
                expect(r.afterAccept.scheduled, "accept re-arms the check").to
                    .be.true;
                expect(
                    r.afterAccept.entries,
                    "accept keeps one store entry",
                ).to.eq(1);
                expect(
                    r.afterAccept.record,
                    "accept stamps the last-check record",
                ).to.be.a("number");
                // Decline: the schedule is cleared, but the record survives.
                expect(r.afterDecline.scheduled, "decline clears the schedule")
                    .to.be.false;
                expect(
                    r.afterDecline.entries,
                    "decline removes the store entry",
                ).to.eq(0);
                expect(
                    r.afterDecline.record,
                    "decline keeps the last-check record",
                ).to.be.a("number");
            });
        });
    });

    // The test above drives the offer headlessly through `scope.schedule` — the
    // right tool for setup. This one instead presses the REAL dialog button, the
    // way a player does, to prove the button choice (not a scripted scope) is what
    // drives the outcome. It is the pattern the testing doc recommends when the
    // offer itself is the thing under test: model the user, don't pre-answer.
    it("pressing Schedule on the offer arms the next check (models the player, #579)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                // A bare wound: the healing check is NOT auto-armed — it is
                // offered. So it starts with no healingCheck entry, and we can
                // prove that pressing Schedule is what arms it.
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
                            },
                        },
                    ]),
                );
                const wound = created.find((i) => i.type === "trauma");
                await win.game.time.advance(100);
                win.__uuid = wound.uuid;
                win.__woundId = wound.id;
                win.__entriesBefore = (
                    wound.system.scheduledActions || []
                ).filter((e) => e.actionName === "healingCheck").length;
                // Perform WITHOUT skipDialog so the real offer dialog opens; stash
                // the promise so we can await the flow after the button press.
                win.__perf = wound.logic.executeAction("healingCheck", {});
                return null;
            });
            // Model the player: click the actual "Schedule" button.
            cy.submitDialog("yes");
            cy.foundry((win) =>
                win.__perf.then(() => {
                    const sys = win.game.actors
                        .get(actor.id)
                        .items.get(win.__woundId).system;
                    return {
                        entriesBefore: win.__entriesBefore,
                        entriesAfter: (sys.scheduledActions || []).filter(
                            (e) => e.actionName === "healingCheck",
                        ).length,
                        armedAfter: win.sohl.events.isScheduled(
                            win.__uuid,
                            "healingCheck",
                        ),
                    };
                }),
            ).should((r) => {
                expect(
                    r.entriesBefore,
                    "healing check is offered, not auto-armed",
                ).to.eq(0);
                expect(
                    r.entriesAfter,
                    "pressing Schedule adds the store entry",
                ).to.eq(1);
                expect(r.armedAfter, "pressing Schedule arms the healing check")
                    .to.be.true;
            });
        });
    });
});
