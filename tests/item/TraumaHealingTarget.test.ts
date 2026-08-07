import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    ITEM_KIND,
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

    it("is DISABLED — not zero — for an untreated wound with no Healing Rate", () => {
        // "Untreated" is a real state, distinct from a target of 0 (#1146/#1148).
        const logic = makeWound({ healingRateBase: null }, 12);
        expect(logic.healing.disabled).toBeTruthy();
    });

    it("is 0 when the wound is on no actor (no Healing Base to read)", () => {
        const logic = makeWound({ healingRateBase: 4 }, null);
        expect(logic.healing.effective).toBe(0);
    });

    it("exposes a HEALING effect key pointing at the modifier", () => {
        expect(TRAUMA_EFFECT_KEY.HEALING).toBe("mod:logic.healing");
    });
});
