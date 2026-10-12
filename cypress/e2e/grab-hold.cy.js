/* SPDX-License-Identifier: GPL-3.0-or-later */
/** Canonical won-Hold effect isolation, using real Actor preparation and Trauma. */
describe("Grab Hold limb condition", () => {
    const actorIds = [];
    let sourceId, targetId, offerId, targetPartCode, heldItemId, pending;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const id of actorIds.splice(0)) await win.game.actors.get(id)?.delete();
            return true;
        }),
    );
    it("pins the struck limb with Immobilized, retains its item, and restores movement on release", () => {
        cy.importActor().then((actor) => {
            sourceId = actor.id;
            actorIds.push(actor.id);
        });
        cy.importActor().then((actor) => {
            targetId = actor.id;
            actorIds.push(actor.id);
        });
        cy.foundry(async (win) => {
            const source = win.game.actors.get(sourceId),
                target = win.game.actors.get(targetId);
            const technique = source.items.find(
                (item) => item.type === "skill" && item.system.shortcode === "bflkgrab",
            );
            if (!technique) throw new Error("Fixture lacks shipped Grab technique");
            const sourceHand = source.logic.body.structure.parts.find(
                (part) => part.canHoldItem && !part.immobilized,
            );
            const targetHand = target.logic.body.structure.parts.find(
                (part) => part.canHoldItem && !part.immobilized && part.locations.length,
            );
            if (!sourceHand || !targetHand)
                throw new Error("Hold needs two real usable holding limbs");
            await source.logic.data.update(
                source.logic.body.structure.setPartFieldsUpdate([
                    { index: sourceHand.index, changes: { heldItemId: null } },
                ]),
            );
            const [gear] = await target.createEmbeddedDocuments(
                "Item",
                win.structuredClone([
                    {
                        name: "Held through Hold",
                        type: "miscgear",
                        system: { shortcode: "holdtestgear", isCarried: true },
                    },
                ]),
            );
            heldItemId = gear.id;
            targetPartCode = targetHand.shortcode;
            await target.logic.data.update(
                target.logic.body.structure.setPartFieldsUpdate([
                    { index: targetHand.index, changes: { heldItemId } },
                ]),
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
                    mode: technique.logic.strikeMode.pointerData,
                    targetPartCode,
                    availableTA: 0,
                    status: "settled",
                    settled: {
                        id: offerId,
                        initiatorUuid: source.uuid,
                        targetUuid: target.uuid,
                        targetPartCode,
                        choice: {
                            manoeuvre: "hold",
                            partCodes: [sourceHand.shortcode],
                            impactTacticalAdvantages: 0,
                        },
                        status: "settled",
                        outcome: { initiatorWins: true, margin: 3 },
                    },
                }),
            );
            pending = target.logic.applyGrabHold({ scope: { offerId, targetUuid: target.uuid } });
            return true;
        });
        cy.get('dialog button[data-action="ok"]').should("be.visible").click();
        cy.foundry(async (win) => {
            await pending;
            const target = win.game.actors.get(targetId),
                source = win.game.actors.get(sourceId);
            const offer = target.getFlag("sohl", `grabOffers.${offerId}`);
            const trauma = target.items.get(offer.hold.traumaId);
            const part = target.logic.body.structure.parts.find(
                (p) => p.shortcode === targetPartCode,
            );
            expect(offer.hold.status).to.equal("active");
            expect(trauma.type).to.equal("trauma");
            expect(trauma.system.shortcode).to.equal("immob");
            expect(trauma.getFlag("sohl", "grabHold")).to.equal(offerId);
            expect(
                part.locations.some(
                    (location) => location.shortcode === trauma.system.bodyLocationCode,
                ),
            ).to.equal(true);
            expect(part.immobilized).to.equal(true);
            expect(part.isUnusable).to.equal(false);
            expect(part.canHoldItem).to.equal(true);
            expect(part.heldItemId).to.equal(heldItemId);
            expect(target.items.has(heldItemId)).to.equal(true);
            expect(part.roles.length).to.be.greaterThan(0);
            const itemCount = target.items.size;
            await target.logic.applyGrabHold({ scope: { offerId, targetUuid: target.uuid } });
            expect(target.items.size).to.equal(itemCount);
            await source.logic.releaseGrabHold({ scope: { offerId, targetUuid: target.uuid } });
            const restored = target.logic.body.structure.parts.find(
                (p) => p.shortcode === targetPartCode,
            );
            expect(target.getFlag("sohl", `grabOffers.${offerId}`).hold.status).to.equal("ended");
            expect(target.items.has(trauma.id)).to.equal(false);
            expect(restored.immobilized).to.equal(false);
            expect(restored.canHoldItem).to.equal(true);
            expect(restored.heldItemId).to.equal(heldItemId);
            expect(target.items.has(heldItemId)).to.equal(true);
            return true;
        });
    });
});
