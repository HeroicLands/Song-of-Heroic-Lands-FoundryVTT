/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Corpus movement-profile paradigm (#365): the compendium Human Folk corpus is
 * authored in the new expression-driven format — per-medium `movementProfiles`,
 * a `personalFatigue` expression, and a `weight` (base | calc-of-str). This
 * confirms it imports and validates under the new DataModel, that `moveBase`
 * mirrors the terrestrial profile's `feetPerRound`, and that
 * `CorpusLogic.baseWeight` evaluates `weight.calc` against the being's `str`.
 */
describe("Corpus movement-profile format (#365)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("Human Folk imports and derives from the new format", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const lin = a.itemTypes.corpus[0];
                const L = lin.logic;
                const strItem = a.itemTypes.attribute.find(
                    (i) => i.system.shortcode === "str",
                );
                const profile = L.data.movementProfiles[0] ?? {};
                return {
                    hasCorpus: !!lin,
                    moveTerrestrial: L.data.moveBase.terrestrial,
                    profileCount: L.data.movementProfiles.length,
                    profileMedium: profile.medium,
                    profileFeetPerRound: profile.feetPerRound,
                    profileEncumbrance: profile.encumbrance,
                    profileStrMod: profile.strMod,
                    personalFatigue: L.data.personalFatigue,
                    bodyWeightBase: L.data.weight.base,
                    bodyWeightCalc: L.data.weight.calc,
                    baseWeight: L.weight.effective,
                    reach: L.reach.effective,
                    str: strItem?.logic.score.effective ?? null,
                };
            }).then((r) => {
                expect(r.hasCorpus, "actor has a corpus").to.be.true;
                // moveBase mirrors the terrestrial profile's feetPerRound.
                expect(r.moveTerrestrial).to.eq(50);
                expect(r.profileCount).to.eq(1);
                expect(r.profileMedium).to.eq("terrestrial");
                expect(r.profileFeetPerRound).to.eq(50);
                expect(r.profileEncumbrance).to.eq("floor(wt/4)");
                expect(r.profileStrMod).to.eq("-5 * floor((str - 10) / 2)");
                expect(r.personalFatigue).to.eq("enc + 5");
                // weight is computed (base null) from a str expression.
                expect(r.bodyWeightBase).to.eq(null);
                expect(r.bodyWeightCalc).to.eq("(9 * str) + 50");
                expect(r.str, "str resolved").to.be.a("number");
                // baseWeight = (9 * str) + 50, evaluated against the being's str.
                expect(r.baseWeight).to.eq(9 * r.str + 50);
                expect(r.reach).to.eq(0); // Human Folk (medium) has reachBase 0
            });
        });
    });
});
