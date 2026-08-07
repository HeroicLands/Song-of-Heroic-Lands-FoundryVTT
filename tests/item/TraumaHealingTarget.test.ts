import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import {
    CRITICAL_FAILURE,
    ITEM_KIND,
    MARGINAL_SUCCESS,
    TRAUMA_EFFECT_KEY,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** A wound on an actor whose Healing Base is `healingBase`. */
function makeWound(
    overrides: Record<string, unknown> = {},
    healingBase: number | null = 12,
) {
    const opts: Record<string, unknown> = {};
    if (healingBase !== null) {
        const actor = makeMockActor();
        // `actorLogic` resolves to the mock document's `.logic`.
        (actor.logic as any).healingBase = { effective: healingBase };
        opts.actor = actor;
    }
    const logic = makeItemLogic(
        TraumaLogic,
        ITEM_KIND.TRAUMA,
        {
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: 3,
            healingRateBase: 4,
            // A recorded rate AND a treatment date — `isTreated` needs both, and
            // an untreated wound's target is disabled, not computed.
            treatmentDate: 500,
            ...overrides,
        },
        opts,
    );
    (logic.item as any).uuid = "Item.wound00000";
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

describe("TraumaLogic.healing — the Healing Test target (#1181)", () => {
    it("is a ValueModifier of Healing Rate × Healing Base", () => {
        const logic = makeWound({ healingRateBase: 4 }, 12);
        expect(logic.healing).toBeInstanceOf(ValueModifier);
        expect(logic.healing.base).toBe(48);
        expect(logic.healing.effective).toBe(48);
    });

    it("an Active Effect delta on it changes what the wound is tested against", () => {
        const logic = makeWound({ healingRateBase: 3 }, 10);
        expect(logic.healing.effective).toBe(30);
        // What an AE keyed `mod:logic.healing` ultimately does: add a delta.
        logic.healing.add("SOHL.MOD.test", "TST", 10);
        expect(logic.healing.effective).toBe(40);
    });

    it("is DISABLED — not zero — for an untreated wound", () => {
        // "Untreated" is a real state, distinct from a target of 0 (#1146/#1148),
        // and being disabled is what makes the test auto-Critically-Fail.
        expect(
            makeWound({ healingRateBase: null }, 12).healing.disabled,
        ).toBeTruthy();
        // A rate on record but no treatment date is still untreated.
        expect(
            makeWound({ treatmentDate: null }, 12).healing.disabled,
        ).toBeTruthy();
    });

    it("is 0 when the wound is on no actor (no Healing Base to read)", () => {
        const logic = makeWound({ healingRateBase: 4 }, null);
        expect(logic.healing.effective).toBe(0);
    });

    it("exposes a HEALING effect key pointing at the modifier", () => {
        expect(TRAUMA_EFFECT_KEY.HEALING).toBe("mod:logic.healing");
    });
});

describe("a disabled healing target auto-Critically-Fails, whatever disabled it (#1181)", () => {
    it("forces the 00 face when healing is disabled for ANY reason", async () => {
        // Keyed on `disabled`, not on `isTreated` — so any future disabler (a
        // rule, a condition, an effect channel) inherits the auto-CF for free.
        const logic = makeWound({ levelBase: 3 }, 12);
        expect(logic.healing.disabled).toBeFalsy();
        logic.healing.disabled = "SOHL.Trauma.Untreated";

        const spy = vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: CRITICAL_FAILURE } as any);
        await logic.healingTest({ scope: {} } as any);

        const ctx = spy.mock.calls[0][0] as any;
        expect(ctx.scope.roll?.total).toBe(100);
    });

    it("casts a real die while healing is enabled", async () => {
        const logic = makeWound({ levelBase: 3 }, 12);
        const spy = vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: MARGINAL_SUCCESS } as any);
        await logic.healingTest({ scope: {} } as any);
        const ctx = spy.mock.calls[0][0] as any;
        expect(ctx.scope.roll).toBeUndefined();
    });
});
