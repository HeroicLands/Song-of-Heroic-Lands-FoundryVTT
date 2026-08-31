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

/**
 * #1269 — a limb being **immobilized** and a limb being unable to **hold** are
 * two different states.
 *
 * `BodyPart` carries one settable switch (`isUnusable`) and two derivations
 * (`immobilized`, `canHoldItem`), all Logic-only and rebuilt each preparation
 * cycle. The unit suite covers the derivation table exhaustively
 * (`tests/domain/body/BodyPart.test.ts`, `tests/actor/Being.test.ts`); what only
 * a live client proves is the round trip through real documents — the authored
 * **Immobilized** trauma dropping out of the compendium onto a being and pinning
 * the right limb, its deletion freeing that limb, and a grievous wound persisting
 * the drop of the weapon the limb was holding.
 */
describe("limb immobilization vs. the ability to hold (#1269)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => cy.cleanupWorld());

    /** Minimal weapongear with the correct nested defense schema (cf. #246). */
    const INLINE_WEAPON = {
        name: "Test Sword",
        system: {
            strikeModes: [
                {
                    shortcode: "strike",
                    type: "melee",
                    name: "Strike",
                    minParts: 1,
                    assocSkillCode: "melee",
                    lengthBase: 3,
                    impactBase: {
                        numDice: 1,
                        die: 6,
                        modifier: 2,
                        aspect: "edged",
                    },
                    attack: { disabled: false, spread: 2, modifier: 0 },
                    defense: {
                        block: { modifier: 0 },
                        counterstrike: { modifier: 0 },
                    },
                    traits: {},
                },
            ],
        },
    };

    /**
     * Read the state of the body part owning `locationCode` off the live logic.
     */
    function partState(win, actorId, locationCode) {
        const struct = win.game.actors.get(actorId).logic.body.structure;
        const part = struct.parts.find((p) =>
            p.locations.some((l) => l.shortcode === locationCode),
        );
        return {
            shortcode: part.shortcode,
            immobilized: part.immobilized,
            isUnusable: part.isUnusable,
            canHoldItem: part.canHoldItem,
            canHoldItemBase: part.canHoldItemBase,
            heldItemId: part.heldItemId,
        };
    }

    /** A location on the first hold-capable limb of the being's body. */
    function grippingLimbLocation(win, actorId) {
        const struct = win.game.actors.get(actorId).logic.body.structure;
        const part = struct.parts.find((p) => p.canHoldItemBase);
        return { part: part.shortcode, location: part.locations[0].shortcode };
    }

    it("the authored Immobilized trauma exists in the items compendium", () => {
        cy.getFromCompendium("sohl.items", "trauma", "immob").should((doc) => {
            expect(doc.system.subType, "a physical condition").to.eq("physcond");
            expect(doc.system.category, "graded as an impediment").to.eq("impediment");
        });
    });

    it("pins the limb it names — and that limb KEEPS its grip", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => grippingLimbLocation(win, actor.id)).then((limb) => {
                cy.getFromCompendium("sohl.items", "trauma", "immob").then((immob) => {
                    cy.dropOnActor(actor, immob);
                    // Name a location on the gripping limb, as a hold (or a
                    // binding spell) would.
                    cy.foundry(async (win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.itemTypes.trauma.find((i) => i.system.shortcode === "immob");
                        await t.update(
                            win.structuredClone({
                                "system.bodyLocationCode": limb.location,
                            }),
                        );
                        return true;
                    });
                    cy.prepare(actor);
                    cy.foundry((win) => partState(win, actor.id, limb.location)).should((p) => {
                        expect(p.immobilized, "the limb is pinned").to.be.true;
                        expect(p.isUnusable, "but not out of action").to.be.false;
                        expect(p.canHoldItem, "so it still grips — a hold is not a disarm").to.be
                            .true;
                    });
                });
            });
        });
    });

    it("only the named limb is pinned, and deleting the trauma frees it", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => grippingLimbLocation(win, actor.id)).then((limb) => {
                cy.getFromCompendium("sohl.items", "trauma", "immob").then((immob) => {
                    cy.dropOnActor(actor, immob);
                    cy.foundry(async (win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.itemTypes.trauma.find((i) => i.system.shortcode === "immob");
                        await t.update(
                            win.structuredClone({
                                "system.bodyLocationCode": limb.location,
                            }),
                        );
                        return true;
                    });
                    cy.prepare(actor);
                    // Every other part is untouched.
                    cy.foundry((win) => {
                        const struct = win.game.actors.get(actor.id).logic.body.structure;
                        return struct.parts.filter((p) => p.immobilized).map((p) => p.shortcode);
                    }).should("deep.eq", [limb.part]);

                    // Deleting the condition releases the limb — no
                    // bespoke lifecycle to unwind.
                    cy.foundry(async (win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.itemTypes.trauma.find((i) => i.system.shortcode === "immob");
                        await t.delete();
                        return true;
                    });
                    cy.prepare(actor);
                    cy.foundry((win) => partState(win, actor.id, limb.location)).should((p) => {
                        expect(p.immobilized, "released").to.be.false;
                        expect(p.canHoldItem).to.be.true;
                    });
                });
            });
        });
    });

    it("a grievous wound disables the limb and persists the drop of what it held", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then((weapon) => {
                cy.holdItem(weapon);
                cy.prepare(actor);
                // The limb now gripping the sword, and a location on it.
                cy.foundry((win) => {
                    const struct = win.game.actors.get(actor.id).logic.body.structure;
                    const part = struct.parts.find((p) => p.heldItemId === weapon.id);
                    return {
                        part: part.shortcode,
                        location: part.locations[0].shortcode,
                    };
                }).then((limb) => {
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        // A heavy edged blow to that limb. `schedule: false`
                        // pre-answers the healing-check offer so the headless
                        // flow opens no dialog.
                        win.__injury = a.logic.resolveInjury({
                            skipDialog: true,
                            scope: {
                                bodyLocationCode: limb.location,
                                aspect: "blunt",
                                impact: 40,
                                schedule: false,
                            },
                        });
                        return null;
                    });
                    cy.foundry((win) =>
                        win.__injury.then(() => {
                            const a = win.game.actors.get(actor.id);
                            const wound = a.itemTypes.trauma.find(
                                (t) => t.system.bodyLocationCode === limb.location,
                            );
                            return wound?.system.levelBase ?? 0;
                        }),
                    ).should("be.gte", 4); // grievous

                    cy.prepare(actor);
                    cy.foundry((win) => partState(win, actor.id, limb.location)).should((p) => {
                        expect(p.isUnusable, "the limb is out of action").to.be.true;
                        expect(p.immobilized, "so it cannot be moved").to.be.true;
                        expect(p.canHoldItem, "and cannot grip").to.be.false;
                        expect(p.canHoldItemBase, "anatomy unchanged").to.be.true;
                        expect(p.heldItemId, "the sword was dropped, persistently").to.eq(null);
                    });
                });
            });
        });
    });
});
