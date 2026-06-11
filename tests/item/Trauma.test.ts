import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    TraumaLogic,
    SHOCK,
    isShock,
    UNTREATED,
} from "@src/document/item/logic/TraumaLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Default TraumaData fields; override per test. */
function traumaFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "physical",
        levelBase: 2,
        healingRateBase: 4,
        aspect: "blunt",
        isTreated: false,
        isBleeding: false,
        bodyLocationCode: "",
        ...overrides,
    };
}

function makeTrauma(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        TraumaLogic,
        ITEM_KIND.TRAUMA,
        traumaFields(overrides),
        opts,
    );
}

/**
 * Build a mock actor whose Lineage exposes the given body locations through
 * `itemTypes.lineage[0].logic.bodyStructure.getAllLocations()` — the lookup
 * path used by TraumaLogic.resolveBodyLocation().
 */
function makeActorWithLineage(locations: { shortcode: string }[]): any {
    const actor = makeMockActor();
    actor.itemTypes = {
        [ITEM_KIND.LINEAGE]: [
            {
                logic: {
                    bodyStructure: {
                        getAllLocations: () => locations,
                    },
                },
            },
        ],
    };
    return actor;
}

/*
 * TraumaLogic.defineIntrinsicActions() declares the INTRINSIC executors
 * "treatmentTest" and "healingTest", but neither exists as a method on the
 * class yet (unimplemented mechanics). SohlAction's constructor throws for
 * an INTRINSIC action whose executor is not a function on the target, so
 * the class cannot be constructed with its full intrinsic set. Tests
 * construct it with the missing executors filtered out.
 *
 * Captured BEFORE the spy below is installed.
 */
const realDefs = TraumaLogic.defineIntrinsicActions();
const MISSING = ["treatmentTest", "healingTest"];
const safeDefs = realDefs.filter(
    (d) => !MISSING.includes(d.executor as string),
);

beforeEach(() => {
    vi.spyOn(TraumaLogic, "defineIntrinsicActions").mockReturnValue(safeDefs);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("TraumaLogic", () => {
    describe("construction", () => {
        it("throws with the full intrinsic action set (unimplemented executors)", () => {
            // treatmentTest and healingTest are declared as INTRINSIC
            // executors but do not exist as methods on TraumaLogic, so
            // SohlAction's constructor rejects them. Remove this test once
            // those mechanics are implemented.
            vi.restoreAllMocks();
            expect(() => makeTrauma()).toThrow(/does not have a function/);
        });

        it("constructs against a plain-object TraumaData (no Foundry)", () => {
            const logic = makeTrauma();
            expect(logic).toBeInstanceOf(TraumaLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.TRAUMA);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeTrauma();
            expect(logic.actions.has("postfinalize")).toBe(true);
            expect(logic.actions.has("treatmenttest")).toBe(false);
            expect(logic.actions.has("healingtest")).toBe(false);
        });

        // Unimplemented intrinsic executors:
        it.todo("treatmentTest — unimplemented intrinsic executor");
        it.todo("healingTest — unimplemented intrinsic executor");
    });

    describe("initialize", () => {
        it("seeds level from data.levelBase", () => {
            const logic = makeTrauma({ levelBase: 3 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(3);
            expect(logic.level.effective).toBe(3);
        });

        it("seeds healingRate from data.healingRateBase", () => {
            const logic = makeTrauma({ healingRateBase: 5 });
            logic.initialize();
            expect(logic.healingRate).toBeInstanceOf(ValueModifier);
            expect(logic.healingRate.base).toBe(5);
            expect(logic.healingRate.effective).toBe(5);
        });

        it("resets bodyLocation to undefined", () => {
            const logic = makeTrauma();
            logic.initialize();
            expect(logic.bodyLocation).toBeUndefined();
        });
    });

    describe("evaluate", () => {
        it("resolves bodyLocation from the actor's Lineage by shortcode", () => {
            const head = { shortcode: "head" };
            const torso = { shortcode: "torso" };
            const actor = makeActorWithLineage([head, torso]);
            const logic = makeTrauma({ bodyLocationCode: "torso" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBe(torso);
        });

        it("leaves bodyLocation undefined when bodyLocationCode is blank", () => {
            const actor = makeActorWithLineage([{ shortcode: "head" }]);
            const logic = makeTrauma({ bodyLocationCode: "" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when the trauma has no actor", () => {
            const logic = makeTrauma({ bodyLocationCode: "head" });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when the actor has no Lineage", () => {
            const actor = makeMockActor();
            actor.itemTypes = { [ITEM_KIND.LINEAGE]: [] };
            const logic = makeTrauma({ bodyLocationCode: "head" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when no location matches the code", () => {
            const actor = makeActorWithLineage([{ shortcode: "head" }]);
            const logic = makeTrauma({ bodyLocationCode: "tail" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when the Lineage has no body structure", () => {
            const actor = makeMockActor();
            actor.itemTypes = { [ITEM_KIND.LINEAGE]: [{ logic: {} }] };
            const logic = makeTrauma({ bodyLocationCode: "head" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });
    });

    describe("finalize", () => {
        it("runs without error after initialize and evaluate", () => {
            const logic = makeTrauma();
            logic.initialize();
            logic.evaluate();
            expect(() => logic.finalize()).not.toThrow();
        });
    });

    describe("module exports", () => {
        it("SHOCK orders states by increasing severity", () => {
            expect(SHOCK.NONE).toBe(0);
            expect(SHOCK.STUNNED).toBe(1);
            expect(SHOCK.INCAPACITATED).toBe(2);
            expect(SHOCK.UNCONCIOUS).toBe(3);
            expect(SHOCK.KILLED).toBe(4);
        });

        it("isShock guards valid shock values", () => {
            expect(isShock(SHOCK.STUNNED)).toBe(true);
            expect(isShock(99)).toBe(false);
        });

        it("UNTREATED supplies the untreated-wound baseline", () => {
            expect(UNTREATED).toEqual({
                hr: 4,
                infect: true,
                bleed: false,
                impair: false,
                newInj: -1,
            });
        });
    });
});

describe("TraumaDataModel", () => {
    // The DataModel is Foundry-layer (implements TraumaData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with TraumaSubTypes choices");
        it.todo("defines levelBase as a NumberField");
        it.todo("defines healingRateBase as a NumberField");
        it.todo("defines aspect with ImpactAspects choices");
        it.todo("defines isTreated as a BooleanField");
        it.todo("defines isBleeding as a BooleanField");
        it.todo("defines bodyLocationCode as a StringField");
    });

    it.todo("has kind set to ITEM_KIND.TRAUMA");
});
