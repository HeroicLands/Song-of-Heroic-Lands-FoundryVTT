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
 * Skill Development Roll persistence (#716).
 *
 * `SkillLogic.improveWithSDR` rolls `1d100 + skillBase` against the current base
 * mastery level and, on a success, raises `system.masteryLevelBase` by `sdrIncr`
 * (1). Whatever the outcome, it must clear `system.improveFlag`. This exercises
 * the real Foundry persistence path (`this.data.update(...)`) that the unit
 * suite can only mock — driving the live `.logic` with forced dice so the
 * outcome is deterministic, then asserting the persisted `system` fields.
 */
describe("skill improveWithSDR persistence (#716)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    // No skillBaseFormula → skillBase 0, so the forced d100 value alone is the
    // roll total against masteryLevelBase 50: 100 > 50 → success, 5 ≤ 50 → fail.
    function makeFlaggedSkill(actor) {
        return cy.createItemOn(actor, "skill", {
            name: "Sword",
            system: {
                shortcode: "swo",
                masteryLevelBase: 50,
                improveFlag: true,
            },
        });
    }

    function runSdr(actor, skill, forced) {
        return cy.foundry(async (win) => {
            const s = win.game.actors.get(actor.id).items.get(skill.id);
            win.sohl.entity.roll.SimpleRoll.forceValues(forced);
            // improveWithSDR opens no dialog; call with no explicit context so
            // executeAction builds the real one (carrying the actor's speaker),
            // exactly as the context-menu invocation does.
            await s.logic.executeAction("improveWithSDR");
            // executeAction awaits the update, so system now reflects the write.
            const sys = win.game.actors.get(actor.id).items.get(skill.id).system;
            return {
                masteryLevelBase: sys.masteryLevelBase,
                improveFlag: sys.improveFlag,
            };
        });
    }

    it("raises masteryLevelBase and clears improveFlag on a successful roll", () => {
        cy.importActor().then((actor) => {
            makeFlaggedSkill(actor).then((skill) => {
                cy.prepare(actor);
                runSdr(actor, skill, 100).should((r) => {
                    expect(r.masteryLevelBase, "base raised by sdrIncr (1)").to.eq(51);
                    expect(r.improveFlag, "flag cleared after roll").to.be.false;
                });
            });
        });
    });

    it("clears improveFlag without raising masteryLevelBase on a failed roll", () => {
        cy.importActor().then((actor) => {
            makeFlaggedSkill(actor).then((skill) => {
                cy.prepare(actor);
                runSdr(actor, skill, 5).should((r) => {
                    expect(r.masteryLevelBase, "base unchanged").to.eq(50);
                    expect(r.improveFlag, "flag cleared after roll").to.be.false;
                });
            });
        });
    });

    // #1103: the card used to render through standard-test-card.hbs under keys
    // that template does not read, so Target and Roll came out blank and a GM
    // result-edit pencil was drawn with an empty scope.
    it("posts a card carrying the roll total and the target mastery level (#1103)", () => {
        cy.importActor().then((actor) => {
            makeFlaggedSkill(actor).then((skill) => {
                cy.prepare(actor);
                runSdr(actor, skill, 100);
                // `improveWithSDR` posts the card fire-and-forget, so the
                // message lands *after* executeAction resolves. cy.foundry()
                // does not retry, so poll the window for the card, then assert
                // its rendered content.
                cy.window().should((win) => {
                    const card = win.game.messages.contents.find((m) =>
                        (m.content || "").includes("(SDR)"),
                    );
                    expect(card, "SDR card posted").to.exist;
                    expect(card.content, "target rendered").to.contain(">50<");
                    expect(card.content, "roll total rendered").to.contain(">100<");
                    expect(card.content, "no result-edit pencil").to.not.contain(
                        'data-action="resultEdit"',
                    );
                });
            });
        });
    });
});
