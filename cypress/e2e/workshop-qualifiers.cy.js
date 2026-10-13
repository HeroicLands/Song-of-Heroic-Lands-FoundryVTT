/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */
describe("explicit workshop qualifier rating", () => {
    let actorId;
    let ownsDice = false;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            const actor = win.game.actors.get(actorId);
            await actor?.sheet.close();
            await actor?.delete();
            actorId = undefined;
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            return true;
        }),
    );
    it("persists the selected rating and uses its stars without changing other qualifier TNs", () => {
        cy.foundry(async (win) => {
            const actor = await win.Actor.create(
                win.structuredClone({
                    name: "Rosa workshop probe",
                    type: "structure",
                    system: {
                        shortcode: `rosaworkshop${win.crypto.randomUUID().replaceAll("-", "")}`,
                    },
                }),
            );
            actorId = actor.id;
            expect(actor.system.workshopRating).to.equal(0);
            await actor.sheet.render({ force: true });
            return true;
        });
        cy.get('input[name="system.workshopRating"]')
            .should("have.value", "0")
            .should("not.be.disabled")
            .clear()
            .type("4")
            .blur();
        cy.window().should((win) => {
            expect(win.game.actors.get(actorId).system.workshopRating).to.equal(4);
        });
        cy.foundry((win) => {
            const workshop = win.game.actors.get(actorId).logic;
            const api = win.sohl.entity.roll;
            if (api.SimpleRoll.forcedRemaining)
                throw new Error("Foreign forced dice queue is occupied");
            api.SimpleRoll.forceValues(4, 5, 4, 5);
            ownsDice = true;
            const selected = api.workshopQualifierRoll(
                2,
                workshop,
                ["none", "one", "two"],
                workshop,
            );
            expect(selected.rolls).to.deep.equal([4, 5]);
            expect(selected.successCount).to.equal(1);
            expect(selected.result).to.equal("one");
            const ordinary = api.qualifierRoll(2, 5, ["none", "one", "two"], workshop);
            expect(ordinary.successCount).to.equal(2);
            expect(ordinary.result).to.equal("two");
            expect(api.SimpleRoll.forcedRemaining).to.equal(0);
            expect(workshop.data.workshopRating).to.equal(4);
            return true;
        });
    });
});
