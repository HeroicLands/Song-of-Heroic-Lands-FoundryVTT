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
 * The Healing Rate is the single source of truth for whether a wound has been
 * treated (#1148), and `TraumaDataModel._preUpdate` is what keeps it so: the
 * moment a rate first appears — the stored value going from `null` to a number —
 * the treatment date is stamped in the same update. That hook is Foundry-layer,
 * so only a live client proves it; in particular it must fire for a rate typed
 * straight into the sheet, not merely for the treatment actions that stamp the
 * date themselves.
 */

describe("Healing Rate stamps the treatment date (#1148)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /** An untreated wound: no Healing Rate, no treatment date. */
    function untreatedWound(actorId) {
        return cy.foundry(async (win) => {
            const a = win.game.actors.get(actorId);
            const items = win.structuredClone([
                {
                    name: "Gash",
                    type: "trauma",
                    system: {
                        subType: "injury",
                        levelBase: 3,
                        aspect: "edged",
                    },
                },
            ]);
            const [wound] = await a.createEmbeddedDocuments("Item", items);
            return { id: wound.id, uuid: wound.uuid };
        });
    }

    it("a new wound arrives with no Healing Rate and reads as untreated", () => {
        cy.importActor().then((actor) => {
            untreatedWound(actor.id).then((wound) => {
                cy.foundry((win) => {
                    const w = win.game.actors.get(actor.id).items.get(wound.id);
                    return {
                        hr: w.system.healingRateBase,
                        date: w.system.treatmentDate,
                        isTreated: w.logic.isTreated,
                    };
                }).should((r) => {
                    expect(r.hr, "no Healing Rate determined").to.be.null;
                    expect(r.isTreated, "reads as untreated").to.be.false;
                });
            });
        });
    });

    it("setting a Healing Rate by hand stamps the treatment date in the same update", () => {
        cy.importActor().then((actor) => {
            untreatedWound(actor.id).then((wound) => {
                cy.foundry(async (win) => {
                    const w = win.game.actors.get(actor.id).items.get(wound.id);
                    // A bare rate update — no treatment date supplied, exactly
                    // what a sheet edit sends. Re-realmed: a payload built in
                    // the Cypress realm is rejected by Foundry.
                    await w.update(
                        win.structuredClone({ "system.healingRateBase": 4 }),
                    );
                    const after = win.game.actors
                        .get(actor.id)
                        .items.get(wound.id);
                    return {
                        hr: after.system.healingRateBase,
                        date: after.system.treatmentDate,
                        isTreated: after.logic.isTreated,
                    };
                }).should((r) => {
                    expect(r.hr).to.eq(4);
                    expect(r.date, "treatment date stamped").to.not.be.null;
                    expect(r.isTreated, "now reads as treated").to.be.true;
                });
            });
        });
    });

    it("a treatment date on its own cannot make a rate-less wound treated", () => {
        cy.importActor().then((actor) => {
            untreatedWound(actor.id).then((wound) => {
                cy.foundry(async (win) => {
                    const w = win.game.actors.get(actor.id).items.get(wound.id);
                    await w.update(
                        win.structuredClone({ "system.treatmentDate": 500 }),
                    );
                    const after = win.game.actors
                        .get(actor.id)
                        .items.get(wound.id);
                    return {
                        hr: after.system.healingRateBase,
                        date: after.system.treatmentDate,
                        isTreated: after.logic.isTreated,
                    };
                }).should((r) => {
                    expect(r.date).to.eq(500);
                    expect(r.hr, "still no rate").to.be.null;
                    expect(r.isTreated, "the date alone proves nothing").to.be
                        .false;
                });
            });
        });
    });

    it("an update that supplies its own treatment date is left alone", () => {
        cy.importActor().then((actor) => {
            untreatedWound(actor.id).then((wound) => {
                cy.foundry(async (win) => {
                    const w = win.game.actors.get(actor.id).items.get(wound.id);
                    await w.update(
                        win.structuredClone({
                            "system.healingRateBase": 5,
                            "system.treatmentDate": 1234,
                        }),
                    );
                    const after = win.game.actors
                        .get(actor.id)
                        .items.get(wound.id);
                    return { date: after.system.treatmentDate };
                }).should((r) => {
                    // The treatment actions stamp their own date; the hook must
                    // not overwrite it with "now".
                    expect(r.date).to.eq(1234);
                });
            });
        });
    });
});
