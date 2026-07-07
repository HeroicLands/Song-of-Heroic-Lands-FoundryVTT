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
 * Foundation / factory validation: every actor and item kind must create as a
 * valid document with a constructed `.logic`. Runs first in the suite so a bad
 * factory default or a missing required field surfaces here, in isolation,
 * rather than deep inside a feature spec.
 */

import { ACTOR_KINDS } from "../support/factories/actorFactory.js";
import { ITEM_KINDS } from "../support/factories/itemFactory.js";

describe("actor & item CRUD (factory validation)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    ACTOR_KINDS.forEach((kind) => {
        it(`creates a ${kind} actor with a constructed logic`, () => {
            cy.createActor(kind, { name: `crud ${kind}` }).then((actor) => {
                expect(actor, "created actor").to.exist;
                expect(actor.type).to.eq(kind);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return { exists: !!a, hasLogic: !!a?.logic, type: a?.type };
                }).should((r) => {
                    expect(r.exists, "in game.actors").to.be.true;
                    expect(r.hasLogic, "has .logic").to.be.true;
                    expect(r.type).to.eq(kind);
                });
            });
        });
    });

    ITEM_KINDS.forEach((kind) => {
        it(`creates a ${kind} world item with a constructed logic`, () => {
            cy.createWorldItem(kind, { name: `crud ${kind}` }).then((item) => {
                expect(item, "created item").to.exist;
                expect(item.type).to.eq(kind);
                cy.foundry(
                    (win) => !!win.game.items.get(item.id)?.logic,
                ).should("be.true");
            });
        });
    });

    it("cascades embedded-item deletion when the actor is deleted", () => {
        cy.createActor("being", { name: "cascade" }).then((actor) => {
            cy.createItemOn(actor, "miscgear", { name: "thing" });
            cy.foundry(
                (win) => win.game.actors.get(actor.id).items.size,
            ).should("eq", 1);
            cy.foundry(async (win) => {
                await win.game.actors.get(actor.id).delete();
                return true;
            });
            cy.foundry((win) => !!win.game.actors.get(actor.id)).should(
                "be.false",
            );
        });
    });
});
