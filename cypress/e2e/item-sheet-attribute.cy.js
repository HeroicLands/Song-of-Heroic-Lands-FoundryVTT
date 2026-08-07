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

import { itemSheetSuite } from "../support/itemSheetSuite.js";

itemSheetSuite("attribute");

/**
 * #1105 — the Properties tab's two scalar fields rendered with **empty**
 * `<label>`s, so a reader saw `10` and `3d6` side by side with nothing saying
 * which was which. `formGroup` labels a field from `field.label`, which
 * Foundry's `Localization.localizeSchema` only assigns when a
 * `<PREFIX>.FIELDS.<path>.label` key exists — and `lang/en.json` had no
 * `SOHL.Attribute.FIELDS.*` entries at all.
 *
 * The unit suite guards the keys' presence; only a live client proves
 * `localizeSchema` actually resolved them onto the rendered control, since the
 * Node template harness stubs `formGroup`.
 */
describe("attribute sheet field labels (#1105)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("labels Score and Init Dice Formula on the Properties tab", () => {
        cy.createWorldItem("attribute", { name: "Strength" }).then((item) => {
            cy.openSheet(item);
            // Item sheets declare their tabs in the "sheet" group.
            cy.switchTab("properties", "sheet");
            cy.foundry((win) => {
                const root = win.game.items.get(item.id).sheet.element;
                const labelFor = (name) => {
                    const input = root.querySelector(`[name="${name}"]`);
                    const group = input?.closest(".form-group");
                    return group?.querySelector("label")?.textContent.trim();
                };
                return {
                    score: labelFor("system.scoreBase") ?? null,
                    initDice: labelFor("system.initDiceFormula") ?? null,
                };
            }).should((l) => {
                expect(l.score, "scoreBase label").to.eq("Score");
                expect(l.initDice, "initDiceFormula label").to.eq(
                    "Init Dice Formula",
                );
            });
        });
    });
});
