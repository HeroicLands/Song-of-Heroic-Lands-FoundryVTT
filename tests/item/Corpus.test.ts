import { describe, it, expect, vi, afterEach } from "vitest";
import { CorpusLogic } from "@src/document/item/logic/CorpusLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    type MovementMedium,
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

/** Default CorpusData fields; override per test. */
function corpusFields(overrides: Record<string, unknown> = {}) {
    return {
        structure: BODY_STRUCTURE_DATA,
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
        weight: { base: null, calc: "(9 * str) + 50" },
        reachBase: 5,
        ...overrides,
    };
}

function makeCorpus(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        CorpusLogic,
        ITEM_KIND.CORPUS,
        corpusFields(overrides),
        { name: "Human", ...opts },
    );
}

/**
 * A corpus embedded on a being that owns a `str` attribute of the given score,
 * so `weight.calc` (a SafeExpression of `str`) can be evaluated.
 */
function makeCorpusWithStr(
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
    return makeCorpus(overrides, { actor });
}

/**
 * A corpus embedded on a being with a `str` attribute, a chosen
 * `movementMedium`, and a stubbed `carriedWeight`, so the derived movement VMs
 * (`strengthModifier`, `encumbrance`) can be evaluated against `str` and `wt`.
 * (`carriedWeight` is a `ValueModifier` accumulated ground-up by `BeingLogic`;
 * `CorpusLogic` reads its `.effective`, so the unit test stubs a
 * modifier-shaped `{ effective }`. `movementMedium` is read off the being's data
 * to select the active movement profile.)
 */
function makeCorpusWithActor(
    {
        str = 0,
        carriedWeight = 0,
        movementMedium = MOVEMENT_MEDIUM.TERRESTRIAL,
    }: {
        str?: number;
        carriedWeight?: number;
        movementMedium?: MovementMedium;
    } = {},
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
    actor.system.movementMedium = movementMedium;
    return makeCorpus(overrides, { actor });
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

describe("CorpusLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object CorpusData (no Foundry)", () => {
            const logic = makeCorpus();
            expect(logic).toBeInstanceOf(CorpusLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.CORPUS);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeCorpus();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });

        it("registers itself on the owning being during initialize", () => {
            const actor = makeMockActor({ kind: "being" });
            const registered: unknown[] = [];
            actor.logic.registerCorpus = (l: unknown) => registered.push(l);
            const logic = makeCorpus({}, { actor });
            logic.initialize();
            expect(registered).toEqual([logic]);
        });
    });

    describe("initialize", () => {
        it("builds the BodyStructure from persisted data", () => {
            const logic = makeCorpus();
            logic.initialize();
            expect(logic.structure).toBeInstanceOf(BodyStructure);
            expect(logic.structure.parts).toHaveLength(2);
            expect(logic.structure.parts[0].shortcode).toBe("head");
            expect(logic.structure.parent).toBe(logic);
        });

        it("seeds weight from a fixed weight.base", () => {
            const logic = makeCorpus({
                weight: { base: 200, calc: "0" },
            });
            logic.initialize();
            expect(logic.weight).toBeInstanceOf(ValueModifier);
            expect(logic.weight.base).toBe(200);
            expect(logic.weight.effective).toBe(200);
        });

        it("computes weight from strength when weight.base is null", () => {
            const logic = makeCorpusWithStr(13, {
                weight: { base: null, calc: "(9 * str) + 50" },
            });
            logic.initialize();
            // (9 * 13) + 50 = 167
            expect(logic.weight.base).toBe(167);
        });

        it("seeds reach from reachBase", () => {
            const logic = makeCorpus({ reachBase: 8 });
            logic.initialize();
            expect(logic.reach).toBeInstanceOf(ValueModifier);
            expect(logic.reach.base).toBe(8);
            expect(logic.reach.effective).toBe(8);
        });

        it("reach accepts runtime deltas layered on the base (size effects etc.)", () => {
            const logic = makeCorpus({ reachBase: 5 });
            logic.initialize();
            logic.reach.add("Enlarged", "Enl", 3);
            expect(logic.reach.base).toBe(5);
            expect(logic.reach.effective).toBe(8);
            expect(logic.reach.modifier).toBe(3);
        });

        it("rebuilds modifiers on a fresh initialize (deltas are not persisted)", () => {
            const logic = makeCorpus({ reachBase: 5 });
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
            const logic = makeCorpus();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("movement profile", () => {
        it("resolves the active moveProfile from the being's movementMedium and seeds move VMs", () => {
            const logic = makeCorpusWithActor({
                movementMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
            });
            logic.initialize();
            expect(logic.moveProfile.medium).toBe(MOVEMENT_MEDIUM.TERRESTRIAL);
            expect(logic.moveProfile.disabled).toBe(false);
            expect(logic.feetPerRound.effective).toBe(50);
            expect(logic.leaguesPerWatch.effective).toBe(5);
        });

        it("picks the profile matching the chosen movementMedium", () => {
            const logic = makeCorpusWithActor(
                { movementMedium: MOVEMENT_MEDIUM.AQUATIC },
                { movementProfiles: TWO_MEDIUM_PROFILES },
            );
            logic.initialize();
            expect(logic.moveProfile.medium).toBe(MOVEMENT_MEDIUM.AQUATIC);
            expect(logic.feetPerRound.effective).toBe(10);
            expect(logic.leaguesPerWatch.effective).toBe(1);
        });

        it("falls back to a disabled profile when no medium matches", () => {
            const logic = makeCorpusWithActor({
                movementMedium: MOVEMENT_MEDIUM.AERIAL,
            });
            logic.initialize();
            expect(logic.moveProfile.disabled).toBe(true);
            expect(logic.feetPerRound.effective).toBe(0);
            expect(logic.leaguesPerWatch.effective).toBe(0);
        });

        it("falls back to a disabled profile when there is no owning being", () => {
            const logic = makeCorpus();
            logic.initialize();
            expect(logic.moveProfile.disabled).toBe(true);
            expect(logic.feetPerRound.effective).toBe(0);
        });
    });

    describe("strengthModifier", () => {
        it("evaluates the active profile's strMod against the being's strength (after evaluate)", () => {
            // str 14, terrestrial strMod "-5 * floor((str - 10) / 2)" = -10
            const logic = makeCorpusWithActor({
                str: 14,
                movementMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
            });
            logic.initialize();
            logic.evaluate();
            expect(logic.strengthModifier.effective).toBe(-10);
        });

        it("is 0 for the disabled fallback profile (strMod '0')", () => {
            const logic = makeCorpusWithActor({
                str: 14,
                movementMedium: MOVEMENT_MEDIUM.AERIAL,
            });
            logic.initialize();
            logic.evaluate();
            expect(logic.strengthModifier.effective).toBe(0);
        });

        it("defaults str to 0 when the being has no strength attribute (no NaN)", () => {
            // Active terrestrial profile but no `str` attribute on the being:
            // str defaults to 0 → -5 * floor((0 - 10) / 2) = 25 (not NaN).
            const actor = makeMockActor({ kind: "being" });
            actor.itemTypes = {};
            actor.system.movementMedium = MOVEMENT_MEDIUM.TERRESTRIAL;
            const logic = makeCorpus({}, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.strengthModifier.effective).toBe(25);
        });
    });

    describe("encumbrance", () => {
        it("evaluates the active profile's encumbrance against carried weight (after finalize)", () => {
            // carriedWeight 10, terrestrial encumbrance "floor(wt / 4)" = 2
            const logic = makeCorpusWithActor({
                carriedWeight: 10,
                movementMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
            });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.encumbrance.effective).toBe(2);
        });

        it("uses the active medium's own encumbrance expression", () => {
            // aquatic: "floor(wt / 2)" with wt 10 → 5
            const logic = makeCorpusWithActor(
                {
                    carriedWeight: 10,
                    movementMedium: MOVEMENT_MEDIUM.AQUATIC,
                },
                { movementProfiles: TWO_MEDIUM_PROFILES },
            );
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.encumbrance.effective).toBe(5);
        });

        it("is 0 with no carried weight (wt 0)", () => {
            const logic = makeCorpusWithActor({
                carriedWeight: 0,
                movementMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
            });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.encumbrance.effective).toBe(0);
        });
    });
});

describe("CorpusDataModel", () => {
    // The DataModel is Foundry-layer (implements CorpusData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines structure as a SchemaField of parts and adjacency");
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
            "defines weight as a SchemaField of base (nullable NumberField) and calc (JavaScriptField)",
        );
        it.todo("defines reachBase as NumberField with min 0");
    });

    it.todo("has kind set to ITEM_KIND.CORPUS");
    it.todo("has correct LOCALIZATION_PREFIXES including Corpus and Item");
});
