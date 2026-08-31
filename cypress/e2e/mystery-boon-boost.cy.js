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
 * Boon / Boost skill-affecting Mysteries (#975).
 *
 * A `boon` Mystery contributes a flat ±N delta to its associated skill's EML; a
 * `boost` Mystery contributes the Mastery-Boost-table delta. Both are
 * live-derived — recomputed every prepare cycle and pushed onto the real skill's
 * `masteryLevel` — so the effect applies only while the Mystery is present and
 * reverts automatically when it lapses. Driven through the live `.logic`.
 */
describe("mystery boon/boost skill contribution (#975)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /** Read the prepared EML (effective mastery level) of a skill by shortcode. */
    function eml(actor, shortcode) {
        return cy.foundry((win) => {
            const logic = win.game.actors.get(actor.id).logic.getItemLogic(shortcode, "skill");
            return logic.masteryLevel.effective;
        });
    }

    it("a Boon adds a flat +N delta to the associated skill's EML, and reverts when removed", () => {
        cy.createActor("being", { name: "Boon Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 50,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 50);

            cy.createItemOn(actor, "mystery", {
                name: "Blade Boon",
                system: {
                    subType: "boon",
                    assocSkillCode: "sword",
                    levelBase: 5,
                },
            }).then((boon) => {
                cy.prepare(actor);
                eml(actor, "sword").should("equal", 55); // 50 + 5

                // Removing the Mystery reverts the delta — no persisted state.
                cy.foundry((win) =>
                    win
                        .fromUuidSync(boon.uuid)
                        .delete()
                        .then(() => null),
                );
                cy.prepare(actor);
                eml(actor, "sword").should("equal", 50);
            });
        });
    });

    it("a Boost adds the Mastery-Boost-table delta to the associated skill's EML", () => {
        // seed 52, N=3 → 52(+7)59(+7)66(+6)72 ⇒ +20 EML.
        cy.createActor("being", { name: "Boost Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 52,
                },
            });
            cy.createItemOn(actor, "mystery", {
                name: "Blade Boost",
                system: {
                    subType: "boost",
                    assocSkillCode: "sword",
                    levelBase: 3,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 72); // 52 + 20
        });
    });

    it("a Boon that names no resolvable skill contributes nothing (no offer)", () => {
        // A Boon on an absent skill has no mastery level to modify, so it is not
        // offered a conferred skill — it simply contributes nothing. #981.
        cy.createActor("being", { name: "No-Skill Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 50,
                },
            });
            cy.createItemOn(actor, "mystery", {
                name: "Orphan Boon",
                system: {
                    subType: "boon",
                    assocSkillCode: "missing",
                    levelBase: 5,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 50);
        });
    });

    // ---- Absent-skill Boost: drop-time offer + ML-0 confer (#981) -----------

    /**
     * A Boost dropped onto an actor that names a skill the actor lacks offers to
     * add that skill (resolved from world/compendium) at mastery level 0; once
     * added, the Boost opens it at Skill Base and boosts it. The offer fires from
     * the mystery's `_onCreate`, so creating the Boost surfaces the dialog.
     */
    it("a Boost naming an absent skill offers to add it at ML 0, then confers it at Skill Base (#981)", () => {
        cy.createActor("being", { name: "Stealth Learner" }).then((actor) => {
            // A Strength attribute so the conferred skill's sb(attr.str) formula
            // computes a positive Skill Base.
            cy.createItemOn(actor, "attribute", {
                name: "Strength",
                system: { shortcode: "str", scoreBase: 13 },
            });
            // A skill DEFINITION the actor does not have, resolvable in the world.
            cy.createWorldItem("skill", {
                name: "Conferred Stealth",
                system: {
                    subType: "physical",
                    shortcode: "spkstl",
                    skillBaseFormula: "sb(attr.str)",
                },
            });
            // Dropping the Boost (create-on-actor) fires the offer dialog.
            cy.createItemOn(actor, "mystery", {
                name: "Stealth Boost",
                system: {
                    subType: "boost",
                    assocSkillCode: "spkstl",
                    levelBase: 1, // N=1 → conferred at exactly Skill Base
                },
            });
            cy.submitDialog("add"); // accept the offer

            // The skill is added asynchronously; poll until it appears prepared,
            // then assert it is a real, unlearned skill conferred at its SB.
            cy.window().should((win) => {
                const a = win.game.actors.get(actor.id);
                const skill = a.itemTypes.skill.find((s) => s.system.shortcode === "spkstl");
                expect(skill, "conferred skill was added to the actor").to.exist;
                expect(
                    skill.system.masteryLevelBase,
                    "added as unlearned (mastery level base 0)",
                ).to.eq(0);
                const sb = skill.logic.skillBase;
                expect(sb, "skill base computed from the definition").to.be.greaterThan(0);
                expect(
                    skill.logic.masteryLevel.effective,
                    "N=1 Boost opens the skill at exactly its Skill Base",
                ).to.eq(sb);
            });

            // And it is not a transient — a real embedded skill in _source.
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return (a._source.items || []).some((i) => i.system?.shortcode === "spkstl");
            }).should("eq", true);
        });
    });

    it("declining the offer adds no skill (#981)", () => {
        cy.createActor("being", { name: "Climb Decliner" }).then((actor) => {
            cy.createItemOn(actor, "attribute", {
                name: "Strength",
                system: { shortcode: "str", scoreBase: 13 },
            });
            cy.createWorldItem("skill", {
                name: "Conferred Climbing",
                system: {
                    subType: "physical",
                    shortcode: "spkclm",
                    skillBaseFormula: "sb(attr.str)",
                },
            });
            cy.createItemOn(actor, "mystery", {
                name: "Climb Boost",
                system: {
                    subType: "boost",
                    assocSkillCode: "spkclm",
                    levelBase: 1,
                },
            });
            cy.submitDialog("no"); // decline
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return a.itemTypes.skill.some((s) => s.system.shortcode === "spkclm");
            }).should("eq", false);
        });
    });
});
