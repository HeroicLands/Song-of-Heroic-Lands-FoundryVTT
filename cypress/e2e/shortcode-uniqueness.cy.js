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

import { tagName } from "../support/factories/ids.js";
import { toRealm } from "../support/resolve";

/**
 * `(type, shortcode)` uniqueness (#766): the runtime enforces the key on create
 * and update. A colliding explicit shortcode is rejected by default and
 * auto-suffixed when the caller passes `shortcodeDedupe: true`.
 */
describe("shortcode uniqueness (#766)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("rejects a colliding explicit shortcode on create (no dedupe)", () => {
        cy.createWorldItem("skill", {
            system: { shortcode: "dupsc" },
        }).then((first) => {
            expect(first, "first create succeeds").to.not.be.null;
            expect(first.system.shortcode).to.eq("dupsc");
            // A second world skill with the same shortcode is vetoed.
            cy.createWorldItem("skill", {
                system: { shortcode: "dupsc" },
            }).should("not.exist");
        });
    });

    it("auto-suffixes a colliding shortcode with shortcodeDedupe", () => {
        cy.createWorldItem("skill", {
            system: { shortcode: "dupsc" },
        }).then(() => {
            cy.foundry((win) =>
                win.Item.create(
                    toRealm(win, {
                        name: tagName("Beta"),
                        type: "skill",
                        // subType is required with no initial (#956); without it
                        // the create is vetoed and the dedupe never runs.
                        system: { subType: "social", shortcode: "dupsc" },
                    }),
                    { shortcodeDedupe: true },
                ).then((doc) => doc?.system?.shortcode),
            ).should("eq", "dupsc2");
        });
    });

    it("rejects renaming a shortcode into a collision on update", () => {
        cy.createWorldItem("skill", { system: { shortcode: "scone" } }).then(
            () => {
                cy.createWorldItem("skill", {
                    system: { shortcode: "sctwo" },
                }).then((b) => {
                    const id = b.id;
                    cy.foundry(async (win) => {
                        await win.game.items
                            .get(id)
                            .update(
                                toRealm(win, { "system.shortcode": "scone" }),
                            );
                        return win.game.items.get(id).system.shortcode;
                    }).should("eq", "sctwo"); // update vetoed → unchanged
                });
            },
        );
    });

    it("allows the same shortcode on a different type (key is per type)", () => {
        cy.createWorldItem("skill", { system: { shortcode: "shared" } }).then(
            (skill) => {
                expect(skill).to.exist;
                cy.createWorldItem("affliction", {
                    system: { shortcode: "shared" },
                }).then((affliction) => {
                    expect(affliction, "different type, same shortcode is fine")
                        .to.exist;
                    expect(affliction.system.shortcode).to.eq("shared");
                });
            },
        );
    });
});
