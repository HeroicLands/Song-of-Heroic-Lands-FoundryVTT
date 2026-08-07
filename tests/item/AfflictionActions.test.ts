import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    AFFLICTION_EFFECT_KEY,
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    ITEM_KIND,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Default AfflictionData fields; override per test. */
function afflictionFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: AFFLICTION_SUBTYPE.DISEASE,
        category: null,
        isDormant: false,
        contractDate: null,
        treatmentDate: null,
        levelBase: 2,
        healingRateBase: 4,
        contagionIndexBase: 3,
        transmission: AFFLICTION_TRANSMISSION.CONTACT,
        onsetMacroUuid: null,
        onsetFormula: "2d6",
        outcome: "cured",
        outcomeTrauma: null,
        ...overrides,
    };
}

/**
 * Build an affliction on an actor whose Healing Base is `healingBase`, run the
 * full lifecycle, and hand back the logic.
 */
function makeAffliction(
    overrides: Record<string, unknown> = {},
    healingBase = 12,
) {
    const actor = makeMockActor();
    // `actorLogic` resolves to the mock document's `.logic`, so the Healing Base
    // the affliction reads must be stubbed there, not on the document.
    (actor.logic as any).healingBase = { effective: healingBase };
    const logic = makeItemLogic(
        AfflictionLogic,
        ITEM_KIND.AFFLICTION,
        afflictionFields(overrides),
        { actor },
    );
    (logic.item as any).uuid = "Item.affliction00";
    logic.initialize();
    logic.evaluate();
    logic.finalize();
    return logic;
}

beforeEach(() => {
    (globalThis as any).sohl.events = {
        scheduleAt: vi.fn(),
        unsubscribe: vi.fn(),
    };
});
afterEach(() => vi.restoreAllMocks());

describe("AfflictionLogic course/healing targets (#1183)", () => {
    it("course is a ValueModifier based on Healing Rate × Healing Base", () => {
        const logic = makeAffliction({ healingRateBase: 4 }, 12);
        expect(logic.course).toBeInstanceOf(ValueModifier);
        expect(logic.course.base).toBe(48);
        expect(logic.course.effective).toBe(48);
    });

    it("healing is a ValueModifier based on Healing Rate × Healing Base", () => {
        const logic = makeAffliction({ healingRateBase: 3 }, 10);
        expect(logic.healing).toBeInstanceOf(ValueModifier);
        expect(logic.healing.base).toBe(30);
    });

    it("both targets are 0 when the affliction has no Healing Rate", () => {
        const logic = makeAffliction({ healingRateBase: null }, 12);
        expect(logic.course.effective).toBe(0);
        expect(logic.healing.effective).toBe(0);
    });

    it("both targets are 0 when the affliction is on no actor", () => {
        const logic = makeItemLogic(
            AfflictionLogic,
            ITEM_KIND.AFFLICTION,
            afflictionFields(),
        );
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        expect(logic.course.effective).toBe(0);
        expect(logic.healing.effective).toBe(0);
    });

    it("exposes COURSE and HEALING effect keys pointing at those modifiers", () => {
        expect(AFFLICTION_EFFECT_KEY.COURSE).toBe("mod:logic.course");
        expect(AFFLICTION_EFFECT_KEY.HEALING).toBe("mod:logic.healing");
    });

    it("no longer exposes a diagnosis-bonus modifier or effect key", () => {
        const logic = makeAffliction();
        expect((logic as any).diagnosisBonus).toBeUndefined();
        expect(
            (AFFLICTION_EFFECT_KEY as Record<string, string>).DIAGNOSIS_BONUS,
        ).toBeUndefined();
    });
});

describe("AfflictionLogic intrinsic action set (#1183, supersedes #1126)", () => {
    /** Every intrinsic action shortcode the affliction defines. */
    function shortcodes() {
        return AfflictionLogic.defineIntrinsicActions().map(
            (a) => a.shortcode as string,
        );
    }

    it("offers the implemented actions", () => {
        const codes = shortcodes();
        for (const code of [
            "requestTreatment",
            "treatAffliction",
            "courseTest",
            "courseCheck",
            "onsetCheck",
            "resolutionCheck",
        ]) {
            expect(codes).toContain(code);
        }
    });

    it("no longer offers any unimplemented action", () => {
        const codes = shortcodes();
        for (const code of [
            "transmitaffliction",
            "contractafflictiontest",
            "coursetest",
            "treatmenttest",
            "diagnosistest",
            "healingtest",
            "fatiguetest",
            "moraletest",
            "feartest",
            "healingCheck",
        ]) {
            expect(codes).not.toContain(code);
        }
    });

    it("every declared executor resolves to a real method", () => {
        const logic = makeAffliction();
        for (const action of AfflictionLogic.defineIntrinsicActions()) {
            if (!action.executor) continue;
            expect(
                typeof (logic as any)[action.executor as string],
                `executor ${String(action.executor)}`,
            ).toBe("function");
        }
    });

    it("courseTest is always visible; courseCheck stays hidden", () => {
        const actions = AfflictionLogic.defineIntrinsicActions();
        const courseTest = actions.find((a) => a.shortcode === "courseTest");
        const courseCheck = actions.find((a) => a.shortcode === "courseCheck");
        expect(courseTest?.visible).toBe("true");
        expect(courseCheck?.group).toBe("hidden");
        expect(courseCheck?.recordsLastRun).toBe(true);
    });
});
