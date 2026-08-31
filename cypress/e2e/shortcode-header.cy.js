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
 * Shortcode in the sheet header (#351):
 *
 * - **Item** sheets show an editable `system.shortcode` input directly under the
 *   Name field — no label, a localized placeholder (`SOHL.Common.shortcode`) —
 *   persisting via submitOnChange.
 * - **Being** (actor) sheets, after the Manuscript redesign (#782/#798), show the
 *   shortcode as read-only header text (`span.sheet-header__shortcode`) edited
 *   together with the name through the `editIdentity` DialogV2 pencil — routing the
 *   change through the `(type, shortcode)` uniqueness guard (#766) rather than a raw
 *   inline input.
 */
describe("shortcode header input (#351)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("actor sheet header: read-only shortcode edited via the identity pencil", () => {
        cy.createActor("being", {
            name: "Hero",
            system: { shortcode: "hdrbeing" },
        }).then((actor) => {
            cy.openSheet(actor);
            // The redesigned header renders the shortcode as read-only text (a
            // <span>, not an inline placeholder input), with an edit-identity
            // pencil beside it.
            cy.get(".sohl.being .sheet-header__shortcode")
                .should(($el) => expect($el[0].tagName).to.eq("SPAN"))
                .and("have.text", "hdrbeing");
            cy.get(".sohl.being [data-action='editIdentity']").should("exist");

            // Editing routes through the Edit Identity dialog: open it, set the
            // shortcode field, and Save.
            cy.get(".sohl.being [data-action='editIdentity']").click({
                force: true,
            });
            const findIdentityDlg = (win) =>
                Array.from(win.foundry.applications.instances.values())
                    .reverse()
                    .find(
                        (app) =>
                            /dialog/i.test(app.constructor.name) &&
                            app.rendered &&
                            app.element?.querySelector("input[name='shortcode']"),
                    );
            cy.window({ log: false }).should((win) => {
                expect(findIdentityDlg(win), "edit-identity dialog rendered").to.exist;
            });
            // The DialogV2 ok button reads its form via FormDataExtended on
            // click, so set the value and press Save atomically.
            cy.foundry((win) => {
                const dlg = findIdentityDlg(win);
                dlg.element.querySelector("input[name='shortcode']").value = "hdrbeing2";
                dlg.element.querySelector("button[data-action='ok']").click();
                return null;
            });
            // actor.update from the dialog callback is async — poll the live
            // document until the persisted shortcode updates.
            cy.window({ log: false }).should((win) => {
                expect(win.game.actors.get(actor.id).system.shortcode).to.eq("hdrbeing2");
            });
        });
    });

    it("item sheet header: editable shortcode under the name", () => {
        cy.createActor("being", { name: "Owner" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Stealth",
                system: { shortcode: "hdritem" },
            }).then((item) => {
                cy.closeAllSheets();
                cy.openSheet(item);
                // The placeholder is localized (`SOHL.Common.shortcode`), so
                // assert the localized value rather than a literal — the
                // wording is free to change, the binding is not.
                cy.foundry((win) => win.game.i18n.localize("SOHL.Common.shortcode")).then(
                    (placeholder) => {
                        expect(placeholder, "placeholder is localized").to.not.match(/^SOHL\./);
                        cy.get(".sheet-header__shortcode")
                            .should("have.attr", "placeholder", placeholder)
                            .and("have.value", "hdritem");
                    },
                );
                cy.editSheetField(item, "system.shortcode", "hdritem2");
                cy.foundry(
                    (win) => win.game.actors.get(actor.id).items.get(item.id).system.shortcode,
                ).should("eq", "hdritem2");
            });
        });
    });
});
