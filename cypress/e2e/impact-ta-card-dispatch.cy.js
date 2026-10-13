/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */
describe("Impact TA chat-card dispatch", () => {
    const actors = [],
        scenes = [],
        combats = [],
        messages = [];
    let sourceId,
        targetId,
        resultMessageId,
        oldSceneId,
        beforeMessages,
        targetItemsBefore,
        ownsDice = false;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const message of win.game.messages)
                if (
                    beforeMessages &&
                    !beforeMessages.has(message.id) &&
                    message.speaker?.actor === sourceId &&
                    !messages.includes(message.id)
                )
                    messages.push(message.id);
            for (const id of messages.splice(0)) await win.game.messages.get(id)?.delete();
            for (const id of combats.splice(0)) await win.game.combats.get(id)?.delete();
            for (const id of scenes.splice(0)) await win.game.scenes.get(id)?.delete();
            for (const id of actors.splice(0)) await win.game.actors.get(id)?.delete();
            if (oldSceneId && win.game.scenes.has(oldSceneId))
                await win.game.scenes.get(oldSceneId).view();
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            return true;
        }),
    );
    for (const value of [3]) {
        it(`revives recorded dice and participants from a real source-owned card click`, () => {
            cy.importActor().then((actor) => {
                sourceId = actor.id;
                actors.push(actor.id);
            });
            cy.importActor().then((actor) => {
                targetId = actor.id;
                actors.push(actor.id);
            });
            cy.foundry(async (win) => {
                oldSceneId = win.canvas.scene?.id;
                const source = win.game.actors.get(sourceId),
                    target = win.game.actors.get(targetId);
                targetItemsBefore = target.items.map((item) => item.id).sort();
                const [weapon] = await source.createEmbeddedDocuments(
                    "Item",
                    win.structuredClone([
                        {
                            type: "weapongear",
                            name: "Impact TA probe",
                            system: {
                                shortcode: "taspending",
                                heftBase: 0,
                                strikeModes: [
                                    {
                                        type: "melee",
                                        shortcode: "cut",
                                        name: "Cut",
                                        minParts: 1,
                                        assocSkillCode: "melee",
                                        lengthBase: 1,
                                        attack: { spread: 1, modifier: 0 },
                                        impactBase: {
                                            numDice: 1,
                                            die: 6,
                                            modifier: 2,
                                            aspect: "blunt",
                                        },
                                        traits: { impTA: value, noStrMod: true },
                                        defense: {
                                            block: { modifier: 0 },
                                            counterstrike: { modifier: 0 },
                                        },
                                    },
                                ],
                            },
                        },
                    ]),
                );
                const scene = await win.Scene.create(
                    win.structuredClone({ name: "Impact TA arena", width: 1000, height: 1000 }),
                );
                scenes.push(scene.id);
                await scene.view();
                const tokens = await scene.createEmbeddedDocuments(
                    "Token",
                    win.structuredClone([
                        { name: source.name, actorId: source.id, actorLink: true },
                        { name: target.name, actorId: target.id, actorLink: true, x: 100 },
                    ]),
                );
                const combat = await win.Combat.create(
                    win.structuredClone({ name: "Impact TA combat" }),
                );
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
                const attacker = members.find((member) => member.actorId === source.id);
                const mode = source.items.get(weapon.id).logic.strikeModes[0];
                const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                if (SimpleRoll.forcedRemaining)
                    throw new Error("Foreign forced dice queue is occupied");
                SimpleRoll.forceValues(6);
                ownsDice = true;
                const speaker = source.logic.speaker;
                const impact = new win.sohl.entity.ImpactResult(
                    {
                        speaker,
                        impactModifier: mode.impact.clone({}, { parent: attacker.logic }),
                        roll: new SimpleRoll(
                            { numDice: 1, dieFaces: 6, modifier: 2, rolls: [4] },
                            { parent: attacker.logic },
                        ),
                    },
                    { parent: attacker.logic },
                );
                const old = new Set(win.game.messages.map((message) => message.id));
                beforeMessages = old;
                const sourceToken = tokens.find((token) => token.actorId === source.id);
                const targetToken = tokens.find((token) => token.actorId === target.id);
                // The public result builder is the same serializer/template route
                // used by ordinary resolved combat. Only exchange scoring is fixed;
                // the recorded impact, mode, speakers and documents are real.
                const attack = {
                    label: "Attack",
                    token: sourceToken.logic,
                    combatant: attacker.logic,
                    mode,
                    masteryLevelModifier: { constrainedEffective: 50, deltas: [] },
                    roll: { total: 25 },
                    isSuccess: true,
                    isCritical: false,
                    successLevel: 1,
                    mishaps: new Set(),
                    testType: win.sohl.utils.TEST_TYPE.AUTOCOMBATMELEE.id,
                };
                const defender = members.find((member) => member.actorId === target.id);
                const defense = {
                    ...attack,
                    label: "Ignore",
                    token: targetToken.logic,
                    combatant: defender.logic,
                    isSuccess: false,
                    mode: undefined,
                    testType: win.sohl.utils.TEST_TYPE.IGNORE.id,
                };
                const { atkCardData } = win.sohl.document.combatant.logic.buildCombatCardData({
                    attackResult: attack,
                    defendResult: defense,
                    attackerImpact: impact,
                    tacticalAdvantages: { side: "attacker", count: 2 },
                    margin: 3,
                    attackerLandsBlow: true,
                    defenderLandsBlow: false,
                });
                await speaker.toChat(
                    "systems/sohl/templates/chat/attack-result-card.hbs",
                    atkCardData,
                );
                const emitted = win.game.messages.filter((message) => !old.has(message.id));
                emitted.forEach((message) => messages.push(message.id));
                resultMessageId = emitted.find((message) =>
                    message.content.includes('data-action="spendImpactTAs"'),
                )?.id;
                if (!resultMessageId)
                    throw new Error("Resolved combat emitted no Impact TA choice");
                return true;
            });
            cy.get('#sidebar-tabs [data-tab="chat"]').click();
            cy.get('[data-action="spendImpactTAs"]')
                .last()
                .scrollIntoView()
                .should("be.visible")
                .then(($button) => {
                    const payload = JSON.parse($button[0].dataset.scope);
                    expect(payload.sourceCombatantUuid).to.contain("Combat.");
                    expect(payload.impactResult.roll.rolls).to.deep.equal([4]);
                    expect(payload.targetTokenUuid).to.contain(".Token.");
                })
                .click();
            cy.get('dialog:visible input[name="spent"]')
                .should("have.value", "0")
                .clear()
                .type("2");
            cy.get("dialog:visible").last().find('button[data-action="ok"]').click();
            cy.then(() =>
                cy
                    .get(
                        `.chat-card [data-action="resolveInjury"][data-source-actor-uuid="Actor.${sourceId}"]`,
                    )
                    .should("be.visible"),
            );
            cy.foundry(async (win) => {
                const cardMessage = win.game.messages.find(
                    (message) =>
                        message.id !== resultMessageId &&
                        message.speaker.actor === sourceId &&
                        message.content.includes('data-action="resolveInjury"') &&
                        !message.content.includes('data-action="spendImpactTAs"'),
                );
                if (!cardMessage) return false;
                if (!messages.includes(cardMessage.id)) messages.push(cardMessage.id);
                const html = new win.DOMParser().parseFromString(cardMessage.content, "text/html");
                const button = html.querySelector('[data-action="resolveInjury"]');
                const scope = JSON.parse(button.dataset.scope);
                expect(button.dataset.handlerUuid).to.equal(`Actor.${targetId}`);
                expect(scope).to.include({ impact: 12, aspect: "blunt" });
                expect(html.body.textContent).to.contain("12");
                expect(win.sohl.entity.roll.SimpleRoll.forcedRemaining).to.equal(1);
                expect(
                    win.game.actors
                        .get(targetId)
                        .items.map((item) => item.id)
                        .sort(),
                ).to.deep.equal(targetItemsBefore);
                return true;
            }).should("eq", true);
        });
    }
});
