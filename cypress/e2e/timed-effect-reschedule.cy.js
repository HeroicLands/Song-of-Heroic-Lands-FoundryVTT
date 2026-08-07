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
 * Offer-to-reschedule (#579) under the **Check/Test** split (#1181): a recurring
 * timed effect never auto-re-arms. The cycle has two halves, and only the second
 * one schedules anything:
 *
 * - a **`*Check`** _offers and does nothing else_ — it posts a card whose button
 *   invites the wound's controller to perform one test. No roll, no change, and
 *   **no schedule** (so a check firing cannot re-arm itself behind the player);
 * - a **`*Test`** _acts_ — it performs the effect and then OFFERS the next
 *   occurrence, anchored on the due time of the occurrence it just answered.
 *
 * Proven end to end against real Foundry, matching the two sanctioned ways to
 * answer a consent dialog:
 *
 * 1. **Headless, via the schedule scope (`scope.schedule`)** — the right tool when
 *    the offer is incidental to what a spec is setting up:
 *    - **accept** → the next healing check is armed on the generic
 *      `scheduledActions` store;
 *    - **decline** → the schedule is cleared, but the run record survives, so
 *      "when did this last happen?" is still answerable (#356).
 *
 * The record follows the **act**: `system.lastRun` is stamped by the test that
 * performed, never by the check that merely offered (#1192).
 * 2. **By pressing the real dialog button** (`cy.submitDialog`) — modelling the
 *    player, for when the offer itself is the subject under test: clicking
 *    **Schedule** on the test's offer is what arms the next check.
 */

describe("Timed-effect reschedule (#579)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /**
     * A treated wound on `actorId`, created directly so no action (and no offer)
     * runs. `_preCreate` seeds the healingCheck schedule, so it arrives armed.
     * @param win - The game window.
     * @param actorId - The owning actor's id.
     * @returns The created trauma item.
     */
    async function makeWound(win, actorId) {
        const created = await win.game.actors
            .get(actorId)
            .createEmbeddedDocuments(
                "Item",
                win.structuredClone([
                    {
                        type: "trauma",
                        name: "Wound",
                        system: {
                            subType: "injury",
                            levelBase: 3,
                            healingRateBase: 4,
                            treatmentDate: 0,
                        },
                    },
                ]),
            );
        return created.find((i) => i.type === "trauma");
    }

    it("the check only offers; the test re-arms on accept and clears on decline", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const wound = await makeWound(win, actor.id);
                const woundId = wound.id;
                const uuid = wound.uuid;

                // Advance to before the first scheduled check, so nothing the
                // queue does interferes — this isolates the scheduling.
                await win.game.time.advance(100);

                const snap = () => {
                    const sys = a.items.get(woundId).system;
                    return {
                        scheduled: win.sohl.events.isScheduled(
                            uuid,
                            "healingCheck",
                        ),
                        // The generic run record (system.lastRun), stamped at
                        // the action chokepoint — not a bespoke field. It
                        // follows the ACT, so the test's shortcode carries it
                        // and the check's never appears (#1192).
                        record: sys.lastRun?.healingtest,
                        checkRecord: sys.lastRun?.healingCheck,
                        entries: (sys.scheduledActions || []).filter(
                            (e) => e.actionName === "healingCheck",
                        ).length,
                        level: sys.levelBase,
                    };
                };
                const before = snap();

                // THE CHECK: offers only. It posts a card and stops — no
                // roll, no healing, no schedule, and no run record (an offer
                // nobody answered is not a performance).
                await a.items.get(woundId).logic.executeAction("healingCheck", {
                    skipDialog: true,
                });
                const afterCheck = snap();

                // THE TEST, ACCEPTING the next occurrence — driven through the
                // action chokepoint (executeAction), headless via scope.
                // A forced low die keeps the outcome a success, so the wound
                // heals rather than risking the critical-failure infection path
                // (which would post a second, unrelated offer).
                win.sohl.entity.roll.SimpleRoll.forceValues(5);
                await a.items.get(woundId).logic.executeAction("healingtest", {
                    skipDialog: true,
                    scope: { schedule: true },
                });
                win.sohl.entity.roll.SimpleRoll.clearForced();
                const afterAccept = snap();

                // THE TEST, DECLINING the next occurrence.
                win.sohl.entity.roll.SimpleRoll.forceValues(5);
                await a.items.get(woundId).logic.executeAction("healingtest", {
                    skipDialog: true,
                    scope: { schedule: false },
                });
                win.sohl.entity.roll.SimpleRoll.clearForced();
                const afterDecline = snap();

                return { before, afterCheck, afterAccept, afterDecline };
            }).should((r) => {
                // The check offers and does nothing else (#1181).
                expect(
                    r.afterCheck.entries,
                    "the check leaves the schedule alone",
                ).to.eq(r.before.entries);
                expect(r.afterCheck.level, "the check heals nothing").to.eq(
                    r.before.level,
                );
                expect(
                    r.afterCheck.checkRecord,
                    "the check stamps no run record — it only offers",
                ).to.be.undefined;
                expect(
                    r.afterCheck.record,
                    "no test has run yet, so there is no run record",
                ).to.be.undefined;

                // Accept: the next check is armed.
                expect(r.afterAccept.scheduled, "accept re-arms the check").to
                    .be.true;
                expect(
                    r.afterAccept.entries,
                    "accept keeps one store entry",
                ).to.eq(1);
                expect(
                    r.afterAccept.record,
                    "the test stamps the run record",
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
                    "decline keeps the run record",
                ).to.be.a("number");
            });
        });
    });

    // The test above drives the offer headlessly through `scope.schedule` — the
    // right tool for setup. This one instead presses the REAL dialog button, the
    // way a player does, to prove the button choice (not a scripted scope) is what
    // drives the outcome. It is the pattern the testing doc recommends when the
    // offer itself is the thing under test: model the user, don't pre-answer.
    it("pressing Schedule on the test's offer arms the next check (models the player, #579)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const wound = await makeWound(win, actor.id);
                await win.game.time.advance(100);
                win.__uuid = wound.uuid;
                win.__woundId = wound.id;

                // Clear the seeded schedule so the only thing that can arm the
                // next check is the button press under test.
                await win.sohl.unschedule(wound, "healingCheck");
                win.__entriesBefore = (
                    a.items.get(wound.id).system.scheduledActions || []
                ).filter((e) => e.actionName === "healingCheck").length;

                // Perform the TEST WITHOUT skipDialog so the real offer dialog
                // opens; stash the promise so we can await the flow after the
                // button press. The forced die keeps the roll a success, so no
                // second (infection) offer competes with this one.
                win.sohl.entity.roll.SimpleRoll.forceValues(5);
                win.__perf = a.items
                    .get(wound.id)
                    .logic.executeAction("healingtest", {});
                return null;
            });
            // Model the player: click the actual "Schedule" button.
            cy.submitDialog("yes");
            cy.foundry((win) =>
                win.__perf.then(() => {
                    win.sohl.entity.roll.SimpleRoll.clearForced();
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
                    "the next check is offered, not auto-armed",
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
