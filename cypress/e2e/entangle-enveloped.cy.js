/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */

describe("Entangle and Enveloped", () => {
    let sourceId, targetId;
    const messages = [],
        scenes = [],
        combats = [];
    let ownsDice = false;
    const ownedDialogs = new Set();
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const app of win.foundry.applications.instances.values())
                if (ownedDialogs.has(app.id)) await app.close();
            ownedDialogs.clear();
            for (const id of messages.splice(0)) {
                const message = win.game.messages.get(id);
                if (message) await message.delete();
            }
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            for (const id of combats.splice(0)) {
                const combat = win.game.combats.get(id);
                if (combat) await combat.delete();
            }
            for (const id of scenes.splice(0)) {
                const scene = win.game.scenes.get(id);
                if (scene) await scene.delete();
            }
            for (const id of [sourceId, targetId]) {
                const actor = id && win.game.actors.get(id);
                if (actor) await actor.delete();
            }
            sourceId = targetId = undefined;
            return true;
        }),
    );
    const importPair = () =>
        cy.importActor().then((a) => {
            sourceId = a.id;
            return cy.importActor().then((b) => {
                targetId = b.id;
            });
        });
    const modeData = (entangle, envelop) => ({
        type: "melee",
        shortcode: "lash",
        name: "Lash",
        minParts: 1,
        assocSkillCode: "melee",
        lengthBase: 6,
        attack: { spread: 4, modifier: 0 },
        impactBase: {
            numDice: envelop ? 0 : 1,
            die: envelop ? null : 6,
            modifier: 0,
            aspect: "blunt",
        },
        traits: { entangle, envelop, noStrMod: envelop },
        defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
    });
    it("offers Entangle at the original weapon's reach and never adds Strength impact", () => {
        importPair().then(() =>
            cy
                .foundry(async (win) => {
                    const source = win.game.actors.get(sourceId);
                    const str = source.items.find(
                        (i) => i.type === "attribute" && i.system.shortcode === "str",
                    );
                    await str.update(win.structuredClone({ "system.scoreBase": 20 }));
                    const [weapon] = await source.createEmbeddedDocuments(
                        "Item",
                        win.structuredClone([
                            {
                                type: "weapongear",
                                name: "Entangle probe",
                                system: {
                                    shortcode: "entangleprobe",
                                    heftBase: 0,
                                    strikeModes: [modeData(true, false)],
                                },
                            },
                        ]),
                    );
                    const modes = source.items.get(weapon.id).logic.strikeModes;
                    const alternate = modes.find((m) => m.traits.hold);
                    if (!alternate) throw new Error("Weapon has no Entangle alternative");
                    return {
                        names: modes.map((m) => m.name),
                        reach: alternate.reach.effective,
                        originalReach: modes[0].reach.effective,
                        impact: alternate.impact.effective,
                        dice: alternate.impact.roll.numDice,
                        hold: alternate.traits.hold,
                        originalDice: modes[0].impact.roll.numDice,
                        authoredCount: source.items.get(weapon.id).system.strikeModes.length,
                    };
                })
                .should((r) => {
                    expect(r.names.some((n) => n.includes("Entangle"))).to.equal(true);
                    expect(r.reach).to.equal(r.originalReach);
                    expect(r.impact).to.equal(0);
                    expect(r.dice).to.equal(0);
                    expect(r.hold).to.equal(true);
                    expect(r.originalDice).to.equal(1);
                    expect(r.authoredCount).to.equal(1);
                }),
        );
    });
    it("requires target confirmation, penalizes every defence, and restores rolls when deleted", () => {
        let acceptanceScope, probeSnapshot;
        importPair().then(() =>
            cy
                .foundry(async (win) => {
                    const source = win.game.actors.get(sourceId),
                        target = win.game.actors.get(targetId);
                    const [weapon] = await target.createEmbeddedDocuments(
                        "Item",
                        win.structuredClone([
                            {
                                type: "weapongear",
                                name: "Condition probe",
                                system: {
                                    shortcode: "conditionprobe",
                                    heftBase: 0,
                                    strikeModes: [modeData(false, false)],
                                },
                            },
                        ]),
                    );
                    const dodge = target.items.find(
                        (i) => i.type === "skill" && i.system.shortcode === "dge",
                    );
                    if (!dodge) throw new Error("Fixture has no Dodge skill");
                    const mode = target.items.get(weapon.id).logic.strikeModes[0];
                    const before = [
                        mode.attack.effective,
                        mode.defense.block.effective,
                        mode.defense.counterstrike.effective,
                        dodge.logic.masteryLevel.effective,
                    ];
                    // Test bookkeeping stays local; storing a cross-realm object
                    // in actor flags can change its shape during Foundry cleaning.
                    probeSnapshot = { weaponId: weapon.id, dodgeId: dodge.id, before };
                    const oldMessages = new Set(win.game.messages.map((m) => m.id));
                    const [net] = await source.createEmbeddedDocuments(
                        "Item",
                        win.structuredClone([
                            {
                                type: "weapongear",
                                name: "Envelop attack probe",
                                system: {
                                    shortcode: "envelopprobe",
                                    heftBase: 0,
                                    strikeModes: [modeData(false, true)],
                                },
                            },
                        ]),
                    );
                    const structure = source.logic.body.structure;
                    const hands = structure.parts.filter(
                        (part) => part.canHoldItem && !part.immobilized,
                    );
                    if (!hands.length) throw new Error("Source fixture needs a free hand");
                    await source.logic.data.update(
                        win.structuredClone(
                            structure.setPartFieldsUpdate(
                                hands.map((part, index) => ({
                                    index: part.index,
                                    changes: { heldItemId: index === 0 ? net.id : null },
                                })),
                            ),
                        ),
                    );
                    const scene = await win.Scene.create(
                        win.structuredClone({
                            name: "Envelop isolated arena",
                            width: 1000,
                            height: 1000,
                        }),
                    );
                    scenes.push(scene.id);
                    await scene.view();
                    const tokens = await scene.createEmbeddedDocuments(
                        "Token",
                        win.structuredClone([
                            { name: source.name, actorId: source.id, actorLink: true, x: 0, y: 0 },
                            {
                                name: target.name,
                                actorId: target.id,
                                actorLink: true,
                                x: 100,
                                y: 0,
                            },
                        ]),
                    );
                    const combat = await win.Combat.create(
                        win.structuredClone({ name: "Envelop isolated combat" }),
                    );
                    combats.push(combat.id);
                    const participants = await combat.createEmbeddedDocuments(
                        "Combatant",
                        win.structuredClone(
                            tokens.map((token) => ({
                                actorId: token.actorId,
                                tokenId: token.id,
                                sceneId: scene.id,
                            })),
                        ),
                    );
                    const attacker = participants.find(
                        (participant) => participant.actorId === source.id,
                    );
                    const defender = participants.find(
                        (participant) => participant.actorId === target.id,
                    );
                    const attackMode = source.items.get(net.id).logic.strikeModes[0];
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                    if (SimpleRoll.forcedRemaining)
                        throw new Error("Foreign forced dice queue is occupied");
                    ownsDice = true;
                    SimpleRoll.forceValues(1, 100);
                    const attack = new win.sohl.entity.AttackResult(
                        {
                            combatantUuid: attacker.uuid,
                            mode: attackMode.pointerData,
                            masteryLevelModifier: attackMode.attack.clone(
                                {},
                                { parent: attacker.logic },
                            ),
                            impact: attackMode.impact.clone(
                                {
                                    aimBodyPartCode: target.logic.body.structure.parts[0].shortcode,
                                    spread: 0,
                                },
                                { parent: attacker.logic },
                            ),
                            tokenUuid: attacker.logic.tokenLogic?.uuid,
                            testType: win.sohl.utils.TEST_TYPE.AUTOCOMBATMELEE.id,
                        },
                        { parent: attacker.logic, chatSpeaker: source.logic.speaker },
                    );
                    try {
                        await attack.evaluate();
                        await defender.logic.automatedDodgeResume({
                            scope: { attackResult: attack },
                            speaker: target.logic.speaker,
                            token: defender.logic.tokenLogic,
                            skipDialog: true,
                            noChat: false,
                        });
                    } finally {
                        if (ownsDice) {
                            SimpleRoll.clearForced();
                            ownsDice = false;
                        }
                        for (const message of win.game.messages)
                            if (
                                !oldMessages.has(message.id) &&
                                [source.id, target.id].includes(message.speaker?.actor)
                            )
                                messages.push(message.id);
                    }
                    return target.items.some(
                        (i) => i.type === "trauma" && i.system.shortcode === "enveloped",
                    );
                })
                .should((exists) => expect(exists).to.equal(false)),
        );
        cy.foundry((win) => {
            win.ui.sidebar.changeTab("chat", "primary");
            win.ui.sidebar.expand();
            return true;
        });
        cy.then(() => {
            cy.get(`[data-action="applyEnveloped"][data-handler-uuid="Actor.${targetId}"]`)
                .filter(":visible")
                .last()
                .then((button) => {
                    acceptanceScope = JSON.parse(button[0].dataset.scope);
                    cy.wrap(button).click();
                });
            const findConfirmation = (win) =>
                Array.from(win.foundry.applications.instances.values())
                    .reverse()
                    .find(
                        (app) =>
                            /dialog/i.test(app.constructor.name) &&
                            app.rendered &&
                            app.options.window?.title ===
                                win.sohl.i18n.localize("SOHL.Enveloped.apply") &&
                            app.element?.querySelector('button[data-action="ok"]'),
                    );
            cy.window({ log: false }).should(
                (win) => expect(findConfirmation(win), "target Enveloped confirmation").to.exist,
            );
            cy.foundry((win) => {
                const app = findConfirmation(win);
                if (!app) throw new Error("Enveloped confirmation disappeared");
                ownedDialogs.add(app.id);
                app.element.querySelector('button[data-action="ok"]').click();
                return true;
            });
        });
        cy.window({ log: false }).should((win) => {
            const target = win.game.actors.get(targetId);
            const recordOwner = win.fromUuidSync(acceptanceScope.recordOwnerUuid);
            const accepted = target.getFlag("sohl", `envelopAccepted.${acceptanceScope.offerId}`);
            const trauma = target.items.find(
                (item) => item.type === "trauma" && item.system.shortcode === "enveloped",
            );
            const diagnostics = JSON.stringify({
                currentUser: win.game.user.id,
                targetOwner: target.isOwner,
                targetUuid: target.uuid,
                scope: acceptanceScope,
                offer: recordOwner?.getFlag("sohl", `envelopOffers.${acceptanceScope.offerId}`),
                accepted,
            });
            expect(accepted, `completed owner acceptance: ${diagnostics}`).to.exist;
            expect(trauma, `persisted condition: ${diagnostics}`).to.exist;
        });
        cy.foundry(async (win) => {
            const target = win.game.actors.get(targetId),
                probe = probeSnapshot;
            const snapshot = () => {
                const weapon = target.items.get(probe.weaponId),
                    dodge = target.items.get(probe.dodgeId);
                if (!weapon || !dodge)
                    throw new Error(
                        `Owned probe item disappeared: ${JSON.stringify({
                            targetId,
                            probe,
                            items: target.items.map((item) => ({
                                id: item.id,
                                shortcode: item.system.shortcode,
                            })),
                        })}`,
                    );
                const mode = weapon.logic.strikeModes[0];
                return [
                    mode.attack.effective,
                    mode.defense.block.effective,
                    mode.defense.counterstrike.effective,
                    dodge.logic.masteryLevel.effective,
                ];
            };
            const trauma = target.items.find(
                (i) => i.type === "trauma" && i.system.shortcode === "enveloped",
            );
            if (!trauma) throw new Error("Accepted Enveloped condition was not created");
            const penalties = snapshot().map((v, i) => v - probe.before[i]);
            const scheduled = trauma.system.scheduledActions ?? [];
            await trauma.delete();
            return {
                penalties,
                scheduled: scheduled.length,
                after: snapshot(),
                before: probe.before,
            };
        }).should((r) => {
            expect(r.penalties).to.deep.equal([-20, -20, -20, -20]);
            expect(r.scheduled).to.equal(0);
            expect(r.after).to.deep.equal(r.before);
        });
    });
});
