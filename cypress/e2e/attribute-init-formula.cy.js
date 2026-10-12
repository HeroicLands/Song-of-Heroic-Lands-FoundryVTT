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
 * The Init Dice Formula action is offered on an attribute's real Profile-card
 * context menu. These flows click that menu item and answer its actual DialogV2
 * confirmation, then inspect the persisted embedded Attribute document.
 */

import { toRealm } from "../support/resolve";

const ACTION_LABEL = "Roll Init Dice Formula";

function setFormula(actorId, shortcode, scoreBase, initDiceFormula) {
    return cy.foundry(async (win) => {
        const actor = win.game.actors.get(actorId);
        const attribute = actor.items.find(
            (item) => item.type === "attribute" && item.system.shortcode === shortcode,
        );
        if (!attribute) throw new Error(`No attribute with shortcode ${shortcode}`);
        await attribute.update(
            toRealm(win, {
                "system.scoreBase": scoreBase,
                "system.initDiceFormula": initDiceFormula,
            }),
        );
        return attribute.id;
    });
}

function invokeFormulaAction(actor, attributeId) {
    cy.openSheet(actor);
    cy.switchTab("profile", "primary");
    cy.get(
        `section.tab[data-tab="profile"] .attribute-score[data-item-id="${attributeId}"] .item-contextmenu`,
    ).click();
    cy.get("#context-menu").contains(".context-item", ACTION_LABEL).click();
}

describe("attribute Init Dice Formula action", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
        cy.foundry((win) => win.sohl.entity.roll.SimpleRoll.clearForced());
    });

    it("rolls from the attribute menu and saves only after confirmation", () => {
        cy.importActor().then((actor) => {
            setFormula(actor.id, "str", 10, "3d6").then((attributeId) => {
                cy.foundry((win) => win.sohl.entity.roll.SimpleRoll.forceValues(1, 2, 3));
                invokeFormulaAction(actor, attributeId);
                cy.window().should((win) => {
                    const dialog = [...win.foundry.applications.instances.values()]
                        .reverse()
                        .find(
                            (app) =>
                                app.constructor.name === "DialogV2" &&
                                app.rendered &&
                                app.element?.textContent.includes("Score from 10 to 6"),
                        );
                    expect(dialog, "confirmation shows the current and proposed score").to.exist;
                });
                cy.submitDialog("yes");
                cy.window().should((win) => {
                    const attribute = win.game.actors.get(actor.id).items.get(attributeId);
                    expect(attribute.system.scoreBase).to.eq(6);
                });
            });
        });
    });

    it("keeps the existing score when the user declines", () => {
        cy.importActor().then((actor) => {
            setFormula(actor.id, "str", 10, "3d6").then((attributeId) => {
                cy.foundry((win) => win.sohl.entity.roll.SimpleRoll.forceValues(6, 6, 6));
                invokeFormulaAction(actor, attributeId);
                cy.window().should((win) => {
                    const dialog = [...win.foundry.applications.instances.values()]
                        .reverse()
                        .find(
                            (app) =>
                                app.constructor.name === "DialogV2" &&
                                app.rendered &&
                                app.element?.textContent.includes("Score from 10 to 18"),
                        );
                    expect(dialog, "confirmation shows the proposed score").to.exist;
                });
                cy.submitDialog("no");
                cy.window().should((win) => {
                    const attribute = win.game.actors.get(actor.id).items.get(attributeId);
                    expect(attribute.system.scoreBase).to.eq(10);
                });
            });
        });
    });

    it("accepts the fixed integer formula zero", () => {
        cy.importActor().then((actor) => {
            setFormula(actor.id, "str", 10, "0").then((attributeId) => {
                invokeFormulaAction(actor, attributeId);
                cy.window().should((win) => {
                    const dialog = [...win.foundry.applications.instances.values()]
                        .reverse()
                        .find(
                            (app) =>
                                app.constructor.name === "DialogV2" &&
                                app.rendered &&
                                app.element?.textContent.includes("Score from 10 to 0"),
                        );
                    expect(dialog, "confirmation shows zero as the proposed score").to.exist;
                });
                cy.submitDialog("yes");
                cy.window().should((win) => {
                    const attribute = win.game.actors.get(actor.id).items.get(attributeId);
                    expect(attribute.system.scoreBase).to.eq(0);
                });
            });
        });
    });
});
