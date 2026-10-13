/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */
describe("Value Diamond allocation", () => {
    const ownedActors = new Set();
    const ownedMessages = new Set();
    let actorId;
    let ownsDice = false;
    before(() => cy.login());
    function findOwnedDialog(win, probe) {
        return Array.from(win.foundry.applications.instances.values()).find(
            (app) =>
                !probe.baselineApps.has(app) &&
                app.options?.window?.title ===
                    win.game.i18n.localize("SOHL.ValueDiamonds.allocate") &&
                (!app.element || app.element.querySelector('input[name="qualifiers"]')),
        );
    }
    function ownedDialog() {
        return cy
            .window()
            .should((win) => {
                const probe = win.__sohl27Allocation;
                if (probe.error) throw new Error(probe.error);
                const app = findOwnedDialog(win, probe);
                expect(app?.rendered, "owned allocation dialog rendered").to.equal(true);
                probe.dialog = app;
            })
            .then((win) => cy.wrap(win.__sohl27Allocation.dialog.element));
    }
    afterEach(() =>
        cy.foundry(async (win) => {
            const probe = win.__sohl27Allocation;
            if (probe) {
                const dialog = probe.dialog ?? findOwnedDialog(win, probe);
                if (dialog) await dialog.close();
                // Closing the exact owned dialog settles its wait before fixture
                // documents or forced dice are removed. A recorded failure was
                // already captured at creation; cleanup never masks it globally.
                await probe.pending;
                for (const message of win.game.messages) {
                    if (!probe.baseline.has(message.id) && message.speaker.actor === actorId)
                        ownedMessages.add(message.id);
                }
                delete win.__sohl27Allocation;
            }
            for (const id of ownedMessages) await win.game.messages.get(id)?.delete();
            ownedMessages.clear();
            for (const id of ownedActors) await win.game.actors.get(id)?.delete();
            ownedActors.clear();
            actorId = undefined;
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            return true;
        }),
    );
    function begin() {
        cy.importActor().then((actor) => {
            actorId = actor.id;
            ownedActors.add(actorId);
        });
        cy.foundry(async (win) => {
            if (win.__sohl27Allocation) throw new Error("Foreign allocation fixture is active");
            const actor = win.game.actors.get(actorId);
            const [skill] = await actor.createEmbeddedDocuments(
                "Item",
                win.structuredClone([
                    {
                        name: "Owned diamond allocation probe",
                        type: "skill",
                        system: {
                            shortcode: "diamondprobe",
                            subType: "lore",
                            masteryLevelBase: 99,
                            initSkillMult: 1,
                        },
                    },
                ]),
            );
            const Roll = win.sohl.entity.roll.SimpleRoll;
            if (Roll.forcedRemaining) throw new Error("Foreign forced dice queue is occupied");
            Roll.forceValues(23, 4, 9);
            ownsDice = true;
            const probe = {
                baseline: new Set(win.game.messages.map((m) => m.id)),
                baselineApps: new Set(win.foundry.applications.instances.values()),
                error: null,
                result: null,
                allocation: null,
            };
            win.__sohl27Allocation = probe;
            probe.pending = (async () => {
                probe.result = await skill.logic.successValueTest(
                    new win.sohl.entity.action.SohlActionContext({
                        speaker: skill.logic.speaker,
                        skipDialog: true,
                        noChat: true,
                    }),
                );
                if (!probe.result || probe.result.valueDiamonds < 4)
                    throw new Error("Owned SV probe did not earn enough diamonds");
                probe.original = JSON.stringify(probe.result.roll.toJSON());
                probe.allocation = await win.sohl.entity.result.offerValueDiamondAllocation(
                    probe.result,
                    {
                        qualifier: {
                            targetNumber: 5,
                            effectLadder: [
                                "none",
                                "fine",
                                "better",
                                "superior",
                                "excellent",
                                "masterwork",
                            ],
                        },
                    },
                );
            })().catch((error) => {
                probe.error = String(error?.stack ?? error);
            });
            return true;
        });
    }
    it("uses only a chosen post-roll split and preserves the originating dice", () => {
        begin();
        ownedDialog().within(() => {
            cy.get('input[name="qualifiers"]').should("have.value", "0").clear().type("1");
            cy.get('input[name="time"]').should("have.value", "0").clear().type("3");
            cy.get('button[data-action="ok"]').click();
        });
        cy.foundry(async (win) => {
            const probe = win.__sohl27Allocation;
            await probe.pending;
            if (probe.error) throw new Error(probe.error);
            expect(probe.allocation.qualifiers).to.equal(1);
            expect(probe.allocation.timeReductionPercent).to.equal(30);
            expect(probe.allocation.unspent).to.equal(probe.result.valueDiamonds - 4);
            expect(probe.allocation.qualifierResult.rolls).to.deep.equal([4]);
            expect(probe.allocation.qualifierResult.successCount).to.equal(1);
            expect(JSON.stringify(probe.result.roll.toJSON())).to.equal(probe.original);
            expect(probe.result.roll.rolls).to.deep.equal([23]);
            const repeated = await win.sohl.entity.result.offerValueDiamondAllocation(
                probe.result,
                {
                    qualifier: {
                        targetNumber: 5,
                        effectLadder: [
                            "none",
                            "fine",
                            "better",
                            "superior",
                            "excellent",
                            "masterwork",
                        ],
                    },
                },
            );
            expect(repeated.qualifiers).to.equal(1);
            expect(repeated.qualifierResult.rolls).to.deep.equal([4]);
            expect(win.sohl.entity.roll.SimpleRoll.forcedRemaining).to.equal(1);
            const cards = win.game.messages.filter(
                (m) =>
                    !probe.baseline.has(m.id) &&
                    m.speaker.actor === actorId &&
                    m.content.includes("value-diamond-allocation"),
            );
            expect(cards).to.have.length(1);
            return true;
        });
    });
    it("cancels without allocation, summary, or qualifier dice", () => {
        begin();
        ownedDialog().within(() => cy.get('button[data-action="cancel"]').click());
        cy.foundry(async (win) => {
            const probe = win.__sohl27Allocation;
            await probe.pending;
            if (probe.error) throw new Error(probe.error);
            expect(probe.allocation).to.equal(undefined);
            expect(JSON.stringify(probe.result.roll.toJSON())).to.equal(probe.original);
            expect(win.sohl.entity.roll.SimpleRoll.forcedRemaining).to.equal(2);
            expect(
                win.game.messages.filter(
                    (m) => !probe.baseline.has(m.id) && m.speaker.actor === actorId,
                ),
            ).to.have.length(0);
            return true;
        });
    });
});
