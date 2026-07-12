/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Being Facade tab (#303 / #307): the initial/summary tab shows an editable bio
 * image bound to `system.portrait` and a rich-text description editor bound to
 * `system.appearance` (the "physical appearance" field). Both must bind to real
 * datamodel fields — the tab previously pointed at `system.bioImage` /
 * `system.description`, which do not exist, so the image was blank and the
 * editor always empty.
 */
import { toRealm } from "../support/resolve";

describe("Being Facade tab (#307)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("binds the bio image to system.portrait", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) =>
                win.game.actors
                    .get(actor.id)
                    .update(
                        toRealm(win, {
                            "system.portrait": "icons/svg/mystery-man.svg",
                        }),
                    )
                    .then(() => null),
            );
            cy.openSheet(actor);
            cy.switchTab("facade", "primary");
            cy.get('section.tab[data-tab="facade"] img.facade__image')
                .should("have.attr", "data-edit", "system.portrait")
                .and("have.attr", "src", "icons/svg/mystery-man.svg");
        });
    });

    it("renders the enriched appearance in the description editor", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) =>
                win.game.actors
                    .get(actor.id)
                    .update(
                        toRealm(win, {
                            "system.appearance":
                                "<p>Weathered and scarred.</p>",
                        }),
                    )
                    .then(() => null),
            );
            cy.openSheet(actor);
            cy.switchTab("facade", "primary");
            cy.get('section.tab[data-tab="facade"] .facade__description')
                .should("contain.text", "Weathered and scarred.")
                // The editor must target the real field so edits persist.
                .find('[data-edit="system.appearance"]')
                .should("exist");
        });
    });
});
