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
 * Mysteries — the `useMystery` intrinsic action.
 *
 * `MysteryLogic` registers a `useMystery` intrinsic action (GREEN: it is present
 * on the item's logic), but the executor and the mystical-ability "perform" flow
 * are not fully wired (RED against #72 Use Mystery / #74 Mystical Ability
 * perform).
 */

describe("mysteries", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // GREEN: a mystery item registers the `useMystery` intrinsic action.
    it("a mystery item registers the useMystery intrinsic action", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "mystery", { name: "Second Sight" }).then(
                (item) => {
                    cy.foundry((win) => {
                        const it = win.game.actors
                            .get(actor.id)
                            .items.get(item.id);
                        return {
                            type: it?.type,
                            hasUseMystery:
                                !!it?.logic?.actions?.get("useMystery"),
                        };
                    }).should((r) => {
                        expect(r.type, "mystery item").to.eq("mystery");
                        expect(r.hasUseMystery, "useMystery action registered")
                            .to.be.true;
                    });
                },
            );
        });
    });

    // RED — blocked by #72 (Use Mystery action) / #74 (Mystical Ability perform):
    // the useMystery executor and the mystical-ability perform flow are not fully
    // implemented. Un-skip and assert the produced effect / chat card once wired.
    it.skip("useMystery performs the mystery's effect (#72, #74)", () => {});
    it.skip("a mystical ability performs its effect (#74)", () => {});
});
