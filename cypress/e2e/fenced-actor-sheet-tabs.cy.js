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
 * Vehicle / Structure / Cohort sheets: every declared tab must render its body,
 * not just Facade (issue #1088). The base actor sheet used to hard-code its
 * render list to header/tabs/facade, so the gear/actions/effects/members parts
 * these sheets declare never reached the DOM — the nav buttons switched, but the
 * panel below them was empty and there was no way to run an action from the
 * sheet.
 *
 * These types are fenced for the Being-centric beta, so the suite is the mirror
 * image of `being-sheet.cy.js`'s tab loop rather than a full behavioral suite:
 * it proves each tab body renders and carries its content.
 */

/** The tabs each fenced actor sheet declares, in declaration order. */
const FENCED_SHEETS = [
    { kind: "vehicle", tabs: ["facade", "gear", "actions", "effects"] },
    { kind: "structure", tabs: ["facade", "gear", "actions", "effects"] },
    { kind: "cohort", tabs: ["facade", "members", "actions", "effects"] },
];

/** The intrinsic actions every actor carries, whatever its type. */
const SHARED_ACTIONS = ["editDocument", "makeDefaultMedium", "deleteDocument"];

describe("fenced actor sheets render every tab (#1088)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    FENCED_SHEETS.forEach(({ kind, tabs }) => {
        tabs.forEach((tab) => {
            it(`${kind}: activates the ${tab} tab and renders its body`, () => {
                cy.createActor(kind, { name: `tabs ${kind}` }).then((actor) => {
                    cy.openSheet(actor);
                    cy.switchTab(tab, "primary");
                    cy.get(
                        `section.tab[data-group="primary"][data-tab="${tab}"]`,
                    ).should("have.class", "active");
                });
            });
        });

        // The issue's headline complaint: the actions exist on the actor, but the
        // Actions tab listed none of them, so there was no way to run one.
        it(`${kind}: lists its intrinsic actions with a run control`, () => {
            cy.createActor(kind, { name: `actions ${kind}` }).then((actor) => {
                cy.openSheet(actor);
                cy.switchTab("actions", "primary");
                cy.get('section.tab[data-tab="actions"]').within(() => {
                    SHARED_ACTIONS.forEach((name) => {
                        cy.get(`.ledger__row[data-action-name="${name}"]`)
                            .should("exist")
                            .find('[data-action="runAction"]')
                            .should("exist");
                    });
                });
            });
        });

        // The header context was never prepared for these sheets either, so the
        // name and portrait rendered blank.
        it(`${kind}: shows the actor's name in the sheet header`, () => {
            cy.createActor(kind, { name: `header ${kind}` }).then((actor) => {
                cy.openSheet(actor);
                cy.get('.sheet-header input[name="name"]').should(
                    "have.value",
                    actor.name,
                );
            });
        });

        it(`${kind}: lists its own effects on the Effects tab`, () => {
            cy.createActor(kind, { name: `effects ${kind}` }).then((actor) => {
                const id = actor.id;
                cy.foundry(async (win) => {
                    await win.game.actors
                        .get(id)
                        .createEmbeddedDocuments("ActiveEffect", [
                            win.JSON.parse(
                                JSON.stringify({
                                    name: "Barnacles",
                                    type: "sohleffectdata",
                                }),
                            ),
                        ]);
                    return true;
                });
                cy.openSheet(actor);
                cy.switchTab("effects", "primary");
                cy.get('section.tab[data-tab="effects"] .effects__row')
                    .should("have.length.greaterThan", 0)
                    .and("contain.text", "Barnacles");
            });
        });
    });

    // Gear is a Vehicle/Structure tab (cargo and stores); a Cohort's shared-gear
    // tab is separate work.
    ["vehicle", "structure"].forEach((kind) => {
        it(`${kind}: lists an embedded gear item on the Gear tab`, () => {
            cy.createActor(kind, { name: `gear ${kind}` }).then((actor) => {
                cy.createItemOn(actor, "miscgear", { name: "Ship's Biscuit" });
                cy.openSheet(actor);
                cy.switchTab("gear", "primary");
                cy.get('section.tab[data-tab="gear"] .gear-list')
                    .should("exist")
                    .and("contain.text", "Ship's Biscuit");
            });
        });
    });
});
