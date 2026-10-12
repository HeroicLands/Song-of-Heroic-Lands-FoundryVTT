/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Runtime regression for the public qualifier-roll API and its Actor Logic owner. */
describe("qualifier roll runtime API", () => {
    let actorId;
    let ownsForcedValues = false;

    before(() => cy.login());

    afterEach(() =>
        cy.foundry(async (win) => {
            // Never clear values unless this spec verified an empty queue and
            // then added its own forced dice.
            if (ownsForcedValues) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsForcedValues = false;
            }
            const id = actorId;
            actorId = undefined;
            if (!id) return true;
            const actor = win.game.actors.get(id);
            if (actor) await actor.delete();
            return true;
        }),
    );

    it("uses a real Actor Logic owner, the public namespace, and seeded/forced dice", () => {
        cy.createActor("being", { name: "Qualifier API Smoke" }).then((actor) => {
            actorId = actor.id;
            return cy
                .foundry((win) => {
                    const { qualifierRoll, SimpleRoll } = win.sohl.entity.roll;
                    const actorDoc = win.game.actors.get(actorId);
                    const logic = actorDoc?.logic;
                    if (!logic || logic.document !== actorDoc) {
                        throw new Error("Expected the test actor's real Logic owner");
                    }
                    if (SimpleRoll.forcedRemaining !== 0) {
                        throw new Error(
                            "Expected the forced-die queue to be empty before this smoke",
                        );
                    }

                    const ladder = ["no effect", "one effect", "two effects", "three effects"];
                    try {
                        ownsForcedValues = true;
                        SimpleRoll.forceValues(1, 5, 6);
                        const forced = qualifierRoll(3, 5, ladder, logic);
                        const seededA = qualifierRoll(
                            4,
                            4,
                            ["0", "1", "2", "3", "4"],
                            logic,
                            win.sohl.entity.random.createRng("qualifier-browser-smoke"),
                        );
                        const seededB = qualifierRoll(
                            4,
                            4,
                            ["0", "1", "2", "3", "4"],
                            logic,
                            win.sohl.entity.random.createRng("qualifier-browser-smoke"),
                        );
                        return {
                            ownerIsActor: logic.document === actorDoc,
                            forced,
                            forcedRemaining: SimpleRoll.forcedRemaining,
                            seededA,
                            seededB,
                        };
                    } finally {
                        if (ownsForcedValues) {
                            SimpleRoll.clearForced();
                            ownsForcedValues = false;
                        }
                    }
                })
                .should((result) => {
                    expect(result.ownerIsActor, "real Actor Logic passed as parent").to.be.true;
                    expect(result.forced).to.deep.equal({
                        rolls: [1, 5, 6],
                        successCount: 2,
                        result: "two effects",
                    });
                    expect(result.forcedRemaining, "forced values consumed").to.equal(0);
                    expect(result.seededA).to.deep.equal(result.seededB);
                    expect(result.seededA.rolls).to.have.length(4);
                    expect(result.seededA.result).to.equal(String(result.seededA.successCount));
                });
        });
    });
});
