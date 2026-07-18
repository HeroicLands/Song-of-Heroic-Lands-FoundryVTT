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
 * Fate — mastery and availability.
 *
 * A skill exposes a `fateMasteryLevel` modifier (GREEN), but fate is inert:
 * `SkillLogic.availableFate` returns `[]` (the resolution is commented out,
 * `SkillLogic.ts:242`), which leaves no charged fate to spend. RED against #71.
 */

describe("fate", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // GREEN: a skill's logic exposes a fateMasteryLevel modifier.
    it("a skill exposes a fateMasteryLevel modifier", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const s = win.game.actors.get(actor.id).items.get(skill.id);
                    return { hasFateMl: !!s?.logic?.fateMasteryLevel };
                }).should((r) => {
                    expect(r.hasFateMl, "fateMasteryLevel present").to.be.true;
                });
            });
        });
    });

    // GREEN guard documenting the current gap: no fate is available today, so
    // fate can never be spent. This asserts the RED state so it flips visibly
    // when #71 lands.
    it("exposes no available fate today (#71 gap guard)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const s = win.game.actors.get(actor.id).items.get(skill.id);
                    return s?.logic?.availableFate?.length ?? -1;
                }).should("eq", 0);
            });
        });
    });

    // RED — blocked by #71: fate mastery / availability — `availableFate` returns
    // [] so `fateMasteryLevel.disabled` holds in finalize() and no fate item can
    // be spent. Un-skip and assert a charged fate item is offered and a fate
    // reroll resolves once implemented.
    it.skip("a charged fate item enables a fate reroll (#71)", () => {});
});
