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
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    FATIGUE_CATEGORY,
    FEAR_LEVEL,
    IMPACT_ASPECT,
    ITEM_KIND,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    MORALE_LEVEL,
    MOVEMENT_MEDIUM,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import * as ActionCard from "@src/document/chat/action-card";
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

        /** A contracted-disease setup: contagion fails, creating an affliction
         *  whose incubation interval is carried on `onsetDurationBase`. */
        function contractsWith(onsetDurationBase = 604800) {
            vi.spyOn(
                AfflictionContract,
                "promptContractDisease",
            ).mockResolvedValue(customDisease);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ isSuccess: false } as any);
            const affliction = {
                uuid: "Item.aff00000000",
                system: { onsetDurationBase },
            };
            vi.spyOn(
                FoundryHelpersMock,
                "fvttCreateEmbeddedItems",
            ).mockResolvedValue([affliction] as any);
            return affliction;
        }

        it("OFFERS the onset check after contracting — accept schedules it (#579)", async () => {
            const affliction = contractsWith(604800); // 7 days
            const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
            const logic = beingWithEndurance();

            await (logic as any).contractDisease({
                skipDialog: true,
                scope: { schedule: true },
            });

            expect(schedule).toHaveBeenCalledWith(
                affliction,
                "onsetCheck",
                604800,
            );
        });

        it("does NOT auto-arm the onset — declining leaves it unscheduled (#579)", async () => {
            const affliction = contractsWith(604800);
            const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
            const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
            const logic = beingWithEndurance();

            await (logic as any).contractDisease({
                skipDialog: true,
                scope: { schedule: false },
            });

            expect(schedule).not.toHaveBeenCalled();
            expect(unschedule).toHaveBeenCalledWith(affliction, "onsetCheck");
        });
    });

    describe("Fear Test (#558)", () => {
        afterEach(() => vi.restoreAllMocks());

        /** A being with a Will attribute of the given score. */
        function beingWithWill(score = 15) {
            const logic = makeBeing();
            (logic as any).actor.items.set(
                "wil",
                makeAttributeStub("wil", score),
            );
            return logic;
        }

        /** Force the Fear Test's headless roll to a given outcome. */
        function forceRoll(
            normSuccessLevel: number,
            lastDigit: number,
            isSuccess: boolean,
        ) {
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({
                normSuccessLevel,
                lastDigit,
                isSuccess,
            } as any);
        }

        /** Stub the Foundry-touching side effects; return the create spy. */
        function stubEffects(statuses: Set<string> = new Set()) {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                statuses,
            );
            vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            ).mockResolvedValue(undefined as any);
            vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(
                undefined as any,
            );
            return vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
        }

        it("records a fresh Afraid result as a fear trauma with no PSY", async () => {
            forceRoll(MARGINAL_FAILURE, 7, false);
            const create = stubEffects();
            const toggle = vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            );
            const being = beingWithWill();

            await (being as any).fearTest({ scope: { sourceName: "Wraith" } });

            expect(create).toHaveBeenCalledTimes(1);
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                type: ITEM_KIND.TRAUMA,
                name: "Wraith",
                system: {
                    subType: TRAUMA_SUBTYPE.FEAR,
                    levelBase: FEAR_LEVEL.AFRAID,
                },
            });
            // FEARFUL status is switched on.
            expect(toggle).toHaveBeenCalledWith(
                expect.anything(),
                "fear",
                true,
            );
        });

        it("Terrified (CF5) records the state and inflicts +1 PSY", async () => {
            forceRoll(CRITICAL_FAILURE, 5, false);
            const create = stubEffects();
            const being = beingWithWill();

            await (being as any).fearTest({ scope: { sourceName: "Wraith" } });

            expect(create).toHaveBeenCalledTimes(2);
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.FEAR,
                    levelBase: FEAR_LEVEL.TERRIFIED,
                },
            });
            expect((create.mock.calls[1][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                    levelBase: 1,
                },
            });
        });

        it("Catatonic (CF0) records the state and inflicts +2 PSY", async () => {
            forceRoll(CRITICAL_FAILURE, 0, false);
            const create = stubEffects();
            const being = beingWithWill();

            await (being as any).fearTest({ scope: { sourceName: "Wraith" } });

            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: { levelBase: FEAR_LEVEL.CATATONIC },
            });
            expect((create.mock.calls[1][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                    levelBase: 2,
                },
            });
        });

        it("a Brave (CS) result records a Brave marker, not a fearful state", async () => {
            forceRoll(CRITICAL_SUCCESS, 0, true);
            const create = stubEffects();
            const being = beingWithWill();

            await (being as any).fearTest({ scope: { sourceName: "Wraith" } });

            expect(create).toHaveBeenCalledTimes(1);
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.FEAR,
                    levelBase: FEAR_LEVEL.BRAVE,
                },
            });
        });

        it("a Steady (MS) result records nothing and clears an existing fear source", async () => {
            forceRoll(MARGINAL_SUCCESS, 3, true);
            const create = stubEffects(new Set(["fear"]));
            const toggle = vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            );
            const being = beingWithWill();
            const del = vi.fn().mockResolvedValue(undefined);
            // An existing Afraid trauma for the same source.
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                {
                    subType: TRAUMA_SUBTYPE.FEAR,
                    levelBase: FEAR_LEVEL.AFRAID,
                },
                { actor: (being as any).actor, name: "Wraith" },
            );
            const wraith = (
                being.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]
            )[0];
            (wraith.item as any).delete = del;

            await (being as any).fearTest({ scope: { sourceName: "Wraith" } });

            expect(create).not.toHaveBeenCalled();
            expect(del).toHaveBeenCalledTimes(1);
            // No other fear sources remain → FEARFUL switched off.
            expect(toggle).toHaveBeenCalledWith(
                expect.anything(),
                "fear",
                false,
            );
        });

        it("fearState reports the most severe active fear source", async () => {
            const being = beingWithWill();
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                { subType: TRAUMA_SUBTYPE.FEAR, levelBase: FEAR_LEVEL.AFRAID },
                { actor: (being as any).actor, name: "Wraith" },
            );
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                {
                    subType: TRAUMA_SUBTYPE.FEAR,
                    levelBase: FEAR_LEVEL.CATATONIC,
                },
                { actor: (being as any).actor, name: "Horror" },
            );
            expect(being.fearState).toBe(FEAR_LEVEL.CATATONIC);
        });
    });

    describe("Morale, Rally & Reaction (#559)", () => {
        afterEach(() => vi.restoreAllMocks());

        function forceRoll(
            normSuccessLevel: number,
            lastDigit: number,
            isSuccess: boolean,
        ) {
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({
                normSuccessLevel,
                lastDigit,
                isSuccess,
            } as any);
        }

        function stubEffects() {
            vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(
                undefined as any,
            );
            return vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
        }

        /** Attach a morale trauma at `level` (source `name`) and return it. */
        function attachMorale(being: any, level: number, name: string) {
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                { subType: TRAUMA_SUBTYPE.MORALE, levelBase: level },
                { actor: being.actor, name },
            );
            const t = (
                being.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]
            ).find((x) => x.item?.name === name)!;
            (t.item as any).delete = vi.fn().mockResolvedValue(undefined);
            (t.item as any).update = vi.fn().mockResolvedValue(undefined);
            return t;
        }

        it("Withdrawing (MF) records a morale trauma with no PSY", async () => {
            forceRoll(MARGINAL_FAILURE, 7, false);
            const create = stubEffects();
            await (makeBeing() as any).moraleTest({ scope: {} });
            expect(create).toHaveBeenCalledTimes(1);
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.MORALE,
                    levelBase: MORALE_LEVEL.WITHDRAWING,
                },
            });
        });

        it("Catatonic (CF0) records the state and inflicts +2 PSY", async () => {
            forceRoll(CRITICAL_FAILURE, 0, false);
            const create = stubEffects();
            await (makeBeing() as any).moraleTest({ scope: {} });
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: { levelBase: MORALE_LEVEL.CATATONIC },
            });
            expect((create.mock.calls[1][1] as any[])[0]).toMatchObject({
                system: {
                    subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                    levelBase: 2,
                },
            });
        });

        it("Routed (CF5) records the state and inflicts +1 PSY", async () => {
            forceRoll(CRITICAL_FAILURE, 5, false);
            const create = stubEffects();
            await (makeBeing() as any).moraleTest({ scope: {} });
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: { levelBase: MORALE_LEVEL.ROUTED },
            });
            expect((create.mock.calls[1][1] as any[])[0]).toMatchObject({
                system: { levelBase: 1 },
            });
        });

        it("a Reaction Test success steadies a Routed combatant", async () => {
            forceRoll(MARGINAL_SUCCESS, 3, true);
            stubEffects();
            const being = makeBeing();
            const routed = attachMorale(
                being,
                MORALE_LEVEL.ROUTED,
                "Broken line",
            );
            await (being as any).reactionTest({ scope: {} });
            expect((routed.item as any).delete).toHaveBeenCalledTimes(1);
        });

        it("a Reaction Test success improves Catatonic only to Routed", async () => {
            forceRoll(MARGINAL_SUCCESS, 3, true);
            stubEffects();
            const being = makeBeing();
            const cat = attachMorale(being, MORALE_LEVEL.CATATONIC, "Terror");
            await (being as any).reactionTest({ scope: {} });
            expect((cat.item as any).update).toHaveBeenCalledWith({
                "system.levelBase": MORALE_LEVEL.ROUTED,
            });
            expect((cat.item as any).delete).not.toHaveBeenCalled();
        });

        it("a Reaction Test warns and returns null when not shaken", async () => {
            const warn = vi.spyOn(sohl.log, "uiWarn");
            stubEffects();
            await expect(
                (makeBeing() as any).reactionTest({ scope: {} }),
            ).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("a Rally critical success OFFERS to steady allies (open acceptRally card)", async () => {
            forceRoll(CRITICAL_SUCCESS, 0, true);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined as any);
            await (makeBeing() as any).rallyTest({ scope: {} });
            const spec = post.mock.calls.at(-1)![1] as any;
            expect(spec.buttons).toMatchObject({
                action: "acceptRally",
                handlerUuid: "@self",
                scope: { mode: "steady" },
            });
        });

        it("a Rally failure posts an informational card with no accept button", async () => {
            forceRoll(CRITICAL_FAILURE, 0, false);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined as any);
            await (makeBeing() as any).rallyTest({ scope: {} });
            const spec = post.mock.calls.at(-1)![1] as any;
            expect(spec.buttons).toBeUndefined();
        });

        it("moraleState reports the most severe active morale source", () => {
            const being = makeBeing();
            attachMorale(being, MORALE_LEVEL.WITHDRAWING, "A");
            attachMorale(being, MORALE_LEVEL.ROUTED, "B");
            expect(being.moraleState).toBe(MORALE_LEVEL.ROUTED);
        });
    });

    describe("The Pall (#561)", () => {
        afterEach(() => vi.restoreAllMocks());

        function forceRoll(
            normSuccessLevel: number,
            lastDigit: number,
            isSuccess: boolean,
        ) {
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({
                normSuccessLevel,
                lastDigit,
                isSuccess,
            } as any);
        }

        function stubEffects() {
            vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(
                undefined as any,
            );
            return vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
        }

        it("Disturbed (MF) accrues +1 Pall Stress Level", async () => {
            forceRoll(MARGINAL_FAILURE, 7, false);
            const create = stubEffects();
            await (makeBeing() as any).pallResist({ scope: { totalPal: 2 } });
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: { subType: TRAUMA_SUBTYPE.PALL, levelBase: 1 },
            });
        });

        it("Catatonic (CF0) accrues +3 Pall Stress Levels", async () => {
            forceRoll(CRITICAL_FAILURE, 0, false);
            const create = stubEffects();
            await (makeBeing() as any).pallResist({ scope: { totalPal: 1 } });
            expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
                system: { levelBase: 3 },
            });
        });

        it("adds PSL to an existing Pall Cloud on a repeat failure", async () => {
            forceRoll(CRITICAL_FAILURE, 5, false); // Terrified +2
            stubEffects();
            const being = makeBeing();
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                { subType: TRAUMA_SUBTYPE.PALL, levelBase: 1 },
                { actor: (being as any).actor, name: "The Pall" },
            );
            const pall = (
                being.logicTypes[ITEM_KIND.TRAUMA] as TraumaLogic[]
            )[0];
            (pall.item as any).update = vi.fn().mockResolvedValue(undefined);
            await (being as any).pallResist({ scope: { totalPal: 0 } });
            expect((pall.item as any).update).toHaveBeenCalledWith({
                "system.levelBase": 3,
            });
        });

        it("a successful Resist accrues no Pall Stress", async () => {
            forceRoll(MARGINAL_SUCCESS, 3, true);
            const create = stubEffects();
            await (makeBeing() as any).pallResist({ scope: { totalPal: 2 } });
            expect(create).not.toHaveBeenCalled();
        });

        it("pallStress reports the Pall Cloud level", () => {
            const being = makeBeing();
            makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                { subType: TRAUMA_SUBTYPE.PALL, levelBase: 4 },
                { actor: (being as any).actor, name: "The Pall" },
            );
            expect(being.pallStress).toBe(4);
        });
    });

    describe("unusable body part (#568)", () => {
        afterEach(() => vi.restoreAllMocks());

        function beingWithHands() {
            const being = makeBeing();
            (being as any).body = {
                structure: {
                    parts: [
                        {
                            locations: [{ shortcode: "rhand" }],
                            roles: ["manipulator"],
                            permanentImpairment: 0,
                            permanentlyUnusable: false,
                        },
                        {
                            locations: [{ shortcode: "lfoot" }],
                            roles: ["locomotor"],
                            permanentImpairment: 0,
                            permanentlyUnusable: false,
                        },
                    ],
                },
            };
            return being;
        }

        function injure(being: any, location: string, level: number) {
            const t = makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                {
                    subType: TRAUMA_SUBTYPE.INJURY,
                    levelBase: level,
                    bodyLocationCode: location,
                },
                { actor: being.actor, name: "Wound" },
            );
            (t as any).initialize();
        }

        it("reports the roles of a part made unusable by a grievous injury", () => {
            const being = beingWithHands();
            injure(being, "rhand", 4); // grievous → unusable
            const roles = being.unusableRoles();
            expect(roles.has("manipulator")).toBe(true);
            expect(roles.has("locomotor")).toBe(false);
        });

        it("reports no roles when injuries are only impairing (not unusable)", () => {
            const being = beingWithHands();
            injure(being, "rhand", 2); // serious → impaired but usable
            expect(being.unusableRoles().size).toBe(0);
        });

        it("is empty for an incorporeal being (no body)", () => {
            expect(makeBeing().unusableRoles().size).toBe(0);
        });

        it("maps an impaired-but-usable role to its −10 (serious) penalty", () => {
            const being = beingWithHands();
            injure(being, "rhand", 2); // serious → impaired but usable (−10)
            const penalties = being.impairedRolePenalties();
            expect(penalties.get("manipulator")).toBe(-10);
            expect(penalties.has("locomotor")).toBe(false);
        });

        it("excludes a role made unusable by a grievous injury (that is auto-CF, not a penalty)", () => {
            const being = beingWithHands();
            injure(being, "rhand", 4); // grievous → unusable, no numeric penalty
            expect(being.impairedRolePenalties().has("manipulator")).toBe(
                false,
            );
            expect(being.unusableRoles().has("manipulator")).toBe(true);
        });

        it("is empty when a part is uninjured", () => {
            expect(beingWithHands().impairedRolePenalties().size).toBe(0);
        });

        it("is empty for an incorporeal being (no body)", () => {
            expect(makeBeing().impairedRolePenalties().size).toBe(0);
        });

        describe("bodyPartImpairments — per-part view (#628)", () => {
            it("derives each given part's impairment, in order", () => {
                const being = beingWithHands();
                injure(being, "rhand", 2); // serious → impaired but usable (−10)
                const parts = (being as any).body.structure.parts;
                const [rhand, lfoot] = being.bodyPartImpairments(parts);
                expect(rhand.usable).toBe(true);
                expect(rhand.impairment).toBe(-10);
                expect(lfoot.usable).toBe(true);
                expect(lfoot.impairment).toBe(0);
            });

            it("marks a part with a grievous injury unusable", () => {
                const being = beingWithHands();
                injure(being, "rhand", 4); // grievous → unusable
                const parts = (being as any).body.structure.parts;
                expect(being.bodyPartImpairments(parts)[0].usable).toBe(false);
            });

            it("returns an empty array for no parts", () => {
                expect(makeBeing().bodyPartImpairments([])).toEqual([]);
            });
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

    describe("shockState (#550)", () => {
        afterEach(() => vi.restoreAllMocks());

        it("is NONE (0) when no shock status is active", () => {
            const being = makeBeing();
            expect(being.shockState).toBe(0);
        });

        it("reports the highest active shock status", () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(["stun", "unconscious"]),
            );
            const being = makeBeing();
            expect(being.shockState).toBe(3); // UNCONSCIOUS
        });

        it("setShockState clears active shock statuses and sets only the target", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(["unconscious"]),
            );
            const toggle = vi
                .spyOn(FoundryHelpersMock, "fvttToggleActorStatus")
                .mockResolvedValue(undefined);
            const being = makeBeing();
            await being.setShockState(1); // → STUNNED
            // Unconscious removed, stun added; incapacitated/dead untouched.
            expect(toggle).toHaveBeenCalledWith(
                being.actor,
                "unconscious",
                false,
            );
            expect(toggle).toHaveBeenCalledWith(being.actor, "stun", true);
            expect(toggle).toHaveBeenCalledTimes(2);
        });

        it("setShockState(NONE) clears every active shock status and sets none", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(["stun", "dead"]),
            );
            const toggle = vi
                .spyOn(FoundryHelpersMock, "fvttToggleActorStatus")
                .mockResolvedValue(undefined);
            const being = makeBeing();
            await being.setShockState(0);
            expect(toggle).toHaveBeenCalledWith(being.actor, "stun", false);
            expect(toggle).toHaveBeenCalledWith(being.actor, "dead", false);
            expect(toggle).toHaveBeenCalledTimes(2);
        });

        it("setShockState clamps out-of-range levels", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(),
            );
            const toggle = vi
                .spyOn(FoundryHelpersMock, "fvttToggleActorStatus")
                .mockResolvedValue(undefined);
            const being = makeBeing();
            await being.setShockState(99); // clamps to DEAD
            expect(toggle).toHaveBeenCalledWith(being.actor, "dead", true);
        });

        it("advanceShockState moves from the current state by N steps", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(["stun"]), // STUNNED (1)
            );
            const toggle = vi
                .spyOn(FoundryHelpersMock, "fvttToggleActorStatus")
                .mockResolvedValue(undefined);
            const being = makeBeing();
            await being.advanceShockState(2); // 1 → 3 (UNCONSCIOUS)
            expect(toggle).toHaveBeenCalledWith(being.actor, "stun", false);
            expect(toggle).toHaveBeenCalledWith(
                being.actor,
                "unconscious",
                true,
            );
        });
    });

    describe("shockReTest (#556)", () => {
        afterEach(() => vi.restoreAllMocks());

        function setup(
            opts: {
                current?: Set<string>;
                sl?: number;
                shockMl?: number;
                fatigue?: number;
            } = {},
        ) {
            const {
                current = new Set<string>(),
                sl = 0,
                shockMl = 50,
                fatigue = 0,
            } = opts;
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                current,
            );
            vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            ).mockResolvedValue(undefined);
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            const being = makeBeing();
            (being as any).fatiguePenalty = { effective: fatigue };
            vi.spyOn(being, "getItemLogic").mockImplementation(
                (code: string) =>
                    code === "shok" ?
                        ({ masteryLevel: { effective: shockMl } } as any)
                    :   undefined,
            );
            const roll = vi
                .spyOn(MasteryLevelModifier.prototype, "successTest")
                .mockResolvedValue({ normSuccessLevel: sl } as any);
            const set = vi
                .spyOn(being, "setShockState")
                .mockResolvedValue(undefined);
            return { being, roll, set, create };
        }

        it("does nothing unless the being is Incapacitated or Unconscious", async () => {
            const { being, roll } = setup({ current: new Set(["stun"]) }); // STUNNED
            const res = await being.shockReTest({} as any);
            expect(res).toBeNull();
            expect(roll).not.toHaveBeenCalled();
        });

        it("rolls the Shock skill at −20 minus the fatigue penalty", async () => {
            const { being, roll } = setup({
                current: new Set(["incapacitated"]),
                sl: MARGINAL_SUCCESS,
                shockMl: 44,
                fatigue: 5,
            });
            await being.shockReTest({} as any);
            expect((roll.mock.instances[0] as any).base).toBe(44);
            expect(roll.mock.calls[0][0].scope.situationalModifier).toBe(-25); // −20 − 5
        });

        it("recovers from all shock on a critical success", async () => {
            const { being, set } = setup({
                current: new Set(["unconscious"]),
                sl: CRITICAL_SUCCESS,
            });
            await being.shockReTest({} as any);
            expect(set).toHaveBeenCalledWith(0); // NONE
        });

        it("improves to Stunned on a marginal success", async () => {
            const { being, set } = setup({
                current: new Set(["incapacitated"]),
                sl: MARGINAL_SUCCESS,
            });
            await being.shockReTest({} as any);
            expect(set).toHaveBeenCalledWith(1); // STUNNED
        });

        it("drops into Extended Shock (a shock trauma) on a marginal failure", async () => {
            const { being, create } = setup({
                current: new Set(["incapacitated"]),
                sl: MARGINAL_FAILURE,
            });
            await being.shockReTest({} as any);
            expect(create).toHaveBeenCalledWith(being, [
                expect.objectContaining({
                    system: expect.objectContaining({
                        subType: "shock",
                        healingRateBase: 5,
                    }),
                }),
            ]);
        });

        it("OFFERS the Extended Shock recovery course rather than auto-arming it (#579)", async () => {
            const { being, create } = setup({
                current: new Set(["incapacitated"]),
                sl: MARGINAL_FAILURE,
            });
            const shockItem = {
                uuid: "Item.shock00000",
                system: { courseDurationBase: 14400 },
            };
            create.mockResolvedValue([shockItem]);
            const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
            // A pre-answered scheduling context accepts the course offer.
            await being.shockReTest({
                skipDialog: true,
                scope: { schedule: true },
            } as any);
            expect(schedule).toHaveBeenCalledWith(
                shockItem,
                "courseCheck",
                14400,
            );
        });

        it("drops an Unconscious victim into a Coma on a critical failure", async () => {
            const { being, create, set } = setup({
                current: new Set(["unconscious"]),
                sl: CRITICAL_FAILURE,
            });
            await being.shockReTest({} as any);
            expect(create).toHaveBeenCalledWith(being, [
                expect.objectContaining({
                    system: expect.objectContaining({ subType: "coma" }),
                }),
            ]);
            expect(set).toHaveBeenCalledWith(3); // UNCONSCIOUS
        });
    });

    describe("shockReTest scheduling (#569)", () => {
        afterEach(() => vi.restoreAllMocks());

        /** A being reporting `statuses`, with sohl.schedule/unschedule spied. */
        function setup(statuses: string[] = []) {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(statuses),
            );
            vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            ).mockResolvedValue(undefined);
            const being = makeBeing();
            const schedule = vi
                .spyOn((globalThis as any).sohl, "schedule")
                .mockResolvedValue(undefined);
            const unschedule = vi
                .spyOn((globalThis as any).sohl, "unschedule")
                .mockResolvedValue(undefined);
            // Pre-answered "yes" so offerSchedule arms without a dialog.
            const accept = {
                skipDialog: true,
                scope: { schedule: true },
            } as any;
            return { being, schedule, unschedule, accept };
        }

        it("Incapacitated → offers an event-driven turnEnd Re-Test schedule", async () => {
            const { being, schedule, unschedule, accept } = setup([
                "incapacitated",
            ]);
            await being.offerShockReTest(accept);
            expect(schedule).toHaveBeenCalledWith(
                being.actor,
                "shockReTest",
                0,
                undefined,
                undefined,
                "turnEnd",
                // Gated to this being's own combatant turn (#569).
                "combatant.actor.uuid === subscriberUuid",
            );
            expect(unschedule).not.toHaveBeenCalled();
        });

        it("Unconscious → offers a +10-minute time Re-Test schedule", async () => {
            const { being, schedule, unschedule, accept } = setup([
                "unconscious",
            ]);
            await being.offerShockReTest(accept);
            expect(schedule).toHaveBeenCalledWith(
                being.actor,
                "shockReTest",
                600,
            );
            expect(unschedule).not.toHaveBeenCalled();
        });

        it("no ordinary shock (Stunned) → clears any Re-Test reminder", async () => {
            const { being, schedule, unschedule, accept } = setup(["stun"]);
            await being.offerShockReTest(accept);
            expect(schedule).not.toHaveBeenCalled();
            expect(unschedule).toHaveBeenCalledWith(being.actor, "shockReTest");
        });

        it("a lasting Extended Shock trauma suppresses the ordinary Re-Test even while Incapacitated", async () => {
            const { being, schedule, unschedule, accept } = setup([
                "incapacitated",
            ]);
            // Extended Shock is a shock-subtype trauma; recovery is a Course Test,
            // not the ordinary Re-Test — so no ordinary reminder should arm.
            (being.actor as any).itemTypes = {
                [ITEM_KIND.TRAUMA]: [
                    { logic: { data: { subType: TRAUMA_SUBTYPE.SHOCK } } },
                ],
            };
            await being.offerShockReTest(accept);
            expect(schedule).not.toHaveBeenCalled();
            expect(unschedule).toHaveBeenCalledWith(being.actor, "shockReTest");
        });

        it("injuryShock offers the Re-Test after worsening the shock state", async () => {
            const { being, accept } = setup(["incapacitated"]);
            vi.spyOn(being, "setShockState").mockResolvedValue(undefined);
            vi.spyOn(being, "getItemLogic").mockReturnValue(undefined as any);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ normSuccessLevel: MARGINAL_FAILURE } as any);
            const offer = vi
                .spyOn(being, "offerShockReTest")
                .mockResolvedValue(undefined);
            await being.injuryShock({
                ...accept,
                scope: { shockIndex: 8, shockBonus: 0 },
            } as any);
            expect(offer).toHaveBeenCalledTimes(1);
        });

        it("performing a Re-Test clears the ordinary reminder on completion", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(["incapacitated"]),
            );
            vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            ).mockResolvedValue(undefined);
            vi.spyOn(
                FoundryHelpersMock,
                "fvttCreateEmbeddedItems",
            ).mockResolvedValue([]);
            const being = makeBeing();
            (being as any).fatiguePenalty = { effective: 0 };
            vi.spyOn(being, "getItemLogic").mockReturnValue(undefined as any);
            vi.spyOn(being, "setShockState").mockResolvedValue(undefined);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ normSuccessLevel: MARGINAL_SUCCESS } as any);
            const unschedule = vi
                .spyOn((globalThis as any).sohl, "unschedule")
                .mockResolvedValue(undefined);
            await being.shockReTest({} as any);
            expect(unschedule).toHaveBeenCalledWith(being.actor, "shockReTest");
        });
    });

    describe("applyPermanentImpairment (#554)", () => {
        afterEach(() => vi.restoreAllMocks());

        /** Body data whose head/skull part carries `headPi` permanent impairment. */
        function bodyWith(headPi = 0) {
            const structure = JSON.parse(JSON.stringify(BODY_STRUCTURE_DATA));
            structure.parts[0].permanentImpairment = headPi;
            return bodyData({ structure });
        }

        it("rewrites the whole parts array with the worsened impairment", async () => {
            const being = makeBeing({ body: bodyWith(0) });
            being.initialize();
            await being.applyPermanentImpairment("skull", -10);
            const payload = (being.actor!.update as any).mock.calls[0][0];
            const parts = payload["system.body.structure.parts"];
            expect(parts).toHaveLength(2);
            expect(parts[0].permanentImpairment).toBe(-10); // head (skull)
            expect(parts[1].permanentImpairment ?? 0).toBe(0); // thorax untouched
        });

        it("keeps the worse existing impairment and does not write", async () => {
            const being = makeBeing({ body: bodyWith(-20) });
            being.initialize();
            await being.applyPermanentImpairment("skull", -10);
            expect(being.actor!.update).not.toHaveBeenCalled();
        });

        it("is a no-op for a non-negative magnitude or an unknown location", async () => {
            const being = makeBeing({ body: bodyWith(0) });
            being.initialize();
            await being.applyPermanentImpairment("skull", 0);
            await being.applyPermanentImpairment("nope", -10);
            expect(being.actor!.update).not.toHaveBeenCalled();
        });
    });

    describe("performBloodStoppage — the physician's Blood Stoppage step (#547)", () => {
        afterEach(() => vi.restoreAllMocks());

        function physician(pysnMl: number | null) {
            const being = makeBeing();
            vi.spyOn(being, "getItemLogic").mockImplementation(
                (code: string) =>
                    code === "pysn" && pysnMl !== null ?
                        ({ masteryLevel: { effective: pysnMl } } as any)
                    :   undefined,
            );
            return being;
        }

        it("rolls the physician's Physician skill and posts a result with an owner-gated Accept button", async () => {
            const being = physician(70);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined as any);
            vi.spyOn(
                FoundryHelpersMock,
                "fvttLogicFromUuidSync",
            ).mockReturnValue({ item: { name: "Gash" } } as any);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ normSuccessLevel: CRITICAL_SUCCESS } as any);

            const res = await (being as any).performBloodStoppage({
                scope: { injuryUuid: "Item.bleeder", stoppageBonus: 0 },
                skipDialog: true,
            });

            expect(res).toMatchObject({ kind: "stopImmediately" });
            const spec = post.mock.calls[0][1] as any;
            expect(spec.buttons).toEqual(
                expect.objectContaining({
                    action: "acceptBloodStoppage",
                    handlerUuid: "Item.bleeder",
                    scope: { kind: "stopImmediately", nextBonus: 0 },
                }),
            );
        });

        it("self-gates: a non-physician aborts with a notice and posts nothing", async () => {
            const being = physician(null);
            const post = vi.spyOn(ActionCard, "postActionCard");
            const warn = vi.spyOn(sohl.log, "uiWarn");
            const res = await (being as any).performBloodStoppage({
                scope: { injuryUuid: "Item.bleeder" },
            });
            expect(res).toBeUndefined();
            expect(warn).toHaveBeenCalled();
            expect(post).not.toHaveBeenCalled();
        });
    });

    describe("performTreatmentTest — the physician's self-sufficient action", () => {
        afterEach(() => vi.restoreAllMocks());

        /** A being whose Physician skill ML is `pysnMl`, or absent when `null`. */
        function physician(pysnMl: number | null) {
            const being = makeBeing();
            vi.spyOn(being, "getItemLogic").mockImplementation(
                (code: string) =>
                    code === "pysn" && pysnMl !== null ?
                        ({ masteryLevel: { effective: pysnMl } } as any)
                    :   undefined,
            );
            return being;
        }

        it("card path: rolls the physician's own skill and posts a Result card with an owner-gated Accept button", async () => {
            const being = physician(60);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined);
            // Grievous edged wound resolved from the pre-filled injury uuid.
            vi.spyOn(
                FoundryHelpersMock,
                "fvttLogicFromUuidSync",
            ).mockReturnValue({
                data: { levelBase: 4, aspect: "edged" },
            } as any);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ normSuccessLevel: MARGINAL_SUCCESS } as any);

            const res = await being.performTreatmentTest({
                scope: { injuryUuid: "Item.w" },
                skipDialog: true,
            } as any);

            // grievous MS → HR 4; the wound is NOT mutated here (propose only).
            expect(res).toMatchObject({ healingRate: 4 });
            // The Accept button hands the rate to the wound's own treatInjury.
            const spec = post.mock.calls[0][1];
            expect(spec.buttons).toEqual(
                expect.objectContaining({
                    action: "treatInjury",
                    handlerUuid: "Item.w",
                    scope: { healingRate: 4 },
                }),
            );
        });

        it("GM-directed (no target wound): posts an informational result with no button", async () => {
            const being = physician(60);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined);
            // No pre-filled uuid; dialog describes a grievous edged wound, no uuid.
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
                injuryUuid: "",
                severity: 4,
                aspect: "edged",
            });
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue({ normSuccessLevel: MARGINAL_SUCCESS } as any);

            const res = await being.performTreatmentTest({ scope: {} } as any);

            expect(res).toMatchObject({ healingRate: 4 });
            // No target → no Accept button (someone runs Treat Injury by hand).
            expect(post.mock.calls[0][1].buttons).toBeUndefined();
        });

        it("self-gates: aborts (undefined + warns) when the responder has no Physician skill", async () => {
            const being = physician(null);
            const post = vi
                .spyOn(ActionCard, "postActionCard")
                .mockResolvedValue(undefined);
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(
                being.performTreatmentTest({
                    scope: { injuryUuid: "Item.w" },
                    skipDialog: true,
                } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalled();
            expect(post).not.toHaveBeenCalled();
        });

        it("returns undefined when a pre-filled wound uuid cannot be resolved", async () => {
            const being = physician(60);
            vi.spyOn(
                FoundryHelpersMock,
                "fvttLogicFromUuidSync",
            ).mockReturnValue(undefined);
            await expect(
                being.performTreatmentTest({
                    scope: { injuryUuid: "x" },
                    skipDialog: true,
                } as any),
            ).resolves.toBeUndefined();
        });
    });

    describe("injuryShock (#555)", () => {
        afterEach(() => vi.restoreAllMocks());

        function setup(
            opts: {
                current?: Set<string>;
                sl?: number;
                shockMl?: number;
                fatigue?: number;
            } = {},
        ) {
            const {
                current = new Set<string>(),
                sl = 0,
                shockMl = 50,
                fatigue = 0,
            } = opts;
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                current,
            );
            vi.spyOn(
                FoundryHelpersMock,
                "fvttToggleActorStatus",
            ).mockResolvedValue(undefined);
            const being = makeBeing();
            (being as any).fatiguePenalty = { effective: fatigue };
            vi.spyOn(being, "getItemLogic").mockImplementation(
                (code: string) =>
                    code === "shok" ?
                        ({ masteryLevel: { effective: shockMl } } as any)
                    :   undefined,
            );
            const roll = vi
                .spyOn(MasteryLevelModifier.prototype, "successTest")
                .mockResolvedValue({ normSuccessLevel: sl } as any);
            const set = vi
                .spyOn(being, "setShockState")
                .mockResolvedValue(undefined);
            return { being, roll, set };
        }

        it("computes the Shock State Index and worsens the shock state", async () => {
            // shockIndex 7 + MF (+1) → SSI 8 → INCAPACITATED (2).
            const { being, set } = setup({ sl: MARGINAL_FAILURE });
            await being.injuryShock({
                scope: { shockIndex: 7, shockBonus: 0 },
            } as any);
            expect(set).toHaveBeenCalledWith(2);
        });

        it("rolls the Shock skill with the fatigue penalty and glancing bonus", async () => {
            const { being, roll } = setup({
                sl: MARGINAL_SUCCESS,
                shockMl: 44,
                fatigue: 5,
            });
            await being.injuryShock({
                scope: { shockIndex: 5, shockBonus: 10 },
            } as any);
            expect((roll.mock.instances[0] as any).base).toBe(44);
            expect(roll.mock.calls[0][0].scope.situationalModifier).toBe(5); // 10 − 5
        });

        it("worsens only — never improves a worse existing shock state", async () => {
            // Already UNCONSCIOUS (3); a mild new SSI 7 → STUNNED (1) must not improve.
            const { being, set } = setup({
                current: new Set(["unconscious"]),
                sl: MARGINAL_FAILURE,
            });
            await being.injuryShock({
                scope: { shockIndex: 6, shockBonus: 0 },
            } as any);
            expect(set).toHaveBeenCalledWith(3);
        });

        it("returns null and changes nothing when the roll is refused", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorStatuses").mockReturnValue(
                new Set(),
            );
            const being = makeBeing();
            (being as any).fatiguePenalty = { effective: 0 };
            vi.spyOn(being, "getItemLogic").mockReturnValue(undefined as any);
            vi.spyOn(
                MasteryLevelModifier.prototype,
                "successTest",
            ).mockResolvedValue(false as any);
            const set = vi.spyOn(being, "setShockState");
            const res = await being.injuryShock({
                scope: { shockIndex: 8 },
            } as any);
            expect(res).toBeNull();
            expect(set).not.toHaveBeenCalled();
        });
    });

    describe("fatiguePenalty (#552)", () => {
        let traumaSeq = 0;
        /** Embed an initialized trauma with a unique id so instances coexist. */
        function addTrauma(being: any, fields: Record<string, unknown>) {
            const id = `trauma${String(traumaSeq++).padStart(9, "0")}`;
            const t = makeItemLogic(
                TraumaLogic,
                ITEM_KIND.TRAUMA,
                {
                    category: "",
                    healingRateBase: null,
                    aspect: IMPACT_ASPECT.BLUNT,
                    treatmentDate: null,
                    bodyLocationCode: "",
                    ...fields,
                },
                { actor: being.actor, id },
            );
            t.initialize();
            return t;
        }

        /** Embed an initialized fatigue trauma of the given category/level. */
        function addFatigue(being: any, category: string, levelBase: number) {
            return addTrauma(being, {
                subType: TRAUMA_SUBTYPE.FATIGUE,
                category,
                levelBase,
            });
        }

        /** Embed an initialized injury (non-fatigue) trauma. */
        function addInjury(being: any, levelBase: number) {
            return addTrauma(being, {
                subType: TRAUMA_SUBTYPE.INJURY,
                levelBase,
                healingRateBase: 0,
            });
        }

        it("is a ValueModifier after initialize", () => {
            const being = makeBeing();
            being.initialize();
            expect(being.fatiguePenalty).toBeInstanceOf(ValueModifier);
        });

        it("is 0 with no fatigue traumas", () => {
            const being = makeBeing();
            being.initialize();
            being.evaluate();
            being.finalize();
            expect(being.fatiguePenalty.effective).toBe(0);
        });

        it("sums Fatigue Levels across every fatigue instance", () => {
            const being = makeBeing();
            addFatigue(being, FATIGUE_CATEGORY.WINDEDNESS, 5);
            addFatigue(being, FATIGUE_CATEGORY.WEARINESS, 10);
            addFatigue(being, FATIGUE_CATEGORY.WEAKNESS, 3);
            being.initialize();
            being.evaluate();
            being.finalize();
            expect(being.fatiguePenalty.effective).toBe(18);
        });

        it("ignores non-fatigue traumas (injuries)", () => {
            const being = makeBeing();
            addFatigue(being, FATIGUE_CATEGORY.WEARINESS, 4);
            addInjury(being, 5);
            being.initialize();
            being.evaluate();
            being.finalize();
            expect(being.fatiguePenalty.effective).toBe(4);
        });

        it("rebuilds each prepare cycle", () => {
            const being = makeBeing();
            addFatigue(being, FATIGUE_CATEGORY.WINDEDNESS, 5);
            being.initialize();
            being.evaluate();
            being.finalize();
            expect(being.fatiguePenalty.effective).toBe(5);
            being.initialize();
            expect(being.fatiguePenalty.effective).toBe(0);
        });
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
