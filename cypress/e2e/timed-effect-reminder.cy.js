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
 * Timed-effect consent (#579): when a scheduled effect comes due, the event
 * queue posts a [Perform] reminder card — it does NOT perform the effect. Proven
 * end to end: a treated wound with a scheduled healing check, world time advanced
 * well past the check → a reminder card appears with a [Perform] button addressed
 * to the wound, and the wound's level is unchanged (nothing auto-healed).
 */

describe("Timed-effect reminder", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("a due healing check posts a [Perform] reminder instead of auto-healing", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // A treated injury with a scheduled healing check (anchor day 0,
                // 100s interval) — finalize arms it on prep.
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
                                lastHealingCheckDate: 0,
                                healingCheckDurationBase: 100,
                                healingCheckDurationFormula: "100",
                            },
                        },
                    ]),
                );
                const wound = created.find((i) => i.type === "trauma");

                const beforeCount = win.game.messages.size;
                const beforeLevel = a.items.get(wound.id).system.levelBase;

                // Advance world time well past the scheduled check.
                await win.sohl.events.fire({
                    name: "updateWorldTime",
                    worldTime: 1_000_000,
                });

                const msg = win.game.messages.contents.at(-1);
                const div = win.document.createElement("div");
                div.innerHTML = msg?.content ?? "";
                const btn = div.querySelector(
                    'button.action-card-button[data-action="healingCheck"]',
                );

                return {
                    cardsPosted: win.game.messages.size - beforeCount,
                    hasPerformButton: !!btn,
                    handlerUuid: btn?.dataset.handlerUuid,
                    woundUuid: wound.uuid,
                    beforeLevel,
                    afterLevel: a.items.get(wound.id).system.levelBase,
                };
            }).should((r) => {
                expect(r.cardsPosted, "a reminder card was posted").to.be.gte(
                    1,
                );
                expect(r.hasPerformButton, "it has a [Perform] button").to.be
                    .true;
                // The button is addressed to the wound (so its owner performs it).
                expect(r.handlerUuid, "addressed to the wound item").to.eq(
                    r.woundUuid,
                );
                // Nothing auto-healed — the level is unchanged until performed.
                expect(r.afterLevel, "wound not auto-modified").to.eq(
                    r.beforeLevel,
                );
            });
        });
    });
});
