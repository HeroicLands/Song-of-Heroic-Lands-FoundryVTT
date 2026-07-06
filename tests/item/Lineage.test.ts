import { describe, it, expect, vi, afterEach } from "vitest";
import { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMediums,
} from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

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
        encumbranceRate: 1,
        bodyWeightBase: 150,
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
            expect(logic.bodyStructure._parent).toBe(logic);
        });

        it("seeds bodyWeight from bodyWeightBase", () => {
            const logic = makeLineage({ bodyWeightBase: 200 });
            logic.initialize();
            expect(logic.bodyWeight).toBeInstanceOf(ValueModifier);
            expect(logic.bodyWeight.base).toBe(200);
            expect(logic.bodyWeight.effective).toBe(200);
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
        it.todo("defines encumbranceRate as NumberField with min 0");
        it.todo("defines bodyWeightBase as NumberField with min 0");
        it.todo("defines reachBase as NumberField with min 0");
    });

    it.todo("has kind set to ITEM_KIND.LINEAGE");
    it.todo("has correct LOCALIZATION_PREFIXES including Lineage and Item");
});
