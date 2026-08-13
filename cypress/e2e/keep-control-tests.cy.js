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
 * from a `resultDescTable` supplied in scope.
 *
 * Basic Folk ships the `agl` and `dex` attributes and no `acro` / `lgdm` skill,
 * so a created skill placed above/below the attribute's own mastery level pins
 * which ability wins — proving the better-of selection in both directions. The
 * attribute's ML is read off the actor rather than hard-coded, because it tracks
 * the compendium's attribute scores and content moves them (#1271). A forced
 * d100 (`SimpleRoll.forceValues`) drives the pass/fail outcome deterministically;
 * the bespoke result label is read off the returned result. `skipDialog`
 * pre-answers the pre-roll dialog so the headless run never hangs.
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

    /**
     * Read an attribute's derived mastery-level base off the actor. The value
     * follows the compendium's attribute score, which content changes move, so
     * the specs pin the better-of selection rule and not a content number.
     *
     * @param {object} actor - the imported Basic Folk actor.
     * @param {string} shortcode - the attribute's shortcode (`"agl"`, `"dex"`).
     */
    function attrMasteryBase(actor, shortcode) {
        return cy.foundry((win) => {
            const a = win.game.actors.get(actor.id);
            const attr = a.items.find(
                (i) =>
                    i.type === "attribute" && i.system.shortcode === shortcode,
            );
            if (!attr)
                throw new Error(`No '${shortcode}' attribute on ${a.name}`);
            return attr.logic.masteryLevel.base;
        });
    }

    it("Stumble rolls the better ability (Acrobatics beats Agility) and posts keep-footing cards", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            attrMasteryBase(actor, "agl").then((agl) => {
                const acro = agl + 10;
                cy.createItemOn(actor, "skill", {
                    name: "Acrobatics",
                    system: { shortcode: "acro", masteryLevelBase: acro },
                });
                cy.prepare(actor);
                runBothOutcomes(actor, "stumbleTest").should((r) => {
                    expect(
                        r.winnerBase,
                        `Acrobatics (${acro}) beat Agility (${agl})`,
                    ).to.eq(acro);
                    expect(r.succIsSuccess).to.be.true;
                    expect(["Keeps Footing", "Sure-Footed"]).to.include(
                        r.succText,
                    );
                    expect(r.failIsSuccess).to.be.false;
                    expect(["Stumbles", "Falls Hard"]).to.include(r.failText);
                });
            });
        });
    });

    it("Stumble falls back to Agility when Acrobatics is the weaker ability", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            attrMasteryBase(actor, "agl").then((agl) => {
                const acro = agl - 10;
                cy.createItemOn(actor, "skill", {
                    name: "Acrobatics",
                    system: { shortcode: "acro", masteryLevelBase: acro },
                });
                cy.prepare(actor);
                runBothOutcomes(actor, "stumbleTest").should((r) => {
                    expect(
                        r.winnerBase,
                        `Agility (${agl}) beat Acrobatics (${acro})`,
                    ).to.eq(agl);
                    expect(["Keeps Footing", "Sure-Footed"]).to.include(
                        r.succText,
                    );
                });
            });
        });
    });

    it("Fumble rolls the better of Dexterity and Legerdemain and posts keep-grip cards", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            attrMasteryBase(actor, "dex").then((dex) => {
                const lgdm = dex + 15;
                cy.createItemOn(actor, "skill", {
                    name: "Legerdemain",
                    system: { shortcode: "lgdm", masteryLevelBase: lgdm },
                });
                cy.prepare(actor);
                runBothOutcomes(actor, "fumbleTest").should((r) => {
                    expect(
                        r.winnerBase,
                        `Legerdemain (${lgdm}) beat Dexterity (${dex})`,
                    ).to.eq(lgdm);
                    expect(r.succIsSuccess).to.be.true;
                    expect(["Keeps Grip", "Sure-Handed"]).to.include(
                        r.succText,
                    );
                    expect(r.failIsSuccess).to.be.false;
                    expect(["Fumbles", "Drops It"]).to.include(r.failText);
                });
            });
        });
    });
});
