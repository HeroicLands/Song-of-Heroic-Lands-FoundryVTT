import { describe, it, expect, vi, afterEach } from "vitest";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { BodyLogic } from "@src/document/actor/logic/BodyLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { MiscGearLogic } from "@src/document/item/logic/MiscGearLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    ACTOR_KIND,
    IMPACT_ASPECT,
    ITEM_KIND,
    MOVEMENT_MEDIUM,
} from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import * as AfflictionContract from "@src/document/actor/logic/affliction-contract";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import {
    makeActorLogic,
    makeAttributeStub,
    makeBodyData,
    makeItemLogic,
    makeMockActor,
} from "@tests/mocks/logicHarness";

/** Construct a BeingLogic against a plain-object BeingData. */
function makeBeing(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(BeingLogic, ACTOR_KIND.BEING, fields, opts);
}

/** Minimal persisted body structure: a head (skull) and a thorax (chest). */
const BODY_STRUCTURE_DATA: BodyStructure.Data = {
    parts: [
        {
            shortcode: "head",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 15,
            locations: [
                {
                    shortcode: "skull",
                    bleedingSusceptibility: "medium",
                    amputability: "none",
                    shockValue: 3,
                    probWeight: 10,
                    protectionBase: {
                        blunt: 3,
                        edged: 3,
                        piercing: 3,
                        fire: 0,
                    },
                },
            ],
        },
        {
            shortcode: "thorax",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 30,
            locations: [
                {
                    shortcode: "chest",
                    bleedingSusceptibility: "low",
                    amputability: "none",
                    shockValue: 4,
                    probWeight: 20,
                    protectionBase: {
                        blunt: 2,
                        edged: 1,
                        piercing: 1,
                        fire: 0,
                    },
                },
            ],
        },
    ],
    adjacent: [["head", "thorax"]],
};

/** A complete `system.body` with the sample structure; override per test. */
function bodyData(overrides: Record<string, unknown> = {}) {
    return makeBodyData({ structure: BODY_STRUCTURE_DATA, ...overrides });
}

/** A being carrying a `str` attribute of the given score (for `weight.calc`). */
function makeBeingWithStr(
    str: number,
    bodyOverrides: Record<string, unknown> = {},
) {
    const being = makeBeing({ body: bodyData(bodyOverrides) });
    (being.actor as any).itemTypes = {
        [ITEM_KIND.ATTRIBUTE]: [
            {
                logic: {
                    data: { shortcode: "str" },
                    score: { effective: str },
                },
            },
        ],
    };
    return being;
}

/** A persisted melee strike-mode payload (same shape the item logic builds from). */
function meleeModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "melee",
        name: "Punch",
        minParts: 1,
        assocSkillCode: "unarmed",
        lengthBase: 1,
        attack: { disabled: false, spread: 2, modifier: 5 },
        impactBase: {
            numDice: 1,
            die: 6,
            modifier: 0,
            aspect: IMPACT_ASPECT.BLUNT,
        },
        traits: {},
        defense: { block: { modifier: 3 }, counterstrike: { modifier: -2 } },
        ...overrides,
    };
}

/** Build a real MeleeStrikeMode (BeingLogic.reach checks `instanceof`). */
function makeMeleeMode(
    parentLogic: any,
    overrides: Record<string, unknown> = {},
    id = "sm1",
): MeleeStrikeMode {
    return new MeleeStrikeMode(
        meleeModeData(overrides) as any,
        parentLogic,
        id,
    );
}

/**
 * Embed a real `combattechnique`-subtype SkillLogic on the actor and return its
 * item doc (BeingLogic reads technique strike modes through `actor.itemTypes`,
 * off each skill's `strikeMode`). Combat techniques now live as skills.
 */
function makeTechniqueItem(
    actor: any,
    strikeModeOverrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
): any {
    const logic = makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        {
            subType: "combattechnique",
            skillBaseFormula: "",
            masteryLevelBase: 0,
            improveFlag: false,
            combatCategory: "none",
            parentSkillCode: "",
            initSkillMult: 1,
            strikeMode: meleeModeData(strikeModeOverrides),
        },
        { actor, ...opts },
    );
    logic.initialize();
    return logic.item;
}

/** A linked-token stub matching the TokenActorRef contract. */
function makeToken(id: string, actorId: string | null, actorLink = true): any {
    return { id, actorId, actorLink, name: `token-${id}` };
}

/** A fresh body-location object as the body rebuilds them each cycle. */
function makeLocation(shortcode: string): any {
    return {
        shortcode,
        armorProtection: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
        isRigid: false,
        armorType: "",
    };
}

/** An ArmorGear item stub exposing what aggregateArmorProtection reads. */
function makeArmorItem(
    material: string,
    protection: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    },
    locations: { flexible?: string[]; rigid?: string[] },
    isEquipped = true,
): any {
    return {
        logic: {
            data: {
                kind: ITEM_KIND.ARMORGEAR,
                isEquipped,
                material,
                locations: {
                    flexible: locations.flexible ?? [],
                    rigid: locations.rigid ?? [],
                },
            },
            protection: {
                blunt: { effective: protection.blunt },
                edged: { effective: protection.edged },
                piercing: { effective: protection.piercing },
                fire: { effective: protection.fire },
            },
        },
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("BeingLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object BeingData (no Foundry)", () => {
            const logic = makeBeing();
            expect(logic).toBeInstanceOf(BeingLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.BEING);
        });

        it("declares only intrinsic executors that exist on the logic", () => {
            // Regression: SohlAction's constructor throws when an INTRINSIC
            // executor names a method missing from the logic (case-sensitive).
            for (const def of BeingLogic.defineIntrinsicActions()) {
                if (!def.executor) continue;
                expect(
                    typeof (BeingLogic.prototype as any)[def.executor],
                    `executor "${def.executor}"`,
                ).toBe("function");
            }
            expect(() => makeBeing()).not.toThrow();
        });

        it("defines the being intrinsic actions", () => {
            const logic = makeBeing();
            for (const shortcode of [
                "editDocument",
                "deleteDocument",
                "shockTest",
                "stumbleTest",
                "fumbleTest",
                "moraleTest",
                "fearTest",
                "calcImpact",
                "contractDisease",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });
    });

    describe("body sub-object", () => {
        it("is built directly from system.body on initialize (no embedded item)", () => {
            const being = makeBeing({ body: makeBodyData() });
            being.initialize();
            expect(being.body).toBeInstanceOf(BodyLogic);
            expect(being.body.structure.parts).toEqual([]);
        });

        it("is incorporeal (empty structure) by default", () => {
            const being = makeBeing();
            being.initialize();
            expect(being.body.isIncorporeal).toBe(true);
        });

        it("rebuilds the body each prepare cycle", () => {
            const being = makeBeing({ body: makeBodyData() });
            being.initialize();
            const first = being.body;
            being.initialize();
            expect(being.body).not.toBe(first);
        });
    });

    // Body derivation (structure/weight/reach/bodyScale/injury table) — re-homed
    // from the former CorpusLogic tests (#535). The body is now Being-owned
    // (`being.body`), and its entities are parented to the BeingLogic.
    describe("body derivation", () => {
        it("builds the BodyStructure from persisted system.body data", () => {
            const being = makeBeing({ body: bodyData() });
            being.initialize();
            expect(being.body.structure).toBeInstanceOf(BodyStructure);
            expect(being.body.structure.parts).toHaveLength(2);
            expect(being.body.structure.parts[0].shortcode).toBe("head");
            // The structure is parented to the owning being logic.
            expect(being.body.structure.parent).toBe(being);
        });

        it("seeds weight from a fixed weight.base", () => {
            const being = makeBeing({
                body: bodyData({ weight: { base: 200, calc: "0" } }),
            });
            being.initialize();
            expect(being.body.weight).toBeInstanceOf(ValueModifier);
            expect(being.body.weight.base).toBe(200);
            expect(being.body.weight.effective).toBe(200);
        });

        it("computes weight from strength when weight.base is null (in evaluate)", () => {
            const being = makeBeingWithStr(13, {
                weight: { base: null, calc: "(9 * str) + 50" },
            });
            being.initialize();
            // The str-derived weight is deferred to evaluate (str isn't prepared
            // during the actor's initialize).
            being.evaluate();
            // (9 * 13) + 50 = 167
            expect(being.body.weight.base).toBe(167);
        });

        it("seeds reach from reachBase and accepts runtime deltas", () => {
            const being = makeBeing({ body: bodyData({ reachBase: 8 }) });
            being.initialize();
            expect(being.body.reach).toBeInstanceOf(ValueModifier);
            expect(being.body.reach.base).toBe(8);
            being.body.reach.add("Enlarged", "Enl", 3);
            expect(being.body.reach.effective).toBe(11);
        });

        it("rebuilds modifiers on a fresh initialize (deltas are not persisted)", () => {
            const being = makeBeing({ body: bodyData({ reachBase: 5 }) });
            being.initialize();
            being.body.reach.add("Enlarged", "Enl", 3);
            expect(being.body.reach.effective).toBe(8);
            being.initialize();
            expect(being.body.reach.effective).toBe(5);
            expect(being.body.reach.empty).toBe(true);
        });

        describe("bodyScale and injury table (#468)", () => {
            const scaled = (f: number) => [1, 5, 10, 15, 20].map((t) => t * f);

            it("a human being (bodyScale 1.0) keeps the master thresholds", () => {
                const being = makeBeing({ body: bodyData() });
                being.initialize();
                being.evaluate();
                expect(being.body.bodyScale.effective).toBe(1);
                expect(being.injuryTable).toEqual([1, 5, 10, 15, 20]);
            });

            it("derives the scaled injury table from bodyScaleBase (a frail cat)", () => {
                const being = makeBeing({
                    body: bodyData({ bodyScaleBase: 0.27 }),
                });
                being.initialize();
                being.evaluate();
                expect(being.body.bodyScale.effective).toBe(0.27);
                expect(being.injuryTable).toEqual(scaled(0.27));
            });

            it("floors bodyScale at 0.01", () => {
                const being = makeBeing({
                    body: bodyData({ bodyScaleBase: 0 }),
                });
                being.initialize();
                expect(being.body.bodyScale.effective).toBe(0.01);
            });

            it("re-scales the table when a delta is layered on bodyScale", () => {
                const being = makeBeing({
                    body: bodyData({ bodyScaleBase: 1.0 }),
                });
                being.initialize();
                being.body.bodyScale.add("Shrink", "shrink", -0.5);
                being.evaluate();
                expect(being.body.bodyScale.effective).toBe(0.5);
                expect(being.injuryTable).toEqual(scaled(0.5));
            });

            it("exposes the scaled table through BodyStructure.injuryTable", () => {
                const being = makeBeing({
                    body: bodyData({ bodyScaleBase: 2.9 }),
                });
                being.initialize();
                being.evaluate();
                expect(being.body.structure.injuryTable).toEqual(scaled(2.9));
            });
        });

        it("derives strengthModifier from the active movement profile's strMod", () => {
            const being = makeBeingWithStr(14, {});
            (being.data as any).currentMoveMedium = MOVEMENT_MEDIUM.TERRESTRIAL;
            (being.data as any).movementProfiles = [
                {
                    medium: MOVEMENT_MEDIUM.TERRESTRIAL,
                    feetPerRound: 50,
                    leaguesPerWatch: 5,
                    encumbrance: "floor(wt / 4)",
                    strMod: "-5 * floor((str - 10) / 2)",
                    disabled: false,
                },
            ];
            being.initialize();
            being.evaluate();
            // -5 * floor((14 - 10) / 2) = -5 * 2 = -10
            expect(being.strengthModifier.effective).toBe(-10);
        });

        it("derives encumbrance from the active profile and carried weight", () => {
            const being = makeBeing({ body: bodyData() });
            (being.data as any).currentMoveMedium = MOVEMENT_MEDIUM.TERRESTRIAL;
            (being.data as any).movementProfiles = [
                {
                    medium: MOVEMENT_MEDIUM.TERRESTRIAL,
                    feetPerRound: 50,
                    leaguesPerWatch: 5,
                    encumbrance: "floor(wt / 4)",
                    strMod: "0",
                    disabled: false,
                },
            ];
            being.initialize();
            being.carriedWeight.add("load", "Load", 10);
            being.evaluate();
            being.finalize();
            // floor(10 / 4) = 2
            expect(being.encumbrance.effective).toBe(2);
        });
    });

    describe("carriedWeight", () => {
        /** Full gear field set (mirrors tests/item/Gear.test.ts). */
        function gearFields(overrides: Record<string, unknown> = {}) {
            return {
                quantity: 1,
                weightBase: 2.5,
                valueBase: 10,
                isCarried: true,
                isEquipped: false,
                qualityBase: 9,
                durabilityBase: 12,
                sharedWithCohortIds: [] as string[],
                containerId: null as string | null,
                ...overrides,
            };
        }

        it("is an empty modifier after initialize and accumulates weight deltas", () => {
            const logic = makeBeing();
            logic.initialize();
            expect(logic.carriedWeight).toBeInstanceOf(ValueModifier);
            expect(logic.carriedWeight.effective).toBe(0);
            logic.carriedWeight.add("rockWt", "Rock Weight", 10);
            logic.carriedWeight.add("gemWt", "Gem Weight", 5.5);
            expect(logic.carriedWeight.effective).toBe(15.5);
        });

        it("resets to an empty modifier on initialize (rebuilt each prepare cycle)", () => {
            const logic = makeBeing();
            logic.initialize();
            logic.carriedWeight.add("rockWt", "Rock Weight", 20);
            expect(logic.carriedWeight.effective).toBe(20);
            logic.initialize();
            expect(logic.carriedWeight.effective).toBe(0);
        });

        it("sums a carried gear item's weight × quantity during its evaluate", () => {
            const being = makeBeing();
            being.initialize();
            const gear = makeItemLogic(
                MiscGearLogic,
                ITEM_KIND.MISCGEAR,
                gearFields({ quantity: 2, weightBase: 5, isCarried: true }),
                { actor: being.actor },
            );
            gear.initialize();
            gear.evaluate();
            expect(being.carriedWeight.effective).toBe(10);
        });

        it("ignores gear that is not carried", () => {
            const being = makeBeing();
            being.initialize();
            const gear = makeItemLogic(
                MiscGearLogic,
                ITEM_KIND.MISCGEAR,
                gearFields({ quantity: 3, weightBase: 4, isCarried: false }),
                { actor: being.actor },
            );
            gear.initialize();
            gear.evaluate();
            expect(being.carriedWeight.effective).toBe(0);
        });
    });

    describe("reach", () => {
        it("is 0 when the being has no strike modes", () => {
            const logic = makeBeing();
            expect(logic.reach).toBe(0);
        });

        it("uses combat-technique modes, which are intrinsic and always available", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            actor.itemTypes = { [ITEM_KIND.SKILL]: [ct] };
            expect(logic.reach).toBe(4);
        });

        it("takes the greatest reach among available modes, including held weapons", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            const weaponMode = makeMeleeMode(logic, {
                lengthBase: 6,
                minParts: 2,
            });
            const limbsHolding = vi.fn(() => 2);
            (logic as any).body = { structure: { limbsHolding } };
            actor.itemTypes = {
                [ITEM_KIND.SKILL]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            expect(logic.reach).toBe(6);
            expect(limbsHolding).toHaveBeenCalledWith("wpn1");
        });

        it("ignores a weapon mode when the weapon is held in fewer than minParts limbs", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor, { lengthBase: 4 });
            const weaponMode = makeMeleeMode(logic, {
                lengthBase: 6,
                minParts: 2,
            });
            (logic as any).body = {
                structure: { limbsHolding: () => 1 },
            };
            actor.itemTypes = {
                [ITEM_KIND.SKILL]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    { id: "wpn1", logic: { strikeModes: [weaponMode] } },
                ],
            };
            expect(logic.reach).toBe(4);
        });
    });

    describe("availableStrikeModes", () => {
        it("is empty when the being has no strike modes", () => {
            const logic = makeBeing();
            expect(logic.availableStrikeModes).toEqual([]);
        });

        it("always includes technique modes, listed before weapon modes", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const ct = makeTechniqueItem(actor);
            const weaponMode = makeMeleeMode(logic, { minParts: 1 });
            // availableStrikeModes now reads the count of body parts holding the
            // weapon off the weapon logic's `heldBy` getter (GearLogic.heldBy).
            // Held in one limb → the minParts:1 mode is available.
            actor.itemTypes = {
                [ITEM_KIND.SKILL]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: {
                            strikeModes: [weaponMode],
                            heldBy: [{ shortcode: "hand-r" }],
                        },
                    },
                ],
            };
            const modes = logic.availableStrikeModes;
            expect(modes).toEqual([ct.logic.strikeMode, weaponMode]);
        });

        it("excludes weapon modes when the weapon is held by no body parts", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const weaponMode = makeMeleeMode(logic, { minParts: 1 });
            // An unheld weapon reports an empty `heldBy`, so no mode is available.
            actor.itemTypes = {
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: { strikeModes: [weaponMode], heldBy: [] },
                    },
                ],
            };
            expect(logic.availableStrikeModes).toEqual([]);
        });
    });

    describe("tokens", () => {
        it("is empty when there is no active scene", () => {
            const logic = makeBeing();
            expect(logic.tokens).toEqual([]);
        });

        it("returns the active scene's linked tokens for a world actor", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            const mine = makeToken("tok1", actorId);
            const unlinked = makeToken("tok2", actorId, false);
            const other = makeToken("tok3", "someoneelse0000");
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [mine, unlinked, other],
            } as any);
            expect(logic.tokens).toEqual([mine]);
        });

        it("returns only the embedded token for a synthetic actor", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            const embedded = makeToken("tok1", actor.id, false);
            actor.isToken = true;
            actor.token = embedded;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [embedded, makeToken("tok2", actor.id)],
            } as any);
            expect(logic.tokens).toEqual([embedded]);
        });

        it("is empty for a synthetic actor whose token is not on the active scene", () => {
            const logic = makeBeing();
            const actor: any = logic.actor;
            actor.isToken = true;
            actor.token = makeToken("tok1", actor.id, false);
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok2", actor.id)],
            } as any);
            expect(logic.tokens).toEqual([]);
        });
    });

    describe("combatant", () => {
        it("is null when there is no active combat", () => {
            const logic = makeBeing();
            expect(logic.combatant).toBeNull();
        });

        it("returns the first combatant whose token is one of the being's tokens", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok1", actorId)],
            } as any);
            const mine = { tokenId: "tok1" };
            vi.spyOn(FoundryHelpersMock, "getActiveCombat").mockReturnValue({
                combatants: {
                    contents: [{ tokenId: "other" }, mine],
                },
            } as any);
            expect(logic.combatant).toBe(mine);
        });

        it("is null when no combatant matches the being's tokens", () => {
            const logic = makeBeing();
            const actorId = logic.actor!.id!;
            vi.spyOn(FoundryHelpersMock, "getActiveScene").mockReturnValue({
                tokens: [makeToken("tok1", actorId)],
            } as any);
            vi.spyOn(FoundryHelpersMock, "getActiveCombat").mockReturnValue({
                combatants: { contents: [{ tokenId: "other" }] },
            } as any);
            expect(logic.combatant).toBeNull();
        });
    });

    describe("unimplemented test methods", () => {
        it("resolve to null (not yet implemented)", async () => {
            const logic = makeBeing();
            const ctx = { scope: {} } as any;
            await expect(logic.shockTest(ctx)).resolves.toBeNull();
            await expect(logic.stumbleTest(ctx)).resolves.toBeNull();
            await expect(logic.fumbleTest(ctx)).resolves.toBeNull();
            await expect(logic.moraleTest(ctx)).resolves.toBeNull();
            await expect(logic.fearTest(ctx)).resolves.toBeNull();
        });

        it("calcImpact returns undefined when the scope has no impact data", async () => {
            // calcImpact is now implemented: with neither a priorTestResult nor
            // an impactModifier in scope it logs an error and bare-returns
            // (undefined), rather than the old not-yet-implemented `null`.
            const logic = makeBeing();
            const ctx = { scope: {} } as any;
            await expect(logic.calcImpact(ctx)).resolves.toBeUndefined();
        });

        it.todo("shockTest - rolls the Shock skill without impairment penalty");
        it.todo(
            "stumbleTest - uses the better of agility trait or acrobatics skill",
        );
        it.todo(
            "fumbleTest - uses the better of dexterity trait or legerdemain skill",
        );
        it.todo("moraleTest / fearTest - roll the Initiative skill");
        it.todo(
            "calcImpact - calculates location and damage from CombatResult",
        );
    });

    describe("contractDisease", () => {
        afterEach(() => vi.restoreAllMocks());

        /** A being with an Endurance attribute of the given score. */
        function beingWithEndurance(score = 13) {
            const logic = makeBeing();
            (logic as any).actor.items.set(
                "end",
                makeAttributeStub("end", score),
            );
            return logic;
        }

        const customDisease = {
            kind: "custom" as const,
            name: "Rattle Cough",
            subType: "disease",
            contagionIndex: 3,
        };

        it("warns and returns null when the being has no Endurance attribute", async () => {
            const warn = vi.spyOn(sohl.log, "uiWarn");
            const logic = makeBeing();
            await expect(
                (logic as any).contractDisease({ scope: {} }),
            ).resolves.toBeNull();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no Endurance attribute/),
            );
        });

        it("returns null when the dialog is dismissed", async () => {
            vi.spyOn(
                AfflictionContract,
                "promptContractDisease",
            ).mockResolvedValue(null);
            const logic = beingWithEndurance();
            await expect(
                (logic as any).contractDisease({ scope: {} }),
            ).resolves.toBeNull();
        });

        it("contracts the disease (creates it) when the contagion roll fails", async () => {
            vi.spyOn(
                AfflictionContract,
                "promptContractDisease",
            ).mockResolvedValue(customDisease);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ isSuccess: false } as any);
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            const logic = beingWithEndurance();

            await (logic as any).contractDisease({ scope: {} });

            expect(create).toHaveBeenCalledTimes(1);
            const itemsData = create.mock.calls[0][1] as any[];
            expect(itemsData[0]).toMatchObject({
                type: "affliction",
                name: "Rattle Cough",
                system: { subType: "disease", contagionIndexBase: 3 },
            });
        });

        it("does NOT contract the disease when the contagion roll succeeds", async () => {
            vi.spyOn(
                AfflictionContract,
                "promptContractDisease",
            ).mockResolvedValue(customDisease);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ isSuccess: true } as any);
            const create = vi.spyOn(
                FoundryHelpersMock,
                "fvttCreateEmbeddedItems",
            );
            const logic = beingWithEndurance();

            await (logic as any).contractDisease({ scope: {} });

            expect(create).not.toHaveBeenCalled();
        });
    });

    // Opposed-test resume moved off the actor onto SohlTokenDocumentLogic
    // (opposed tests are token-based). See SohlTokenDocumentLogic.test.ts.

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize run without items present", () => {
            const logic = makeBeing();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("evaluate aggregates worn armor onto the body locations", () => {
            const logic = makeBeing();
            logic.initialize();
            const thorax = makeLocation("thorax");
            const skull = makeLocation("skull");
            // Corporeal body (non-empty parts) exposing the mock locations.
            (logic.body as any).structure = {
                parts: [{}],
                getAllLocations: () => [thorax, skull],
            };
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.ARMORGEAR]: [
                    makeArmorItem(
                        "Mail",
                        { blunt: 2, edged: 5, piercing: 4, fire: 1 },
                        { flexible: ["thorax"] },
                    ),
                    makeArmorItem(
                        "Plate",
                        { blunt: 4, edged: 6, piercing: 5, fire: 2 },
                        { rigid: ["thorax"] },
                    ),
                ],
            };
            logic.evaluate();
            expect(thorax.armorProtection).toEqual({
                blunt: 6,
                edged: 11,
                piercing: 9,
                fire: 3,
            });
            expect(thorax.isRigid).toBe(true);
            expect(thorax.armorType).toBe("Mail, Plate");
            // Uncovered location stays bare.
            expect(skull.armorProtection).toEqual({
                blunt: 0,
                edged: 0,
                piercing: 0,
                fire: 0,
            });
            expect(skull.isRigid).toBe(false);
            expect(skull.armorType).toBe("");
        });

        it("evaluate resets prior aggregation state before reapplying layers", () => {
            const logic = makeBeing();
            logic.initialize();
            const thorax = makeLocation("thorax");
            (logic.body as any).structure = {
                parts: [{}],
                getAllLocations: () => [thorax],
            };
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.ARMORGEAR]: [
                    makeArmorItem(
                        "Mail",
                        { blunt: 2, edged: 5, piercing: 4, fire: 1 },
                        { flexible: ["thorax"] },
                    ),
                ],
            };
            logic.evaluate();
            logic.evaluate();
            // Idempotent: a second pass does not double the protection.
            expect(thorax.armorProtection.edged).toBe(5);
            expect(thorax.armorType).toBe("Mail");
        });

        it("finalize does not warn for an incorporeal being (empty body)", () => {
            const logic = makeBeing();
            logic.initialize();
            const warn = vi.spyOn(sohl.log, "warn");
            logic.finalize();
            expect(warn).not.toHaveBeenCalled();
        });

        it("finalize does not warn for a corporeal being (with body parts)", () => {
            const logic = makeBeing({ body: bodyData() });
            logic.initialize();
            const warn = vi.spyOn(sohl.log, "warn");
            logic.finalize();
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe("getUsableStrikeModes (#177)", () => {
        function makeMeleeWithReach(
            parentLogic: any,
            reachEffective: number,
            disabled = false,
            id = "sm1",
        ): MeleeStrikeMode {
            const sm = makeMeleeMode(
                parentLogic,
                { attack: { disabled, spread: 2, modifier: 5 } },
                id,
            );
            // Override reach.effective without going through full evaluate
            Object.defineProperty(sm.reach, "effective", {
                get: () => reachEffective,
                configurable: true,
            });
            return sm;
        }

        it("returns [] when there are no available strike modes", () => {
            const logic = makeBeing();
            (logic.actor as any).itemTypes = {};
            expect(
                logic.getUsableStrikeModes({
                    distanceToTarget: 5,
                    volleyAllowed: false,
                    directAllowed: true,
                    meleeAllowed: true,
                }),
            ).toEqual([]);
        });

        it("returns a melee mode within reach when meleeAllowed", () => {
            const logic = makeBeing();
            const sm = makeMeleeWithReach(logic, 6);
            const ct = makeTechniqueItem(logic.actor as any);
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.SKILL]: [ct],
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: { strikeModes: [sm], heldBy: [{}] },
                    },
                ],
            };
            const result = logic.getUsableStrikeModes({
                distanceToTarget: 5,
                volleyAllowed: false,
                directAllowed: true,
                meleeAllowed: true,
            });
            expect(result).toContain(sm);
        });

        it("excludes a melee mode out of reach", () => {
            const logic = makeBeing();
            const sm = makeMeleeWithReach(logic, 3);
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: { strikeModes: [sm], heldBy: [{}] },
                    },
                ],
            };
            const result = logic.getUsableStrikeModes({
                distanceToTarget: 5,
                volleyAllowed: false,
                directAllowed: true,
                meleeAllowed: true,
            });
            expect(result).not.toContain(sm);
        });

        it("excludes a melee mode when meleeAllowed is false", () => {
            const logic = makeBeing();
            const sm = makeMeleeWithReach(logic, 10);
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: { strikeModes: [sm], heldBy: [{}] },
                    },
                ],
            };
            const result = logic.getUsableStrikeModes({
                distanceToTarget: 5,
                volleyAllowed: false,
                directAllowed: true,
                meleeAllowed: false,
            });
            expect(result).not.toContain(sm);
        });

        it("excludes a mode with attack.disabled", () => {
            const logic = makeBeing();
            const sm = makeMeleeWithReach(logic, 10, true);
            (logic.actor as any).itemTypes = {
                [ITEM_KIND.WEAPONGEAR]: [
                    {
                        id: "wpn1",
                        logic: { strikeModes: [sm], heldBy: [{}] },
                    },
                ],
            };
            const result = logic.getUsableStrikeModes({
                distanceToTarget: 5,
                volleyAllowed: false,
                directAllowed: true,
                meleeAllowed: true,
            });
            expect(result).not.toContain(sm);
        });
    });

    describe("properties", () => {
        // health is written into the data model (system.health) as plain
        // numbers — covered by the "BeingLogic health (#470)" suite below.
        // shockState is declared but not yet assigned by any lifecycle phase.
        it.todo("shockState - tracks current shock state");
    });

    describe("healingBase (#549)", () => {
        /** A being carrying END and WIL attributes of the given scores. */
        function beingWithAttrs(end: number, wil: number) {
            const being = makeBeing();
            (being as any).actor.items.set(
                "end",
                makeAttributeStub("end", end),
            );
            (being as any).actor.items.set(
                "wil",
                makeAttributeStub("wil", wil),
            );
            return being;
        }

        it("is a ValueModifier after initialize", () => {
            const being = beingWithAttrs(12, 12);
            being.initialize();
            expect(being.healingBase).toBeInstanceOf(ValueModifier);
        });

        it("seeds the base to avg(END, WIL) in evaluate (equal scores)", () => {
            const being = beingWithAttrs(12, 12);
            being.initialize();
            being.evaluate();
            expect(being.healingBase.base).toBe(12);
            expect(being.healingBase.effective).toBe(12);
        });

        it("rounds the base up when END > WIL", () => {
            const being = beingWithAttrs(13, 12);
            being.initialize();
            being.evaluate();
            expect(being.healingBase.base).toBe(13); // 12.5 → 13
        });

        it("rounds the base down when END <= WIL", () => {
            const being = beingWithAttrs(12, 13);
            being.initialize();
            being.evaluate();
            expect(being.healingBase.base).toBe(12); // 12.5 → 12
        });

        it("accepts runtime deltas (traits/treatment) on top of the base", () => {
            const being = beingWithAttrs(12, 12);
            being.initialize();
            being.evaluate();
            being.healingBase.add("Treatment", "Trt", 2);
            expect(being.healingBase.effective).toBe(14);
        });

        it("rebuilds each initialize (deltas are not persisted)", () => {
            const being = beingWithAttrs(12, 12);
            being.initialize();
            being.evaluate();
            being.healingBase.add("Treatment", "Trt", 2);
            expect(being.healingBase.empty).toBe(false);
            being.initialize();
            expect(being.healingBase.empty).toBe(true);
            expect(being.healingBase.hasBase).toBe(false);
        });

        it("leaves the base unset (0) when an attribute is missing", () => {
            const being = makeBeing(); // incorporeal: no attributes
            being.initialize();
            being.evaluate();
            expect(being.healingBase.base).toBe(0);
            expect(being.healingBase.hasBase).toBe(false);
        });
    });

    describe("aggregateArmorProtection (#180)", () => {
        function makeArmorStub(
            isEquipped: boolean,
            blunt = 3,
            locations = {
                flexible: ["head"],
                rigid: [] as string[],
            },
        ) {
            return {
                data: {
                    kind: ITEM_KIND.ARMORGEAR,
                    isEquipped,
                    material: "leather",
                    locations,
                },
                protection: {
                    blunt: { effective: blunt },
                    edged: { effective: 2 },
                    piercing: { effective: 2 },
                    fire: { effective: 0 },
                },
            };
        }

        function makeHeadLoc() {
            return {
                shortcode: "head",
                armorProtection: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
                isRigid: false,
                armorType: "",
            };
        }

        // Build a being with the armor item embedded, initialize it, then point
        // its body structure at the mock head location so armor aggregation folds
        // onto it. Returns the initialized logic ready to evaluate.
        function setup(
            armorStub: ReturnType<typeof makeArmorStub>,
            headLoc: ReturnType<typeof makeHeadLoc>,
        ) {
            const logic = makeBeing();
            const actor = logic.actor as any;
            actor.items.set("arm1", {
                id: "arm1",
                type: ITEM_KIND.ARMORGEAR,
                logic: armorStub,
            });
            logic.initialize();
            (logic.body as any).structure = {
                parts: [{}],
                getAllLocations: () => [headLoc],
            };
            return logic;
        }

        it("ignores unequipped armor — body location gets no protection", () => {
            const headLoc = makeHeadLoc();
            const logic = setup(makeArmorStub(false), headLoc);
            logic.evaluate();
            expect(headLoc.armorProtection.blunt).toBe(0);
        });

        it("applies equipped armor — body location receives the protection", () => {
            const headLoc = makeHeadLoc();
            const logic = setup(makeArmorStub(true, 5), headLoc);
            logic.evaluate();
            expect(headLoc.armorProtection.blunt).toBe(5);
        });
    });
});

describe("BeingLogic health (#470)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("populates health as 100/Excellent for a healthy, uninjured being (max always 100)", () => {
        const logic = makeBeing();
        logic.initialize();
        logic.finalize();
        // Health is written back into the data model (system.health) as plain
        // numbers for the token bar — not a ValueModifier — and never persisted.
        expect(logic.data.health.max).toBe(100);
        expect(logic.data.health.value).toBe(100);
        expect(logic.healthBand).toBe("Excellent");
    });

    it("reads the dead status via the fvttActorStatuses shim → value 0 / Dead", () => {
        vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
            new Set(["dead"]),
        );
        const logic = makeBeing();
        logic.initialize();
        logic.finalize();
        expect(logic.data.health.max).toBe(100);
        expect(logic.data.health.value).toBe(0);
        expect(logic.healthBand).toBe("Dead");
    });
});

describe("BeingDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("has no additional fields beyond base actor schema");
    });

    it.todo("has kind set to ACTOR_KIND.BEING");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
