/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/** Live automated combat routes at zero-dice impact boundaries. */
describe("automated combat impact boundaries", () => {
    const actors = [],
        scenes = [],
        combats = [];
    let attackerId,
        defenderId,
        ownsDice = false,
        previousSceneId,
        previousCombatId;
    // Combatant creation schedules the real asynchronous group-seeding write.
    async function waitForGroupSeeding(win, combat) {
        const deadline = Date.now() + 10000;
        while (combat.combatants.some((member) => !member.groupId)) {
            if (Date.now() >= deadline)
                throw new Error("Owned combat group seeding did not complete before cleanup");
            await new Promise((resolve) => win.setTimeout(resolve, 25));
        }
    }
    let messageIdsBefore;
    function messageBelongsToFixture(win, message) {
        if (messageIdsBefore.has(message.id)) return false;
        if (actors.includes(message.speaker?.actor)) return true;
        const html = new win.DOMParser().parseFromString(message.content, "text/html");
        return Array.from(html.querySelectorAll("[data-actor-id],[data-handler-uuid]")).some(
            (element) =>
                actors.includes(element.dataset.actorId) ||
                actors.some((id) => element.dataset.handlerUuid === `Actor.${id}`),
        );
    }
    before(() => cy.login());
    beforeEach(() =>
        cy.foundry((win) => {
            messageIdsBefore = new Set(win.game.messages.map((message) => message.id));
            previousSceneId = win.canvas?.scene?.id;
            previousCombatId = win.ui.combat?.viewed?.id;
            return true;
        }),
    );
    afterEach(() =>
        cy.foundry(async (win) => {
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            const ownedMessages = win.game.messages
                .filter((message) => messageBelongsToFixture(win, message))
                .map((message) => message.id);
            for (const id of ownedMessages) await win.game.messages.get(id)?.delete();
            for (const id of combats.splice(0)) {
                const combat = win.game.combats.get(id);
                if (combat) {
                    await waitForGroupSeeding(win, combat);
                    await combat.delete();
                }
            }
            for (const id of scenes.splice(0)) await win.game.scenes.get(id)?.delete();
            for (const id of actors.splice(0)) await win.game.actors.get(id)?.delete();
            if (previousSceneId && win.game.scenes.has(previousSceneId))
                await win.game.scenes.get(previousSceneId).view();
            if (previousCombatId && win.game.combats.has(previousCombatId))
                win.ui.combat.viewed = win.game.combats.get(previousCombatId);
            return true;
        }),
    );
    function participants() {
        cy.importActor().then((actor) => {
            attackerId = actor.id;
            actors.push(actor.id);
        });
        cy.importActor().then((actor) => {
            defenderId = actor.id;
            actors.push(actor.id);
        });
    }
    async function setup(win) {
        const source = win.game.actors.get(attackerId),
            target = win.game.actors.get(defenderId);
        for (const actor of [source, target]) {
            const melee = actor.items.find(
                (item) => item.type === "skill" && item.system.shortcode === "melee",
            );
            if (!melee) throw new Error("Boundary fixture lacks Melee skill");
            await melee.update(win.structuredClone({ "system.masteryLevelBase": 80 }));
            const body = actor.logic.body.structure;
            await actor.logic.data.update(
                body.setPartFieldsUpdate(
                    body.parts
                        .filter((part) => part.canHoldItem)
                        .map((part) => ({ index: part.index, changes: { heldItemId: null } })),
                ),
            );
        }
        const [weapon] = await source.createEmbeddedDocuments(
            "Item",
            win.structuredClone([
                {
                    name: "Fixed impact boundary probe",
                    type: "weapongear",
                    system: {
                        shortcode: "impactboundaryprobe",
                        isCarried: true,
                        heftBase: 0,
                        strikeModes: [
                            {
                                type: "melee",
                                shortcode: "fixedimpact",
                                name: "Fixed impact",
                                minParts: 1,
                                assocSkillCode: "melee",
                                lengthBase: 1,
                                attack: { spread: 0, modifier: 0 },
                                impactBase: { numDice: 0, die: null, modifier: 2, aspect: "blunt" },
                                defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
                                traits: { noStrMod: true },
                            },
                        ],
                    },
                },
            ]),
        );
        const hand = source.logic.body.structure.parts.find((part) => part.canHoldItem);
        if (!hand) throw new Error("Boundary fixture requires a holding limb");
        await source.logic.data.update(
            source.logic.body.structure.setPartFieldsUpdate([
                { index: hand.index, changes: { heldItemId: weapon.id } },
            ]),
        );
        const scene = await win.Scene.create(
            win.structuredClone({ name: "Impact boundary arena", width: 1000, height: 1000 }),
        );
        scenes.push(scene.id);
        await scene.view();
        // Overlapping token centers put this exchange explicitly in close reach.
        const tokens = await scene.createEmbeddedDocuments(
            "Token",
            win.structuredClone([
                { name: source.name, actorId: source.id, actorLink: true, x: 0, y: 0 },
                { name: target.name, actorId: target.id, actorLink: true, x: 0, y: 0 },
            ]),
        );
        const combat = await win.Combat.create(win.structuredClone({ scene: null, active: true }));
        combats.push(combat.id);
        const members = await combat.createEmbeddedDocuments(
            "Combatant",
            win.structuredClone(
                tokens.map((token) => ({
                    actorId: token.actorId,
                    tokenId: token.id,
                    sceneId: scene.id,
                })),
            ),
        );
        await waitForGroupSeeding(win, combat);
        if (win.ui.combat) win.ui.combat.viewed = combat;
        const attacker = members.find((member) => member.actorId === source.id),
            defender = members.find((member) => member.actorId === target.id);
        const speaker = (actorCombatant) =>
            new win.sohl.core.logic.SohlSpeaker({
                actor: actorCombatant.actor.id,
                token: actorCombatant.token.id,
                scene: scene.id,
                user: win.game.user.id,
            });
        const attackMode = source.items.get(weapon.id).logic.strikeModes[0];
        const attack = new win.sohl.entity.AttackResult(
            {
                combatantUuid: attacker.uuid,
                mode: attackMode.pointerData,
                masteryLevelModifier: attackMode.attack.clone({}, { parent: attacker.logic }),
                impact: attackMode.impact.clone(
                    {
                        aimBodyPartCode: target.logic.body.structure.parts.find(
                            (part) => part.canHoldItem,
                        ).shortcode,
                        spread: 0,
                    },
                    { parent: attacker.logic },
                ),
                tokenUuid: attacker.logic.tokenLogic.uuid,
                testType: win.sohl.utils.TEST_TYPE.AUTOCOMBATMELEE.id,
            },
            { parent: attacker.logic, chatSpeaker: speaker(attacker) },
        );
        return { source, target, attacker, defender, speaker, attack };
    }
    function queue(win, ...values) {
        const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
        if (SimpleRoll.forcedRemaining) throw new Error("Foreign forced-die queue occupied");
        ownsDice = true;
        SimpleRoll.forceValues(...values);
        return SimpleRoll;
    }
    it("a winning zero-impact Grab counterstrike offers the original attacker a trial without injury", () => {
        participants();
        cy.foundry(async (win) => {
            const { source, target, attacker, defender, speaker, attack } = await setup(win);
            const technique = target.items.find(
                (item) => item.type === "skill" && item.system.shortcode === "bflkgrab",
            );
            if (!technique) throw new Error("Fixture lacks shipped Grab");
            const grab = technique.logic.strikeMode;
            expect(grab.impact.disabled).to.be.a("string").and.not.equal("");
            expect(grab.impact.effective).to.equal(0);
            expect(grab.impact.numDice).to.equal(0);
            const SimpleRoll = queue(win, 100, 1, 4);
            await attack.evaluate();
            expect(attack.isSuccess).to.equal(false);
            const warnings = [];
            const originalWarn = win.sohl.log.uiWarn;
            win.sohl.log.uiWarn = function (...args) {
                warnings.push(args.map(String).join(" "));
                return originalWarn.apply(this, args);
            };
            let result;
            let prerequisites;
            try {
                const modeState = (mode) => ({
                    shortcode: mode.shortcode,
                    itemUuid: mode.pointerData.itemUuid,
                    reach: mode.reach?.effective,
                    attackDisabled: mode.attack?.disabled,
                    counterstrikeDisabled: mode.defense?.counterstrike?.disabled,
                });
                prerequisites = {
                    sourceKind: attacker.logic.actorLogic?.data.kind,
                    defenderKind: defender.logic.actorLogic?.data.kind,
                    sourceToken: attacker.logic.tokenLogic?.uuid,
                    defenderToken: defender.logic.tokenLogic?.uuid,
                    canvasReady: win.canvas?.ready,
                    sceneId: win.canvas?.scene?.id,
                    gridUnits: win.canvas?.scene?.grid?.units,
                    range: win.sohl.core.fvttRangeToTarget(
                        defender.logic.tokenLogic,
                        attacker.logic.tokenLogic,
                    ),
                    requestedGrab: modeState(grab),
                    available: defender.logic.actorLogic.availableStrikeModes.map(modeState),
                    usable: defender.logic.actorLogic.getUsableStrikeModes().map(modeState),
                    aimChoices: win.sohl.document.combatant.logic.buildAimChoices(
                        attacker.logic.actorLogic,
                    ),
                };
                result = await defender.logic.automatedCounterstrikeResume({
                    scope: { attackResult: attack, mode: grab.pointerData },
                    speaker: speaker(defender),
                    token: defender.logic.tokenLogic,
                    skipDialog: true,
                    noChat: false,
                });
            } finally {
                win.sohl.log.uiWarn = originalWarn;
            }
            if (!result)
                throw new Error(
                    `Counterstrike route returned no result: ${JSON.stringify({ warnings, prerequisites })}`,
                );
            const offer = Object.values(source.getFlag("sohl", "grabOffers") ?? {}).find(
                (value) => value.initiatorUuid === target.uuid && value.targetUuid === source.uuid,
            );
            expect(offer, "swapped target-owned trial").to.exist;
            expect(offer.targetUserId).to.equal(win.game.user.id);
            expect(offer.initiatorUserId).to.equal(win.game.user.id);
            expect(offer.mode.itemUuid).to.equal(technique.uuid);
            expect(target.getFlag("sohl", "grabOffers") ?? {}).to.deep.equal({});
            expect(SimpleRoll.forcedRemaining, "only two combat test dice consumed").to.equal(1);
            const cards = win.game.messages.filter((message) =>
                actors.includes(message.speaker?.actor),
            );
            expect(
                cards.some((message) => message.content.includes('data-action="beginGrabTrial"')),
                JSON.stringify({
                    ownActorFiltered: cards.map((message) => ({
                        id: message.id,
                        speaker: message.speaker,
                    })),
                    ownNewMessages: win.game.messages
                        .filter((message) => messageBelongsToFixture(win, message))
                        .map((message) => ({
                            id: message.id,
                            speaker: message.speaker,
                            content: message.content,
                        })),
                }),
            ).to.equal(true);
            expect(
                cards.some((message) => message.content.includes('data-action="resolveInjury"')),
            ).to.equal(false);
            return true;
        });
    });
    it("an ordinary fixed two-point attack returns two impact without rolling an extra die", () => {
        participants();
        cy.foundry(async (win) => {
            const { attacker, defender, speaker, attack } = await setup(win);
            const SimpleRoll = queue(win, 1, 100, 4);
            await attack.evaluate();
            expect(attack.isSuccess).to.equal(true);
            const result = await defender.logic.automatedDodgeResume({
                scope: { attackResult: attack },
                speaker: speaker(defender),
                token: defender.logic.tokenLogic,
                skipDialog: true,
                noChat: true,
            });
            expect(result.attackerLandsBlow).to.equal(true);
            expect(result.attackerImpact.total).to.equal(2);
            expect(result.attackerImpact.roll.rolls).to.deep.equal([]);
            expect(SimpleRoll.forcedRemaining, "fixed impact consumes no random die").to.equal(1);
            expect(result.attackResult.combatant.uuid).to.equal(attacker.uuid);
            return true;
        });
    });
});
