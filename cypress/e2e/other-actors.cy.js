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
 * Non-being actor kinds: cohort, structure, vehicle.
 *
 * Each is a `SohlActorDataModel` subtype with its own schema. Containment and
 * schema-field round-trip are GREEN today; derived behavior is a no-op (their
 * Logic classes call `super` only), so capacity/HP/move/invariant computation is
 * RED (#184) and the cohort shared-gear tab is RED (#76).
 */

/** Update a document's `system` with a realm-cloned patch; resolves after settle. */
function patchSystem(win, id, patch) {
    return win.game.actors
        .get(id)
        .update(win.JSON.parse(JSON.stringify(patch)));
}

describe("non-being actors: cohort / structure / vehicle", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // ------------------------------------------------------------- create + logic

    for (const kind of ["cohort", "structure", "vehicle"]) {
        it(`${kind} creates and carries a .logic`, () => {
            cy.createActor(kind, { name: `other ${kind}` }).then((actor) => {
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return { type: a.type, hasLogic: !!a.logic };
                }).should((r) => {
                    expect(r.type, "actor type").to.eq(kind);
                    expect(r.hasLogic, "carries .logic").to.be.true;
                });
            });
        });
    }

    // ----------------------------------------------------------------- containment

    it("structure embeds gear items", () => {
        cy.createActor("structure", { name: "Keep" }).then((actor) => {
            cy.createItemOn(actor, "miscgear", {
                name: "Portcullis Winch",
            }).then(() => {
                cy.foundry((win) =>
                    win.game.actors
                        .get(actor.id)
                        .itemTypes.miscgear.map((i) => i.name),
                ).should("include", "Portcullis Winch");
            });
        });
    });

    // -------------------------------------------------------------- schema fields

    it("cohort persists members[] referencing beings by shortcode", () => {
        cy.createActor("cohort", { name: "The Watch" }).then((actor) => {
            cy.foundry((win) =>
                patchSystem(win, actor.id, {
                    "system.leaderName": "Sergeant Vell",
                    "system.members": [
                        { shortcode: "vell", name: "Sergeant Vell" },
                        { shortcode: "arn", name: "Arn" },
                    ],
                }),
            );
            cy.foundry((win) => {
                const s = win.game.actors.get(actor.id).system;
                return {
                    leaderName: s.leaderName,
                    count: s.members.length,
                    shortcodes: s.members.map((m) => m.shortcode),
                    // role defaults are applied by the SchemaField.
                    roles: s.members.map((m) => m.role),
                };
            }).should((r) => {
                expect(r.leaderName).to.eq("Sergeant Vell");
                expect(r.count, "two members").to.eq(2);
                expect(r.shortcodes).to.have.members(["vell", "arn"]);
                expect(
                    r.roles.every((x) => !!x),
                    "each member has a role",
                ).to.be.true;
            });
        });
    });

    it("vehicle persists cargo capacity and occupants[]", () => {
        cy.createActor("vehicle", { name: "River Barge" }).then((actor) => {
            cy.foundry((win) =>
                patchSystem(win, actor.id, {
                    "system.cargoCapacity": 500,
                    "system.crewRequired": 2,
                    // `name` and `title` are `blank: false`, so both must be
                    // non-empty for the occupant to survive schema validation.
                    "system.occupants": [
                        { name: "Ferryman", title: "Captain" },
                        { name: "Deckhand", title: "Crew" },
                    ],
                }),
            );
            cy.foundry((win) => {
                const s = win.game.actors.get(actor.id).system;
                return {
                    cargoCapacity: s.cargoCapacity,
                    crewRequired: s.crewRequired,
                    occupantNames: s.occupants.map((o) => o.name),
                    occupantRoles: s.occupants.map((o) => o.role),
                };
            }).should((r) => {
                expect(r.cargoCapacity).to.eq(500);
                expect(r.crewRequired).to.eq(2);
                expect(r.occupantNames).to.have.members([
                    "Ferryman",
                    "Deckhand",
                ]);
                expect(
                    r.occupantRoles.every((x) => !!x),
                    "role defaults applied",
                ).to.be.true;
            });
        });
    });

    // ------------------------------------------------------------------------ RED

    // RED — blocked by #76: cohort shared-gear tab.
    it.skip("cohort exposes a shared-gear tab (#76)", () => {});

    // RED — blocked by #184: derived behavior for all three — their Logic classes
    // are no-op `super` today (no capacity/HP/move/invariant computation). Assert
    // a derived property (structure capacity, cohort aggregate, vehicle load)
    // once implemented.
    it.skip("non-being logic derives capacity/HP/move/invariants (#184)", () => {});
});
