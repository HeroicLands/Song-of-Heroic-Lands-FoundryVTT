/* SPDX-License-Identifier: GPL-3.0-or-later */
/** Live document/escrow proof; document action owner gates are covered separately. */
describe("Grab Take participant inventory", () => {
    const ids = [];
    let sourceId, targetId, offerId, pending;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const id of ids.splice(0)) {
                const actor = win.game.actors.get(id);
                if (actor) await actor.delete();
            }
            return true;
        }),
    );
    it("releases both grips, moves container contents with fixed IDs, and accepts once", () => {
        cy.importActor().then((a) => {
            sourceId = a.id;
            ids.push(a.id);
        });
        cy.importActor().then((a) => {
            targetId = a.id;
            ids.push(a.id);
        });
        cy.foundry(async (win) => {
            const source = win.game.actors.get(sourceId),
                target = win.game.actors.get(targetId);
            const [bag, child] = await target.createEmbeddedDocuments(
                "Item",
                win.structuredClone([
                    {
                        name: "Take test container",
                        type: "containergear",
                        system: { shortcode: "taketestbag", isCarried: true },
                    },
                    {
                        name: "Take test contents",
                        type: "miscgear",
                        system: { shortcode: "taketestcontents", isCarried: true },
                    },
                ]),
            );
            await child.update(win.structuredClone({ "system.containerId": bag.id }));
            const hands = target.logic.body.structure.parts.filter((p) => p.canHoldItem);
            if (hands.length < 2) throw new Error("Take fixture needs two holding limbs");
            await target.logic.data.update(
                target.logic.body.structure.setPartFieldsUpdate(
                    hands
                        .slice(0, 2)
                        .map((p) => ({ index: p.index, changes: { heldItemId: bag.id } })),
                ),
            );
            const sourceHands = source.logic.body.structure.parts.filter((p) => p.canHoldItem);
            await source.logic.data.update(
                source.logic.body.structure.setPartFieldsUpdate(
                    sourceHands.map((p) => ({ index: p.index, changes: { heldItemId: null } })),
                ),
            );
            offerId = win.foundry.utils.randomID();
            await target.setFlag(
                "sohl",
                `grabOffers.${offerId}`,
                win.structuredClone({
                    id: offerId,
                    initiatorUuid: source.uuid,
                    initiatorUserId: win.game.user.id,
                    targetUuid: target.uuid,
                    targetUserId: win.game.user.id,
                    mode: {},
                    targetPartCode: hands[0].shortcode,
                    availableTA: 0,
                    status: "settled",
                    settled: {
                        targetPartCode: hands[0].shortcode,
                        choice: { manoeuvre: "take" },
                        outcome: { initiatorWins: true },
                    },
                }),
            );
            pending = target.logic.releaseGrabTake({ scope: { offerId, targetUuid: target.uuid } });
            return true;
        });
        cy.get('dialog button[data-action="ok"]')
            .filter(":visible")
            .last()
            .should("be.visible")
            .click();
        cy.foundry(async (win) => {
            await pending;
            const target = win.game.actors.get(targetId),
                source = win.game.actors.get(sourceId);
            const take = target.getFlag("sohl", `grabOffers.${offerId}`).take;
            expect(take.status).to.equal("released");
            expect(take.sourceIds.every((id) => !target.items.has(id))).to.equal(true);
            expect(
                target.logic.body.structure.parts.every(
                    (p) => !take.sourceIds.includes(p.heldItemId),
                ),
            ).to.equal(true);
            pending = source.logic.acceptGrabTake({ scope: { offerId, targetUuid: target.uuid } });
            return true;
        });
        cy.get('dialog button[data-action="ok"]')
            .filter(":visible")
            .last()
            .should("be.visible")
            .click();
        cy.foundry(async (win) => {
            await pending;
            const target = win.game.actors.get(targetId),
                source = win.game.actors.get(sourceId);
            const take = target.getFlag("sohl", `grabOffers.${offerId}`).take;
            const before = source.items.size;
            await source.logic.acceptGrabTake({ scope: { offerId, targetUuid: target.uuid } });
            expect(source.items.size).to.equal(before);
            expect(take.items.every((data) => source.items.has(data._id))).to.equal(true);
            const contents = take.items.find((data) => data.system.containerId === take.rootId);
            expect(source.items.get(contents._id).system.containerId).to.equal(take.rootId);
            expect(
                source.logic.body.structure.parts.some((p) => p.heldItemId === take.rootId),
            ).to.equal(true);
            expect(source.getFlag("sohl", `grabTakeAccepted.${offerId}`).itemId).to.equal(
                take.rootId,
            );
            return true;
        });
    });
});
