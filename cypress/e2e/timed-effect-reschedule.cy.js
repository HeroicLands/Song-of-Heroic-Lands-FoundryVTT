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
 * Foundry, driven headlessly through the schedule scope (`scope.reschedule`):
 *
 * - **accept** → the next healing check is armed on the generic `scheduledActions`
 *   store, and the "last performed" record (`lastHealingCheckDate`) is stamped;
 * - **decline** → the schedule is cleared, but the record survives (so "when was
 *   my last healing test?" is still answerable, #356).
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
                        record: sys.lastHealingCheckDate,
                        entries: (sys.scheduledActions || []).filter(
                            (e) => e.actionName === "healingCheck",
                        ).length,
                    };
                };

                // ACCEPT the reschedule (headless — scope-driven, no dialog).
                await a.items.get(woundId).logic.healingCheck({
                    skipDialog: true,
                    scope: { reschedule: true },
                });
                const afterAccept = snap();

                // DECLINE the reschedule.
                await a.items.get(woundId).logic.healingCheck({
                    skipDialog: true,
                    scope: { reschedule: false },
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
});
