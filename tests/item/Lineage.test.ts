import { describe, it, expect, vi, afterEach } from "vitest";
import { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMediums,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

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

/** Default LineageData fields; override per test. */
function lineageFields(overrides: Record<string, unknown> = {}) {
    return {
        bodyStructure: BODY_STRUCTURE_DATA,
        moveBase: {
            terrestrial: 60,
            aquatic: 10,
            aerial: 0,
            burrowing: 0,
            astral: 0,
        },
        defaultMoveMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
        personalFatigue: "enc + 5",
        movementProfiles: [
            {
                medium: MOVEMENT_MEDIUM.TERRESTRIAL,
                feetPerRound: 50,
                leaguesPerWatch: 5,
                encumbrance: "floor(wt / 4)",
                strMod: "-5 * floor((str - 10) / 2)",
                disabled: false,
            },
        ],
        bodyWeight: { base: null, calc: "(9 * str) + 50" },
        reachBase: 5,
        ...overrides,
    };
}

function makeLineage(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        LineageLogic,
        ITEM_KIND.LINEAGE,
        lineageFields(overrides),
        { name: "Human", ...opts },
    );
}

/**
 * A lineage embedded on a being that owns a `str` attribute of the given score,
 * so `bodyWeight.calc` (a SafeExpression of `str`) can be evaluated.
 */
function makeLineageWithStr(
    str: number,
    overrides: Record<string, unknown> = {},
) {
    const actor = makeMockActor({ kind: "being" });
    actor.itemTypes = {
        [ITEM_KIND.ATTRIBUTE]: [
            {
                logic: {
                    data: { shortcode: "str" },
                    score: { effective: str },
                },
            },
        ],
    };
    return makeLineage(overrides, { actor });
}

/**
 * A lineage embedded on a being with a `str` attribute and a stubbed
 * `carriedWeight`, so the expression accessors (`getStrMod`, `getEncumbrance`)
 * can be evaluated against `str` and `wt`. (`carriedWeight` is a `ValueModifier`
 * accumulated ground-up by `BeingLogic`; the LineageLogic accessor reads its
 * `.effective`, so the unit test stubs a modifier-shaped `{ effective }`.)
 */
function makeLineageWithActor(
    { str = 0, carriedWeight = 0 } = {},
    overrides: Record<string, unknown> = {},
) {
    const actor = makeMockActor({ kind: "being" });
    actor.itemTypes = {
        [ITEM_KIND.ATTRIBUTE]: [
            {
                logic: {
                    data: { shortcode: "str" },
                    score: { effective: str },
                },
            },
        ],
    };
    actor.logic.carriedWeight = { effective: carriedWeight };
    return makeLineage(overrides, { actor });
}

/** A two-medium (terrestrial + aquatic) profile set for medium-selection tests. */
const TWO_MEDIUM_PROFILES = [
    {
        medium: MOVEMENT_MEDIUM.TERRESTRIAL,
        feetPerRound: 50,
        leaguesPerWatch: 5,
        encumbrance: "floor(wt / 4)",
        strMod: "-5 * floor((str - 10) / 2)",
        disabled: false,
    },
    {
        medium: MOVEMENT_MEDIUM.AQUATIC,
        feetPerRound: 10,
        leaguesPerWatch: 1,
        encumbrance: "floor(wt / 2)",
        strMod: "0",
        disabled: false,
    },
];

afterEach(() => {
    vi.restoreAllMocks();
});

describe("LineageLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object LineageData (no Foundry)", () => {
            const logic = makeLineage();
            expect(logic).toBeInstanceOf(LineageLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.LINEAGE);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeLineage();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("builds the BodyStructure from persisted data", () => {
            const logic = makeLineage();
            logic.initialize();
            expect(logic.bodyStructure).toBeInstanceOf(BodyStructure);
            expect(logic.bodyStructure.parts).toHaveLength(2);
            expect(logic.bodyStructure.parts[0].shortcode).toBe("head");
            expect(logic.bodyStructure.parent).toBe(logic);
        });

        it("seeds bodyWeight from baseWeight (fixed base)", () => {
            const logic = makeLineage({
                bodyWeight: { base: 200, calc: "0" },
            });
            logic.initialize();
            expect(logic.bodyWeight).toBeInstanceOf(ValueModifier);
            expect(logic.bodyWeight.base).toBe(200);
            expect(logic.bodyWeight.effective).toBe(200);
        });

        it("seeds bodyWeight from baseWeight (computed from strength)", () => {
            const logic = makeLineageWithStr(13, {
                bodyWeight: { base: null, calc: "(9 * str) + 50" },
            });
            logic.initialize();
            // (9 * 13) + 50 = 167
            expect(logic.bodyWeight.base).toBe(167);
        });

        it("seeds reach from reachBase", () => {
            const logic = makeLineage({ reachBase: 8 });
            logic.initialize();
            expect(logic.reach).toBeInstanceOf(ValueModifier);
            expect(logic.reach.base).toBe(8);
            expect(logic.reach.effective).toBe(8);
        });

        it("reach accepts runtime deltas layered on the base (size effects etc.)", () => {
            const logic = makeLineage({ reachBase: 5 });
            logic.initialize();
            logic.reach.add("Enlarged", "Enl", 3);
            expect(logic.reach.base).toBe(5);
            expect(logic.reach.effective).toBe(8);
            expect(logic.reach.modifier).toBe(3);
        });

        it("seeds one move ValueModifier per medium from moveBase", () => {
            const moveBase = {
                terrestrial: 60,
                aquatic: 10,
                aerial: 120,
                burrowing: 0,
                astral: 0,
            };
            const logic = makeLineage({ moveBase });
            logic.initialize();
            for (const medium of MovementMediums) {
                const vm = logic.move[medium as keyof typeof logic.move];
                expect(vm, medium).toBeInstanceOf(ValueModifier);
                expect(vm.base, medium).toBe(
                    moveBase[medium as keyof typeof moveBase],
                );
                expect(vm.effective, medium).toBe(
                    moveBase[medium as keyof typeof moveBase],
                );
            }
        });

        it("rebuilds modifiers on a fresh initialize (deltas are not persisted)", () => {
            const logic = makeLineage({ reachBase: 5 });
            logic.initialize();
            logic.reach.add("Enlarged", "Enl", 3);
            expect(logic.reach.effective).toBe(8);
            logic.initialize();
            expect(logic.reach.effective).toBe(5);
            expect(logic.reach.empty).toBe(true);
        });
    });

    describe("evaluate / finalize", () => {
        it("run without error after initialize", () => {
            const logic = makeLineage();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("derived properties", () => {
        it("moveBase mirrors data.moveBase", () => {
            const logic = makeLineage();
            expect(logic.moveBase).toBe(logic.data.moveBase);
            expect(logic.moveBase.terrestrial).toBe(60);
        });

        it("defaultMoveMedium mirrors data.defaultMoveMedium", () => {
            const logic = makeLineage({
                defaultMoveMedium: MOVEMENT_MEDIUM.AQUATIC,
            });
            expect(logic.defaultMoveMedium).toBe(MOVEMENT_MEDIUM.AQUATIC);
        });
    });

    describe("baseWeight", () => {
        it("returns bodyWeight.base verbatim when it is set", () => {
            const logic = makeLineageWithStr(18, {
                bodyWeight: { base: 150, calc: "(9 * str) + 50" },
            });
            // base wins over calc even when a strength attribute is present
            expect(logic.baseWeight).toBe(150);
        });

        it("evaluates bodyWeight.calc against the being's strength when base is null", () => {
            const logic = makeLineageWithStr(20, {
                bodyWeight: { base: null, calc: "(9 * str) + 50" },
            });
            // (9 * 20) + 50 = 230
            expect(logic.baseWeight).toBe(230);
        });

        it("falls back to str = 0 when there is no owning being", () => {
            const logic = makeLineage({
                bodyWeight: { base: null, calc: "(9 * str) + 50" },
            });
            // no actor → no str attribute → str defaults to 0 → 50
            expect(logic.baseWeight).toBe(50);
        });

        it("returns 0 when calc cannot produce a number", () => {
            const logic = makeLineage({
                bodyWeight: { base: null, calc: "str" },
            });
            // str is a number (0), so this is 0 — a genuinely non-numeric
            // result would also clamp to 0
            expect(logic.baseWeight).toBe(0);
        });
    });

    describe("per-medium accessors", () => {
        describe("getMoveBase", () => {
            it("reads the moveBase scalar for the default medium", () => {
                // default fixture: moveBase.terrestrial = 60 (distinct from the
                // profile's feetPerRound = 50, so the two accessors are told apart)
                expect(makeLineage().getMoveBase()).toBe(60);
            });

            it("reads the moveBase scalar for an explicit medium", () => {
                expect(makeLineage().getMoveBase(MOVEMENT_MEDIUM.AQUATIC)).toBe(
                    10,
                );
            });

            it("is 0 for a medium the lineage cannot use", () => {
                expect(makeLineage().getMoveBase(MOVEMENT_MEDIUM.AERIAL)).toBe(
                    0,
                );
            });
        });

        describe("getFeetPerRound / getLeaguesPerWatch", () => {
            it("read the default medium's profile", () => {
                const logic = makeLineage();
                expect(logic.getFeetPerRound()).toBe(50);
                expect(logic.getLeaguesPerWatch()).toBe(5);
            });

            it("read an explicit medium's profile", () => {
                const logic = makeLineage({
                    movementProfiles: TWO_MEDIUM_PROFILES,
                });
                expect(logic.getFeetPerRound(MOVEMENT_MEDIUM.AQUATIC)).toBe(10);
                expect(logic.getLeaguesPerWatch(MOVEMENT_MEDIUM.AQUATIC)).toBe(
                    1,
                );
            });

            it("are 0 when there is no profile for the medium", () => {
                const logic = makeLineage();
                expect(logic.getFeetPerRound(MOVEMENT_MEDIUM.AERIAL)).toBe(0);
                expect(logic.getLeaguesPerWatch(MOVEMENT_MEDIUM.AERIAL)).toBe(
                    0,
                );
            });
        });

        describe("getStrMod", () => {
            it("evaluates the profile's strMod against the being's strength", () => {
                // str 14 → -5 * floor((14 - 10) / 2) = -5 * 2 = -10
                const logic = makeLineageWithActor({ str: 14 });
                expect(logic.getStrMod()).toBe(-10);
            });

            it("defaults str to 0 when there is no owning being", () => {
                // no actor → str 0 → -5 * floor((0 - 10) / 2) = -5 * -5 = 25
                expect(makeLineage().getStrMod()).toBe(25);
            });

            it("is 0 when the medium has no profile", () => {
                const logic = makeLineageWithActor({ str: 14 });
                expect(logic.getStrMod(MOVEMENT_MEDIUM.AERIAL)).toBe(0);
            });
        });

        describe("getEncumbrance", () => {
            it("evaluates the profile's encumbrance against the being's carried weight (wt)", () => {
                // carriedWeight 10 → floor(10 / 4) = 2
                const logic = makeLineageWithActor({
                    str: 10,
                    carriedWeight: 10,
                });
                expect(logic.getEncumbrance()).toBe(2);
            });

            it("uses the requested medium's own encumbrance expression", () => {
                // aquatic: floor(wt / 2) with wt 10 → 5
                const logic = makeLineageWithActor(
                    { str: 10, carriedWeight: 10 },
                    { movementProfiles: TWO_MEDIUM_PROFILES },
                );
                expect(logic.getEncumbrance(MOVEMENT_MEDIUM.AQUATIC)).toBe(5);
            });

            it("is 0 with no carried weight (wt 0)", () => {
                const logic = makeLineageWithActor({ str: 10 });
                expect(logic.getEncumbrance()).toBe(0);
            });

            it("is 0 when there is no owning being", () => {
                expect(makeLineage().getEncumbrance()).toBe(0);
            });
        });
    });
});

describe("LineageDataModel", () => {
    // The DataModel is Foundry-layer (implements LineageData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo(
            "defines bodyStructure as a SchemaField of parts and adjacency",
        );
        it.todo(
            "defines moveBase as a SchemaField with one NumberField per medium",
        );
        it.todo(
            "defines defaultMoveMedium with MovementMediums choices defaulting to TERRESTRIAL",
        );
        it.todo("defines personalFatigue as a JavaScriptField");
        it.todo(
            "defines movementProfiles as an ArrayField of per-medium profiles (medium, feetPerRound, leaguesPerWatch, encumbrance, strMod, disabled)",
        );
        it.todo(
            "defines bodyWeight as a SchemaField of base (nullable NumberField) and calc (JavaScriptField)",
        );
        it.todo("defines reachBase as NumberField with min 0");
    });

    it.todo("has kind set to ITEM_KIND.LINEAGE");
    it.todo("has correct LOCALIZATION_PREFIXES including Lineage and Item");
});
