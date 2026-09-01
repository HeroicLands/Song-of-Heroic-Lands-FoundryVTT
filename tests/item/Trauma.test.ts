import { describe, it, expect, vi, afterEach } from "vitest";
import { TraumaLogic, SHOCK, isShock, UNTREATED } from "@src/document/item/logic/TraumaLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    FEAR_CATEGORY,
    ITEM_KIND,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    MORALE_CATEGORY,
    TRAUMA_SUBTYPE,
    TRAUMA_PSYCOND_CATEGORY,
    TRAUMA_PHYSCOND_CATEGORY,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import * as ActionCard from "@src/document/chat/action-card";

/**
 * A `system.scheduledActions` seed — the generic store (issue #588) that replaces
 * the retired bespoke `last*Date` anchors. The executor reads its catch-up anchor
 * and interval from this entry.
 */
function sched(actionName: string, anchor: number, interval: number) {
    return {
        scheduledActions: [{ actionName, anchor, interval, sceneUuid: "", payload: {} }],
    };
}

/** Action contexts pre-answering the schedule offer (issue #579). */
const RESCHEDULE_YES = { skipDialog: true, scope: { schedule: true } } as any;
const RESCHEDULE_NO = { skipDialog: true, scope: { schedule: false } } as any;

describe("time-based healing / blood-loss on the generic store (#482, #579, #588)", () => {
    afterEach(() => vi.restoreAllMocks());

    function withSchedule() {
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
        return { schedule, unschedule };
    }

    // The mock item document has no uuid; set one so the executors run.
    function trauma(overrides: Record<string, unknown> = {}) {
        const logic = makeTrauma(overrides);
        (logic.item as any).uuid = "Item.trauma0000";
        return logic;
    }

    /** Settle the healing roll at `level` so the test reaches its offer. */
    function stubRoll(level: number) {
        return vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: level } as any);
    }

    /** A treated injury — the only shape the healing cycle runs on (#1181). */
    function injury(overrides: Record<string, unknown> = {}) {
        return trauma({
            subType: "injury",
            healingRateBase: 4,
            treatmentDate: 1,
            ...overrides,
        });
    }

    it("healingCheck offers the next occurrence and, on accept, schedules it via the generic store", async () => {
        const { schedule } = withSchedule();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        const logic = injury({
            levelBase: 3,
            healingCheckDurationFormula: "500",
        });
        logic.initialize();
        stubRoll(MARGINAL_FAILURE);
        await logic.healingTest(RESCHEDULE_YES);
        // Nothing is armed, so the occurrence's due time is "now" (1000).
        expect(schedule).toHaveBeenCalledWith(
            logic.item,
            "healingCheck",
            500,
            undefined,
            undefined,
            undefined,
            undefined,
            1000,
        );
        // The executor persists the rolled interval; the "last run" RECORD is a
        // generic stamp applied at the action chokepoint (SohlAction.execute),
        // NOT here — so the executor no longer writes any last*Date.
        const update = (logic.item.update as any).mock.calls.at(-1)?.[0] ?? {};
        expect(update).toMatchObject({
            "system.healingCheckDurationBase": 500,
        });
        expect(update).not.toHaveProperty("system.lastHealingCheckDate");
    });

    it("healingCheck declines the offer and clears the schedule (default No / decline)", async () => {
        const { unschedule } = withSchedule();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        const logic = injury({
            levelBase: 3,
            healingCheckDurationFormula: "500",
        });
        logic.initialize();
        stubRoll(MARGINAL_FAILURE);
        await logic.healingTest(RESCHEDULE_NO);
        expect(unschedule).toHaveBeenCalledWith(logic.item, "healingCheck");
    });

    it("healingCheck ends the recurrence (unschedule, no offer) once the wound has healed to 0", async () => {
        const { schedule, unschedule } = withSchedule();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        const logic = injury({ levelBase: 0 });
        logic.initialize();
        await logic.healingTest(RESCHEDULE_YES);
        expect(unschedule).toHaveBeenCalledWith(logic.item, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("finalize re-arms healingCheck from the persisted system.scheduledActions entry", () => {
        const { schedule, unschedule } = withSchedule();
        const scheduleAt = (globalThis as any).sohl.events.scheduleAt;
        const logic = trauma({
            levelBase: 3,
            ...sched("healingCheck", 2000, 500),
        });
        logic.initialize();
        logic.finalize();
        // armScheduledActions arms the store entry at anchor + interval = 2500.
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
            2500,
            {},
            undefined,
        );
        // finalize never invents or clears a schedule of its own.
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("bloodLossAdvanceTest offers the next advance, anchored on this occurrence (#1181)", async () => {
        const { schedule } = withSchedule();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const logic = trauma({
            bloodLossAdvanceDurationBase: 300,
            bloodLossAdvanceDurationFormula: "300",
        });
        logic.initialize();
        await logic.bloodLossAdvanceTest(RESCHEDULE_YES);
        expect(schedule).toHaveBeenCalledWith(
            logic.item,
            "bloodLossAdvanceCheck",
            300,
            undefined,
            undefined,
            undefined,
            undefined,
            2000,
        );
    });

    it("healingTest anchors the next occurrence on THIS one's due time, not on now (#1181)", async () => {
        const { schedule } = withSchedule();
        // Due at 1000 + 500 = 1500, but not performed until 3200. The next
        // occurrence must anchor at 1500 (so it falls at 2000), NOT at 3200.
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(3200);
        const logic = trauma({
            subType: "injury",
            levelBase: 3,
            healingRateBase: 4,
            treatmentDate: 1,
            healingCheckDurationFormula: "500",
            ...sched("healingCheck", 1000, 500),
        });
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        stubRoll(MARGINAL_FAILURE);
        await logic.healingTest(RESCHEDULE_YES);
        expect(schedule).toHaveBeenCalledWith(
            logic.item,
            "healingCheck",
            500,
            undefined,
            undefined,
            undefined,
            undefined,
            1500,
        );
    });

    it("healingCheck only posts a card — it rolls nothing and changes nothing (#1181)", async () => {
        const { schedule } = withSchedule();
        const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined as never);
        const logic = trauma({
            subType: "injury",
            levelBase: 3,
            healingRateBase: 4,
            ...sched("healingCheck", 1000, 500),
        });
        logic.initialize();
        (logic.item.update as any).mockClear();
        await logic.healingCheck({} as any);
        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][1].buttons).toMatchObject({
            action: "healingtest",
        });
        expect(logic.item.update).not.toHaveBeenCalled();
        expect(schedule).not.toHaveBeenCalled();
    });
});

describe("isTreated — a null Healing Rate is the source of truth (#1148)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("is false when the Healing Rate is null, whatever the treatment date says", () => {
        const logic = makeTrauma({
            healingRateBase: null,
            treatmentDate: 1000,
        });
        // The date cannot make a rate-less wound treated.
        expect(logic.isTreated).toBe(false);
    });

    it("is false when there is a rate but no treatment date", () => {
        const logic = makeTrauma({ healingRateBase: 4, treatmentDate: null });
        expect(logic.isTreated).toBe(false);
    });

    it("is true only when both a rate and a treatment date are recorded", () => {
        const logic = makeTrauma({ healingRateBase: 4, treatmentDate: 1000 });
        expect(logic.isTreated).toBe(true);
    });

    it("treats a recorded rate of 0 as a real rate, not as 'no rate'", () => {
        const logic = makeTrauma({ healingRateBase: 0, treatmentDate: 1000 });
        expect(logic.isTreated).toBe(true);
    });
});

describe("healingRate modifier — disabled while undetermined (#1148)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("is disabled, not zero, when no Healing Rate has been determined", () => {
        const logic = makeTrauma({ healingRateBase: null });
        logic.initialize();
        // Mirrors AfflictionLogic: an absent rate disables the modifier (which
        // the Being ledger renders as ✗) rather than reading as a rate of 0.
        expect(logic.healingRate.disabled).toBeTruthy();
    });

    it("carries the recorded rate as its base once determined", () => {
        const logic = makeTrauma({ healingRateBase: 4 });
        logic.initialize();
        expect(logic.healingRate.disabled).toBeFalsy();
        expect(logic.healingRate.base).toBe(4);
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

function makeTrauma(overrides: Record<string, unknown> = {}, opts: Record<string, unknown> = {}) {
    return makeItemLogic(TraumaLogic, ITEM_KIND.TRAUMA, traumaFields(overrides), opts);
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

        // treatmentTest behavior is covered by the "Injury Treatment Test
        // effect (#553)" suite below.

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
                // No rate determined (#1148) — not the real rate 0.
                hr: null,
                // The 00 face: always a Critical Failure, whatever the target.
                roll: 100,
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

describe("Blood Loss Advance Test effect (#487)", () => {
    afterEach(() => vi.restoreAllMocks());

    function withEvents() {
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
    }

    /** A bleeding injury on an actor with a Strength ML and shock-advance op. */
    function bleeder(strMl = 60) {
        const actor = makeMockActor();
        (actor.logic as any).advanceShockState = vi.fn().mockResolvedValue(undefined);
        (actor.logic as any).getItemLogic = vi.fn((code: string) =>
            code === "str" ? { masteryLevel: { effective: strMl } } : undefined,
        );
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                bloodLossAdvanceDurationBase: 300,
                bloodLossAdvanceDurationFormula: "300",
                ...sched("bloodLossAdvanceCheck", 1000, 300),
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.bleeder0000";
        logic.initialize();
        return { logic, actor };
    }

    function mockRoll(...levels: number[]) {
        const spy = vi.spyOn(MasteryLevelModifier.prototype, "successTest");
        for (const lvl of levels) {
            spy.mockResolvedValueOnce({ normSuccessLevel: lvl } as any);
        }
        return spy;
    }

    it.each([
        [CRITICAL_FAILURE, 3],
        [MARGINAL_FAILURE, 2],
        [MARGINAL_SUCCESS, 1],
    ])(
        "accrues Blood Loss Points, advancing shock and anemia (sl %i → %i BLP)",
        async (sl, blp) => {
            withEvents();
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1300); // 1 checkpoint
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            mockRoll(sl);
            const { logic, actor } = bleeder();
            await logic.bloodLossAdvanceTest({} as any);
            expect((actor.logic as any).advanceShockState).toHaveBeenCalledWith(blp);
            expect(create).toHaveBeenCalledWith(actor.logic, [
                expect.objectContaining({
                    system: expect.objectContaining({
                        levelBase: blp * 5,
                        category: "weakness",
                    }),
                }),
            ]);
        },
    );

    it("does no blood loss on a critical success (0 BLP)", async () => {
        withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1300);
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        mockRoll(CRITICAL_SUCCESS);
        const { logic, actor } = bleeder();
        await logic.bloodLossAdvanceTest({} as any);
        expect((actor.logic as any).advanceShockState).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });

    it("rolls against the victim's Strength Mastery Level", async () => {
        withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1300);
        vi.spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems").mockResolvedValue([]);
        const spy = mockRoll(MARGINAL_SUCCESS);
        const { logic } = bleeder(72);
        await logic.bloodLossAdvanceTest({} as any);
        expect((spy.mock.instances[0] as any).base).toBe(72);
    });

    it("applies exactly ONE advance per invocation, however much time elapsed (#1181)", async () => {
        withEvents();
        // Two intervals have gone by; the old executor advanced twice in one
        // pass. One check yields one test — a bleeding wound left unattended
        // costs one advance per consented test, not a silent cascade.
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1600);
        vi.spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems").mockResolvedValue([]);
        const spy = mockRoll(MARGINAL_FAILURE, MARGINAL_FAILURE);
        const { logic, actor } = bleeder();
        await logic.bloodLossAdvanceTest({} as any);
        expect(spy).toHaveBeenCalledTimes(1);
        expect((actor.logic as any).advanceShockState).toHaveBeenCalledTimes(1);
    });
});

describe("Injury Healing Test effect (#486)", () => {
    afterEach(() => vi.restoreAllMocks());

    function withEvents() {
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
    }

    /** A treated injury on an actor with healingBase `hb`; `now` sets checkpoints. */
    function treatedInjury(
        opts: {
            levelBase?: number;
            /** `null` is a wound whose Healing Rate is not yet determined. */
            healingRateBase?: number | null;
            hb?: number;
            subType?: string;
            treatmentDate?: number | null;
            infection?: boolean;
        } = {},
    ) {
        const {
            levelBase = 5,
            healingRateBase = 3,
            hb = 4,
            subType = TRAUMA_SUBTYPE.INJURY,
            treatmentDate = 500,
            infection = false,
        } = opts;
        const actor = makeMockActor();
        (actor.logic as any).healingBase = { effective: hb };
        const logic = makeTrauma(
            {
                subType,
                levelBase,
                healingRateBase,
                treatmentDate,
                ...sched("healingCheck", 1000, 500),
                healingCheckDurationBase: 500,
                healingCheckDurationFormula: "500",
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.injury00000";
        logic.initialize();
        logic.evaluate();
        // `healing` is built in finalize (it needs the actor's settled Healing
        // Base), and it is what decides whether a die is cast at all — so the
        // fixture must run the full lifecycle, as production does.
        logic.finalize();
        if (infection) {
            actor.itemTypes = {
                [ITEM_KIND.TRAUMA]: [
                    {
                        logic: {
                            data: { subType: TRAUMA_SUBTYPE.INFECTION },
                            level: { effective: 2 },
                        },
                    },
                ],
            };
        }
        return logic;
    }

    /** Mock each successive Injury Healing Test to return the given levels. */
    function mockRoll(...levels: number[]) {
        const spy = vi.spyOn(MasteryLevelModifier.prototype, "successTest");
        for (const lvl of levels) {
            spy.mockResolvedValueOnce({ normSuccessLevel: lvl } as any);
        }
        return spy;
    }

    /** Run one checkpoint (now = anchor + one interval). */
    function oneCheckpoint() {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1500);
    }

    it("reduces the Injury Level by 1 on a marginal success", async () => {
        withEvents();
        oneCheckpoint();
        mockRoll(MARGINAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 5 });
        await logic.healingTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 4 }),
        );
    });

    it("reduces the Injury Level by 2 on a critical success", async () => {
        withEvents();
        oneCheckpoint();
        mockRoll(CRITICAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 5 });
        await logic.healingTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 3 }),
        );
    });

    it("does not heal on a marginal or critical failure", async () => {
        withEvents();
        oneCheckpoint();
        mockRoll(MARGINAL_FAILURE);
        const mf = treatedInjury({ levelBase: 5 });
        await mf.healingTest({} as any);
        expect(mf.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 5 }),
        );

        vi.restoreAllMocks();
        withEvents();
        oneCheckpoint();
        mockRoll(CRITICAL_FAILURE);
        const cf = treatedInjury({ levelBase: 5 });
        await cf.healingTest({} as any);
        expect(cf.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 5 }),
        );
    });

    it("rolls exactly ONE test per invocation, however much time elapsed (#1181)", async () => {
        withEvents();
        // Four intervals have gone by; the old executor would have rolled four
        // times in one pass. One check yields one test.
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(4000);
        const spy = mockRoll(MARGINAL_SUCCESS, MARGINAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 5 });
        await logic.healingTest({} as any);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 4 }),
        );
    });

    it("stops testing once the injury heals to 0", async () => {
        withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const spy = mockRoll(MARGINAL_SUCCESS, MARGINAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 1 });
        await logic.healingTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 0 }),
        );
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("casts no dice for an untreated injury — it supplies the 00 face instead (#1148)", async () => {
        withEvents();
        oneCheckpoint();
        const cast = vi.spyOn(SimpleRoll.prototype, "roll");
        const spy = mockRoll(CRITICAL_FAILURE);
        const logic = treatedInjury({
            levelBase: 5,
            treatmentDate: null,
            healingRateBase: null,
        });
        await logic.healingTest({} as any);
        // The test still runs — it is handed a pre-seeded die rather than
        // short-circuited — and that die is the 00 face (100), which exceeds
        // every ordinary target and ends in a critical-failure digit, so it is
        // a Critical Failure whatever the target.
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0].scope.roll?.total).toBe(100);
        // Nothing is drawn from the generator.
        expect(cast).not.toHaveBeenCalled();
    });

    it("an untreated injury never improves — its forced Critical Failure does no healing (#1148)", async () => {
        withEvents();
        oneCheckpoint();
        mockRoll(CRITICAL_FAILURE);
        const logic = treatedInjury({
            levelBase: 5,
            treatmentDate: null,
            healingRateBase: null,
        });
        await logic.healingTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 5 }),
        );
    });

    it("casts no dice when the Healing Rate is undetermined, even with a treatment date on record (#1148)", async () => {
        withEvents();
        oneCheckpoint();
        const cast = vi.spyOn(SimpleRoll.prototype, "roll");
        const spy = mockRoll(CRITICAL_FAILURE);
        // A stored treatment date cannot make a rate-less wound treated.
        const logic = treatedInjury({ levelBase: 5, healingRateBase: null });
        await logic.healingTest({} as any);
        expect(spy.mock.calls[0][0].scope.roll?.total).toBe(100);
        expect(cast).not.toHaveBeenCalled();
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 5 }),
        );
    });

    it("casts a real die once a Healing Rate is recorded (#1148)", async () => {
        withEvents();
        oneCheckpoint();
        const spy = mockRoll(MARGINAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 5, healingRateBase: 3 });
        await logic.healingTest({} as any);
        // A determined rate is tested normally — no die is supplied.
        expect(spy.mock.calls[0][0].scope.roll).toBeUndefined();
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 4 }),
        );
    });

    it("an untreated wound is infection-prone — its forced Critical Failure contracts an infection (#1146)", async () => {
        withEvents();
        oneCheckpoint();
        mockRoll(CRITICAL_FAILURE);
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        // `infectable` is false — it is only ever set by a Treatment Test — yet
        // an untreated wound is resolved as though its treatment roll were a
        // Critical Failure, which is exactly what marks a wound infectable.
        const logic = treatedInjury({
            levelBase: 5,
            treatmentDate: null,
            healingRateBase: null,
        });
        await logic.healingTest({} as any);
        expect(create).toHaveBeenCalledWith(
            logic.actorLogic,
            expect.arrayContaining([
                expect.objectContaining({
                    system: expect.objectContaining({ subType: "infection" }),
                }),
            ]),
        );
    });

    it("an active infection still halts everything — an untreated wound auto-fails nothing while healing is halted (#1146)", async () => {
        withEvents();
        oneCheckpoint();
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        const logic = treatedInjury({
            levelBase: 5,
            treatmentDate: null,
            infection: true,
        });
        await logic.healingTest({} as any);
        // Halted means no test is resolved at all — not an auto-CF that would
        // pile a second infection on top of the one already halting healing.
        expect(create).not.toHaveBeenCalled();
    });

    it("makes no test while an active infection halts healing", async () => {
        withEvents();
        oneCheckpoint();
        const spy = mockRoll(MARGINAL_SUCCESS);
        const logic = treatedInjury({ levelBase: 5, infection: true });
        (logic.item.update as any).mockClear();
        const result = await logic.healingTest({} as any);
        // No roll, no progress, and no write — but the recurrence survives, so
        // healing resumes once the infection is beaten (#1181).
        expect(spy).not.toHaveBeenCalled();
        expect(result).toEqual({ level: 5 });
        expect(logic.item.update).not.toHaveBeenCalled();
    });

    it("does not apply the injury healing test to a non-injury trauma", async () => {
        withEvents();
        oneCheckpoint();
        const spy = mockRoll(MARGINAL_SUCCESS);
        const logic = treatedInjury({
            levelBase: 5,
            subType: TRAUMA_SUBTYPE.FEAR,
        });
        await logic.healingTest({} as any);
        expect(spy).not.toHaveBeenCalled();
    });
});

describe("Infection lifecycle (#557)", () => {
    afterEach(() => vi.restoreAllMocks());

    const HOUR = 3600;

    function withEvents() {
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
    }

    function mockRoll(...levels: number[]) {
        const spy = vi.spyOn(MasteryLevelModifier.prototype, "successTest");
        for (const lvl of levels) spy.mockResolvedValueOnce({ normSuccessLevel: lvl } as any);
        return spy;
    }

    describe("contraction on a Critical-Failure Injury Healing Test", () => {
        function injury(infectable: boolean, healingRateBase = 3) {
            const actor = makeMockActor();
            (actor.logic as any).healingBase = { effective: 4 };
            const logic = makeTrauma(
                {
                    subType: TRAUMA_SUBTYPE.INJURY,
                    levelBase: 3,
                    healingRateBase,
                    treatmentDate: 500,
                    infectable,
                    bodyLocationCode: "skull",
                    ...sched("healingCheck", 1000, 500),
                    healingCheckDurationBase: 500,
                    healingCheckDurationFormula: "500",
                },
                { actor },
            );
            (logic.item as any).uuid = "Item.injury00000";
            logic.initialize();
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1500);
            return logic;
        }

        it("contracts an infection at HR = injury HR + 1 on a CF of an infectable wound", async () => {
            withEvents();
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            mockRoll(CRITICAL_FAILURE);
            const logic = injury(true, 3);
            await logic.healingTest({} as any);
            expect(create).toHaveBeenCalledWith(logic.actorLogic, [
                expect.objectContaining({
                    system: expect.objectContaining({
                        subType: "infection",
                        levelBase: 0,
                        healingRateBase: 4, // injury HR 3 + 1
                    }),
                }),
            ]);
        });

        it("does not contract an infection on a CF of a non-infectable wound", async () => {
            withEvents();
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            mockRoll(CRITICAL_FAILURE);
            const logic = injury(false);
            await logic.healingTest({} as any);
            expect(create).not.toHaveBeenCalled();
        });

        it("OFFERS the new infection's recovery course rather than auto-arming it (#579)", async () => {
            withEvents();
            const infectionItem = {
                uuid: "Item.infect00000",
                system: { courseDurationBase: 86400 },
            };
            vi.spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems").mockResolvedValue([
                infectionItem,
            ]);
            const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
            mockRoll(CRITICAL_FAILURE);
            const logic = injury(true, 3);
            // A pre-answered scheduling context accepts the course offer.
            await logic.healingTest({
                skipDialog: true,
                scope: { schedule: true },
            } as any);
            expect(schedule).toHaveBeenCalledWith(infectionItem, "courseCheck", 86400);
        });
    });

    describe("Infection Healing Test (course)", () => {
        function infection(opts: { healingRateBase?: number; spanHrs?: number } = {}) {
            const { healingRateBase = 3, spanHrs = 24 } = opts;
            const interval = spanHrs * HOUR;
            const actor = makeMockActor();
            (actor.logic as any).healingBase = { effective: 4 };
            (actor.logic as any).fatiguePenalty = { effective: 0 };
            const logic = makeTrauma(
                {
                    subType: TRAUMA_SUBTYPE.INFECTION,
                    levelBase: 0,
                    healingRateBase,
                    ...sched("courseCheck", 0, interval),
                    courseDurationBase: interval,
                    courseDurationFormula: String(interval),
                },
                { actor },
            );
            (logic.item as any).uuid = "Item.infect00000";
            logic.initialize();
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(interval);
            return { logic, actor };
        }

        it("adjusts the infection Healing Rate by the test result", async () => {
            withEvents();
            vi.spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems").mockResolvedValue([]);
            mockRoll(MARGINAL_SUCCESS); // HR 3 → 4
            const { logic } = infection({ healingRateBase: 3 });
            await logic.courseTest({} as any);
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({ "system.healingRateBase": 4 }),
            );
        });

        it("floors the Healing Rate at 1 (an infection never kills)", async () => {
            withEvents();
            vi.spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems").mockResolvedValue([]);
            mockRoll(CRITICAL_FAILURE); // HR 1 → -1, floored to 1
            const { logic, actor } = infection({ healingRateBase: 1 });
            await logic.courseTest({} as any);
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({ "system.healingRateBase": 1 }),
            );
            expect((actor.logic as any).setShockState).toBeUndefined();
        });

        it("saps weakness fatigue by the Healing-Rate band", async () => {
            withEvents();
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            mockRoll(MARGINAL_FAILURE); // HR 2 → 1 (band 1–2 → 10)
            const { logic } = infection({ healingRateBase: 2 });
            await logic.courseTest({} as any);
            expect(create).toHaveBeenCalledWith(logic.actorLogic, [
                expect.objectContaining({
                    system: expect.objectContaining({
                        levelBase: 10,
                        category: "weakness",
                    }),
                }),
            ]);
        });

        it("heals (no weakness) when the Healing Rate reaches 6", async () => {
            (globalThis as any).sohl.events = {
                scheduleAt: vi.fn(),
                unsubscribe: vi.fn(),
            };
            const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
            const create = vi
                .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
                .mockResolvedValue([]);
            mockRoll(CRITICAL_SUCCESS); // HR 5 → 7
            const { logic } = infection({ healingRateBase: 5 });
            await logic.courseTest({} as any);
            expect(create).not.toHaveBeenCalled(); // no weakness at HR ≥ 6
            expect(unschedule).toHaveBeenCalledWith(logic.item, "courseCheck");
        });
    });
});

describe("Extended Shock / Coma course test (#556)", () => {
    afterEach(() => vi.restoreAllMocks());

    const HOUR = 3600;

    function withEvents() {
        const scheduleAt = vi.fn();
        const unsubscribe = vi.fn();
        (globalThis as any).sohl.events = { scheduleAt, unsubscribe };
        return { scheduleAt, unsubscribe };
    }

    /** A lasting-shock (shock/coma) trauma with one course interval of `spanHrs`. */
    function lasting(
        opts: {
            subType?: string;
            healingRateBase?: number;
            hb?: number;
            fatigue?: number;
            spanHrs?: number;
            contractDate?: number;
            otherComaHr?: number | null;
        } = {},
    ) {
        const {
            subType = TRAUMA_SUBTYPE.SHOCK,
            healingRateBase = 4,
            hb = 4,
            fatigue = 0,
            spanHrs = 4,
            contractDate = 0,
            otherComaHr = null,
        } = opts;
        const interval = spanHrs * HOUR;
        const actor = makeMockActor();
        (actor.logic as any).healingBase = { effective: hb };
        (actor.logic as any).fatiguePenalty = { effective: fatigue };
        (actor.logic as any).setShockState = vi.fn().mockResolvedValue(undefined);
        const logic = makeTrauma(
            {
                subType,
                levelBase: 0,
                healingRateBase,
                contractDate,
                ...sched("courseCheck", 0, interval),
                courseDurationBase: interval,
                courseDurationFormula: String(interval),
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.shock000000";
        logic.initialize();
        // Optionally give the actor another active coma trauma (the self logic
        // is already registered via actor.items by makeItemLogic).
        if (otherComaHr != null) {
            actor.itemTypes = {
                [ITEM_KIND.TRAUMA]: [
                    {
                        logic: {
                            data: { subType: TRAUMA_SUBTYPE.COMA },
                            healingRate: { effective: otherComaHr },
                        },
                    },
                ],
            };
        }
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(interval);
        return { logic, actor };
    }

    function mockRoll(...levels: number[]) {
        const spy = vi.spyOn(MasteryLevelModifier.prototype, "successTest");
        for (const lvl of levels) spy.mockResolvedValueOnce({ normSuccessLevel: lvl } as any);
        return spy;
    }

    it("adjusts the Healing Rate by the course-test result", async () => {
        withEvents();
        mockRoll(MARGINAL_SUCCESS); // HR 4 → 5
        const { logic } = lasting({ healingRateBase: 4 });
        await logic.courseTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.healingRateBase": 5 }),
        );
    });

    it("rolls Healing Base × HR with the fatigue penalty", async () => {
        withEvents();
        const spy = mockRoll(MARGINAL_SUCCESS);
        const { logic } = lasting({ healingRateBase: 4, hb: 4, fatigue: 5 });
        await logic.courseTest({} as any);
        expect((spy.mock.instances[0] as any).base).toBe(16); // 4 × 4
        expect(spy.mock.calls[0][0].scope.situationalModifier).toBe(-5);
    });

    it("kills the victim when the Healing Rate falls to 0 or below", async () => {
        withEvents();
        const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
        mockRoll(CRITICAL_FAILURE); // HR 1 → -1
        const { logic, actor } = lasting({ healingRateBase: 1 });
        await logic.courseTest({} as any);
        expect((actor.logic as any).setShockState).toHaveBeenCalledWith(4); // DEAD
        expect(unschedule).toHaveBeenCalledWith(logic.item, "courseCheck");
    });

    it("recovers (shock cleared) when the Healing Rate reaches 6", async () => {
        withEvents();
        const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
        mockRoll(CRITICAL_SUCCESS); // HR 5 → 7 (≥6)
        const { logic, actor } = lasting({ healingRateBase: 5 });
        await logic.courseTest({} as any);
        expect((actor.logic as any).setShockState).toHaveBeenCalledWith(0); // NONE
        expect(unschedule).toHaveBeenCalledWith(logic.item, "courseCheck");
    });

    it("leaves an Extended Shock recovery Unconscious while a Coma remains", async () => {
        withEvents();
        mockRoll(CRITICAL_SUCCESS);
        const { logic, actor } = lasting({
            subType: TRAUMA_SUBTYPE.SHOCK,
            healingRateBase: 5,
            otherComaHr: 3,
        });
        await logic.courseTest({} as any);
        expect((actor.logic as any).setShockState).toHaveBeenCalledWith(3); // UNCONSCIOUS
    });

    it("a recovering Coma inflicts weariness fatigue equal to days spent", async () => {
        withEvents();
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        mockRoll(CRITICAL_SUCCESS); // HR 5 → 7
        // Coma course fires at 4h here (span), but contractDate 0 → ~0 days.
        // Use a long span to accrue days: 48h ≈ 2 days.
        const { logic } = lasting({
            subType: TRAUMA_SUBTYPE.COMA,
            healingRateBase: 5,
            spanHrs: 48,
            contractDate: 0,
        });
        await logic.courseTest({} as any);
        expect(create).toHaveBeenCalledWith(logic.actorLogic, [
            expect.objectContaining({
                system: expect.objectContaining({ category: "weakness" }),
            }),
        ]);
    });
});

describe("Permanent impairment on heal (#554)", () => {
    afterEach(() => vi.restoreAllMocks());

    const DAY = 86400;

    function withEvents() {
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
    }

    /**
     * A treated, permanent-impairment-eligible injury with one healing interval
     * spanning `spanDays`; a single Injury Healing Test fires at `spanDays`.
     */
    function eligibleInjury(
        opts: {
            levelBase?: number;
            eligible?: boolean;
            spanDays?: number;
        } = {},
    ) {
        const { levelBase = 1, eligible = true, spanDays = 20 } = opts;
        const interval = spanDays * DAY;
        const actor = makeMockActor();
        (actor.logic as any).healingBase = { effective: 4 };
        const applyPermanentImpairment = vi.fn().mockResolvedValue(undefined);
        (actor.logic as any).applyPermanentImpairment = applyPermanentImpairment;
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                levelBase,
                healingRateBase: 6,
                treatmentDate: 500,
                contractDate: 0,
                permanentImpairmentEligible: eligible,
                bodyLocationCode: "skull",
                ...sched("healingCheck", 0, interval),
                healingCheckDurationBase: interval,
                healingCheckDurationFormula: String(interval),
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.injury00000";
        logic.initialize();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(interval);
        return { logic, applyPermanentImpairment };
    }

    function mockRoll(sl: number) {
        vi.spyOn(MasteryLevelModifier.prototype, "successTest").mockResolvedValue({
            normSuccessLevel: sl,
        } as any);
    }

    it("applies permanent impairment scaled by time-to-heal on heal to 0", async () => {
        withEvents();
        mockRoll(MARGINAL_SUCCESS); // level 1 → 0 in one test
        const { logic, applyPermanentImpairment } = eligibleInjury({
            spanDays: 20,
        });
        await logic.healingTest({} as any);
        // 20 days → −5, on the skull's body part.
        expect(applyPermanentImpairment).toHaveBeenCalledWith("skull", -5);
    });

    it("does not apply when the wound is not eligible", async () => {
        withEvents();
        mockRoll(MARGINAL_SUCCESS);
        const { logic, applyPermanentImpairment } = eligibleInjury({
            eligible: false,
            spanDays: 40,
        });
        await logic.healingTest({} as any);
        expect(applyPermanentImpairment).not.toHaveBeenCalled();
    });

    it("does not apply for a fast heal (< 20 days)", async () => {
        withEvents();
        mockRoll(MARGINAL_SUCCESS);
        const { logic, applyPermanentImpairment } = eligibleInjury({
            spanDays: 10,
        });
        await logic.healingTest({} as any);
        expect(applyPermanentImpairment).not.toHaveBeenCalled();
    });

    it("does not apply when the injury does not reach 0", async () => {
        withEvents();
        mockRoll(MARGINAL_SUCCESS); // level 3 → 2, not healed
        const { logic, applyPermanentImpairment } = eligibleInjury({
            levelBase: 3,
            spanDays: 40,
        });
        await logic.healingTest({} as any);
        expect(applyPermanentImpairment).not.toHaveBeenCalled();
    });
});

describe("Treatment action cards — requestTreatment / treatInjury", () => {
    afterEach(() => vi.restoreAllMocks());

    function injury(overrides: Record<string, unknown> = {}) {
        const actor = makeMockActor({ name: "Aldric" });
        const logic = makeTrauma(
            { subType: TRAUMA_SUBTYPE.INJURY, levelBase: 4, ...overrides },
            { actor },
        );
        (logic.item as any).uuid = "Item.wound";
        logic.initialize();
        return logic;
    }

    describe("requestTreatment (context-menu trigger)", () => {
        it("posts an open Perform Treatment Test card targeting the wound (@self)", async () => {
            const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined);
            await injury().requestTreatment({} as any);
            expect(post).toHaveBeenCalledOnce();
            const spec = post.mock.calls[0][1];
            // The button invokes performTreatmentTest, is open (@self), and
            // pre-fills the wound uuid.
            expect(spec.buttons).toEqual(
                expect.objectContaining({
                    action: "performTreatmentTest",
                    handlerUuid: "@self",
                    scope: { injuryUuid: "Item.wound" },
                }),
            );
        });

        it("warns and posts nothing for a non-injury trauma", async () => {
            const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined);
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await injury({ subType: TRAUMA_SUBTYPE.FEAR }).requestTreatment({} as any);
            expect(post).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalled();
        });

        it("warns and posts nothing for an already-healed injury", async () => {
            const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined);
            await injury({ levelBase: 0 }).requestTreatment({} as any);
            expect(post).not.toHaveBeenCalled();
        });
    });

    describe("treatInjury (self-sufficient: card path + manual dialog)", () => {
        it("records a card-supplied Healing Rate without a dialog (skipDialog)", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
            const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
            const logic = injury();
            await logic.treatInjury({
                scope: { healingRate: 4 },
                skipDialog: true,
            } as any);
            expect(dlg).not.toHaveBeenCalled();
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    "system.healingRateBase": 4,
                    "system.treatmentDate": 1000,
                }),
            );
        });

        it("heals the wound outright on a HEAL result", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
            const logic = injury();
            await logic.treatInjury({
                scope: { healingRate: "HEAL" },
                skipDialog: true,
            } as any);
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({ "system.levelBase": 0 }),
            );
        });

        it("run by hand (no scope), opens a dialog and records the entered rate", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(500);
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
                healingRate: 3,
            });
            const logic = injury();
            await logic.treatInjury({ scope: {} } as any);
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    "system.healingRateBase": 3,
                    "system.treatmentDate": 500,
                }),
            );
        });

        it("run by hand on an untreated wound, opens the dialog blank — an undetermined rate is not 0 (#1087)", async () => {
            const dlg = vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
            const logic = injury({ healingRateBase: null });
            await logic.treatInjury({ scope: {} } as any);
            // `null` is "no Healing Rate determined yet", not the dire rate 0:
            // pre-filling 0 would let a blind confirm record the worst outcome.
            expect(dlg.mock.calls[0][0]).toEqual(
                expect.objectContaining({ data: { healingRate: null } }),
            );
        });

        it("run by hand, a blank Healing Rate records nothing (#1087)", async () => {
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
                healingRate: "",
            });
            const logic = injury({ healingRateBase: null });
            await expect(logic.treatInjury({ scope: {} } as any)).resolves.toBeUndefined();
            // Number("") is 0 — a blank field must not record a Healing Rate of 0.
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("run by hand, a rate of 0 is recorded as a rate — it never heals the wound (#1087)", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(500);
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
                healingRate: 0,
            });
            const logic = injury({ levelBase: 4 });
            await logic.treatInjury({ scope: {} } as any);
            // 0 is a legitimate (dire) Healing Rate, not the HEAL sentinel: the
            // wound keeps its Injury Level.
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.healingRateBase": 0,
                "system.treatmentDate": 500,
            });
            expect(logic.item.update).not.toHaveBeenCalledWith(
                expect.objectContaining({ "system.levelBase": 0 }),
            );
        });

        it("run by hand, is a no-op when the dialog is cancelled", async () => {
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
            const logic = injury();
            await expect(logic.treatInjury({ scope: {} } as any)).resolves.toBeUndefined();
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("card path with no rate (skipDialog) is a no-op — no dialog", async () => {
            const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
            const logic = injury();
            await expect(
                logic.treatInjury({ scope: {}, skipDialog: true } as any),
            ).resolves.toBeUndefined();
            expect(dlg).not.toHaveBeenCalled();
            expect(logic.item.update).not.toHaveBeenCalled();
        });
    });
});

describe("Injury Treatment Test effect (#553)", () => {
    afterEach(() => vi.restoreAllMocks());

    /** An untreated injury on an actor with a Physician skill ML `pysnMl`. */
    function injury(
        opts: {
            levelBase?: number;
            aspect?: string;
            pysnMl?: number;
            bloodLossAdvanceDurationBase?: number | null;
        } = {},
    ) {
        const {
            levelBase = 4,
            aspect = "edged",
            pysnMl = 60,
            bloodLossAdvanceDurationBase = null,
        } = opts;
        const actor = makeMockActor();
        (actor.logic as any).getItemLogic = vi.fn((code: string) =>
            code === "pysn" ? { masteryLevel: { effective: pysnMl } } : undefined,
        );
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                levelBase,
                aspect,
                healingRateBase: null,
                treatmentDate: null,
                bloodLossAdvanceDurationBase,
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.injury00000";
        logic.initialize();
        return { logic, actor };
    }

    function mockRoll(sl: number) {
        return vi
            .spyOn(MasteryLevelModifier.prototype, "successTest")
            .mockResolvedValue({ normSuccessLevel: sl } as any);
    }

    it("sets the Healing Rate from the roll and severity, and the treatment date", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(4200);
        mockRoll(MARGINAL_SUCCESS); // grievous MS → HR 4
        const { logic } = injury({ levelBase: 4, aspect: "edged" });
        await logic.treatmentTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.healingRateBase": 4,
                "system.treatmentDate": 4200,
            }),
        );
    });

    it("rolls the owning actor's Physician skill at the required difficulty modifier", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        const spy = mockRoll(MARGINAL_SUCCESS);
        // Serious edged → CLN / +10.
        const { logic } = injury({ levelBase: 2, aspect: "edged", pysnMl: 55 });
        await logic.treatmentTest({} as any);
        expect((spy.mock.instances[0] as any).base).toBe(55);
        expect(spy.mock.calls[0][0].scope.situationalModifier).toBe(10);
    });

    it("heals the wound immediately on a HEAL result (CS on a minor wound)", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        mockRoll(CRITICAL_SUCCESS); // minor CS → HEAL
        const { logic } = injury({ levelBase: 1, aspect: "edged" });
        await logic.treatmentTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 0 }),
        );
    });

    it("offers the blood-loss timer when a surgical mishap causes a bleeder — accept schedules it (#579)", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        vi.spyOn(FoundryHelpersMock, "fvttGetSetting").mockReturnValue("300");
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        mockRoll(MARGINAL_FAILURE); // grievous MF, SUR → bleeder
        const { logic } = injury({ levelBase: 4, aspect: "edged" });
        // The physician is present; a pre-answered scheduling context accepts the
        // offer (the interactive path would prompt) — nothing auto-arms (#579).
        await logic.treatmentTest({
            skipDialog: true,
            scope: { schedule: true },
        } as any);
        // The bleeder marker persists (drives isBleeding); the blood-loss advance
        // is scheduled only because the offer was accepted.
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.bloodLossAdvanceDurationBase": 300,
            }),
        );
        expect(schedule).toHaveBeenCalledWith(logic.item, "bloodLossAdvanceCheck", 300);
    });

    it("marks a poorly-treated wound infectable, a well-treated one not (#557)", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        mockRoll(MARGINAL_FAILURE); // a failed treatment → infectable
        const poor = injury({ levelBase: 2, aspect: "edged" });
        await poor.logic.treatmentTest({} as any);
        expect(poor.logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.infectable": true }),
        );

        vi.restoreAllMocks();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        mockRoll(MARGINAL_SUCCESS); // a successful treatment → not infectable
        const good = injury({ levelBase: 2, aspect: "edged" });
        await good.logic.treatmentTest({} as any);
        expect(good.logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.infectable": false }),
        );
    });

    it("flags permanent-impairment eligibility from aspect/severity/HR", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        mockRoll(MARGINAL_SUCCESS); // grievous edged MS → HR 4 (eligible)
        const { logic } = injury({ levelBase: 4, aspect: "edged" });
        await logic.treatmentTest({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.permanentImpairmentEligible": true,
            }),
        );
    });

    it("does not flag permanent impairment for an ineligible wound", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        mockRoll(MARGINAL_SUCCESS); // minor edged MS → HR 6 (not eligible)
        const { logic } = injury({ levelBase: 1, aspect: "edged" });
        await logic.treatmentTest({} as any);
        const call = (logic.item.update as any).mock.calls[0][0];
        expect(call["system.permanentImpairmentEligible"]).toBeUndefined();
    });

    it("resolves an unowned (headless) treatment as a critical failure", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(0);
        // successTest returns false when the speaker is not owned.
        vi.spyOn(MasteryLevelModifier.prototype, "successTest").mockResolvedValue(false as any);
        const { logic } = injury({ levelBase: 2, aspect: "edged" }); // serious CF → HR 3
        const result = await logic.treatmentTest({} as any);
        expect(result).toBeNull();
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.healingRateBase": 3 }),
        );
    });

    it("warns and does nothing for a non-injury trauma", async () => {
        const warn = vi.spyOn(sohl.log, "uiWarn");
        const logic = makeTrauma({ subType: TRAUMA_SUBTYPE.FEAR });
        logic.initialize();
        await expect(logic.treatmentTest({} as any)).resolves.toBeNull();
        expect(warn).toHaveBeenCalled();
    });
});

// Relocated from Affliction.test.ts: the named-severity (fear/morale) and
// categorized (fatigue) condition subtypes are now traumas. sohl.i18n.localize
// is identity in tests, so localized labels surface as their localization keys.
describe("TraumaLogic.levelLabel", () => {
    it("clamps negative effective levels to 0", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: -2,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("0");
    });

    it("returns the numeric level as a string (#961 — every level subtype)", () => {
        // Fear/Morale no longer carry a numeric level (their state is in the
        // `category` field), so levelLabel is always the numeric string now.
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: 3,
        });
        logic.initialize();
        expect(logic.levelLabel).toBe("3");
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

    it("maps FEAR categories to their localized labels (#961)", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FEAR,
            category: FEAR_CATEGORY.AFRAID,
        });
        expect(logic.categoryLabel).toBe("SOHL.Trauma.FEAR_CATEGORY.afraid");
    });

    it("maps MORALE categories to their localized labels (#961)", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.MORALE,
            category: MORALE_CATEGORY.ROUTED,
        });
        expect(logic.categoryLabel).toBe("SOHL.Trauma.MORALE_CATEGORY.routed");
    });

    it("maps FATIGUE categories to their localized labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.FATIGUE,
            category: "weariness",
        });
        expect(logic.categoryLabel).toBe("SOHL.Trauma.FATIGUE_CATEGORY.weariness");
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

    it("maps PSYCOND categories to their localized labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
            category: TRAUMA_PSYCOND_CATEGORY.QUIRK,
        });
        expect(logic.categoryLabel).toBe("SOHL.Trauma.PSYCOND_CATEGORY.quirk");
    });

    it("maps PHYSCOND categories to their localized labels", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.PHYSICAL_CONDITION,
            category: TRAUMA_PHYSCOND_CATEGORY.DEBILITY,
        });
        expect(logic.categoryLabel).toBe("SOHL.Trauma.PHYSCOND_CATEGORY.debility");
    });

    it("returns the raw category for an unknown PSYCOND/PHYSCOND category", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
            category: "not-a-category",
        });
        expect(logic.categoryLabel).toBe("not-a-category");
    });
});

describe("TraumaLogic.nextRecoveryTestAt (#939 — view-only next-test date)", () => {
    /** Seed a single scheduledActions entry. */
    function withSched(
        subType: string,
        actionName: string,
        anchor: number,
        interval: number,
        extra: Record<string, unknown> = {},
    ) {
        return makeTrauma({
            subType,
            scheduledActions: [
                {
                    actionName,
                    anchor,
                    interval,
                    sceneUuid: "",
                    payload: {},
                    ...extra,
                },
            ],
        });
    }

    it.each([
        [TRAUMA_SUBTYPE.INJURY, "healingCheck"],
        [TRAUMA_SUBTYPE.INFECTION, "healingCheck"],
        [TRAUMA_SUBTYPE.SHOCK, "courseCheck"],
        [TRAUMA_SUBTYPE.COMA, "courseCheck"],
        [TRAUMA_SUBTYPE.PALL, "pallRecovery"],
        [TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION, "psycheRecovery"],
        [TRAUMA_SUBTYPE.AURALSHOCK, "auralShockRecovery"],
    ])("%s returns anchor+interval of its %s schedule", (subType, actionName) => {
        const logic = withSched(subType, actionName, 1000, 500);
        expect(logic.nextRecoveryTestAt).toBe(1500);
    });

    it("is undefined for a subtype with no recovery action (e.g. fatigue)", () => {
        const logic = withSched(TRAUMA_SUBTYPE.FATIGUE, "healingCheck", 1000, 500);
        expect(logic.nextRecoveryTestAt).toBeUndefined();
    });

    it("is undefined when no matching schedule entry exists", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            scheduledActions: [],
        });
        expect(logic.nextRecoveryTestAt).toBeUndefined();
    });

    it("ignores an event-driven (non-time) schedule for the same action", () => {
        const logic = withSched(TRAUMA_SUBTYPE.SHOCK, "courseCheck", 1000, 500, {
            triggerName: "turnEnd",
        });
        expect(logic.nextRecoveryTestAt).toBeUndefined();
    });

    it("treats an absent triggerName as time-based", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.INJURY,
            scheduledActions: [{ actionName: "healingCheck", anchor: 2000, interval: 250 }],
        });
        expect(logic.nextRecoveryTestAt).toBe(2250);
    });
});

describe("Psyche Stress & Aural Shock recovery (#560)", () => {
    afterEach(() => vi.restoreAllMocks());

    /** A trauma of `subType` on an actor whose Will lookup yields no attribute
     *  (the roll is mocked, so the effective mastery is irrelevant). */
    function recoveryTrauma(subType: string, levelBase: number, category = "") {
        const actor = makeMockActor();
        (actor.logic as any).getItemLogic = () => undefined;
        (actor.logic as any).setShockState = vi.fn().mockResolvedValue(undefined);
        const logic = makeTrauma({ subType, levelBase, category }, { actor });
        (logic.item as any).uuid = "Item.recover0000";
        (logic.item as any).delete = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1000);
        (globalThis as any).sohl.schedule = vi.fn();
        (globalThis as any).sohl.unschedule = vi.fn();
        return logic;
    }

    function mockRoll(level: number) {
        vi.spyOn(MasteryLevelModifier.prototype, "successTest").mockResolvedValue({
            normSuccessLevel: level,
        } as any);
    }

    const NO = { skipDialog: true, scope: { schedule: false } } as any;

    it("Psyche recovery reduces PSY by 1 on a marginal success", async () => {
        mockRoll(MARGINAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION, 3, "indefinite");
        await logic.psycheRecoveryTest(NO);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 2 }),
        );
    });

    it("an indefinite condition goes away when PSY reaches 0", async () => {
        mockRoll(MARGINAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION, 1, "indefinite");
        await logic.psycheRecoveryTest(NO);
        expect(logic.item.delete).toHaveBeenCalledTimes(1);
    });

    it("a Grievous Stress critical failure makes an indefinite condition permanent", async () => {
        mockRoll(CRITICAL_FAILURE);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION, 2, "indefinite");
        await logic.psycheRecoveryTest(NO);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.category": "permanent" }),
        );
        expect(logic.item.delete).not.toHaveBeenCalled();
    });

    it("a critical failure on a permanent condition raises PSY by one", async () => {
        mockRoll(CRITICAL_FAILURE);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION, 2, "permanent");
        await logic.psycheRecoveryTest(NO);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 3 }),
        );
    });

    it("Aural Shock recovery reduces AS by 2 on a critical success", async () => {
        mockRoll(CRITICAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.AURALSHOCK, 3);
        await logic.auralShockRecoveryTest(NO);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 1 }),
        );
    });

    it("a critical-failure Aural Shock recovery inflicts +1 PSY and keeps AS", async () => {
        mockRoll(CRITICAL_FAILURE);
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.AURALSHOCK, 2);
        await logic.auralShockRecoveryTest(NO);
        expect(create).toHaveBeenCalledTimes(1);
        expect((create.mock.calls[0][1] as any[])[0]).toMatchObject({
            system: {
                subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                levelBase: 1,
            },
        });
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 2 }),
        );
    });

    it("recovers from Aural Shock (removes it) when AS reaches 0", async () => {
        mockRoll(MARGINAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.AURALSHOCK, 1);
        await logic.auralShockRecoveryTest(NO);
        expect(logic.item.delete).toHaveBeenCalledTimes(1);
    });

    it("Pall recovery reduces PSL by 2 on a critical success", async () => {
        mockRoll(CRITICAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PALL, 4);
        await logic.pallRecoveryTest(NO);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.levelBase": 2 }),
        );
    });

    it("expels the Pall (removes it) when PSL reach 0", async () => {
        mockRoll(CRITICAL_SUCCESS);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PALL, 2);
        await logic.pallRecoveryTest(NO);
        expect(logic.item.delete).toHaveBeenCalledTimes(1);
    });

    it("a Marginal-Failure Pall recovery knocks the victim unconscious", async () => {
        mockRoll(MARGINAL_FAILURE);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PALL, 3);
        await logic.pallRecoveryTest(NO);
        expect((logic.actorLogic as any).setShockState).toHaveBeenCalled();
    });

    it("a Critical-Failure Pall recovery offers Face the Pall (no removal)", async () => {
        mockRoll(CRITICAL_FAILURE);
        const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined as any);
        const logic = recoveryTrauma(TRAUMA_SUBTYPE.PALL, 3);
        await logic.pallRecoveryTest(NO);
        expect(post).toHaveBeenCalledTimes(1);
        expect(logic.item.delete).not.toHaveBeenCalled();
    });
});

describe("interactive Blood Stoppage flow (#547)", () => {
    afterEach(() => vi.restoreAllMocks());

    function bleedingWound(opts: Record<string, unknown> = {}) {
        const actor = makeMockActor();
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                bloodLossAdvanceDurationBase: 300,
                bloodLossAdvanceDurationFormula: "300",
            },
            { actor, name: "Gash", ...opts },
        );
        (logic.item as any).uuid = "Item.bleeder00000";
        logic.initialize();
        (globalThis as any).sohl.unschedule = vi.fn();
        (globalThis as any).sohl.schedule = vi.fn();
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
        return logic;
    }

    it("requestBloodStoppage posts an open Perform Blood Stoppage card for a bleeder", async () => {
        const post = vi.spyOn(ActionCard, "postActionCard").mockResolvedValue(undefined as any);
        const logic = bleedingWound();
        await logic.requestBloodStoppage({} as any);
        const spec = post.mock.calls.at(-1)![1] as any;
        expect(spec.buttons).toMatchObject({
            action: "performBloodStoppage",
            handlerUuid: "@self",
            scope: { injuryUuid: "Item.bleeder00000" },
        });
    });

    it("requestBloodStoppage warns and posts nothing for a non-bleeding injury", async () => {
        const post = vi.spyOn(ActionCard, "postActionCard");
        const warn = vi.spyOn(sohl.log, "uiWarn");
        const actor = makeMockActor();
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                bloodLossAdvanceDurationBase: null,
            },
            { actor, name: "Bruise" },
        );
        logic.initialize();
        await logic.requestBloodStoppage({} as any);
        expect(warn).toHaveBeenCalled();
        expect(post).not.toHaveBeenCalled();
    });

    it("acceptBloodStoppage (stopImmediately) clears the bleeder and unschedules", async () => {
        const logic = bleedingWound();
        await logic.acceptBloodStoppage({
            scope: { kind: "stopImmediately" },
        } as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.bloodLossAdvanceDurationBase": null,
            }),
        );
        expect((globalThis as any).sohl.unschedule).toHaveBeenCalledWith(
            logic.item,
            "bloodLossAdvanceCheck",
        );
    });

    it("acceptBloodStoppage (stopAfterNext) flags the wound to stop after the next advance", async () => {
        const logic = bleedingWound();
        await logic.acceptBloodStoppage({
            scope: { kind: "stopAfterNext" },
        } as any);
        expect(logic.item.update).toHaveBeenCalledWith({
            "flags.sohl.bloodStoppagePending": true,
        });
    });

    it("acceptBloodStoppage (continuePlusNext) records a +10 next-test bonus", async () => {
        const logic = bleedingWound();
        await logic.acceptBloodStoppage({
            scope: { kind: "continuePlusNext", nextBonus: 10 },
        } as any);
        expect(logic.item.update).toHaveBeenCalledWith({
            "flags.sohl.bloodStoppageBonus": 10,
        });
    });

    it("bloodLossAdvanceCheck clears a bleeder flagged to stop after the next advance", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(1300);
        const actor = makeMockActor();
        (actor.logic as any).getItemLogic = () => ({
            masteryLevel: { effective: 50 },
        });
        (actor.logic as any).advanceShockState = vi.fn();
        const logic = makeTrauma(
            {
                subType: TRAUMA_SUBTYPE.INJURY,
                bloodLossAdvanceDurationBase: 300,
                bloodLossAdvanceDurationFormula: "300",
                ...sched("bloodLossAdvanceCheck", 1000, 300), // 1 checkpoint @1300
            },
            {
                actor,
                name: "Gash",
                flags: { "sohl.bloodStoppagePending": true },
            },
        );
        (logic.item as any).uuid = "Item.bleeder00000";
        logic.initialize();
        (globalThis as any).sohl.unschedule = vi.fn();
        (globalThis as any).sohl.schedule = vi.fn();
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
        await logic.bloodLossAdvanceTest({
            skipDialog: true,
            scope: { schedule: true },
        } as any);
        const update = (logic.item.update as any).mock.calls.at(-1)?.[0] ?? {};
        expect(update["system.bloodLossAdvanceDurationBase"]).toBeNull();
        expect((globalThis as any).sohl.unschedule).toHaveBeenCalledWith(
            logic.item,
            "bloodLossAdvanceCheck",
        );
    });
});

describe("descriptive conditions as trauma subtypes (#648)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("exposes the psychological- and physical-condition subtypes and their categories", () => {
        expect(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION).toBe("psycond");
        expect(TRAUMA_SUBTYPE.PHYSICAL_CONDITION).toBe("physcond");
        expect(Object.values(TRAUMA_PSYCOND_CATEGORY)).toEqual(["quirk", "impulse", "disorder"]);
        expect(Object.values(TRAUMA_PHYSCOND_CATEGORY)).toEqual([
            "trait",
            "impediment",
            "debility",
        ]);
    });

    it("a physical condition carries a category but no injury level, aspect, or body location", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.PHYSICAL_CONDITION,
            category: TRAUMA_PHYSCOND_CATEGORY.TRAIT,
            levelBase: null,
            aspect: null,
            bodyLocationCode: null,
        });
        logic.initialize();
        logic.evaluate();
        expect(logic.data.subType).toBe("physcond");
        expect(logic.data.category).toBe("trait");
        // A null level seeds a base of 0 (no NaN) rather than throwing.
        expect(logic.level.base).toBe(0);
        // No body location code → whole-body / not location-bound.
        expect(logic.bodyLocation).toBeUndefined();
    });

    it("a psychological condition preserves its category and tolerates a null level", () => {
        const logic = makeTrauma({
            subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
            category: TRAUMA_PSYCOND_CATEGORY.QUIRK,
            levelBase: null,
            aspect: null,
            bodyLocationCode: null,
        });
        logic.initialize();
        expect(logic.data.subType).toBe("psycond");
        expect(logic.data.category).toBe("quirk");
        expect(logic.level.base).toBe(0);
    });
});
