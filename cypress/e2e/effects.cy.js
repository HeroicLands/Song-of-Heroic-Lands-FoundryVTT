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
 * Active effects: a SoHL custom effect must be creatable with its data model
 * applied. The `sohleffectdata` subtype (used by the add-effect action) is now
 * declared in `system.json` `documentTypes` (fix for #145) — before that the
 * type was rejected as invalid and effects had no `system.*` (scope/changes).
 */

describe("active effects", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("creates a sohleffectdata effect with its data model applied", () => {
        cy.createWorldItem("miscgear", { name: "Enchanted" }).as("item");
        cy.then(function () {
            const id = this.item.id;
            cy.foundry(async (win) => {
                const doc = win.game.items.get(id);
                const [eff] = await doc.createEmbeddedDocuments(
                    "ActiveEffect",
                    [
                        win.JSON.parse(
                            JSON.stringify({
                                name: "Buff",
                                type: "sohleffectdata",
                            }),
                        ),
                    ],
                );
                return {
                    created: !!eff,
                    type: eff?.type,
                    // Data-model fields present ⇒ SohlActiveEffectDataModel applied.
                    hasScope: eff?.system?.scope !== undefined,
                    hasChanges: Array.isArray(eff?.system?.changes),
                };
            }).then((r) => {
                expect(r.created, "effect created").to.be.true;
                expect(r.type, "sohl effect subtype").to.eq("sohleffectdata");
                expect(r.hasScope, "system.scope present (data model applied)")
                    .to.be.true;
                expect(r.hasChanges, "system.changes array present").to.be.true;
            });
        });
    });

    it("renders the effect on an item sheet's effects tab", () => {
        cy.createWorldItem("miscgear", { name: "Enchanted2" }).as("item");
        cy.then(function () {
            const id = this.item.id;
            cy.foundry(async (win) => {
                const doc = win.game.items.get(id);
                await doc.createEmbeddedDocuments("ActiveEffect", [
                    win.JSON.parse(
                        JSON.stringify({
                            name: "Ward",
                            type: "sohleffectdata",
                        }),
                    ),
                ]);
                return true;
            });
            cy.foundry((win) => win.game.items.get(id).sheet.render(true));
            cy.switchTab("effects", "sheet");
            cy.get('section.tab[data-tab="effects"] .effects__row').should(
                "have.length.greaterThan",
                0,
            );
        });
    });
});
