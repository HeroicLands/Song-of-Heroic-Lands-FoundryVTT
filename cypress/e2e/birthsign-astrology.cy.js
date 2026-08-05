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
 * built-in **Astrokýklos** tradition — its Arnos sign (Springtide window) confers
 * earth +15 (→ `subtype:nature`) and fire −5 (→ `subtype:combat`); its Bourax
 * sign (Blossomreach window) has no fire element (→ no `subtype:combat` delta).
 */
describe("birthsign astrology — derived BSMod skill delta (#1018)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // worldTime is seconds; one day is 86400s; the Turning Wheel is 12×30 days,
    // and worldTime N*86400 is day (N+1) of the year. Day 16 of Springtide falls
    // in Arnos (window Springtide 4 → Blossomreach 3); day 15 of Blossomreach
    // (day 45 of the year) falls in Bourax (window Blossomreach 4 → Greengold 2).
    const ARNOS_BIRTHDATE = 15 * 86400; // Springtide day 16
    const BOURAX_BIRTHDATE = 44 * 86400; // Blossomreach day 15
    const DEFAULT_EXPR = 'merge(astrologySettings(tradition, date), "max")';

    /** Add a birthsign affiliation + a skill to a fresh being, then prepare. */
    function beingWithSkill(birthDate, skill, withAffiliation = true) {
        cy.createActor("being", { system: { birthDate } }).as("being");
        cy.then(function () {
            if (withAffiliation) {
                cy.createItemOn(this.being, "affiliation", {
                    name: "Astrokýklos",
                    system: {
                        society: "astrokyklos",
                        astrologicalExpression: DEFAULT_EXPR,
                    },
                });
            }
            cy.createItemOn(this.being, "skill", {
                name: skill.name,
                system: {
                    shortcode: skill.shortcode,
                    subType: skill.subType,
                    skillBaseFormula: "5",
                    masteryLevelBase: 40,
                },
            });
            cy.prepare(this.being);
        });
    }

    /** Read a skill's mastery-level effective + BSMod delta value. */
    function readSkill(shortcode) {
        return cy.get("@being").then((being) =>
            cy.foundry((win) => {
                const actor = win.game.actors.get(being.id ?? being);
                const skill = actor.itemTypes.skill.find(
                    (i) => i.system.shortcode === shortcode,
                );
                const ml = skill.logic.masteryLevel;
                return {
                    effective: ml.effective,
                    bsMod:
                        ml.deltas.find((d) => d.abbrev === "BSMod")?.value ??
                        null,
                };
            }),
        );
    }

    it("adds a subtype:combat BSMod (−5, fire) to a combat skill under Arnos", () => {
        beingWithSkill(ARNOS_BIRTHDATE, {
            name: "Broadsword",
            shortcode: "bsw",
            subType: "combat",
        });
        readSkill("bsw").then((r) => {
            expect(String(r.bsMod)).to.eq("-5");
            expect(r.effective, "40 base − 5 BSMod").to.eq(35);
        });
    });

    it("adds a subtype:nature BSMod (+15, earth) to a nature skill under Arnos", () => {
        beingWithSkill(ARNOS_BIRTHDATE, {
            name: "Tracking",
            shortcode: "trk",
            subType: "nature",
        });
        readSkill("trk").then((r) => {
            expect(String(r.bsMod)).to.eq("15");
            expect(r.effective, "40 base + 15 BSMod").to.eq(55);
        });
    });

    it("adds no BSMod to a combat skill under Bourax (no fire element)", () => {
        beingWithSkill(BOURAX_BIRTHDATE, {
            name: "Broadsword",
            shortcode: "bsw",
            subType: "combat",
        });
        readSkill("bsw").then((r) => {
            expect(r.bsMod, "Bourax has no fire → no combat delta").to.be.null;
            expect(r.effective).to.eq(40);
        });
    });

    it("derives nothing without a birthsign affiliation", () => {
        beingWithSkill(
            ARNOS_BIRTHDATE,
            { name: "Broadsword", shortcode: "bsw", subType: "combat" },
            false,
        );
        readSkill("bsw").then((r) => {
            expect(r.bsMod, "no affiliation → no BSMod").to.be.null;
            expect(r.effective).to.eq(40);
        });
    });
});
