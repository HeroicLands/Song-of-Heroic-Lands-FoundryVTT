import { describe, it, expect, vi, afterEach } from "vitest";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/* ------------------------------------------------------------------ */
/* Class-level WeaponGearLogic tests                                  */
/* ------------------------------------------------------------------ */

/** Default WeaponGearData fields; override per test. */
function weaponFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 4,
        valueBase: 120,
        isCarried: true,
        qualityBase: 10,
        durabilityBase: 14,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        encumbranceBase: 2,
        heftBase: 5,
        strikeModes: [] as Record<string, unknown>[],
        ...overrides,
    };
}

/** A persisted melee strike-mode payload (carries its own shortcode). */
function meleeModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "melee",
        shortcode: "cut",
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

/** A persisted missile strike-mode payload (carries its own shortcode). */
function missileModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "missile",
        shortcode: "throw",
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

    describe("behavior (all intrinsic actions wired)", () => {
        describe("construction", () => {
            it("constructs against a plain-object WeaponGearData (no Foundry)", () => {
                const logic = makeWeapon();
                expect(logic).toBeInstanceOf(WeaponGearLogic);
                expect(logic.data.kind).toBe(ITEM_KIND.WEAPONGEAR);
            });

            it("defines the inherited gear intrinsic actions", () => {
                // Assisted combat (attack/block/counterstrike) is per-strike-mode
                // on the Combat tab, not weapon-level actions (#69), so weapon
                // gear only carries the inherited gear/lifecycle actions.
                const logic = makeWeapon();
                for (const shortcode of [
                    "toggleCarried",
                    "editDocument",
                    "deleteDocument",
                ]) {
                    expect(logic.actions.has(shortcode), shortcode).toBe(true);
                }
            });

            it("does not define weapon-level attack/block/counterstrike actions", () => {
                const logic = makeWeapon();
                for (const shortcode of ["attack", "block", "counterstrike"]) {
                    expect(logic.actions.has(shortcode), shortcode).toBe(false);
                }
            });
        });

        describe("initialize", () => {
            it("seeds encumbrance from the encumbrance field", () => {
                const logic = makeWeapon({ encumbranceBase: 3 });
                logic.initialize();
                expect(logic.encumbrance).toBeInstanceOf(ValueModifier);
                expect(logic.encumbrance.effective).toBe(3);
            });

            it("builds strike-mode domain objects from the persisted array, preserving shortcodes", () => {
                const logic = makeWeapon({
                    strikeModes: [
                        meleeModeData({ shortcode: "cut" }),
                        missileModeData({ shortcode: "thr" }),
                    ],
                });
                logic.initialize();
                expect(logic.strikeModes).toHaveLength(2);
                const [cut, thr] = logic.strikeModes;
                expect(cut).toBeInstanceOf(MeleeStrikeMode);
                expect(cut.shortcode).toBe("cut");
                expect(cut.name).toBe("Cut");
                expect(thr).toBeInstanceOf(MissileStrikeMode);
                expect(thr.shortcode).toBe("thr");
                expect(thr.name).toBe("Throw");
            });

            it("dispatches on the type discriminator (melee vs missile)", () => {
                const logic = makeWeapon({
                    strikeModes: [
                        meleeModeData({ shortcode: "m1" }),
                        missileModeData({ shortcode: "m2" }),
                    ],
                });
                logic.initialize();
                expect(logic.strikeModes[0].isMelee).toBe(true);
                expect(logic.strikeModes[1].isMissile).toBe(true);
            });

            it("produces an empty strikeModes array when none are persisted", () => {
                const logic = makeWeapon({ strikeModes: [] });
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

        describe("prone wielder (#562)", () => {
            afterEach(() => vi.restoreAllMocks());

            it("subtracts 20 from a melee mode's attack and defenses when prone", () => {
                const actor = makeMockActor();
                vi.spyOn(FoundryHelpers, "fvttActorStatuses").mockReturnValue(
                    new Set(["prone"]),
                );
                const weapon = makeWeapon(
                    { strikeModes: [meleeModeData({ shortcode: "m1" })] },
                    { actor },
                );
                weapon.initialize();
                weapon.evaluate();
                const sm = weapon.strikeModes[0] as any;
                expect(sm.attack.effective).toBe(5 - 20); // AtkMod 5 − 20
                expect(sm.defense.block.effective).toBe(0 - 20);
                expect(sm.defense.counterstrike.effective).toBe(0 - 20);
            });

            it("leaves the melee mode unchanged when the wielder is not prone", () => {
                const actor = makeMockActor();
                vi.spyOn(FoundryHelpers, "fvttActorStatuses").mockReturnValue(
                    new Set(),
                );
                const weapon = makeWeapon(
                    { strikeModes: [meleeModeData({ shortcode: "m1" })] },
                    { actor },
                );
                weapon.initialize();
                weapon.evaluate();
                const sm = weapon.strikeModes[0] as any;
                expect(sm.attack.effective).toBe(5);
                expect(sm.defense.block.effective).toBe(0);
            });
        });

        describe("evaluate", () => {
            it("adds the wielder's body reach to each melee mode's reach", () => {
                const actor = makeMockActor();
                (actor.logic as any).body = { reach: { effective: 3 } };
                const logic = makeWeapon(
                    {
                        strikeModes: [
                            meleeModeData({ shortcode: "m1", lengthBase: 4 }),
                        ],
                    },
                    { actor },
                );
                logic.initialize();
                logic.evaluate();
                const sm = logic.strikeModes[0] as MeleeStrikeMode;
                expect(sm.reach.base).toBe(4); // weapon length
                expect(sm.reach.effective).toBe(7); // + body reach
            });

            it("leaves reach at weapon length when there is no actor/body", () => {
                const logic = makeWeapon({
                    strikeModes: [
                        meleeModeData({ shortcode: "m1", lengthBase: 4 }),
                    ],
                });
                logic.initialize();
                logic.evaluate();
                const sm = logic.strikeModes[0] as MeleeStrikeMode;
                expect(sm.reach.effective).toBe(4);
            });

            it("does not touch missile modes (no reach)", () => {
                const actor = makeMockActor();
                (actor.logic as any).body = { reach: { effective: 3 } };
                const logic = makeWeapon(
                    { strikeModes: [missileModeData({ shortcode: "m1" })] },
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
                    strikeModes: [meleeModeData({ shortcode: "m1" })],
                });
                logic.initialize();
                logic.evaluate();
                expect(() => logic.finalize()).not.toThrow();
            });
        });

        describe("strike mode update helpers (real methods)", () => {
            it("addStrikeModeUpdate - appends to the array, writing the whole array back", () => {
                const existing = meleeModeData({ shortcode: "cut" });
                const logic = makeWeapon({ strikeModes: [existing] });
                const added = missileModeData({ shortcode: "throw" });
                expect(logic.addStrikeModeUpdate(added as any)).toEqual({
                    "system.strikeModes": [existing, added],
                });
            });

            it("addStrikeModeUpdate - appends to an empty weapon", () => {
                const logic = makeWeapon({ strikeModes: [] });
                const added = meleeModeData({ shortcode: "cut" });
                expect(logic.addStrikeModeUpdate(added as any)).toEqual({
                    "system.strikeModes": [added],
                });
            });

            it("addStrikeModeUpdate - throws when the shortcode already exists", () => {
                const logic = makeWeapon({
                    strikeModes: [meleeModeData({ shortcode: "cut" })],
                });
                expect(() =>
                    logic.addStrikeModeUpdate(
                        meleeModeData({ shortcode: "cut" }) as any,
                    ),
                ).toThrow(/already exists/);
            });

            it("removeStrikeModeUpdate - writes back the array without the named mode", () => {
                const keep = missileModeData({ shortcode: "throw" });
                const logic = makeWeapon({
                    strikeModes: [meleeModeData({ shortcode: "cut" }), keep],
                });
                expect(logic.removeStrikeModeUpdate("cut")).toEqual({
                    "system.strikeModes": [keep],
                });
            });

            it("replaceStrikeModeUpdate - swaps the matching element, preserving order", () => {
                const first = meleeModeData({ shortcode: "cut" });
                const second = missileModeData({ shortcode: "throw" });
                const logic = makeWeapon({ strikeModes: [first, second] });
                const replacement = meleeModeData({
                    shortcode: "slash",
                    name: "Slash",
                });
                expect(
                    logic.replaceStrikeModeUpdate("cut", replacement as any),
                ).toEqual({
                    "system.strikeModes": [replacement, second],
                });
            });
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
            "defines strikeModes as an ArrayField of a TypedSchemaField over melee/missile shapes",
        );
    });
});
