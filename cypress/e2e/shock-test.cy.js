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
 * The general **Shock Test** action (#850), end to end in a real Foundry. Shock
 * is a general primitive: a caller supplies a base Shock State Index (SSI) and
 * the action rolls the Shock skill, maps the result to a shock state, and OFFERS
 * to set it (worsen-only). Applying it toggles the real Stunned / Incapacitated /
 * Unconscious / Dead status effects.
 *
 * The dialogs are pre-answered here (`skipDialog` + `scope.applyShockState` /
 * `scope.schedule`) so the headless run never hangs on a consent dialog; the
 * roll → SSI → state mapping and the interactive dialogs are unit covered
 * (`tests/actor/Being.test.ts`, `tests/actor/shock.test.ts`). This spec proves
 * the runtime wiring: the action sets the actual shock status on a real actor.
 */

describe("Shock Test action (#850)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // NONE=0, STUNNED=1, INCAPACITATED=2, UNCONSCIOUS=3, DEAD=4.
    const base = (scope) => ({
        skipDialog: true,
        scope: { schedule: false, ...scope },
    });

    it("a base SSI above 10 sets the being to Dead without a roll", () => {
        cy.createActor("being", { name: "ssi-dead" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const result = await a.logic.shockTest(
                    win.structuredClone(base({ shockIndex: 11, applyShockState: true })),
                );
                return { state: a.logic.shockState, rolled: result != null };
            }).should("deep.equal", { state: 4, rolled: false });
        });
    });

    it("a base SSI below 5 leaves the being in No Shock", () => {
        cy.createActor("being", { name: "ssi-none" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                await a.logic.shockTest(
                    win.structuredClone(base({ shockIndex: 4, applyShockState: true })),
                );
                return a.logic.shockState;
            }).should("eq", 0);
        });
    });

    it("declining the offer leaves the state unchanged", () => {
        cy.createActor("being", { name: "ssi-decline" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                await a.logic.shockTest(
                    win.structuredClone(base({ shockIndex: 11, applyShockState: false })),
                );
                return a.logic.shockState;
            }).should("eq", 0);
        });
    });

    it("worsen-only: a low result never lowers an already-worse state", () => {
        cy.createActor("being", { name: "ssi-worsen" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                await a.logic.setShockState(3); // UNCONSCIOUS
                await a.logic.shockTest(
                    win.structuredClone(
                        // Base < 5 → No Shock; max(Unconscious, None) = Unconscious.
                        base({ shockIndex: 4, applyShockState: true }),
                    ),
                );
                return a.logic.shockState;
            }).should("eq", 3);
        });
    });
});
