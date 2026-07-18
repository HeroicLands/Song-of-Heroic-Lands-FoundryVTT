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
 * Regression guard for #148: DataModel `StringField({ choices })` must be a
 * value-keyed object, not the enum `values` array. Foundry builds `<option>`
 * values from `Object.entries(choices)`, so an array yields index option values
 * (`0,1,2,…`) and breaks any editable select of that field. These fields are not
 * yet rendered as editable selects, so this asserts the schema directly.
 */

// item-kind → choice field paths that were converted from array to object.
const ITEM_CHOICE_FIELDS = {
    skill: ["subType", "combatCategory"],
    trauma: ["subType", "aspect"],
    mystery: ["subType"],
    mysticalability: ["subType"],
    affliction: ["subType", "transmission"],
    concoctiongear: ["subType", "potency"],
    projectilegear: ["subType"],
    trait: ["subType", "intensity"],
};

describe("DataModel choices are value-keyed objects (#148)", () => {
    before(() => cy.login());

    it("every converted item choice field has object (not array) choices", () => {
        cy.foundry((win) => {
            const bad = [];
            for (const [kind, fields] of Object.entries(ITEM_CHOICE_FIELDS)) {
                const model = win.CONFIG.Item.dataModels[kind];
                for (const name of fields) {
                    const field = model.schema.fields[name];
                    const ch =
                        typeof field?.choices === "function" ?
                            field.choices()
                        :   field?.choices;
                    const ok =
                        ch && typeof ch === "object" && !Array.isArray(ch);
                    if (!ok) bad.push(`${kind}.${name}`);
                }
            }
            return bad;
        }).should((bad) => {
            expect(
                bad,
                `array-choices fields: ${bad.join(", ")}`,
            ).to.have.length(0);
        });
    });
});
