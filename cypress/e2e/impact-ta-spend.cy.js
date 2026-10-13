/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */
describe("optional Impact TA spending", () => {
    const actors = [],
        scenes = [],
        combats = [],
        messages = [];
    let sourceId,
        targetId,
        pending,
        targetItemsBefore,
        ownsDice = false;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const id of messages.splice(0)) await win.game.messages.get(id)?.delete();
            for (const id of combats.splice(0)) await win.game.combats.get(id)?.delete();
            for (const id of scenes.splice(0)) await win.game.scenes.get(id)?.delete();
            for (const id of actors.splice(0)) await win.game.actors.get(id)?.delete();
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            return true;
        }),
    );
    for (const value of [3, 0]) {
        it(`applies an explicitly chosen count with per-TA value ${value} without rerolling`, () => {
            cy.importActor().then((actor) => {
                sourceId = actor.id;
                actors.push(actor.id);
            });
            cy.importActor().then((actor) => {
                targetId = actor.id;
                actors.push(actor.id);
            });
            cy.foundry(async (win) => {
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
                pending = attacker.logic
                    .spendImpactTAs({
                        speaker,
                        scope: {
                            sourceCombatantUuid: attacker.uuid,
                            mode: mode.pointerData,
                            impactResult: impact,
                            targetTokenUuid: tokens.find((token) => token.actorId === target.id)
                                .uuid,
                            available: 2,
                            injuryScope: { targetZoneNumber: 1, zoneDie: 1 },
                        },
                    })
                    .finally(() => {
                        for (const message of win.game.messages)
                            if (!old.has(message.id) && message.speaker?.actor === source.id)
                                messages.push(message.id);
                    });
                return true;
            });
            cy.get('dialog:visible input[name="spent"]')
                .should("have.value", "0")
                .clear()
                .type("2");
            cy.get("dialog:visible").last().find('button[data-action="ok"]').click();
            cy.foundry(async (win) => {
                const card = await pending;
                expect(card.impact).to.equal(6 + 2 * value);
                expect(card.handlerUuid).to.equal(`Actor.${targetId}`);
                expect(card.scopeData).to.include({
                    impact: 6 + 2 * value,
                    targetZoneNumber: 1,
                    zoneDie: 1,
                });
                expect(win.sohl.entity.roll.SimpleRoll.forcedRemaining).to.equal(1);
                expect(
                    win.game.actors
                        .get(targetId)
                        .items.map((item) => item.id)
                        .sort(),
                ).to.deep.equal(targetItemsBefore);
                return true;
            });
        });
    }
});
