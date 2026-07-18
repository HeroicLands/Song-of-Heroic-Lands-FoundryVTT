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
 * Default context-menu / action visibility predicates (#458). The improve-flag,
 * transmit, and diagnosis predicates previously referenced stale document paths
 * (`item.system.canImprove`, `item.system.data.improveFlag`, …) that always
 * resolved falsy, so the entries never appeared. They now bind the logic layer
 * (`itemLogic.canImprove`, `itemLogic.data.improveFlag`, …).
 *
 * This spec drives the real runtime path in a live world: the Skill's
 * `improveWithSDR` action `visible(element)` predicate resolves `itemLogic` from
 * the clicked row's `data-item-id` (via `resolveContextItem`) and reads live
 * logic state. It must show when the skill can improve and is not already
 * flagged, and hide once the improve flag is set.
 */
import { toRealm } from "../support/resolve";

/** Build a synthetic row element whose closest() yields the item/actor ids. */
function rowElement(win, itemId, actorId) {
    return {
        closest: (selector) => {
            if (selector === "[data-item-id]") return { dataset: { itemId } };
            if (selector === "[data-actor-id]") return { dataset: { actorId } };
            return null;
        },
    };
}

describe("default action visibility predicates (#458)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("shows the improveWithSDR action only when the skill can improve and is not flagged", () => {
        cy.importActor().then((actor) => {
            // Pick any real skill on the imported Basic Folk.
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const skill = a.items.find((i) => i.type === "skill");
                return skill ? skill.id : null;
            }).then((skillId) => {
                expect(skillId, "actor has a skill").to.not.be.null;

                // canImprove holds (GM + not disabled) and improveFlag defaults
                // false → the action's visible predicate passes.
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const skill = a.items.get(skillId);
                    const el = rowElement(win, skill.id, a.id);
                    const action = skill.logic.actions.get("improveWithSDR");
                    return {
                        canImprove: skill.logic.canImprove,
                        improveFlag: skill.system.improveFlag,
                        visible: action.visible(el),
                    };
                }).should((s) => {
                    expect(s.canImprove, "canImprove").to.be.true;
                    expect(s.improveFlag, "improveFlag").to.be.false;
                    expect(s.visible, "visible when improvable").to.be.true;
                });

                // Set the improve flag → the predicate must now hide the entry.
                cy.foundry((win) =>
                    win.game.actors
                        .get(actor.id)
                        .items.get(skillId)
                        .update(toRealm(win, { "system.improveFlag": true }))
                        .then(() => null),
                );
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const skill = a.items.get(skillId);
                    const el = rowElement(win, skill.id, a.id);
                    const action = skill.logic.actions.get("improveWithSDR");
                    return action.visible(el);
                }).should("be.false");
            });
        });
    });
});
