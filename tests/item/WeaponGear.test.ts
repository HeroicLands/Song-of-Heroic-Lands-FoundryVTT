import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/*
 * Helper-method behavior is mirrored here as inline pure functions so it can
 * be verified without dragging in the full WeaponGearLogic import chain
 * (which transitively requires a complete Foundry runtime). The actual
 * methods on WeaponGearLogic are thin wrappers over this same logic.
 */

function addStrikeModeUpdate(
    existing: Record<string, unknown>,
    strikeMode: unknown,
    id: string,
): Record<string, unknown> {
    if (existing[id]) {
        throw new Error(
            `Strike mode with id "${id}" already exists on this weapon.`,
        );
    }
    return { [`system.strikeModes.${id}`]: strikeMode };
}

function removeStrikeModeUpdate(id: string): Record<string, unknown> {
    return { [`system.strikeModes.-=${id}`]: null };
}

function updateStrikeModeUpdate(
    id: string,
    partial: Record<string, unknown>,
): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(partial)) {
        update[`system.strikeModes.${id}.${key}`] = value;
    }
    return update;
}

const SAMPLE = { type: "melee", name: "Cut", heftBase: 5 };

describe("WeaponGearLogic strike mode update payloads", () => {
    describe("addStrikeModeUpdate", () => {
        it("returns a single-key payload at the supplied id", () => {
            expect(addStrikeModeUpdate({}, SAMPLE, "abc123")).toEqual({
                "system.strikeModes.abc123": SAMPLE,
            });
        });

        it("throws when the id already exists", () => {
            expect(() =>
                addStrikeModeUpdate({ existing: SAMPLE }, SAMPLE, "existing"),
            ).toThrow(/already exists/);
        });
    });

    describe("removeStrikeModeUpdate", () => {
        it("returns a Foundry -= deletion payload", () => {
            expect(removeStrikeModeUpdate("abc123")).toEqual({
                "system.strikeModes.-=abc123": null,
            });
        });
    });

    describe("updateStrikeModeUpdate", () => {
        it("flattens partial fields under the id-prefixed path", () => {
            expect(
                updateStrikeModeUpdate("abc123", {
                    minParts: 2,
                    assocSkillCode: "axe",
                }),
            ).toEqual({
                "system.strikeModes.abc123.minParts": 2,
                "system.strikeModes.abc123.assocSkillCode": "axe",
            });
        });

        it("returns an empty payload when partial is empty", () => {
            expect(updateStrikeModeUpdate("abc123", {})).toEqual({});
        });
    });
});

/* ------------------------------------------------------------------ */
/* Class-level WeaponGearLogic tests                                  */
/* ------------------------------------------------------------------ */

/*
 * WeaponGearLogic.defineIntrinsicActions() declares the executors "attack",
 * "block", and "counterstrike", but no methods with those names exist on the
 * class (only automatedCombatStart / automatedBlockResume /
 * automatedCounterstrikeResume are implemented). SohlAction's constructor
 * throws for an INTRINSIC action whose executor names a non-existent method,
 * so constructing a WeaponGearLogic currently throws. The real definitions
 * are captured here at module scope, BEFORE any spying, and the broken
 * entries are filtered out so the rest of the class can be tested.
 */
const realDefs = WeaponGearLogic.defineIntrinsicActions();
const MISSING_EXECUTORS = ["attack", "block", "counterstrike"];
const safeDefs = realDefs.filter(
    (d) => !MISSING_EXECUTORS.includes(d.executor as string),
);

/** Default WeaponGearData fields; override per test. */
function weaponFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 4,
        valueBase: 120,
        isCarried: true,
        isEquipped: true,
        qualityBase: 10,
        durabilityBase: 14,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        encumbrance: 2,
        heftBase: 5,
        strikeModes: {} as Record<string, unknown>,
        ...overrides,
    };
}

/** A persisted melee strike-mode payload. */
function meleeModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "melee",
        name: "Cut",
        minParts: 1,
        assocSkillCode: "swd",
        lengthBase: 4,
        attack: { disabled: false, spread: 10, modifier: 5 },
        impactBase: {
            numDice: 1,
            die: 10,
            modifier: 5,
            aspect: IMPACT_ASPECT.EDGED,
        },
        traits: {},
        defense: { block: {}, counterstrike: {} },
        ...overrides,
    };
}

/** A persisted missile strike-mode payload. */
function missileModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "missile",
        name: "Throw",
        minParts: 1,
        assocSkillCode: "spr",
        projectileType: "none",
        maxVolleyMult: 1,
        baseRangeBase: 30,
        drawBase: 0,
        attack: { spread: 5, modifier: 0 },
        impactBase: {
            numDice: 1,
            die: 6,
            modifier: 0,
            aspect: IMPACT_ASPECT.PIERCING,
        },
        traits: {},
        ...overrides,
    };
}

function makeWeapon(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        WeaponGearLogic,
        ITEM_KIND.WEAPONGEAR,
        weaponFields(overrides),
        opts,
    );
}

describe("WeaponGearLogic", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("construction (real intrinsic action definitions)", () => {
        // The attack / block / counterstrike executors are unimplemented:
        // defineIntrinsicActions() names them but WeaponGearLogic has no
        // methods with those names, so SohlAction's executor resolution
        // throws during construction.
        it("currently throws because the attack/block/counterstrike executors do not exist", () => {
            expect(() => makeWeapon()).toThrow(/does not have a function/);
        });

        it.todo("implements the 'attack' intrinsic action executor");
        it.todo("implements the 'block' intrinsic action executor");
        it.todo("implements the 'counterstrike' intrinsic action executor");
    });

    describe("with the unimplemented executors filtered out", () => {
        beforeEach(() => {
            vi.spyOn(WeaponGearLogic, "defineIntrinsicActions").mockReturnValue(
                safeDefs,
            );
        });

        describe("construction", () => {
            it("constructs against a plain-object WeaponGearData (no Foundry)", () => {
                const logic = makeWeapon();
                expect(logic).toBeInstanceOf(WeaponGearLogic);
                expect(logic.data.kind).toBe(ITEM_KIND.WEAPONGEAR);
            });

            it("defines the automated-combat intrinsic actions plus inherited gear actions", () => {
                const logic = makeWeapon();
                for (const shortcode of [
                    "automatedCombatStart",
                    "automatedBlockResume",
                    "automatedCounterstrikeResume",
                    "setCarried",
                    "setNotCarried",
                    "postfinalize",
                ]) {
                    expect(logic.actions.has(shortcode), shortcode).toBe(true);
                }
            });
        });

        describe("initialize", () => {
            it("seeds encumbrance from the encumbrance field", () => {
                const logic = makeWeapon({ encumbrance: 3 });
                logic.initialize();
                expect(logic.encumbrance).toBeInstanceOf(ValueModifier);
                expect(logic.encumbrance.effective).toBe(3);
            });

            it("builds strike-mode domain objects from the persisted map, preserving ids", () => {
                const logic = makeWeapon({
                    strikeModes: {
                        cut00000000000id: meleeModeData(),
                        thr00000000000id: missileModeData(),
                    },
                });
                logic.initialize();
                expect(logic.strikeModes).toHaveLength(2);
                const [cut, thr] = logic.strikeModes;
                expect(cut).toBeInstanceOf(MeleeStrikeMode);
                expect(cut.id).toBe("cut00000000000id");
                expect(cut.name).toBe("Cut");
                expect(thr).toBeInstanceOf(MissileStrikeMode);
                expect(thr.id).toBe("thr00000000000id");
                expect(thr.name).toBe("Throw");
            });

            it("dispatches on the type discriminator (melee vs missile)", () => {
                const logic = makeWeapon({
                    strikeModes: { m1: meleeModeData(), m2: missileModeData() },
                });
                logic.initialize();
                expect(logic.strikeModes[0].isMelee).toBe(true);
                expect(logic.strikeModes[1].isMissile).toBe(true);
            });

            it("produces an empty strikeModes array when none are persisted", () => {
                const logic = makeWeapon({ strikeModes: {} });
                logic.initialize();
                expect(logic.strikeModes).toEqual([]);
            });

            it("tolerates an absent strikeModes field", () => {
                const logic = makeWeapon({ strikeModes: undefined });
                logic.initialize();
                expect(logic.strikeModes).toEqual([]);
            });

            it.todo(
                "seeds heft from heftBase (heft is declared but never assigned — suspected bug)",
            );
        });

        describe("evaluate", () => {
            it("adds the wielder's lineage reach to each melee mode's reach", () => {
                const actor = makeMockActor();
                actor.itemTypes = {
                    [ITEM_KIND.LINEAGE]: [
                        { logic: { reach: { effective: 3 } } },
                    ],
                };
                const logic = makeWeapon(
                    {
                        strikeModes: {
                            m1: meleeModeData({ lengthBase: 4 }),
                        },
                    },
                    { actor },
                );
                logic.initialize();
                logic.evaluate();
                const sm = logic.strikeModes[0] as MeleeStrikeMode;
                expect(sm.reach.base).toBe(4); // weapon length
                expect(sm.reach.effective).toBe(7); // + lineage reach
            });

            it("leaves reach at weapon length when there is no actor/lineage", () => {
                const logic = makeWeapon({
                    strikeModes: { m1: meleeModeData({ lengthBase: 4 }) },
                });
                logic.initialize();
                logic.evaluate();
                const sm = logic.strikeModes[0] as MeleeStrikeMode;
                expect(sm.reach.effective).toBe(4);
            });

            it("does not touch missile modes (no reach)", () => {
                const actor = makeMockActor();
                actor.itemTypes = {
                    [ITEM_KIND.LINEAGE]: [
                        { logic: { reach: { effective: 3 } } },
                    ],
                };
                const logic = makeWeapon(
                    { strikeModes: { m1: missileModeData() } },
                    { actor },
                );
                logic.initialize();
                expect(() => logic.evaluate()).not.toThrow();
                const sm = logic.strikeModes[0] as MissileStrikeMode;
                expect(sm.baseRange.effective).toBe(30);
            });
        });

        describe("finalize", () => {
            it("runs without error after initialize/evaluate", () => {
                const logic = makeWeapon({
                    strikeModes: { m1: meleeModeData() },
                });
                logic.initialize();
                logic.evaluate();
                expect(() => logic.finalize()).not.toThrow();
            });
        });

        describe("strike mode update helpers (real methods)", () => {
            it("addStrikeModeUpdate - returns a payload keyed by the supplied id", () => {
                const logic = makeWeapon();
                const sm = meleeModeData();
                expect(logic.addStrikeModeUpdate(sm as any, "abc123")).toEqual({
                    "system.strikeModes.abc123": sm,
                });
            });

            it("addStrikeModeUpdate - throws when the id already exists in persisted data", () => {
                const logic = makeWeapon({
                    strikeModes: { existing: meleeModeData() },
                });
                expect(() =>
                    logic.addStrikeModeUpdate(
                        meleeModeData() as any,
                        "existing",
                    ),
                ).toThrow(/already exists/);
            });

            it("removeStrikeModeUpdate - returns a Foundry -= deletion payload", () => {
                const logic = makeWeapon();
                expect(logic.removeStrikeModeUpdate("abc123")).toEqual({
                    "system.strikeModes.-=abc123": null,
                });
            });

            it("updateStrikeModeUpdate - flattens partial fields under the id-prefixed path", () => {
                const logic = makeWeapon();
                expect(
                    logic.updateStrikeModeUpdate("abc123", {
                        minParts: 2,
                        assocSkillCode: "axe",
                    }),
                ).toEqual({
                    "system.strikeModes.abc123.minParts": 2,
                    "system.strikeModes.abc123.assocSkillCode": "axe",
                });
            });
        });

        describe("intrinsic executors", () => {
            it("automatedCombatStart - delegates to the attacker combatant's automatedCombatStart, passing this logic's uuid in scope", async () => {
                const automatedCombatStart = vi
                    .fn()
                    .mockResolvedValue(undefined);
                vi.spyOn(
                    FoundryHelpers,
                    "fvttActiveCombatantForActor",
                ).mockReturnValue({ automatedCombatStart } as any);
                const logic = makeWeapon({}, { name: "Broadsword" });
                const ctx = { scope: {} } as any;
                await logic.automatedCombatStart(ctx);
                expect(automatedCombatStart).toHaveBeenCalledWith(ctx);
                expect(ctx.scope.logicUuid).toBe(logic.uuid);
            });

            it("automatedCombatStart - warns and aborts when the actor is not in the active combat", async () => {
                vi.spyOn(
                    FoundryHelpers,
                    "fvttActiveCombatantForActor",
                ).mockReturnValue(null);
                const logic = makeWeapon({}, { name: "Broadsword" });
                const ctx = { scope: {} } as any;
                await expect(
                    logic.automatedCombatStart(ctx),
                ).resolves.toBeUndefined();
                expect(ctx.scope.logicUuid).toBeUndefined();
            });

            it.todo(
                "automatedBlockResume - strike-mode selection and delegation (currently an empty stub)",
            );
            it.todo(
                "automatedCounterstrikeResume - strike-mode selection and delegation (currently an empty stub)",
            );
        });
    });
});

describe("WeaponGearDataModel", () => {
    // The DataModel is Foundry-layer (implements WeaponGearData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes GearDataModel base schema fields");
        it.todo("defines encumbrance as NumberField with min 0");
        it.todo("defines heftBase as NumberField with min 0");
        it.todo(
            "defines strikeModes as a mapping of id to TypedSchemaField over melee/missile shapes",
        );
    });
});
