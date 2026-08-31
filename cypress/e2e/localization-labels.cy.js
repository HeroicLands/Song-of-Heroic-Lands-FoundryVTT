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
 * Localization rendering (issues #1353, #1352). Surfaces the unit suite cannot
 * prove, because Foundry assembles them itself:
 *
 *   1. The delete-confirmation dialog. It names the document's type from the
 *      `TYPES.*` root and interpolates it into the caution line — a raw key or a
 *      literal `{docType}` reaching the user is the defect.
 *   2. Structure actor sheet labels. Structure declares no fields of its own, so
 *      every label comes from the `SOHL.Actor` prefix; this asserts they resolve
 *      rather than falling back to raw keys.
 *   3. Gear subtype labels. #1352 moved the shared gear words onto `SOHL.Gear`
 *      and dropped MiscGear's own prefix, so the subtype → Gear → Item prefix
 *      chain is now load-bearing.
 */

/** The open (rendered) dialog's text, or "" when none is open. */
function openDialogText(win) {
    const dlg = Array.from(win.foundry.applications.instances.values())
        .reverse()
        .find((app) => /dialog/i.test(app.constructor.name) && app.rendered && app.element);
    return dlg ? `${dlg.element.textContent ?? ""}` : "";
}

describe("localized labels reach the user (#1353)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.closeAllSheets().then(() => cy.cleanupWorld()));

    // ------------------------------------------------ delete-confirmation dialog

    it("names the document type in the delete dialog, with no raw key and no placeholder", () => {
        cy.createWorldItem("skill", { name: "Doomed Skill" }).as("item");
        cy.then(function () {
            const itemId = this.item.id;
            // No `skipDialog` → the confirmation opens. Stash its promise so the
            // spec can read the dialog, then decline it.
            cy.foundry((win) => {
                const item = win.game.items.get(itemId);
                win.__del = item.system.logic.deleteDocument({});
                return null;
            });
            cy.window()
                .should((win) => {
                    expect(openDialogText(win)).to.contain("deleted");
                })
                .then((win) => {
                    const text = openDialogText(win);
                    // The type is named, in both the title and the caution line.
                    expect(text).to.contain("Skill");
                    expect(text).to.contain("Doomed Skill");
                    // …and neither surface leaks the machinery.
                    expect(text).to.not.match(/TYPES?\./);
                    expect(text).to.not.contain("{docType}");
                    expect(text).to.not.contain("{{");
                    expect(text).to.not.contain("SOHL.");
                });
            cy.submitDialog("no");
            // The declined delete resolves without removing the item.
            cy.foundry((win) => win.__del.then(() => !!win.game.items.get(itemId))).should(
                "eq",
                true,
            );
        });
    });

    // ------------------------------------------------- shared gear prefix labels

    it("labels a gear subtype's shared fields from the SOHL.Gear prefix", () => {
        // #1352 moved `encumbrance` (and the shared effect-key labels) onto
        // `SOHL.Gear`, relying on each subtype's LOCALIZATION_PREFIXES chain
        // ["SOHL.<Subtype>", "SOHL.Gear", "SOHL.Item"] to resolve them. Misc gear
        // no longer declares a subtype prefix at all, so it is the strictest case.
        cy.createWorldItem("armorgear", { name: "Mail Hauberk" }).as("armor");
        cy.createWorldItem("miscgear", { name: "Tin Cup" }).as("misc");
        cy.then(function () {
            for (const doc of [this.armor, this.misc]) {
                cy.openSheet(doc);
                cy.foundry((win) => {
                    const app = win.game.items.get(doc.id).sheet;
                    return `${app.element.textContent ?? ""}`;
                }).should((text) => {
                    expect(text).to.contain("Quality");
                    expect(text).to.contain("Durability");
                    expect(text).to.not.match(/SOHL\.[A-Za-z]+\./);
                });
                cy.closeAllSheets();
            }
        });
    });

    // ------------------------------------------------------ Structure sheet labels

    it("labels the Structure sheet's fields from the SOHL.Actor prefix", () => {
        cy.createActor("structure", { name: "Old Mill" }).as("structure");
        cy.then(function () {
            cy.openSheet(this.structure);
            cy.switchTab("profile", "primary");
            cy.foundry((win) => {
                const app = win.game.actors.get(this.structure.id).sheet;
                return `${app.element.textContent ?? ""}`;
            }).should((text) => {
                // `Appearance` is `SOHL.Actor.FIELDS.appearance.label`, and
                // `Biography` is `SOHL.Actor.SHEET.profile.biography.label` —
                // both reached only through the declared prefix.
                expect(text).to.contain("Appearance");
                expect(text).to.contain("Biography");
                // No unresolved key anywhere on the sheet.
                expect(text).to.not.match(/SOHL\.(Actor|Structure)\./);
            });
        });
    });
});
