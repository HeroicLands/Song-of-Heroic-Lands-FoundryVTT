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
 * Combat-tab Body Locations tree (#295). Read-only Part → Location display; each
 * location shows effective protection = natural base + worn-armor aggregate.
 */
describe("Body Locations tree", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    function combatSection(win, actorId) {
        return win.game.actors
            .get(actorId)
            .sheet.element.querySelector('section[data-tab="combat"]');
    }

    it("renders the Part → Location tree with header and natural values", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.wait(500);
            cy.foundry((win) => {
                const el = combatSection(win, actor.id);
                const fs = [...el.querySelectorAll("fieldset")].find((f) =>
                    /Body Locations/.test(
                        f.querySelector("legend")?.textContent ?? "",
                    ),
                );
                const headers = [
                    ...fs.querySelectorAll("header.list__header .list__detail"),
                ].map((d) => d.textContent.trim());
                const parts = fs.querySelectorAll(".bodypart").length;
                const locRows = fs.querySelectorAll("li.bodylocation").length;
                const firstLoc = fs.querySelector("li.bodylocation");
                const cells =
                    firstLoc ?
                        [...firstLoc.querySelectorAll(".list__detail")].map(
                            (c) => c.textContent.trim(),
                        )
                    :   [];
                return {
                    headers: [...new Set(headers)],
                    parts,
                    locRows,
                    firstName: firstLoc
                        ?.querySelector("h4")
                        ?.textContent?.trim(),
                    cellCount: cells.length,
                };
            }).should((r) => {
                expect(r.headers).to.include.members([
                    "Layers",
                    "B",
                    "E",
                    "P",
                    "F",
                    "Shock",
                    "Impair",
                ]);
                expect(r.parts, "body parts").to.be.at.least(1);
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
                const body = win.game.actors.get(actor.id).logic.logicTypes
                    .corpus[0].structure;
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
                        isEquipped: true,
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
                            ...el.querySelectorAll("li.bodylocation"),
                        ].find(
                            (li) =>
                                li.querySelector("h4")?.textContent?.trim() ===
                                ref.name,
                        );
                        const d = row.querySelectorAll(".list__detail");
                        // cells: Layers, B, E, P, F, Shock, Impair
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
