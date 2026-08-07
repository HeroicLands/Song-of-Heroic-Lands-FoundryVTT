import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import {
    AFFLICTION_EFFECT_KEY,
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    CRITICAL_FAILURE,
    ITEM_KIND,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Default AfflictionData fields; override per test. */
function afflictionFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: AFFLICTION_SUBTYPE.DISEASE,
        category: null,
        isDormant: false,
        contractDate: null,
        // Treated by default: an untreated affliction's healing target is
        // disabled, not computed.
        treatmentDate: 500,
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
            "healingTest",
            "healingCheck",
            "onsetCheck",
            "setOnset",
            "resolutionCheck",
            "setResolution",
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
            "fatiguetest",
            "moraletest",
            "feartest",
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

    it("pairs every *Check with the action it offers (#1183)", () => {
        const codes = shortcodes();
        for (const [check, action] of [
            ["onsetCheck", "setOnset"],
            ["courseCheck", "courseTest"],
            ["healingCheck", "healingTest"],
            ["resolutionCheck", "setResolution"],
        ]) {
            expect(codes, `${check} → ${action}`).toContain(check);
            expect(codes, `${check} → ${action}`).toContain(action);
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

describe("an untreated affliction resolves its healing test as a CF (#1181)", () => {
    it("disables the healing target rather than seeding a real 0", () => {
        // Untreated is a state, not a target of zero — the same rule a wound
        // follows (#1146/#1148).
        const logic = makeAffliction({ treatmentDate: null }, 12);
        expect(logic.healing.disabled).toBeTruthy();
    });

    it("leaves the healing target enabled once treatment is recorded", () => {
        const logic = makeAffliction({ healingRateBase: 3 }, 10);
        expect(logic.healing.disabled).toBeFalsy();
        expect(logic.healing.effective).toBe(30);
    });

    it("forces the healing test's die to the CF face when healing is disabled", async () => {
        const logic = makeAffliction({ treatmentDate: null, levelBase: 3 });
        const spy = vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: CRITICAL_FAILURE } as any);
        await logic.healingTest({ skipDialog: true, scope: {} } as any);
        const ctx = spy.mock.calls[0][0] as any;
        // A pre-seeded d100 showing the `00` face: it fails every target and its
        // last digit criticals, so the test is a Critical Failure whatever the
        // Healing Base — and no die is actually cast.
        expect(ctx.scope.roll).toBeDefined();
        expect(ctx.scope.roll.rolls).toEqual([100]);
    });

    it("casts a real die when healing is enabled", async () => {
        const logic = makeAffliction({ healingRateBase: 4, levelBase: 3 });
        const spy = vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: MARGINAL_SUCCESS } as any);
        await logic.healingTest({ skipDialog: true, scope: {} } as any);
        const ctx = spy.mock.calls[0][0] as any;
        expect(ctx.scope?.roll).toBeUndefined();
    });

    it("stays visible even when healing is disabled — the rule is CF, not hidden", () => {
        const action = AfflictionLogic.defineIntrinsicActions().find(
            (a) => a.shortcode === "healingTest",
        );
        expect(action?.visible).toBe("true");
    });
});
