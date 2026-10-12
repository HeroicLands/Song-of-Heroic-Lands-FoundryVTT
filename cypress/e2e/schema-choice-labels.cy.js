/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute this file under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

describe("localized schema choice labels", () => {
    let createdItemIds;

    beforeEach(() => {
        createdItemIds = [];
        cy.login();
    });

    afterEach(() => {
        cy.closeAllSheets();
        cy.foundry((win) => {
            if (createdItemIds.length === 0) return null;
            return win.Item.deleteDocuments([...createdItemIds]).then(() => null);
        });
    });

    it("localizes choices while preserving their enum values and model state", () => {
        cy.createWorldItem("affliction", {
            name: "Localized Affliction",
            system: { transmission: "none", outcome: "cured" },
        })
            .then((item) => {
                createdItemIds.push(item.id);
                return item;
            })
            .as("affliction");
        cy.createWorldItem("concoctiongear", {
            name: "Localized Concoction",
            system: { potency: "na" },
        })
            .then((item) => {
                createdItemIds.push(item.id);
                return item;
            })
            .as("concoction");

        cy.then(function () {
            const afflictionId = this.affliction.id;
            const concoctionId = this.concoction.id;
            cy.foundry((win) => ({
                affliction: {
                    transmission: win.game.items.get(afflictionId).system.transmission,
                    outcome: win.game.items.get(afflictionId).system.outcome,
                },
                potency: win.game.items.get(concoctionId).system.potency,
            })).then((before) => {
                cy.openSheet(this.affliction);
                cy.foundry((win) => {
                    const item = win.game.items.get(afflictionId);
                    const sheet = item.sheet.element;
                    const choices = (name) => {
                        const select = sheet.querySelector(`select[name="system.${name}"]`);
                        return {
                            value: select.value,
                            options: Array.from(select.options).map((option) => ({
                                value: option.value,
                                label: option.textContent.trim(),
                            })),
                        };
                    };
                    return {
                        transmission: choices("transmission"),
                        outcome: choices("outcome"),
                        model: {
                            transmission: item.system.transmission,
                            outcome: item.system.outcome,
                        },
                    };
                }).should((rendered) => {
                    expect(rendered.transmission.options).to.deep.include({
                        value: "none",
                        label: "Noncommunicable",
                    });
                    expect(rendered.outcome.options).to.deep.include({
                        value: "cured",
                        label: "Cured",
                    });
                    expect(rendered.transmission.options.map((option) => option.label)).to.satisfy(
                        (labels) => labels.every((label) => !/^SOHL\./.test(label)),
                    );
                    expect(rendered.outcome.options.map((option) => option.label)).to.satisfy(
                        (labels) => labels.every((label) => !/^SOHL\./.test(label)),
                    );
                    expect(rendered.transmission.value).to.equal("none");
                    expect(rendered.outcome.value).to.equal("cured");
                    expect(rendered.model).to.deep.equal(before.affliction);
                });

                cy.closeAllSheets();
                cy.openSheet(this.concoction);
                cy.foundry((win) => {
                    const item = win.game.items.get(concoctionId);
                    const select = item.sheet.element.querySelector(
                        'select[name="system.potency"]',
                    );
                    return {
                        value: select.value,
                        options: Array.from(select.options).map((option) => ({
                            value: option.value,
                            label: option.textContent.trim(),
                        })),
                        model: item.system.potency,
                    };
                }).should((rendered) => {
                    expect(rendered.options).to.deep.include({
                        value: "na",
                        label: "Not Applicable",
                    });
                    expect(rendered.options.map((option) => option.label)).to.satisfy((labels) =>
                        labels.every((label) => !/^SOHL\./.test(label)),
                    );
                    expect(rendered.value).to.equal("na");
                    expect(rendered.model).to.equal(before.potency);
                });
            });
        });
    });
});
