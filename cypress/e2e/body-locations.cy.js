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
 * Combat-tab Body Locations table (#295). After the Manuscript redesign the
 * editable Zone → Part → Location tree lives on the Profile tab; the Combat tab
 * shows a FLAT, read-only armor-reference ledger — one row per hit location with
 * Material / B / E / P / F / Shock / Impair. Each location's protection is the
 * natural base plus the worn-armor aggregate.
 */
describe("Body Locations table", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    function combatSection(win, actorId) {
        return win.game.actors
            .get(actorId)
            .sheet.element.querySelector('section[data-tab="combat"]');
    }

    it("renders the flat location table with headers and natural values", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.wait(500);
            cy.foundry((win) => {
                const el = combatSection(win, actor.id);
                // Combat's Body Locations is a flat `.bodylocations-list`
                // wrapping one `.ledger` — column labels in `.ledger__head`,
                // one `.ledger__row` per hit location.
                const fs = el.querySelector(".bodylocations-list");
                const headers = [
                    ...fs.querySelectorAll(".ledger__head > div"),
                ].map((d) => d.textContent.trim());
                const locRows = fs.querySelectorAll(".ledger__row").length;
                const firstLoc = fs.querySelector(".ledger__row");
                return {
                    headers: [...new Set(headers)],
                    locRows,
                    firstName: firstLoc
                        ?.querySelector(".ledger__name")
                        ?.textContent?.trim(),
                };
            }).should((r) => {
                expect(r.headers).to.include.members([
                    "Location",
                    "Material",
                    "B",
                    "E",
                    "P",
                    "F",
                    "Shk",
                    "Imp",
                ]);
                expect(r.locRows, "location rows").to.be.at.least(1);
                expect(r.firstName, "location has a name").to.be.a("string").and
                    .not.empty;
            });
        });
    });

    it("adds worn-armor protection to a covered location's total", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            // Discover a real location shortcode + its natural blunt value.
            cy.foundry((win) => {
                const body = win.game.actors.get(actor.id).logic.body.structure;
                const loc = body.parts.flatMap((p) => p.locations)[0];
                return {
                    code: loc.shortcode,
                    name: loc.name,
                    baseBlunt: loc.protectionBase.blunt.effective,
                };
            }).then((ref) => {
                cy.createItemOn(actor, "armorgear", {
                    name: "Test Plate",
                    system: {
                        isWorn: true,
                        material: "Plate",
                        protectionBase: {
                            blunt: 6,
                            edged: 0,
                            piercing: 0,
                            fire: 0,
                        },
                        locations: { flexible: [], rigid: [ref.code] },
                    },
                }).then(() => {
                    cy.prepare(actor); // re-evaluate → re-aggregate armor
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(500);
                    cy.foundry((win) => {
                        const el = combatSection(win, actor.id);
                        const row = [
                            ...el.querySelectorAll(
                                ".bodylocations-list .ledger__row",
                            ),
                        ].find(
                            (r) =>
                                r
                                    .querySelector(".ledger__name")
                                    ?.textContent?.trim() === ref.name,
                        );
                        const d = row.querySelectorAll(".ledger__cell");
                        // cells: Material, B, E, P, F, Shock, Impair
                        return {
                            layers: d[0].textContent.trim(),
                            blunt: Number(d[1].textContent.trim()),
                        };
                    }).should((r) => {
                        expect(r.blunt, "blunt = natural + armor").to.equal(
                            ref.baseBlunt + 6,
                        );
                        expect(r.layers, "layer material listed").to.contain(
                            "Plate",
                        );
                    });
                });
            });
        });
    });
});
