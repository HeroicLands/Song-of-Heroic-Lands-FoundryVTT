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
 * Keep-control tests (#851 Stumble / #852 Fumble). Each is a "keep control of
 * your body" success test a combat mishap can flag: Stumble rolls the better of
 * Agility / Acrobatics, Fumble the better of Dexterity / Legerdemain, and each
 * posts a result card whose bespoke text ("Keeps Footing", "Drops It", …) comes
 * from a `successStarTable` supplied in scope.
 *
 * Basic Folk ships the `agl` and `dex` attributes (score 10 → ML 50) and no
 * `acro` / `lgdm` skill, so a created skill above/below ML 50 pins which ability
 * wins — proving the better-of selection in both directions. A forced d100
 * (`SimpleRoll.forceValues`) drives the pass/fail outcome deterministically; the
 * bespoke result label is read off the returned result. `skipDialog` pre-answers
 * the pre-roll dialog so the headless run never hangs.
 */

describe("Keep-control tests — Stumble & Fumble (#851, #852)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    /**
     * Run a keep-control action on `actor` twice — a forced-low (success) and a
     * forced-high (failure) d100 — and return the two results' winning mastery
     * base, success flag, and bespoke result label.
     */
    function runBothOutcomes(actor, action) {
        return cy.foundry(async (win) => {
            const a = win.game.actors.get(actor.id);
            const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
            const mkCtx = () => {
                const c = a.logic._getContext();
                c.skipDialog = true; // pre-answer the pre-roll dialog
                c.scope = {};
                return c;
            };
            SimpleRoll.forceValues(1); // 1 ≤ ML → success
            const succ = await a.logic.executeAction(action, mkCtx());
            SimpleRoll.forceValues(100); // 100 > ML → failure
            const fail = await a.logic.executeAction(action, mkCtx());
            return {
                winnerBase: succ?.masteryLevelModifier?.base ?? null,
                succIsSuccess: succ?.isSuccess ?? null,
                succText: succ?.resultText ?? null,
                failIsSuccess: fail?.isSuccess ?? null,
                failText: fail?.resultText ?? null,
            };
        });
    }

    it("Stumble rolls the better ability (Acrobatics beats Agility) and posts keep-footing cards", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Acrobatics",
                system: { shortcode: "acro", masteryLevelBase: 60 },
            });
            cy.prepare(actor);
            runBothOutcomes(actor, "stumbleTest").should((r) => {
                expect(r.winnerBase, "Acrobatics (60) beat Agility (50)").to.eq(
                    60,
                );
                expect(r.succIsSuccess).to.be.true;
                expect(["Keeps Footing", "Sure-Footed"]).to.include(r.succText);
                expect(r.failIsSuccess).to.be.false;
                expect(["Stumbles", "Falls Hard"]).to.include(r.failText);
            });
        });
    });

    it("Stumble falls back to Agility when Acrobatics is the weaker ability", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Acrobatics",
                system: { shortcode: "acro", masteryLevelBase: 40 },
            });
            cy.prepare(actor);
            runBothOutcomes(actor, "stumbleTest").should((r) => {
                expect(r.winnerBase, "Agility (50) beat Acrobatics (40)").to.eq(
                    50,
                );
                expect(["Keeps Footing", "Sure-Footed"]).to.include(r.succText);
            });
        });
    });

    it("Fumble rolls the better of Dexterity and Legerdemain and posts keep-grip cards", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Legerdemain",
                system: { shortcode: "lgdm", masteryLevelBase: 65 },
            });
            cy.prepare(actor);
            runBothOutcomes(actor, "fumbleTest").should((r) => {
                expect(
                    r.winnerBase,
                    "Legerdemain (65) beat Dexterity (50)",
                ).to.eq(65);
                expect(r.succIsSuccess).to.be.true;
                expect(["Keeps Grip", "Sure-Handed"]).to.include(r.succText);
                expect(r.failIsSuccess).to.be.false;
                expect(["Fumbles", "Drops It"]).to.include(r.failText);
            });
        });
    });
});
