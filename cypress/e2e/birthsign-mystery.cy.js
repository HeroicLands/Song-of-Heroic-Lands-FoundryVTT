/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Birthsign as a Mystery(OTHER) carrying a skill-aptitude map.
 *
 * A birthsign is a droppable, compendium-packaged item: a mechanically inert
 * Mystery(OTHER) whose behaviour lives entirely in `system.skillAptitudes` — a
 * map of selector (a skill shortcode, or `subType:<value>`) to mastery-level
 * modifier, carrying one **element** of the Astrokýklos matrix per group of
 * selectors. The player attaches the sign their character was born under;
 * nothing is derived from a birth date.
 *
 * The shipped sign "Arnos" runs +15 earth / +5 metal / −5 fire / −15 air /
 * −5 spirit / +5 water, so a Nature skill gains +15 and a Combat skill −5.
 * "Bourax", its neighbour on the wheel, runs +10 / +10 / 0 / −10 / −10 / 0.
 *
 * Aptitudes never sum: carrying both signs — a birth on the threshold, which is
 * all a cusp is — takes the greater value in each element. The matrix and the
 * merge are asserted in `tests/content/birthsign-aptitudes.test.ts`; what only a
 * live client can prove is that a dropped sign actually retunes the skills on
 * the actor, which is what this spec covers.
 */
describe("birthsign — Mystery(OTHER) + skill aptitudes", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function skillEml(actor, shortcode) {
        return cy.foundry((win) => {
            const a = win.game.actors.get(actor.id);
            const sk = a.items.find(
                (i) => i.type === "skill" && i.system?.shortcode === shortcode,
            );
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

    /** Drop a shipped birthsign from the items compendium onto the actor. */
    function attachSign(actor, shortcode) {
        cy.getFromCompendium("sohl.items", "mystery", shortcode).then((sign) =>
            cy.dropOnActor(actor, sign),
        );
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
        cy.createActor("being", { name: "Born On The Threshold" }).then(
            (actor) => {
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
            },
        );
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
                    (i) =>
                        i.type === "mystery" &&
                        i.system?.shortcode === "bourax",
                );
                return a
                    .deleteEmbeddedDocuments("Item", [bourax.id])
                    .then(() => null);
            });
            cy.prepare(actor);
            skillEml(actor, "swrd").should("eq", 35);
        });
    });

    it("the Arnos Mystery itself is inert — no Active Effects, aptitudes only", () => {
        cy.getFromCompendium("sohl.items", "mystery", "arnos").then((sign) => {
            expect(sign.system.subType).to.eq("other");
            expect(sign.effects.size).to.eq(0);
            expect(sign.system.skillAptitudes["subType:nature"]).to.eq(15);
            expect(sign.system.skillAptitudes["subType:combat"]).to.eq(-5);
        });
    });

    it("ships twelve signs — a cusp is a birth under two, not a thirteenth sign", () => {
        const WHEEL = [
            "arnos",
            "bourax",
            "diplos",
            "chelyx",
            "thyron",
            "korith",
            "stathmos",
            "kentros",
            "belos",
            "tragyx",
            "nalos",
            "opsar",
        ];
        // The twelve signs the wheel once also shipped as standalone cusp items.
        const RETIRED_CUSPS = WHEEL.map(
            (sign, i) => `${sign}${WHEEL[(i + 1) % WHEEL.length]}`,
        );
        cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.items");
            const index = await pack.getIndex({ fields: ["system.shortcode"] });
            const codes = new Set(
                index
                    .filter((e) => e.type === "mystery")
                    .map((e) => e.system?.shortcode),
            );
            return {
                missing: WHEEL.filter((c) => !codes.has(c)),
                lingering: RETIRED_CUSPS.filter((c) => codes.has(c)),
            };
        }).should((result) => {
            expect(result.missing, "principal signs missing").to.deep.eq([]);
            expect(
                result.lingering,
                "retired cusp items still packed",
            ).to.deep.eq([]);
        });
    });
});
