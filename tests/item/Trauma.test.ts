import { describe, it, expect, vi, afterEach } from "vitest";
import {
    TraumaLogic,
    SHOCK,
    isShock,
    UNTREATED,
} from "@src/document/item/logic/TraumaLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND, TRAUMA_SUBTYPE } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

describe("time-based healing / blood-loss scheduling (#482)", () => {
    afterEach(() => vi.restoreAllMocks());

    function withEvents() {
        const scheduleAt = vi.fn();
        const unsubscribe = vi.fn();
        (globalThis as any).sohl.events = { scheduleAt, unsubscribe };
        return { scheduleAt, unsubscribe };
    }

    // The mock item document has no uuid; set one for scheduleAt/unsubscribe.
    function trauma(overrides: Record<string, unknown> = {}) {
        const logic = makeTrauma(overrides);
        (logic.item as any).uuid = "Item.trauma0000";
        return logic;
    }

    it("healingCheck rolls the interval, advances the anchor, and schedules the next occurrence", async () => {
        const { scheduleAt } = withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        const logic = trauma({ healingCheckDurationFormula: "500" });
        logic.initialize();
        await logic.healingCheck({} as any);
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
            1500,
        );
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.lastHealingCheckDate": 1000,
                "system.healingCheckDurationBase": 500,
            }),
        );
    });

    it("finalize schedules healingCheck from the persisted anchor while the wound persists", () => {
        const { scheduleAt } = withEvents();
        const logic = trauma({
            levelBase: 3,
            lastHealingCheckDate: 2000,
            healingCheckDurationBase: 500,
        });
        logic.initialize();
        logic.finalize();
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
            2500,
        );
    });

    it("finalize unsubscribes healingCheck once the wound has healed", () => {
        const { unsubscribe } = withEvents();
        const logic = trauma({ levelBase: 0 });
        logic.initialize();
        logic.finalize();
        expect(unsubscribe).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
        );
    });

    it("bloodLossAdvanceCheck schedules the blood-loss roll event", async () => {
        const { scheduleAt } = withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const logic = trauma({
            bloodLossAdvanceDurationFormula: "300",
        });
        logic.initialize();
        await logic.bloodLossAdvanceCheck({} as any);
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "trauma::bloodLossAdvanceRoll",
            2300,
        );
    });

    it("healingCheck catches up the anchor over every elapsed interval (#481)", async () => {
        const { scheduleAt } = withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(3200);
        const logic = trauma({
            levelBase: 3,
            lastHealingCheckDate: 1000,
            healingCheckDurationBase: 500,
            healingCheckDurationFormula: "500",
        });
        logic.initialize();
        await logic.healingCheck({} as any);
        // Elapsed checkpoints in (1000, 3200] at 500s: 1500,2000,2500,3000.
        // The anchor advances to the last (3000); the next is derived from it.
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.lastHealingCheckDate": 3000 }),
        );
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
            3500,
        );
    });
});

describe("isBleeding — derived from the blood-loss timer (#482)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("is false when bloodLossAdvanceDurationBase is null", () => {
        const logic = makeTrauma({ bloodLossAdvanceDurationBase: null });
        expect(logic.isBleeding).toBe(false);
    });

    it("is true when a blood-loss interval is set", () => {
        const logic = makeTrauma({ bloodLossAdvanceDurationBase: 86400 });
        expect(logic.isBleeding).toBe(true);
    });
});

/** Default TraumaData fields; override per test. */
function traumaFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "physical",
        category: "",
        levelBase: 2,
        healingRateBase: 4,
        aspect: "blunt",
        treatmentDate: null,
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
 * Build a mock actor whose body exposes the given body locations through
 * `actor.logic.body.structure.getAllLocations()` — the lookup path used by
 * TraumaLogic.resolveBodyLocation() (via `getActorBody`).
 */
function makeActorWithBody(locations: { shortcode: string }[]): any {
    const actor = makeMockActor();
    actor.logic.body = {
        structure: {
            getAllLocations: () => locations,
        },
    };
    return actor;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("TraumaLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object TraumaData (no Foundry)", () => {
            const logic = makeTrauma();
            expect(logic).toBeInstanceOf(TraumaLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.TRAUMA);
        });

        it("builds the intrinsic action map (edit/delete + the test actions)", () => {
            const logic = makeTrauma();
            expect(logic.actions.has("editDocument")).toBe(true);
            expect(logic.actions.has("treatmenttest")).toBe(true);
            expect(logic.actions.has("healingtest")).toBe(true);
        });

        it("treatmentTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeTrauma();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.treatmentTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("healingTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeTrauma();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.healingTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });
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
        it("resolves bodyLocation from the actor's Corpus by shortcode", () => {
            const head = { shortcode: "head" };
            const torso = { shortcode: "torso" };
            const actor = makeActorWithBody([head, torso]);
            const logic = makeTrauma({ bodyLocationCode: "torso" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBe(torso);
        });

        it("leaves bodyLocation undefined when bodyLocationCode is blank", () => {
            const actor = makeActorWithBody([{ shortcode: "head" }]);
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

        it("leaves bodyLocation undefined when the being is incorporeal (no body)", () => {
            const actor = makeMockActor();
            const logic = makeTrauma({ bodyLocationCode: "head" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when no location matches the code", () => {
            const actor = makeActorWithBody([{ shortcode: "head" }]);
            const logic = makeTrauma({ bodyLocationCode: "tail" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.bodyLocation).toBeUndefined();
        });

        it("leaves bodyLocation undefined when the body has no structure", () => {
            const actor = makeMockActor();
            actor.logic.body = {};
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
                newInj: null,
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
        it.todo("defines treatmentDate as a nullable NumberField");
        it.todo("defines bodyLocationCode as a StringField");
    });

    it.todo("has kind set to ITEM_KIND.TRAUMA");
});

// Relocated from Affliction.test.ts: the named-severity (fear/morale) and
// categorized (fatigue) condition subtypes are now traumas. sohl.i18n.localize
// is identity in tests, so localized labels surface as their localization keys.
describe("TraumaLogic.levelLabel", () => {
    it("maps FEAR levels to named severity labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FEAR,
            levelBase: 3,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("SOHL.Affliction.FEAR_LEVEL.AFRAID");
    });

    it("maps MORALE levels to named severity labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.MORALE,
            levelBase: 4,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("SOHL.Affliction.MORALE_LEVEL.ROUTED");
    });

    it("clamps negative effective levels to 0", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FEAR,
            levelBase: -2,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("SOHL.Affliction.FEAR_LEVEL.NONE");
    });

    it("returns the numeric level as a string for other subtypes", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: 3,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("3");
    });

    it("falls back to the numeric string for out-of-range FEAR levels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FEAR,
            levelBase: 7,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("7");
    });

    it("does not throw before initialize() — level not yet seeded (#511)", () => {
        // A freshly-dropped trauma can be read by the sheet before its
        // logic.initialize() has run, so `level` (a ValueModifier assigned in
        // initialize) is still undefined. The getter must degrade to "0".
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: 3,
        });
        // deliberately NOT calling logic.initialize()
        expect(() => logic.levelLabel).not.toThrow();
        expect(logic.levelLabel).toBe("0");
    });
});

describe("TraumaLogic.categoryLabel", () => {
    it("returns empty string when category is unset", () => {
        const logic = makeTrauma({ category: "" });
        expect(logic.categoryLabel).toBe("");
    });

    it("maps FATIGUE categories to their localized labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FATIGUE,
            category: "weariness",
        });
        expect(logic.categoryLabel).toBe(
            "SOHL.Affliction.FATIGUE_CATEGORY.weariness",
        );
    });

    it("returns the raw category for other subtypes", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            category: "plague",
        });
        expect(logic.categoryLabel).toBe("plague");
    });

    it("returns the raw category for an unknown FATIGUE category", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FATIGUE,
            category: "not-a-category",
        });
        expect(logic.categoryLabel).toBe("not-a-category");
    });
});
