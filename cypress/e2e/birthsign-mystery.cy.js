/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Birthsign as a Mystery(OTHER) carrying skill Active Effects.
 *
 * A birthsign is a droppable, compendium-packaged item: a mechanically inert
 * Mystery(OTHER) whose behaviour lives entirely in its Active Effects. Each
 * effect scopes to the `skill` item kind and carries one **element** of the
 * Astrokýklos matrix — a set of skill subTypes together with that element's own
 * skill shortcodes — pushing a `mod:logic.masteryLevel` delta onto every
 * matching skill. The player attaches the sign their character was born under;
 * nothing is derived from a birth date.
 *
 * The shipped sign "Arnos" runs +15 earth / +5 metal / −5 fire / −15 air /
 * −5 spirit / +5 water, so a Nature skill gains +15 and a Combat skill −5.
 * The matrix itself is asserted in `tests/content/birthsign-effects.test.ts`.
 */
describe("birthsign — Mystery(OTHER) + skill Active Effects", () => {
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

    it("Arnos shifts skill EML by subtype: Nature +15, Combat −5", () => {
        cy.createActor("being", { name: "Born Under Arnos" }).then((actor) => {
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

            // Baseline: no birthsign attached → EML == masteryLevelBase.
            cy.prepare(actor);
            skillEml(actor, "forg").should("eq", 40);
            skillEml(actor, "swrd").should("eq", 40);

            // Attach the shipped Arnos birthsign from the items compendium.
            cy.getFromCompendium("sohl.items", "mystery", "arnos").then(
                (sign) => cy.dropOnActor(actor, sign),
            );

            // Its Active Effects retune matching skills by subtype.
            cy.prepare(actor);
            skillEml(actor, "forg").should("eq", 55); // 40 + 15 (Nature)
            skillEml(actor, "swrd").should("eq", 35); // 40 − 5 (Combat)
        });
    });

    it("the Arnos Mystery itself is inert (subType other, contributes nothing)", () => {
        cy.getFromCompendium("sohl.items", "mystery", "arnos").then((sign) => {
            expect(sign.system.subType).to.eq("other");
            expect(sign.effects.size).to.be.greaterThan(0);
        });
    });
});
