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
 * Being Profile tab (#373): the biography editor must bind to a real datamodel
 * field. It previously targeted `system.biography`, which is not in the actor
 * schema, so it always rendered empty and edits were silently dropped. It now
 * binds to `system.dossier` ("rich-text dossier / background notes").
 */
import { toRealm } from "../support/resolve";

describe("Being Profile tab (#373)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("renders the enriched dossier in the biography editor", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) =>
                win.game.actors
                    .get(actor.id)
                    .update(
                        toRealm(win, {
                            "system.dossier":
                                "<p>Born of the northern clans.</p>",
                        }),
                    )
                    .then(() => null),
            );
            cy.openSheet(actor);
            cy.switchTab("profile", "primary");
            cy.get('section.tab[data-tab="profile"]')
                .should("contain.text", "Born of the northern clans.")
                // The editor must target the real field so edits persist.
                .find('[data-edit="system.dossier"]')
                .should("exist");
        });
    });
});
