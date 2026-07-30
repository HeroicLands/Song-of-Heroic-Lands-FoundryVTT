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

    it("is hidden when another tab is active (#812)", () => {
        // Regression: the Facade tab declared `display` on its own `.tab`
        // element, overriding Foundry's inactive-tab hiding, so its portrait
        // and appearance editor leaked onto every tab. Switching away must now
        // collapse the Facade section (display:none) like any other inactive
        // tab. Assert through the actor's own sheet element — a document-level
        // `cy.get` can match a leftover facade section from a prior test's
        // sheet (testIsolation is off), which reads as still-active.
        cy.importActor().then((actor) => {
            // Close any sheet left open by a prior test (testIsolation is off),
            // so `switchTab`'s document-level nav click targets this sheet and
            // not a leftover one.
            cy.closeAllSheets();
            cy.openSheet(actor);
            // `switchTab` waits until the profile section carries `.active`.
            cy.switchTab("profile", "primary");
            cy.foundry((win) => {
                const el = win.game.actors.get(actor.id)?.sheet?.element;
                const facade = el?.querySelector(
                    'section.tab[data-tab="facade"]',
                );
                return {
                    facadeActive: facade?.classList.contains("active") ?? null,
                    facadeDisplay:
                        facade ? win.getComputedStyle(facade).display : null,
                };
            }).should("deep.equal", {
                facadeActive: false,
                facadeDisplay: "none",
            });
            cy.screenshot("facade-812-profile-tab-no-leak", {
                capture: "viewport",
            });
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
            cy.get('section.tab[data-tab="facade"] .facade__editor').should(
                "contain.text",
                "Weathered and scarred.",
            );
            // The ProseMirror editor binds the real field via `name` so edits
            // persist. Re-query (rather than chaining `.find`) — the editor
            // enriches asynchronously and detaches the prior subtree.
            cy.get(
                'section.tab[data-tab="facade"] .facade__editor [name="system.appearance"]',
            ).should("exist");
        });
    });
});
