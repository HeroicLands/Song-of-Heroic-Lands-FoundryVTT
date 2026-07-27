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
 * Trauma sheet Sub-type control localization (#754).
 *
 * The `system.subType` `formGroup` on the Trauma properties tab did not pass
 * `localize=true`, so Foundry rendered the choices map's i18n keys verbatim
 * (e.g. "SOHL.Trauma.SubType.physical") instead of the localized label
 * ("Injury"). Parallels the Skill Combat Category fix (#751).
 */
describe("trauma sheet sub-type localization (#754)", () => {
    const SEL = '[name="system.subType"]';

    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function renderSheet(uuid) {
        cy.foundry((win) =>
            Cypress.Promise.resolve(
                win.fromUuidSync(uuid).sheet.render(true),
            ).then(() => null),
        );
        cy.wait(400);
    }

    it("localizes the Sub-type option labels", () => {
        cy.createActor("being", { name: "Trauma I18n Being" }).then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Gash",
                system: { subType: "physical" },
            }).then((trauma) => {
                renderSheet(trauma.uuid);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(trauma.uuid).sheet.element;
                    const ctrl = el.querySelector(SEL);
                    const selected = ctrl?.selectedOptions?.[0];
                    return {
                        present: !!ctrl,
                        label: selected?.textContent?.trim(),
                        allLabels: Array.from(ctrl?.options ?? []).map((o) =>
                            o.textContent.trim(),
                        ),
                    };
                }).should((r) => {
                    expect(r.present, "sub-type control present").to.be.true;
                    // The selected option must show the localized label, not the
                    // raw i18n key.
                    expect(r.label).to.equal("Injury");
                    expect(r.allLabels).not.to.include(
                        "SOHL.Trauma.SubType.physical",
                    );
                });
            });
        });
    });
});
