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
 * schema-field round-trip, membership Health counts, Structure Health/capacity,
 * and informational Vehicle payload derive from real owned and referenced documents.
 */

/** Update a document's `system` with a realm-cloned patch; resolves after settle. */
function patchSystem(win, id, patch) {
    return win.game.actors.get(id).update(win.JSON.parse(JSON.stringify(patch)));
}

describe("non-being actors: cohort / structure / vehicle", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

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
                    win.game.actors.get(actor.id).itemTypes.miscgear.map((i) => i.name),
                ).should("include", "Portcullis Winch");
            });
        });
    });

    // -------------------------------------------------------------- schema fields

    it("cohort persists members[] referencing beings by shortcodeOrUuid", () => {
        cy.createActor("cohort", { name: "The Watch" }).then((actor) => {
            cy.foundry((win) =>
                patchSystem(win, actor.id, {
                    // The leader is one of the members, named by the same
                    // handle its member entry carries.
                    "system.leaderCode": "vell",
                    "system.members": [{ shortcodeOrUuid: "vell" }, { shortcodeOrUuid: "arn" }],
                }),
            );
            cy.foundry((win) => {
                const s = win.game.actors.get(actor.id).system;
                return {
                    leaderCode: s.leaderCode,
                    count: s.members.length,
                    refs: s.members.map((m) => m.shortcodeOrUuid),
                    // role defaults are applied by the SchemaField.
                    roles: s.members.map((m) => m.role),
                };
            }).should((r) => {
                expect(r.leaderCode).to.eq("vell");
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
                expect(r.occupantRefs).to.have.members(["ferryman", "deckhand"]);
                expect(r.occupantTitles).to.have.members(["Captain", "Crew"]);
                expect(
                    r.occupantRoles.every((x) => !!x),
                    "role defaults applied",
                ).to.be.true;
            });
        });
    });

    // ------------------------------------------------------------ shared gear

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
                                            "system.members": [{ shortcodeOrUuid: "aldricw" }],
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
                    win.game.actors.get(cohort.id).logic.sharedGear.map((e) => ({
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

        it("exposes a shared-gear tab listing the item and its carrier", () => {
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
                    cy.get(".item-carried, .item-create, .item-contextmenu").should("not.exist");
                });
            });
        });

        it("leaves the shared item on its carrier, not on the cohort", () => {
            seedSharedGear().then(({ cohort, member }) => {
                cy.foundry((win) => ({
                    onCohort: win.game.actors.get(cohort.id).items.size,
                    onMember: win.game.actors.get(member.id).itemTypes.miscgear.map((i) => i.name),
                })).should((r) => {
                    expect(r.onCohort, "cohort embeds nothing").to.eq(0);
                    expect(r.onMember).to.include("Shared Coil of Rope");
                });
            });
        });
    });

    describe("derived actor state (#40/#41/#42)", () => {
        /** Seed real documents: one Being counted both directly and through a Cohort. */
        function seedDerivedActors() {
            return cy.importActor().then((member) =>
                cy
                    .foundry((win) =>
                        patchSystem(win, member.id, {
                            "system.body.weight.base": 100,
                            "system.body.weight.calc": "0",
                        }),
                    )
                    .then(() =>
                        cy.createActor("cohort", {
                            name: "Derived Watch",
                            system: {
                                members: [
                                    { shortcodeOrUuid: member.uuid },
                                    { shortcodeOrUuid: "missing-derived-member" },
                                ],
                            },
                        }),
                    )
                    .then((cohort) =>
                        cy
                            .createActor("structure", {
                                name: "Derived Keep",
                                system: {
                                    maxHealth: 10,
                                    occupantCapacity: 0,
                                    cargoCapacity: 2,
                                    occupants: [
                                        { actorCodeOrUuid: member.uuid },
                                        { actorCodeOrUuid: cohort.uuid },
                                        { actorCodeOrUuid: "missing-derived-occupant" },
                                    ],
                                },
                            })
                            .then((structure) =>
                                cy
                                    .createActor("vehicle", {
                                        name: "Derived Cart",
                                        system: {
                                            occupantCapacity: 0,
                                            carryingCapacity: 2,
                                            currentMoveMedium: "terrestrial",
                                            movementProfiles: [
                                                {
                                                    medium: "terrestrial",
                                                    feetPerRound: 50,
                                                    leaguesPerWatch: 5,
                                                    encumbrance: "0",
                                                    strMod: "0",
                                                    disabled: false,
                                                },
                                            ],
                                            occupants: [
                                                { actorCodeOrUuid: member.uuid },
                                                { actorCodeOrUuid: cohort.uuid },
                                                { actorCodeOrUuid: "missing-derived-occupant" },
                                            ],
                                        },
                                    })
                                    .then((vehicle) => ({ member, cohort, structure, vehicle })),
                            ),
                    ),
            );
        }

        /** Read the real actors without manually preparing their referenced state. */
        function state(win, docs) {
            const member = win.game.actors.get(docs.member.id);
            const cohort = win.game.actors.get(docs.cohort.id);
            const structure = win.game.actors.get(docs.structure.id);
            const vehicle = win.game.actors.get(docs.vehicle.id);
            return {
                memberHealth: member ? { ...member.system.health } : undefined,
                memberBand: member?.logic.healthBand,
                memberWeight: member?.logic.body.weight.effective,
                memberCarriedWeight: member?.logic.carriedWeight.effective,
                memberCount: cohort.system.memberCount,
                bands: { ...cohort.system.healthBandCounts },
                cohortRows: cohort.logic.memberRows.map((row) => ({
                    name: row.name,
                    resolved: row.isResolved,
                    healthPct: row.healthPct,
                })),
                structureHealth: { ...structure.system.health },
                structureCount: structure.logic.occupantCount,
                structureCargo: structure.logic.cargoWeight,
                structureOverPeople: structure.logic.occupantsOverCapacity,
                structureOverCargo: structure.logic.cargoOverCapacity,
                vehicleCount: vehicle.logic.occupantCount,
                vehicleCargo: vehicle.logic.cargoWeight,
                vehicleOccupantWeight: vehicle.logic.occupantWeight,
                vehicleLoad: vehicle.logic.totalLoad,
                vehicleMove: vehicle.logic.feetPerRound.effective,
                vehicleTravel: vehicle.logic.leaguesPerWatch.effective,
                structureRows: structure.logic.occupantRows.map((row) => ({
                    ref: row.ref,
                    name: row.name,
                    resolved: row.isResolved,
                })),
            };
        }

        it("derives membership, Structure Health/capacity and Vehicle payload for all three kinds", () => {
            seedDerivedActors().then((docs) => {
                cy.foundry((win) => state(win, docs)).should((r) => {
                    expect(r.memberCount, "unresolved member excluded").to.eq(1);
                    expect(r.bands[r.memberBand], "resolved member's actual Health band").to.eq(1);
                    expect(Object.values(r.bands).reduce((sum, count) => sum + count, 0)).to.eq(1);
                    expect(r.structureHealth).to.deep.eq({ value: 10, max: 10 });
                    expect(r.structureCount, "direct and cohort reference deduplicated").to.eq(1);
                    expect(r.structureOverPeople, "capacity warning never blocks occupants").to.eq(
                        true,
                    );
                    expect(r.structureRows).to.have.length(3);
                    expect(r.structureRows[2].resolved).to.eq(false);
                    expect(r.vehicleCount).to.eq(1);
                    expect(r.vehicleOccupantWeight).to.eq(r.memberWeight + r.memberCarriedWeight);
                    expect(r.vehicleLoad).to.eq(r.vehicleOccupantWeight);
                    expect(r.vehicleMove).to.eq(50);
                    expect(r.vehicleTravel).to.eq(5);
                });
                cy.openSheet(docs.structure);
                cy.get('input[name="system.maxHealth"]').should("have.value", "10");
                cy.get(".sheet-header .warning").should("exist");
                cy.switchTab("occupants", "primary");
                cy.get('section.tab[data-tab="occupants"]').within(() => {
                    cy.contains("missing-derived-occupant").should("exist");
                    cy.get('[data-action="removeStructureOccupant"]').should("have.length", 3);
                });
            });
        });

        it("refreshes structural Injury damage and cargo without blocking over-capacity edits", () => {
            seedDerivedActors().then((docs) => {
                cy.createItemOn(docs.structure, "trauma", {
                    name: "Broken masonry",
                    system: { subType: "injury", levelBase: 3 },
                }).then((injury) => {
                    cy.createItemOn(docs.structure, "trauma", {
                        name: "Excluded fear",
                        system: { subType: "fear", levelBase: 5 },
                    });
                    cy.createItemOn(docs.structure, "miscgear", {
                        name: "Dense cargo",
                        system: { weightBase: 1.01, quantity: 2 },
                    }).then((cargo) => {
                        cy.foundry((win) => state(win, docs)).should((r) => {
                            expect(r.structureHealth).to.deep.eq({ value: 7, max: 10 });
                            expect(r.structureCargo).to.eq(2.02);
                            expect(r.structureOverCargo, "full precision crosses capacity").to.eq(
                                true,
                            );
                        });
                        cy.foundry(async (win) => {
                            const actor = win.game.actors.get(docs.structure.id);
                            await actor.items
                                .get(injury.id)
                                .update(win.JSON.parse(JSON.stringify({ "system.levelBase": 5 })));
                            await actor.items
                                .get(cargo.id)
                                .update(win.JSON.parse(JSON.stringify({ "system.quantity": 1 })));
                        });
                        cy.foundry((win) => state(win, docs)).should((r) => {
                            expect(r.structureHealth.value).to.eq(5);
                            expect(r.structureCargo).to.eq(1.01);
                            expect(r.structureOverCargo).to.eq(false);
                        });
                        cy.foundry((win) =>
                            patchSystem(win, docs.structure.id, { "system.maxHealth": 2 }),
                        );
                        cy.foundry((win) => state(win, docs)).should((r) =>
                            expect(r.structureHealth).to.deep.eq({ value: 0, max: 2 }),
                        );
                    });
                });
            });
        });

        it("refreshes referenced Being Health and weight through real document updates", () => {
            seedDerivedActors().then((docs) => {
                cy.foundry((win) => state(win, docs)).then((before) => {
                    cy.foundry((win) => {
                        const member = win.game.actors.get(docs.member.id);
                        return member.logic.body.structure.parts.find(
                            (part) => part.locations.length,
                        )?.locations[0].shortcode;
                    }).then((location) => {
                        expect(location, "imported Being has anatomy").to.be.a("string");
                        cy.createItemOn(docs.member, "trauma", {
                            name: "Reference injury",
                            system: {
                                subType: "injury",
                                levelBase: 5,
                                bodyLocationCode: location,
                                healingRateBase: 4,
                            },
                        });
                    });
                    cy.foundry((win) =>
                        patchSystem(win, docs.member.id, { "system.body.weight.base": 150 }),
                    );
                    cy.createItemOn(docs.member, "miscgear", {
                        name: "Heavy carried load",
                        system: { weightBase: 30, quantity: 2, isCarried: true },
                    });
                    cy.foundry((win) => state(win, docs)).should((r) => {
                        expect(
                            r.memberHealth.value,
                            "actual Injury changes referenced Health",
                        ).to.be.lessThan(before.memberHealth.value);
                        expect(r.bands[r.memberBand], "cohort aggregate reflects new band").to.eq(
                            1,
                        );
                        expect(r.cohortRows[0].healthPct).to.eq(r.memberHealth.value);
                        expect(r.memberWeight).to.eq(150);
                        expect(r.vehicleOccupantWeight).to.eq(
                            r.memberWeight + r.memberCarriedWeight,
                        );
                        expect(r.vehicleLoad).to.be.greaterThan(before.vehicleLoad);
                        expect(r.vehicleMove, "payload never affects movement").to.eq(
                            before.vehicleMove,
                        );
                        expect(r.vehicleTravel, "payload never affects travel").to.eq(
                            before.vehicleTravel,
                        );
                    });
                });
            });
        });

        it("refreshes renamed and deleted references, preserving removable missing rows", () => {
            seedDerivedActors().then((docs) => {
                cy.foundry((win) =>
                    win.game.actors
                        .get(docs.member.id)
                        .update(win.JSON.parse(JSON.stringify({ name: "Renamed Visitor" }))),
                );
                cy.foundry((win) => state(win, docs)).should((r) => {
                    expect(r.cohortRows[0].name).to.eq("Renamed Visitor");
                    expect(r.structureRows[0].name).to.eq("Renamed Visitor");
                });
                cy.foundry((win) => win.game.actors.get(docs.member.id).delete());
                cy.foundry((win) => state(win, docs)).should((r) => {
                    expect(r.memberCount).to.eq(0);
                    expect(Object.values(r.bands).reduce((sum, count) => sum + count, 0)).to.eq(0);
                    expect(r.structureCount).to.eq(0);
                    expect(r.vehicleCount).to.eq(0);
                    expect(r.vehicleOccupantWeight).to.eq(0);
                    expect(r.structureRows[0].resolved).to.eq(false);
                });
                cy.foundry((win) =>
                    win.game.actors.get(docs.structure.id).logic.removeOccupant({
                        skipDialog: true,
                        scope: { actorCodeOrUuid: docs.member.uuid },
                    }),
                );
                cy.foundry((win) => state(win, docs)).should((r) => {
                    expect(r.structureRows).to.have.length(2);
                    expect(r.structureRows.some((row) => row.ref === docs.member.uuid)).to.eq(
                        false,
                    );
                });
            });
        });
    });
});
