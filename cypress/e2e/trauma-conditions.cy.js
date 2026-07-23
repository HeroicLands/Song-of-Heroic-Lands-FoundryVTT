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

import "../support/commands";
import { tagName } from "../support/factories/ids.js";

/**
 * #648 — descriptive personality/physique traits are modelled as Trauma
 * conditions (`psycond` / `physcond`). Their injury-only fields (`levelBase`,
 * `aspect`, `bodyLocationCode`) are nullable so a condition can omit them. This
 * proves a real Foundry client accepts the create and the DataModel validates
 * `null` for those fields — in particular the novel `aspect` StringField that is
 * both `nullable` and `choices`-constrained.
 */
describe("descriptive conditions as trauma items (#648)", () => {
    before(() => cy.login());
    afterEach(() => cy.cleanupWorld());

    function createTrauma(win, system) {
        return win.Item.create(
            win.JSON.parse(
                win.JSON.stringify({
                    name: tagName(`${system.subType} cond`),
                    type: "trauma",
                    system,
                }),
            ),
        ).then((doc) => ({
            type: doc.type,
            subType: doc.system.subType,
            category: doc.system.category,
            levelBase: doc.system.levelBase,
            aspect: doc.system.aspect,
            bodyLocationCode: doc.system.bodyLocationCode,
        }));
    }

    it("a physcond trauma keeps its category and leaves injury fields null (schema initial)", () => {
        cy.foundry((win) =>
            createTrauma(win, { subType: "physcond", category: "trait" }),
        ).should((r) => {
            expect(r.type).to.eq("trauma");
            expect(r.subType).to.eq("physcond");
            expect(r.category).to.eq("trait");
            expect(r.levelBase).to.eq(null);
            expect(r.aspect).to.eq(null);
            expect(r.bodyLocationCode).to.eq(null);
        });
    });

    it("a psycond trauma with explicit null injury fields validates and loads", () => {
        cy.foundry((win) =>
            createTrauma(win, {
                subType: "psycond",
                category: "quirk",
                levelBase: null,
                aspect: null,
                bodyLocationCode: null,
            }),
        ).should((r) => {
            expect(r.subType).to.eq("psycond");
            expect(r.category).to.eq("quirk");
            expect(r.aspect).to.eq(null);
            expect(r.bodyLocationCode).to.eq(null);
        });
    });
});
