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
 * schema-field round-trip are GREEN today, as is the cohort's read-only Shared
 * Gear tab (#76); the rest of derived behavior is a no-op (their Logic classes
 * call `super` only), so capacity/HP/move/invariant computation is RED (#184).
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

    it("cohort persists members[] referencing beings by shortcodeOrUuid", () => {
        cy.createActor("cohort", { name: "The Watch" }).then((actor) => {
            cy.foundry((win) =>
                patchSystem(win, actor.id, {
                    "system.leaderName": "Sergeant Vell",
                    "system.members": [
                        { shortcodeOrUuid: "vell" },
                        { shortcodeOrUuid: "arn" },
                    ],
                }),
            );
            cy.foundry((win) => {
                const s = win.game.actors.get(actor.id).system;
                return {
                    leaderName: s.leaderName,
                    count: s.members.length,
                    refs: s.members.map((m) => m.shortcodeOrUuid),
                    // role defaults are applied by the SchemaField.
                    roles: s.members.map((m) => m.role),
                };
            }).should((r) => {
                expect(r.leaderName).to.eq("Sergeant Vell");
                expect(r.count, "two members").to.eq(2);
                expect(r.refs).to.have.members(["vell", "arn"]);
                expect(
                    r.roles.every((x) => !!x),
                    "each member has a role",
                ).to.be.true;
            });
        });
    });

    it("vehicle persists occupants[] referencing actors by actorCodeOrUuid", () => {
        cy.createActor("vehicle", { name: "River Barge" }).then((actor) => {
            cy.foundry((win) =>
                patchSystem(win, actor.id, {
                    // `actorCodeOrUuid` is required; `title` is `blank: false`.
                    "system.occupants": [
                        { actorCodeOrUuid: "ferryman", title: "Captain" },
                        { actorCodeOrUuid: "deckhand", title: "Crew" },
                    ],
                }),
            );
            cy.foundry((win) => {
                const s = win.game.actors.get(actor.id).system;
                return {
                    occupantRefs: s.occupants.map((o) => o.actorCodeOrUuid),
                    occupantTitles: s.occupants.map((o) => o.title),
                    occupantRoles: s.occupants.map((o) => o.role),
                };
            }).should((r) => {
                expect(r.occupantRefs).to.have.members([
                    "ferryman",
                    "deckhand",
                ]);
                expect(r.occupantTitles).to.have.members(["Captain", "Crew"]);
                expect(
                    r.occupantRoles.every((x) => !!x),
                    "role defaults applied",
                ).to.be.true;
            });
        });
    });

    // ------------------------------------------------------------ shared gear (#76)

    describe("cohort shared gear", () => {
        /**
         * Build a cohort whose one member (a being) carries two items: one
         * shared with the cohort by its shortcode, one not shared at all.
         * Yields `{ cohort, member, sharedName, privateName }`.
         */
        function seedSharedGear() {
            return cy
                .createActor("cohort", {
                    name: "The Wardens",
                    system: { shortcode: "wardens" },
                })
                .then((cohort) =>
                    cy
                        .createActor("being", {
                            name: "Aldric Warden",
                            system: { shortcode: "aldricw" },
                        })
                        .then((member) =>
                            cy
                                .createItemOn(member, "miscgear", {
                                    name: "Shared Coil of Rope",
                                    system: {
                                        sharedWithCohortIds: ["wardens"],
                                    },
                                })
                                .then(() =>
                                    cy.createItemOn(member, "miscgear", {
                                        name: "Private Dagger",
                                    }),
                                )
                                .then(() =>
                                    cy.foundry((win) =>
                                        patchSystem(win, cohort.id, {
                                            "system.members": [
                                                { shortcodeOrUuid: "aldricw" },
                                            ],
                                        }),
                                    ),
                                )
                                .then(() => ({ cohort, member })),
                        ),
                );
        }

        it("aggregates a member's shared gear onto the cohort's logic", () => {
            seedSharedGear().then(({ cohort, member }) => {
                cy.foundry((win) =>
                    win.game.actors
                        .get(cohort.id)
                        .logic.sharedGear.map((e) => ({
                            name: e.gear.name,
                            carrier: e.carrierName,
                            carrierUuid: e.carrierUuid,
                        })),
                ).should((rows) => {
                    expect(rows, "only the shared item").to.have.length(1);
                    expect(rows[0].name).to.eq("Shared Coil of Rope");
                    expect(rows[0].carrier).to.eq(member.name);
                    expect(rows[0].carrierUuid).to.eq(member.uuid);
                });
            });
        });

        it("exposes a shared-gear tab listing the item and its carrier (#76)", () => {
            seedSharedGear().then(({ cohort, member }) => {
                cy.openSheet(cohort);
                cy.switchTab("sharedgear", "primary");
                cy.get('section.tab[data-tab="sharedgear"]').within(() => {
                    cy.contains("Shared Coil of Rope").should("exist");
                    cy.contains(member.name).should("exist");
                    cy.contains("Private Dagger").should("not.exist");
                });
            });
        });

        it("keeps the tab read-only: no create/delete or carry controls", () => {
            seedSharedGear().then(({ cohort }) => {
                cy.openSheet(cohort);
                cy.switchTab("sharedgear", "primary");
                cy.get('section.tab[data-tab="sharedgear"]').within(() => {
                    cy.get("[data-action]").should("not.exist");
                    cy.get(
                        ".item-carried, .item-create, .item-contextmenu",
                    ).should("not.exist");
                });
            });
        });

        it("leaves the shared item on its carrier, not on the cohort", () => {
            seedSharedGear().then(({ cohort, member }) => {
                cy.foundry((win) => ({
                    onCohort: win.game.actors.get(cohort.id).items.size,
                    onMember: win.game.actors
                        .get(member.id)
                        .itemTypes.miscgear.map((i) => i.name),
                })).should((r) => {
                    expect(r.onCohort, "cohort embeds nothing").to.eq(0);
                    expect(r.onMember).to.include("Shared Coil of Rope");
                });
            });
        });
    });

    // ------------------------------------------------------------------------ RED

    // RED — blocked by #184: derived behavior for all three — their Logic classes
    // are no-op `super` today (no capacity/HP/move/invariant computation). Assert
    // a derived property (structure capacity, cohort aggregate, vehicle load)
    // once implemented.
    it.skip("non-being logic derives capacity/HP/move/invariants (#184)", () => {});
});
