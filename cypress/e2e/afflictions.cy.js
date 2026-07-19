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
 * Afflictions — contract / transmit / course / treat / heal.
 *
 * The affliction item persists and carries logic (GREEN), and the being can now
 * contract a disease via `BeingLogic.contractDisease` (#391 — search world/pack
 * diseases or describe a custom one, roll CI×Endurance, create on failure). The
 * per-affliction `AfflictionLogic` lifecycle is still unimplemented: transmit
 * warns "Not Implemented" and the course / diagnosis / treatment tests
 * `throw "… Not Implemented"`. RED against #67/#68.
 */

describe("afflictions", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // GREEN: an affliction item persists on a being and carries its logic.
    it("an affliction item persists on a being and carries logic", () => {
        cy.createActor("being", { name: "afflicted" }).then((actor) => {
            cy.createItemOn(actor, "affliction", { name: "Fever" }).then(
                (item) => {
                    cy.foundry((win) => {
                        const it = win.game.actors
                            .get(actor.id)
                            .items.get(item.id);
                        return { type: it?.type, hasLogic: !!it?.logic };
                    }).should((r) => {
                        expect(r.type, "affliction item").to.eq("affliction");
                        expect(r.hasLogic, "carries logic").to.be.true;
                    });
                },
            );
        });
    });

    // GREEN (#65): the Course / Treatment / Healing action-visibility predicates
    // are restored against the live actor. Course and Healing require the bearer
    // to have a usable Endurance attribute (as the pre-port gate did); Course is
    // additionally gated on the affliction being active, Treatment on it being
    // untreated, and Healing on a non-disabled healing rate. Afflictions have no
    // `isBleeding` field (that lives on Trauma), so no bleeding gate applies.
    describe("action gating (#65)", () => {
        it("active, untreated, self-healing affliction on a being with Endurance offers Course/Treat/Heal", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "affliction", {
                    name: "Wasting Fever",
                    system: {
                        subType: "disease",
                        levelBase: 2,
                        healingRateBase: 4,
                        isDormant: false,
                        isTreated: false,
                    },
                }).then((item) => {
                    cy.prepare(actor);
                    cy.itemLogic(item).should((logic) => {
                        expect(logic.hasCourse, "active + Endurance").to.be
                            .true;
                        expect(logic.canTreat, "untreated").to.be.true;
                        expect(logic.canHeal, "healing rate + Endurance").to.be
                            .true;
                    });
                });
            });
        });

        it("a dormant affliction has no course; a treated one cannot be treated; a non-healing one cannot heal", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "affliction", {
                    name: "Latent Curse",
                    system: {
                        subType: "disease",
                        levelBase: 2,
                        healingRateBase: null,
                        isDormant: true,
                        // `isTreated` is derived from `treatmentDate` (#484), so a
                        // treated affliction is modelled by setting the date, not
                        // the (now read-only) flag — otherwise canTreat stays true.
                        treatmentDate: 1,
                    },
                }).then((item) => {
                    cy.prepare(actor);
                    cy.itemLogic(item).should((logic) => {
                        expect(logic.hasCourse, "dormant").to.be.false;
                        expect(logic.canTreat, "already treated").to.be.false;
                        expect(logic.canHeal, "no natural healing").to.be.false;
                    });
                });
            });
        });

        it("without an Endurance attribute, Course and Healing are unavailable", () => {
            cy.createActor("being", { name: "boneless" }).then((actor) => {
                cy.createItemOn(actor, "affliction", {
                    name: "Wasting Fever",
                    system: {
                        subType: "disease",
                        levelBase: 2,
                        healingRateBase: 4,
                        isDormant: false,
                        isTreated: false,
                    },
                }).then((item) => {
                    cy.prepare(actor);
                    cy.itemLogic(item).should((logic) => {
                        expect(logic.hasCourse, "no Endurance").to.be.false;
                        expect(logic.canHeal, "no Endurance").to.be.false;
                        // Treatment does not depend on Endurance.
                        expect(logic.canTreat, "untreated").to.be.true;
                    });
                });
            });
        });
    });

    // RED — blocked by #67/#68: the affliction lifecycle is unimplemented —
    // contract / transmit / course / diagnosis / treatment throw or warn
    // "Not Implemented" (AfflictionLogic), and BeingLogic.contractAfflictionTest
    // is a stub returning null. #68 is the affliction test-suite epic; #67 covers
    // the remaining condition predicates (canTransmit / canContract). Un-skip and
    // assert the resolved effects once implemented.
    it.skip("contract test resolves an affliction (#67, #68)", () => {});
    it.skip("transmit propagates an affliction (#67, #68)", () => {});
    it.skip("course advances an affliction (#67, #68)", () => {});
    it.skip("treat / heal resolves an affliction (#67, #68)", () => {});
});
