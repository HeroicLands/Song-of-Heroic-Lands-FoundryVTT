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
 * Active-effect authoring controls (#501): create / toggle / delete an embedded
 * effect from a sheet's Effects tab, wired via the shared sheet mixin's
 * `actions` map (`effectCreate` / `effectToggle` / `effectDelete`) and backed by
 * `SohlActor#createEffect` / `SohlItem#createEffect` and
 * `SohlActiveEffect#toggleEnabledState`. Drives the real buttons on a Being
 * (actor) sheet and the create button on an item sheet.
 */
import { toRealm } from "../support/resolve";

const EFFECTS = 'section.tab[data-tab="effects"]';

/** Create a `sohleffectdata` effect on an actor by id; yields its id. */
function seedActorEffect(actorId, name) {
    return cy
        .foundry((win) =>
            win.game.actors
                .get(actorId)
                .createEmbeddedDocuments("ActiveEffect", [
                    toRealm(win, { name, type: "sohleffectdata" }),
                ])
                .then((created) => created[0].id),
        )
        .then((id) => id);
}

describe("active-effect controls (#501)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    it("create: the effect-create control adds an embedded effect (actor)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("effects", "primary");
            cy.get(`${EFFECTS} [data-action="effectCreate"]`).first().click();
            // createEffect resolves asynchronously; poll the document.
            cy.foundry(
                (win) => win.game.actors.get(actor.id).effects.contents.length,
            ).should("be.greaterThan", 0);
            cy.get(`${EFFECTS} .effects__row`).should(
                "have.length.greaterThan",
                0,
            );
        });
    });

    it("toggle: the effect-toggle control flips disabled", () => {
        cy.importActor().then((actor) => {
            seedActorEffect(actor.id, "E2E Toggle Effect").then((effectId) => {
                cy.openSheet(actor);
                cy.switchTab("effects", "primary");
                cy.get(
                    `${EFFECTS} .effects__row[data-effect-id="${effectId}"] [data-action="effectToggle"]`,
                ).click();
                cy.foundry(
                    (win) =>
                        win.game.actors.get(actor.id).effects.get(effectId)
                            .disabled,
                ).should("eq", true);
                // Toggle back.
                cy.get(
                    `${EFFECTS} .effects__row[data-effect-id="${effectId}"] [data-action="effectToggle"]`,
                ).click();
                cy.foundry(
                    (win) =>
                        win.game.actors.get(actor.id).effects.get(effectId)
                            .disabled,
                ).should("eq", false);
            });
        });
    });

    it("delete: the effect-delete control removes the effect (after confirm)", () => {
        cy.importActor().then((actor) => {
            seedActorEffect(actor.id, "E2E Delete Effect").then((effectId) => {
                cy.openSheet(actor);
                cy.switchTab("effects", "primary");
                cy.get(
                    `${EFFECTS} .effects__row[data-effect-id="${effectId}"] [data-action="effectDelete"]`,
                ).click();
                cy.submitDialog("yes"); // DialogV2.confirm
                // Its row no longer renders (embedded delete + re-render is
                // async; allow generous time under headless load)…
                cy.get(
                    `${EFFECTS} .effects__row[data-effect-id="${effectId}"]`,
                    { timeout: 12000 },
                ).should("not.exist");
                // …and the effect is gone from the document.
                cy.foundry(
                    (win) =>
                        win.game.actors
                            .get(actor.id)
                            .effects.contents.filter((e) => e.id === effectId)
                            .length,
                ).should("eq", 0);
            });
        });
    });

    it("create: the effect-create control adds an embedded effect (item)", () => {
        cy.createWorldItem("miscgear", { name: "E2E Effected Item" }).then(
            (item) => {
                cy.openSheet(item);
                cy.switchTab("effects", "sheet");
                cy.get(`${EFFECTS} [data-action="effectCreate"]`)
                    .first()
                    .click();
                cy.foundry(
                    (win) =>
                        win.game.items.get(item.id).effects.contents.length,
                ).should("be.greaterThan", 0);
                cy.get(`${EFFECTS} .effects__row`).should(
                    "have.length.greaterThan",
                    0,
                );
            },
        );
    });
});
