/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

describe("Weapon-only Heft", () => {
    let actorId;
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            const actor = actorId && win.game.actors.get(actorId);
            actorId = undefined;
            if (actor) await actor.delete();
            return true;
        }),
    );

    it("uses real weapon Heft, held limbs, and the unadjusted swing threshold", () => {
        cy.importActor().then((actor) => {
            actorId = actor.id;
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actorId);
                const str = a.items.find(
                    (item) => item.type === "attribute" && item.system.shortcode === "str",
                );
                if (!str) throw new Error("Imported actor has no Strength attribute");
                await str.update(win.structuredClone({ "system.scoreBase": 12 }));
                const [weapon] = await a.createEmbeddedDocuments(
                    "Item",
                    win.structuredClone([
                        {
                            name: "Heft probe",
                            type: "weapongear",
                            system: {
                                shortcode: "heftprobe",
                                heftBase: 15,
                                strikeModes: [
                                    {
                                        type: "melee",
                                        shortcode: "swing",
                                        name: "Swing",
                                        minParts: 1,
                                        assocSkillCode: "melee",
                                        lengthBase: 2,
                                        attack: { spread: 0, modifier: 0 },
                                        traits: { swung: true },
                                        impactBase: {
                                            numDice: 1,
                                            die: 6,
                                            modifier: 0,
                                            aspect: "edged",
                                        },
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
                const snapshot = () => {
                    const mode = a.items.get(weapon.id).logic.strikeModes[0];
                    return {
                        penalties: [
                            mode.attack,
                            mode.defense.block,
                            mode.defense.counterstrike,
                        ].map((m) => Number(m.deltas.find((d) => d.abbrev === "Heft")?.value ?? 0)),
                        bonus: Number(
                            mode.impact.deltas.find((d) => d.abbrev === "TwoHnd")?.value ?? 0,
                        ),
                        hands: a.items.get(weapon.id).logic.heldBy.length,
                    };
                };
                const grip = async (count) => {
                    const struct = a.logic.body.structure;
                    const arms = struct.parts.filter((p) => p.canHoldItem && /arm/i.test(p.name));
                    if (arms.length < 2) throw new Error("Imported actor needs two arms");
                    await a.logic.data.update(
                        struct.setPartFieldsUpdate(
                            arms.map((p, i) => ({
                                index: p.index,
                                changes: { heldItemId: i < count ? weapon.id : null },
                            })),
                        ),
                    );
                };
                await grip(2);
                const relieved = snapshot();
                await str.update(win.structuredClone({ "system.scoreBase": 15 }));
                const swung = snapshot();
                await grip(1);
                const single = snapshot();
                const techniquesExcluded = a.items
                    .filter((i) => i.type === "skill")
                    .every((i) =>
                        (i.logic.strikeModes ?? []).every(
                            (m) =>
                                !m.attack.deltas.some((d) => d.abbrev === "Heft") &&
                                !m.impact.deltas.some((d) => d.abbrev === "TwoHnd"),
                        ),
                    );
                await str.update(win.structuredClone({ "system.scoreBase": 10 }));
                await grip(2);
                await grip(1);
                const weak = snapshot();
                return { relieved, swung, single, weak, techniquesExcluded };
            }).should((r) => {
                expect(r.relieved).to.deep.equal({ penalties: [0, 0, 0], bonus: 0, hands: 2 });
                expect(r.swung).to.deep.equal({ penalties: [0, 0, 0], bonus: 1, hands: 2 });
                expect(r.single.bonus).to.equal(0);
                expect(r.weak.penalties.every((v) => v <= -25)).to.equal(true);
                expect(r.techniquesExcluded).to.equal(true);
            });
        });
    });
});
