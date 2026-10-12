/* SPDX-License-Identifier: GPL-3.0-or-later */
/** Successful real melee resolution into owner-addressed Grab cards. */
describe("Grab trial card flow", () => {
    const actors = [],
        scenes = [],
        combats = [],
        messages = [];
    let sourceId,
        targetId,
        combatId,
        firstHand,
        offerId,
        ownsDice = false;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            for (const m of win.game.messages) {
                if (actors.includes(m.speaker?.actor) && !messages.includes(m.id))
                    messages.push(m.id);
            }
            for (const id of messages.splice(0)) await win.game.messages.get(id)?.delete();
            for (const id of combats.splice(0)) await win.game.combats.get(id)?.delete();
            for (const id of scenes.splice(0)) await win.game.scenes.get(id)?.delete();
            for (const id of actors.splice(0)) await win.game.actors.get(id)?.delete();
            return true;
        }),
    );
    it("offers the initiator choice, asks the target, and settles without retry dice", () => {
        cy.importActor().then((a) => {
            sourceId = a.id;
            actors.push(a.id);
        });
        cy.importActor().then((a) => {
            targetId = a.id;
            actors.push(a.id);
        });
        cy.foundry(async (win) => {
            const source = win.game.actors.get(sourceId),
                target = win.game.actors.get(targetId);
            const technique = source.items.find(
                (i) => i.type === "skill" && i.system.shortcode === "bflkgrab",
            );
            if (!technique) throw new Error("Imported actor lacks shipped Grab technique");
            const hands = source.logic.body.structure.parts.filter(
                (p) => p.canHoldItem && !p.immobilized,
            );
            firstHand = hands[0]?.shortcode;
            if (!firstHand) throw new Error("Grab requires a usable manipulator");
            await source.logic.data.update(
                source.logic.body.structure.setPartFieldsUpdate(
                    hands.map((p) => ({ index: p.index, changes: { heldItemId: null } })),
                ),
            );
            const mode = source.items.get(technique.id).logic.strikeMode;
            const scene = await win.Scene.create(
                win.structuredClone({
                    name: "Grab isolated arena",
                    width: 1000,
                    height: 1000,
                }),
            );
            scenes.push(scene.id);
            await scene.view();

            const tokenDocs = await scene.createEmbeddedDocuments(
                "Token",
                win.structuredClone([
                    { name: source.name, actorId: sourceId, actorLink: true, x: 0, y: 0 },
                    { name: target.name, actorId: targetId, actorLink: true, x: 100, y: 0 },
                ]),
            );
            const combat = await win.Combat.create(
                win.structuredClone({ name: "Grab isolated combat" }),
            );
            combats.push(combat.id);
            combatId = combat.id;
            const participants = await combat.createEmbeddedDocuments(
                "Combatant",
                win.structuredClone(
                    tokenDocs.map((t) => ({
                        actorId: t.actorId,
                        tokenId: t.id,
                        sceneId: scene.id,
                    })),
                ),
            );
            const attacker = participants.find((c) => c.actorId === sourceId),
                defender = participants.find((c) => c.actorId === targetId);
            const before = new Set(win.game.messages.map((m) => m.id));
            const targetLogicBefore = target.logic;
            const targetSystemBefore = target.system;
            const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
            if (SimpleRoll.forcedRemaining)
                throw new Error("Foreign forced dice queue is occupied");
            ownsDice = true;
            SimpleRoll.forceValues(1, 100);
            const attack = new win.sohl.entity.AttackResult(
                {
                    combatantUuid: attacker.uuid,
                    mode: mode.pointerData,
                    masteryLevelModifier: mode.attack.clone({}, { parent: attacker.logic }),
                    impact: mode.impact.clone(
                        {
                            aimBodyPartCode: target.logic.body.structure.parts.find(
                                (p) => p.canHoldItem,
                            ).shortcode,
                            spread: 0,
                        },
                        { parent: attacker.logic },
                    ),
                    speaker: source.logic.speaker,
                    tokenUuid: attacker.logic.tokenLogic.uuid,
                    testType: win.sohl.utils.TEST_TYPE.AUTOCOMBATMELEE.id,
                },
                { parent: attacker.logic, chatSpeaker: source.logic.speaker },
            );
            await attack.evaluate();
            const preparationErrors = [];
            const errorHook = win.Hooks.on("error", (location, error) => {
                preparationErrors.push({
                    location,
                    message: error?.message,
                    stack: error?.stack,
                    cause: error?.cause?.stack,
                });
            });
            await defender.logic.automatedDodgeResume({
                scope: { attackResult: attack },
                speaker: target.logic.speaker,
                token: defender.logic.tokenLogic,
                skipDialog: true,
                noChat: false,
            });
            win.Hooks.off("error", errorHook);
            for (const m of win.game.messages) if (!before.has(m.id)) messages.push(m.id);
            const offers = target.getFlag("sohl", "grabOffers") ?? {};
            offerId = Object.keys(offers).find((id) => offers[id].initiatorUuid === source.uuid);
            if (!offerId)
                throw new Error(
                    `Grab offer missing: ${JSON.stringify({
                        success: attack.isSuccess,
                        level: attack.normSuccessLevel,
                        die: attack.roll.total,
                        actorOwner: source.isOwner,
                        dataOwner: source.logic.data.isOwner,
                        speakerOwner: attack.speaker.isOwner,
                        speakerActor: attack.speaker.actorLogic?.id,
                        speakerUser: attack.speaker.userId,
                        sourceSpeakerActor: source.logic.speaker.actorLogic?.id,
                        disabled: attack.masteryLevelModifier.disabled,
                        token: attack.token?.uuid,
                        mode: attack.mode?.shortcode,
                        traits: attack.mode?.traits,
                    })}`,
                );
            if (!target.logic.body)
                throw new Error(
                    `Offer reset derived body: ${JSON.stringify({ sameLogic: target.logic === targetLogicBefore, sameSystem: target.system === targetSystemBefore, oldBody: !!targetLogicBefore.body, preparationErrors })}`,
                );
            expect(offers[offerId].targetUserId).to.equal(win.game.user.id);
            expect(SimpleRoll.forcedRemaining).to.equal(0);
            SimpleRoll.forceValues(6, 1);
            return true;
        });
        cy.foundry((win) => {
            win.ui.sidebar.changeTab("chat", "primary");
            win.ui.sidebar.expand();
            return true;
        });
        cy.then(() => {
            cy.get(`[data-action="beginGrabTrial"][data-handler-uuid="Actor.${sourceId}"]`)
                .filter(":visible")
                .last()
                .scrollIntoView()
                .click();
            cy.get('dialog select[name="firstHand"]').select(firstHand);
            cy.get('dialog select[name="secondHand"]').select("");
            cy.get('dialog select[name="targetPart"]')
                .invoke("val")
                .should("be.a", "string")
                .and("not.be.empty");
            cy.get('dialog input[name="impactTA"]').clear().type("0");
            cy.get('dialog button[data-action="ok"]').filter(":visible").last().click();
            cy.get(`[data-action="answerGrabTrial"][data-handler-uuid="Actor.${targetId}"]`)
                .filter(":visible")
                .last()
                .scrollIntoView()
                .click();
            cy.get('dialog button[data-action="ok"]')
                .filter(":visible")
                .last()
                .should("be.visible")
                .click();
        });
        cy.foundry(async (win) => {
            const source = win.game.actors.get(sourceId),
                target = win.game.actors.get(targetId);
            const committed = source.getFlag("sohl", `grabTrials.${offerId}`);
            const terminal = target.getFlag("sohl", `grabOffers.${offerId}`);
            expect(committed.initiator.die).to.equal(6);
            expect(committed.choice.impactTacticalAdvantages).to.equal(0);
            expect(terminal.status).to.equal("settled");
            expect(terminal.settled.target.die).to.equal(1);
            const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
            expect(SimpleRoll.forcedRemaining).to.equal(0);
            SimpleRoll.forceValues(3);
            await target.logic.answerGrabTrial({ scope: { offerId, targetUuid: target.uuid } });
            expect(SimpleRoll.forcedRemaining).to.equal(1);
            expect(target.getFlag("sohl", `grabOffers.${offerId}`).settled).to.deep.equal(
                terminal.settled,
            );
            SimpleRoll.clearForced();
            ownsDice = false;
            return true;
        });
    });
});
