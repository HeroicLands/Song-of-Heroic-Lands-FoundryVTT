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
 * Scenario 3 (head): import the canonical starter being "Basic Folk" from the
 * `sohl.actors` compendium and confirm it lands fully populated. This also
 * validates the compendium-import seam the gear/combat specs rely on.
 */

import { BASIC_FOLK } from "../support/factories/basicFolk.js";

describe("being import — Basic Folk", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("imports Basic Folk fully populated (attributes, body, skills)", () => {
        cy.importActor().then((actor) => {
            expect(actor.type).to.eq("being");
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return {
                    items: a.items.size,
                    bodyParts: a.logic.body.structure.parts.length,
                    attrs: a.items.filter((i) => i.type === "attribute").length,
                    skills: a.items.filter((i) => i.type === "skill").length,
                    hasLogic: !!a.logic,
                };
            }).should((r) => {
                expect(r.hasLogic, "being .logic").to.be.true;
                expect(r.items, "embedded item count").to.be.greaterThan(40);
                expect(r.bodyParts, "has an inline body").to.be.greaterThan(0);
                expect(r.attrs, "14 attributes").to.eq(14);
                expect(r.skills, "skills present").to.be.greaterThan(20);
            });
        });
    });

    it("renames a duplicate import to a unique name (_preCreate)", () => {
        // Import untagged twice so SohlActor._preCreate's same-name uniqueness
        // fires. Each import gets a distinct shortcode (importActor uniquifies
        // the `(type, shortcode)` key), so only the name collides — isolating the
        // name-uniquify path. This test cleans up its own (untagged) artifacts.
        cy.importActor(BASIC_FOLK.pack, BASIC_FOLK.id, { tag: false }).then(
            (a1) => {
                cy.importActor(BASIC_FOLK.pack, BASIC_FOLK.id, {
                    tag: false,
                }).then((a2) => {
                    expect(a1.name).to.eq("Basic Folk");
                    expect(a2.name, "second import renamed").to.not.eq(a1.name);
                    expect(a2.name).to.match(/Basic Folk/);
                    cy.foundry(async (win) => {
                        await win.Actor.deleteDocuments([a1.id, a2.id]);
                        return true;
                    });
                });
            },
        );
    });
});
