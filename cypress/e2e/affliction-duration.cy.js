/* SPDX-License-Identifier: GPL-3.0-or-later */
/* global describe, before, afterEach, it, cy, expect */
/* Focused live SimpleRoll duration boundary; owns only its created world items and imported carriers. */
describe("Affliction duration formulas", () => {
    const ownedItems = new Set(),
        ownedActors = new Set();
    let carrierId;
    function carrier() {
        return cy.importActor().then((actor) => {
            ownedActors.add(actor.id);
            carrierId = actor.id;
        });
    }
    let ownsDice = false;
    function queue(win, ...values) {
        const roll = win.sohl.entity.roll.SimpleRoll;
        if (roll.forcedRemaining) throw new Error("Foreign forced dice queue is occupied");
        roll.forceValues(...values);
        ownsDice = true;
        return roll;
    }
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            for (const id of ownedItems) await win.game.items.get(id)?.delete();
            ownedItems.clear();
            for (const id of ownedActors) await win.game.actors.get(id)?.delete();
            ownedActors.clear();
            carrierId = undefined;
            if (ownsDice) {
                win.sohl.entity.roll.SimpleRoll.clearForced();
                ownsDice = false;
            }
            return true;
        }),
    );
    async function create(win, overrides = {}, embedded = false) {
        const data = win.structuredClone({
            name: "Duration boundary probe",
            type: "affliction",
            system: {
                shortcode: `durationprobe${ownedItems.size}`,
                subType: "disease",
                onsetDurationFormula: "0",
                ...overrides,
            },
        });
        if (embedded) {
            const actor = win.game.actors.get(carrierId);
            if (!actor) throw new Error("Owned affliction carrier is unavailable");
            const [item] = await actor.createEmbeddedDocuments("Item", win.structuredClone([data]));
            return item;
        }
        const item = await win.Item.create(data);
        if (item) ownedItems.add(item.id);
        return item;
    }
    it("hides template actions and safely rejects direct patient actions", () => {
        cy.foundry(async (win) => {
            const item = await create(win);
            expect(win.game.i18n.localize("SOHL.Affliction.RequiresActor")).to.equal(
                "Add this Affliction to a character before performing onset, treatment, healing, or resolution actions.",
            );
            const snapshot = JSON.stringify(item.toObject());
            const messages = win.game.messages.size;
            const originalWarning = win.sohl.log.uiWarn;
            const warnings = [];
            win.sohl.log.uiWarn = (message) => warnings.push(message);
            try {
                const definitions = item.logic.constructor
                    .defineIntrinsicActions()
                    .filter(
                        ({ executor }) =>
                            typeof executor === "string" &&
                            Object.hasOwn(Object.getPrototypeOf(item.logic), executor),
                    );
                expect(definitions.length).to.be.greaterThan(0);
                for (const definition of definitions) {
                    const action = item.logic.actions.get(definition.shortcode);
                    expect(
                        action.visible(win.document.createElement("div")),
                        definition.shortcode,
                    ).to.equal(false);
                    const result = await item.logic[definition.executor]({
                        skipDialog: true,
                        scope: {},
                    });
                    expect(result, definition.shortcode).to.equal(undefined);
                }
                expect(warnings).to.deep.equal(
                    definitions.map(() => "SOHL.Affliction.RequiresActor"),
                );
                expect(JSON.stringify(item.toObject())).to.equal(snapshot);
                expect(win.game.messages.size).to.equal(messages);
            } finally {
                win.sohl.log.uiWarn = originalWarning;
            }
            return true;
        });
    });
    it("uses the owned SimpleRoll FIFO for scaled creation and onset seconds", () => {
        carrier();
        cy.foundry(async (win) => {
            const roll = queue(win, 3, 4, 2, 5, 6);
            const item = await create(
                win,
                {
                    onsetDurationFormula: "(2d6)*86400",
                    resolutionDurationFormula: "(1d4)*3600",
                    healingCheckDurationFormula: "(2d6)*60",
                },
                true,
            );
            expect(item, "created affliction").to.exist;
            expect(item.system.onsetDurationBase).to.equal(7 * 86400);
            expect(item.system.onsetDurationBase % 86400).to.equal(0);
            expect(item.system.contractDate).to.be.a("number");
            expect(item.system.scheduledActions ?? []).to.deep.equal([]);
            const now = win.game.time.worldTime;
            const result = await item.logic.setOnset({
                skipDialog: true,
                scope: { schedule: false },
            });
            expect(result.onsetDate).to.equal(now);
            expect(item.system.onsetDate).to.equal(now);
            expect(item.system.resolutionDurationBase).to.equal(2 * 3600);
            expect(item.system.resolutionDurationBase % 3600).to.equal(0);
            expect(item.system.healingCheckDurationBase).to.equal(11 * 60);
            expect(roll.forcedRemaining).to.equal(0);
            expect(item.system.healingCheckDurationBase % 60).to.equal(0);
            expect(item.system.scheduledActions ?? []).to.deep.equal([]);
            return true;
        });
    });
    it("uses normal arithmetic precedence and parentheses around dice expressions", () => {
        cy.foundry(async (win) => {
            const roll = queue(win, 3, 4, 3, 4);
            const ordinary = await create(win, { onsetDurationFormula: "2d6+3*3600" });
            const grouped = await create(win, { onsetDurationFormula: "(2d6+3)*3600" });
            expect(ordinary.system.onsetDurationBase).to.equal(7 + 3 * 3600);
            expect(grouped.system.onsetDurationBase).to.equal((7 + 3) * 3600);
            expect(roll.forcedRemaining).to.equal(0);
            return true;
        });
    });
    it("rolls mixed dice groups in textual FIFO order with division and unary arithmetic", () => {
        cy.foundry(async (win) => {
            const roll = queue(win, 2, 5);
            const item = await create(win, {
                onsetDurationFormula: "(1d4*60 + 1d6*3600)/2 + -10",
            });
            expect(item.system.onsetDurationBase).to.equal((2 * 60 + 5 * 3600) / 2 - 10);
            expect(roll.forcedRemaining).to.equal(0);
            return true;
        });
    });
    it("converts nested mixed-dice expressions to chat without drawing new dice", () => {
        cy.foundry(async (win) => {
            const SimpleRoll = queue(win, 2, 5, 6);
            const parent = { data: { kind: "affliction" } };
            const simple = SimpleRoll.fromFormula("(1d4*60+1d6*3600)/2", parent);
            expect(simple.roll()).to.equal(9060);
            expect(SimpleRoll.forcedRemaining).to.equal(1);
            const prototype = win.foundry.dice.terms.Die.prototype;
            const original = prototype.roll;
            let extraDraws = 0;
            const observed = function (...args) {
                extraDraws++;
                return original.apply(this, args);
            };
            prototype.roll = observed;
            try {
                const chat = await win.sohl.core.fvttToFoundryRoll(simple);
                await chat.evaluate({ allowInteractive: false });
                expect(chat.total).to.equal(simple.total);
                expect(
                    chat.dice.map((die) => ({
                        faces: die.faces,
                        results: die.results.map((result) => result.result),
                    })),
                ).to.deep.equal([
                    { faces: 4, results: [2] },
                    { faces: 6, results: [5] },
                ]);
                expect(extraDraws, "chat conversion reuses every recorded die").to.equal(0);
                expect(SimpleRoll.forcedRemaining).to.equal(1);
            } finally {
                if (prototype.roll === observed) prototype.roll = original;
            }
            return true;
        });
    });
    it("keeps numeric seconds and zero valid", () => {
        carrier();
        cy.foundry(async (win) => {
            const roll = queue(win, 6);
            const item = await create(
                win,
                {
                    onsetDurationFormula: "86400",
                    resolutionDurationFormula: "0",
                    healingCheckDurationFormula: "60",
                },
                true,
            );
            expect(item.system.onsetDurationBase).to.equal(86400);
            await item.logic.setOnset({ skipDialog: true, scope: { schedule: false } });
            expect(item.system.resolutionDurationBase).to.equal(0);
            expect(item.system.healingCheckDurationBase).to.equal(60);
            expect(roll.forcedRemaining).to.equal(1);
            return true;
        });
    });
    it("rejects invalid and negative creation without storing an affliction", () => {
        cy.foundry(async (win) => {
            for (const formula of ["(2d6)*banana", "-1", "1/2", "1/0"]) {
                const baseline = new Set(win.game.items.map((item) => item.id));
                let rejected = false;
                try {
                    await create(win, { onsetDurationFormula: formula });
                } catch {
                    rejected = true;
                }
                expect(rejected, `invalid creation ${formula}`).to.equal(true);
                expect(win.game.items.filter((item) => !baseline.has(item.id))).to.have.length(0);
            }
            return true;
        });
    });
    it("rejects a bad onset interval before onset, bases, or schedules change", () => {
        carrier();
        cy.foundry(async (win) => {
            const item = await create(
                win,
                {
                    resolutionDurationFormula: "3600",
                    healingCheckDurationFormula: "60",
                },
                true,
            );
            for (const formula of ["(2d6)*banana", "-1", "1/2", "1/0"]) {
                await item.update(
                    win.structuredClone({ "system.healingCheckDurationFormula": formula }),
                );
                const before = win.structuredClone(item.toObject().system);
                let rejected = false;
                try {
                    await item.logic.setOnset({ skipDialog: true, scope: { schedule: false } });
                } catch {
                    rejected = true;
                }
                expect(rejected, `invalid onset ${formula}`).to.equal(true);
                expect(item.toObject().system).to.deep.equal(before);
            }
            return true;
        });
    });
});
