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
 * Deterministic dice (#598): `SimpleRoll.forceValues(...)` seeds a process-wide
 * FIFO queue of die values that `SimpleRoll.roll()` consumes instead of
 * `Math.random`. This lets an e2e drive an RNG-gated outcome that lives deep in
 * the logic layer — here a real skill success test — without reaching the roll
 * instance. Reached in the game realm via `sohl.entity.roll.SimpleRoll`.
 *
 * Hygiene mirrors the harness rule: a leftover forced value would leak into the
 * next roll, so `clearForced()` runs in `afterEach`.
 */

describe("Deterministic dice via SimpleRoll.forceValues (#598)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    it("a forced d100 drives a real skill success test — the value flips the outcome", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const s = win.game.actors.get(actor.id).items.get(skill.id);
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                    const test = async (forced) => {
                        // Each test builds a fresh unrolled d100, so forcing right
                        // before it drives that roll.
                        SimpleRoll.forceValues(forced);
                        const result = await s.logic.executeAction(
                            "successTest",
                            { skipDialog: true, scope: {} },
                        );
                        return {
                            rollTotal: result?.roll?.total ?? null,
                            isSuccess: result?.isSuccess ?? null,
                        };
                    };
                    // 5 ≤ ML 50 → success; 100 > ML 50 → failure. Rules-agnostic:
                    // the forced value alone determines the outcome.
                    const low = await test(5);
                    const high = await test(100);
                    return { low, high, remaining: SimpleRoll.forcedRemaining };
                }).should((r) => {
                    expect(r.low.rollTotal, "forced 5 drove the roll").to.eq(5);
                    expect(r.low.isSuccess, "5 ≤ ML 50 → success").to.be.true;
                    expect(r.high.rollTotal, "forced 100 drove the roll").to.eq(
                        100,
                    );
                    expect(r.high.isSuccess, "100 > ML 50 → failure").to.be
                        .false;
                    expect(
                        r.remaining,
                        "both forced values were consumed",
                    ).to.eq(0);
                });
            });
        });
    });

    it("without forcing, the same test rolls a random (in-range) d100", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const s = win.game.actors.get(actor.id).items.get(skill.id);
                    const result = await s.logic.executeAction("successTest", {
                        skipDialog: true,
                        scope: {},
                    });
                    return result?.roll?.total ?? null;
                }).should((total) => {
                    expect(total, "a real d100 in range").to.be.within(1, 100);
                });
            });
        });
    });
});
