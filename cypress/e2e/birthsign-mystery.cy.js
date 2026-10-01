/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Birthsign as a Mystery(OTHER) carrying a skill-aptitude map.
 *
 * A birthsign is a droppable item: a mechanically inert Mystery(OTHER) whose
 * behaviour lives entirely in `system.skillAptitudes` — a map of selector (a
 * skill shortcode, or `subType:<value>`) to mastery-level modifier, carrying one
 * **element** of the Astrokýklos matrix per group of selectors. The player
 * attaches the sign their character was born under; nothing is derived from a
 * birth date.
 *
 * The signs are seeded here rather than taken from a compendium, so the spec is
 * evidence about SoHL's aptitude rules rather than about which documents a build
 * happened to pack. The values are the wheel's own, from the Birthsign rules:
 * "Arnos" runs +15 earth / +5 metal / −5 fire / −15 air / −5 spirit / +5 water,
 * and "Bourax", its neighbour, runs +10 / +10 / 0 / −10 / −10 / 0.
 *
 * Aptitudes never sum: carrying both signs — a birth on the threshold, which is
 * all a cusp is — takes the greater value in each element. The matrix and the
 * merge are asserted in `tests/content/birthsign-aptitudes.test.ts`; what only a
 * live client can prove is that a dropped sign actually retunes the skills on
 * the actor, which is what this spec covers.
 */

/** The two neighbouring signs this spec reads, by the selectors it asserts on. */
const SIGNS = {
    arnos: {
        name: "Arnos",
        skillAptitudes: {
            "subType:nature": 15,
            "subType:craft": 5,
            "subType:combat": -5,
            "subType:physical": -15,
            "subType:lore": -5,
            "subType:social": 5,
        },
    },
    bourax: {
        name: "Bourax",
        skillAptitudes: {
            "subType:nature": 10,
            "subType:craft": 10,
            "subType:combat": 0,
            "subType:physical": -10,
            "subType:lore": -10,
            "subType:social": 0,
        },
    },
};

describe("birthsign — Mystery(OTHER) + skill aptitudes", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function skillEml(actor, shortcode) {
        return cy.foundry((win) => {
            const a = win.game.actors.get(actor.id);
            const sk = a.items.find((i) => i.type === "skill" && i.system?.shortcode === shortcode);
            return sk ? sk.logic.masteryLevel.effective : null;
        });
    }

    /** Give the actor a Nature skill and a Combat skill, both at ML 40. */
    function seedSkills(actor) {
        cy.createItemsOn(actor, [
            {
                kind: "skill",
                name: "Foraging",
                system: {
                    shortcode: "forg",
                    subType: "nature",
                    masteryLevelBase: 40,
                },
            },
            {
                kind: "skill",
                name: "Sword",
                system: {
                    shortcode: "swrd",
                    subType: "combat",
                    masteryLevelBase: 40,
                },
            },
        ]);
    }

    /** Create a world birthsign and drop it onto the actor, as a player would. */
    function attachSign(actor, shortcode) {
        const sign = SIGNS[shortcode];
        return cy
            .createWorldItem("mystery", {
                name: sign.name,
                system: {
                    shortcode,
                    subType: "other",
                    skillAptitudes: sign.skillAptitudes,
                },
            })
            .then((doc) => cy.dropOnActor(actor, doc));
    }

    it("Arnos shifts skill EML by subtype: Nature +15, Combat −5", () => {
        cy.createActor("being", { name: "Born Under Arnos" }).then((actor) => {
            seedSkills(actor);

            // Baseline: no birthsign attached → EML == masteryLevelBase.
            cy.prepare(actor);
            skillEml(actor, "forg").should("eq", 40);
            skillEml(actor, "swrd").should("eq", 40);

            attachSign(actor, "arnos");

            // Its aptitudes retune matching skills by subtype.
            cy.prepare(actor);
            skillEml(actor, "forg").should("eq", 55); // 40 + 15 (Nature)
            skillEml(actor, "swrd").should("eq", 35); // 40 − 5 (Combat)
        });
    });

    it("a birth on the Arnos–Bourax threshold takes the better of both, never the sum", () => {
        cy.createActor("being", { name: "Born On The Threshold" }).then((actor) => {
            seedSkills(actor);
            attachSign(actor, "arnos");
            attachSign(actor, "bourax");
            cy.prepare(actor);

            // Earth: max(Arnos +15, Bourax +10) = +15 — not +25.
            skillEml(actor, "forg").should("eq", 55);
            // Fire: max(Arnos −5, Bourax 0) = 0, so the penalty lifts
            // entirely. Summing would leave it at 35; the kinder neighbour
            // is what makes a cusp a cusp.
            skillEml(actor, "swrd").should("eq", 40);
        });
    });

    it("removing one sign of a pair falls back to the other's aptitudes", () => {
        cy.createActor("being", { name: "Threshold Undone" }).then((actor) => {
            seedSkills(actor);
            attachSign(actor, "arnos");
            attachSign(actor, "bourax");
            cy.prepare(actor);
            skillEml(actor, "swrd").should("eq", 40);

            // Drop Bourax and the Arnos penalty reasserts itself: the merge is
            // derived state, rebuilt every preparation cycle.
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const bourax = a.items.find(
                    (i) => i.type === "mystery" && i.system?.shortcode === "bourax",
                );
                return a.deleteEmbeddedDocuments("Item", [bourax.id]).then(() => null);
            });
            cy.prepare(actor);
            skillEml(actor, "swrd").should("eq", 35);
        });
    });

    it("the sign itself is inert — no Active Effects, aptitudes only", () => {
        cy.createActor("being", { name: "Inert Sign Bearer" }).then((actor) => {
            attachSign(actor, "arnos").should((sign) => {
                expect(sign.system.subType).to.eq("other");
                expect(sign.effects.size).to.eq(0);
                expect(sign.system.skillAptitudes["subType:nature"]).to.eq(15);
                expect(sign.system.skillAptitudes["subType:combat"]).to.eq(-5);
            });
        });
    });
});
