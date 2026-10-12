/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* global describe, before, afterEach, it, cy, expect */

describe("Off-side unarmed techniques", () => {
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

    it("uses the resolved hand or foot, exempts Trip, and clears penalties for ambidominance", () => {
        cy.importActor().then((actor) => {
            actorId = actor.id;
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actorId);
                const dominance = a.items.filter(
                    (i) => i.type === "trauma" && ["ldmnc", "rdmnc"].includes(i.system.shortcode),
                );
                if (dominance.length)
                    await a.deleteEmbeddedDocuments(
                        "Item",
                        dominance.map((i) => i.id),
                    );
                const [right] = await a.createEmbeddedDocuments(
                    "Item",
                    win.structuredClone([
                        {
                            type: "trauma",
                            name: "Right dominance probe",
                            system: { shortcode: "rdmnc", subType: "physcond", category: "trait" },
                        },
                    ]),
                );
                const codes = ["punch", "kick", "grab", "limbblock", "trip"];
                const probes = await a.createEmbeddedDocuments(
                    "Item",
                    win.structuredClone(
                        codes.map((code) => ({
                            type: "skill",
                            name: `Off-side ${code} probe`,
                            system: {
                                shortcode: `offprobe${code}`,
                                subType: "combattechnique",
                                masteryLevelBase: 30,
                                impairedByRoles: [
                                    code === "kick" || code === "trip" ?
                                        "locomotor"
                                    :   "manipulator",
                                ],
                                strikeMode: {
                                    type: "melee",
                                    shortcode: code,
                                    name: code,
                                    minParts: 1,
                                    assocSkillCode: "melee",
                                    lengthBase: 1,
                                    attack: { spread: 0, modifier: 0 },
                                    impactBase: {
                                        numDice: ["punch", "kick"].includes(code) ? 1 : 0,
                                        die: 6,
                                        modifier: 0,
                                        aspect: "blunt",
                                    },
                                    traits: { noStrMod: !["punch", "kick"].includes(code) },
                                    defense: {
                                        block: { modifier: 0 },
                                        counterstrike: { modifier: 0 },
                                    },
                                },
                            },
                        })),
                    ),
                );
                const limbs = async (unusable) => {
                    const structure = a.logic.body.structure;
                    const parts = structure.parts.filter((p) =>
                        ["larmpart", "rarmpart", "llegpart", "rlegpart"].includes(p.shortcode),
                    );
                    if (parts.length !== 4) throw new Error("Fixture needs paired arms and legs");
                    await a.logic.data.update(
                        structure.setPartFieldsUpdate(
                            parts.map((p) => ({
                                index: p.index,
                                changes: {
                                    heldItemId: null,
                                    permanentlyUnusable: unusable && p.shortcode.startsWith("r"),
                                },
                            })),
                        ),
                    );
                };
                const snapshot = () =>
                    probes.map((probe) => {
                        const mode = a.items.get(probe.id).logic.strikeMode;
                        const delta = (modifier, abbrev) =>
                            Number(modifier.deltas.find((d) => d.abbrev === abbrev)?.value ?? 0);
                        return {
                            code: mode.shortcode,
                            rolls: [
                                mode.attack,
                                mode.defense.block,
                                mode.defense.counterstrike,
                            ].map((m) => delta(m, "OffSide")),
                            impact: delta(mode.impact, "OffHnd"),
                        };
                    });
                await limbs(true);
                if (a.logic.dominantSide !== "right")
                    throw new Error("Fixture needs right dominance");
                const offSide = snapshot();
                await limbs(false);
                const dominant = snapshot();
                await limbs(true);
                await right.delete();
                if (a.logic.dominantSide !== undefined)
                    throw new Error("Fixture must be ambidominant");
                return { offSide, dominant, ambidominant: snapshot() };
            }).should((result) => {
                for (const row of result.offSide) {
                    expect(row.rolls).to.deep.equal(
                        row.code === "trip" ? [0, 0, 0] : [-10, -10, -10],
                    );
                    expect(row.impact).to.equal(["punch", "kick"].includes(row.code) ? -1 : 0);
                }
                for (const row of [...result.dominant, ...result.ambidominant]) {
                    expect(row.rolls).to.deep.equal([0, 0, 0]);
                    expect(row.impact).to.equal(0);
                }
            });
        });
    });
});
