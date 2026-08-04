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
 * Birthsign astrology (#1018 / #1028) — the derived birthsign path end to end in
 * a live world: a being with a birth date plus a birthsign Affiliation (its
 * `society` naming a tradition, its `astrologicalExpression` deriving the
 * modifiers) produces a per-skill `BSMod` mastery-level delta. Exercises the
 * built-in "Wheel of the Year" tradition, whose Dawnsign (months 1–3) confers
 * `subtype:combat` +5.
 */
describe("birthsign astrology — derived BSMod skill delta (#1018)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // A birth date safely inside Dawnsign (day 15 of the 360-day year), away
    // from any cusp boundary — worldTime is seconds, one day is 86400s.
    const DAWNSIGN_BIRTHDATE = 15 * 86400;
    const DEFAULT_EXPR = 'merge(astrologySettings(tradition, date), "max")';

    it("adds a subtype:combat BSMod delta to a combat skill from the Dawnsign", () => {
        cy.createActor("being", {
            system: { birthDate: DAWNSIGN_BIRTHDATE },
        }).as("being");
        cy.then(function () {
            cy.createItemOn(this.being, "affiliation", {
                name: "Wheel Astrology",
                system: {
                    society: "wheel-of-the-year",
                    astrologicalExpression: DEFAULT_EXPR,
                },
            });
            cy.createItemOn(this.being, "skill", {
                name: "Broadsword",
                system: {
                    shortcode: "bsw",
                    subType: "combat",
                    skillBaseFormula: "5",
                    masteryLevelBase: 40,
                },
            });
            cy.prepare(this.being);
            cy.foundry((win) => {
                const actor = win.game.actors.get(this.being.id ?? this.being);
                const skill = actor.itemTypes.skill.find(
                    (i) => i.system.shortcode === "bsw",
                );
                const ml = skill.logic.masteryLevel;
                return {
                    effective: ml.effective,
                    hasBsMod: ml.deltas.some((d) => d.abbrev === "BSMod"),
                    bsModValue: ml.deltas.find((d) => d.abbrev === "BSMod")
                        ?.value,
                };
            }).then((r) => {
                expect(r.hasBsMod, "combat skill has a BSMod delta").to.be.true;
                expect(String(r.bsModValue)).to.eq("5");
                expect(r.effective, "40 base + 5 BSMod").to.eq(45);
            });
        });
    });

    it("adds no BSMod delta to a skill the birthsign does not touch", () => {
        cy.createActor("being", {
            system: { birthDate: DAWNSIGN_BIRTHDATE },
        }).as("being");
        cy.then(function () {
            cy.createItemOn(this.being, "affiliation", {
                name: "Wheel Astrology",
                system: {
                    society: "wheel-of-the-year",
                    astrologicalExpression: DEFAULT_EXPR,
                },
            });
            cy.createItemOn(this.being, "skill", {
                name: "Cooking",
                system: {
                    shortcode: "cook",
                    subType: "craft",
                    skillBaseFormula: "5",
                    masteryLevelBase: 40,
                },
            });
            cy.prepare(this.being);
            cy.foundry((win) => {
                const actor = win.game.actors.get(this.being.id ?? this.being);
                const skill = actor.itemTypes.skill.find(
                    (i) => i.system.shortcode === "cook",
                );
                const ml = skill.logic.masteryLevel;
                return {
                    effective: ml.effective,
                    hasBsMod: ml.deltas.some((d) => d.abbrev === "BSMod"),
                };
            }).then((r) => {
                expect(r.hasBsMod, "craft skill untouched by Dawnsign").to.be
                    .false;
                expect(r.effective).to.eq(40);
            });
        });
    });

    it("derives nothing without a birthsign affiliation (plain marker only)", () => {
        cy.createActor("being", {
            system: { birthDate: DAWNSIGN_BIRTHDATE },
        }).as("being");
        cy.then(function () {
            cy.createItemOn(this.being, "skill", {
                name: "Broadsword",
                system: {
                    shortcode: "bsw",
                    subType: "combat",
                    skillBaseFormula: "5",
                    masteryLevelBase: 40,
                },
            });
            cy.prepare(this.being);
            cy.foundry((win) => {
                const actor = win.game.actors.get(this.being.id ?? this.being);
                const skill = actor.itemTypes.skill.find(
                    (i) => i.system.shortcode === "bsw",
                );
                return skill.logic.masteryLevel.effective;
            }).then((effective) => {
                expect(effective, "no affiliation → no BSMod").to.eq(40);
            });
        });
    });
});
