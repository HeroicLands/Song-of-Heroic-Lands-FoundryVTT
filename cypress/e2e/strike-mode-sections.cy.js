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
 * Derived Melee/Missile Strike Mode sections (#293). The Combat tab aggregates
 * strike modes from combat-technique skills (always available) and held weapons,
 * grouped by source, with clickable Atk/Blk/CX.
 */
describe("derived strike mode sections", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    function meleeWeapon(name = "Sword") {
        return {
            name,
            system: {
                strikeModes: [
                    {
                        shortcode: "strike",
                        type: "melee",
                        name: "Strike",
                        assocSkillCode: "melee",
                        minParts: 1,
                        attack: { spread: 0, modifier: 0 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "edged",
                        },
                        traits: {},
                        lengthBase: 3,
                        defense: {
                            block: { modifier: 0 },
                            counterstrike: { modifier: 0 },
                        },
                    },
                ],
            },
        };
    }

    function meleeSection(win, actorId) {
        // After the Manuscript redesign each melee source (held weapon or
        // combat-technique) is a `.section-legend--subtype` sub-header followed
        // by its `.ledger__row` strike modes inside one shared `.ledger`. Return
        // the whole Combat section; these tests add only melee sources.
        return win.game.actors
            .get(actorId)
            .sheet.element.querySelector('section[data-tab="combat"]');
    }

    /** The strike-mode source (weapon / technique) names shown in the Combat tab. */
    function sourceNames(fs) {
        return [...fs.querySelectorAll(".section-legend--subtype .section-legend__name")].map((h) =>
            h.textContent.trim(),
        );
    }

    /**
     * Text of the first cell matching `selector` among the strike-mode rows that
     * belong to the named source — the `.ledger__row`s following that source's
     * `.section-legend--subtype` sub-header, up to the next section legend.
     */
    function cellForSource(fs, name, selector) {
        const legend = [...fs.querySelectorAll(".section-legend--subtype")].find(
            (l) => l.querySelector(".section-legend__name")?.textContent?.trim() === name,
        );
        if (!legend) return undefined;
        let n = legend.nextElementSibling;
        while (n && !n.classList.contains("section-legend")) {
            if (n.classList.contains("ledger__row")) {
                const cell = n.querySelector(selector);
                if (cell) return cell.textContent.trim();
            }
            n = n.nextElementSibling;
        }
        return undefined;
    }

    it("aggregates a combat-technique skill and a held weapon, both rollable", () => {
        cy.importActor().then((actor) => {
            // Combat-technique skill with a melee strike mode (ML drives Atk).
            cy.createItemOn(actor, "skill", {
                name: "Boxing",
                system: {
                    subType: "combattechnique",
                    masteryLevelBase: 40,
                    strikeMode: {
                        type: "melee",
                        name: "Jab",
                        lengthBase: 1,
                        attack: { modifier: 5 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "blunt",
                        },
                        defense: {
                            block: { modifier: 3 },
                            counterstrike: { modifier: -2 },
                        },
                    },
                },
            });
            // A weapon skill for the held weapon's assocSkillCode, and the weapon.
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", meleeWeapon("Sword")).then((w) => {
                cy.holdItem(w);
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
                cy.wait(500);
                cy.foundry((win) => {
                    const fs = meleeSection(win, actor.id);
                    const sources = sourceNames(fs);
                    const atkCells = fs.querySelectorAll(
                        '[data-action="rollStrikeModeTest"][data-test-kind="attack"]',
                    ).length;
                    const blkCells = fs.querySelectorAll(
                        '[data-action="rollStrikeModeTest"][data-test-kind="block"]',
                    ).length;
                    // The technique's Atk cell value.
                    const atk = cellForSource(fs, "Boxing", '[data-test-kind="attack"]');
                    return { sources, atkCells, blkCells, boxingAtk: atk };
                }).should((r) => {
                    expect(r.sources, "grouped by source").to.include.members(["Boxing", "Sword"]);
                    expect(r.atkCells, "attack cells rollable").to.be.at.least(2);
                    expect(r.blkCells, "block cells rollable").to.be.at.least(1);
                    expect(r.boxingAtk, "technique Atk = ML+mod").to.equal("45");
                });
            });
        });
    });

    it("renders the weapon's flat impact modifier on the Combat tab (#774)", () => {
        // A strike mode carrying a nonzero flat impact bonus must show it on the
        // Combat tab (and feed the rolled impact), matching the item sheet.
        // Regression: the modifier was routed only into the inner dice roll, so
        // the label rendered `d6+0e` instead of `d6+2e`.
        const weapon = meleeWeapon("Broadsabre");
        weapon.system.strikeModes[0].impactBase = {
            numDice: 1,
            die: 6,
            modifier: 2,
            aspect: "edged",
        };
        cy.importActor().then((actor) => {
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", weapon).then((w) => {
                cy.holdItem(w);
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
                cy.wait(500);
                cy.foundry((win) => {
                    const fs = meleeSection(win, actor.id);
                    const impact = cellForSource(
                        fs,
                        "Broadsabre",
                        '[data-action="rollStrikeModeImpact"]',
                    );
                    return { impact };
                }).should((r) => {
                    expect(r.impact, "impact carries the flat +2").to.equal("d6+2e");
                });
            });
        });
    });

    it("drops a weapon's strike modes when it is no longer held", () => {
        cy.importActor().then((actor) => {
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", meleeWeapon("Mace")).then((w) => {
                cy.holdItem(w);
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
                cy.wait(400);
                cy.foundry((win) => {
                    const fs = meleeSection(win, actor.id);
                    const has = fs ? sourceNames(fs).some((n) => n === "Mace") : false;
                    return { has };
                }).should((r) => expect(r.has, "held weapon shown").to.be.true);
                // Release it → its strike modes disappear.
                cy.releaseItem(w);
                cy.prepare(actor);
                cy.foundry((win) => win.game.actors.get(actor.id).sheet.render(true));
                cy.wait(500);
                cy.foundry((win) => {
                    const fs = meleeSection(win, actor.id);
                    const has = fs ? sourceNames(fs).some((n) => n === "Mace") : false;
                    return { has };
                }).should((r) => expect(r.has, "unheld weapon removed").to.be.false);
            });
        });
    });
});
