import {
    MasteryLevelModifier,
    getStandardSuccessValueTable,
} from "@src/entity/modifier/MasteryLevelModifier";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    describe,
    it,
    expect,
    vi,
    afterEach,
    beforeEach,
    type MockInstance,
} from "vitest";
import { defaultToJSON, defaultFromJSON } from "@src/utils/helpers";
import { BRAND, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { makeItemLogic } from "@tests/mocks/logicHarness";

// Stand-in owning logic carrying the SohlLogic brand.
const parent = {
    id: "p",
    name: "Skill",
    label: "Skill",
    data: { kind: "skill" },
    [BRAND.SohlLogic]: true,
} as any;

describe("MasteryLevelModifier", () => {
    describe("toJSON / serialization", () => {
        it("round-trips the test-resolution parameters", () => {
            const ml = new MasteryLevelModifier(
                {
                    baseValue: 50,
                    minTarget: 5,
                    maxTarget: 95,
                    successLevelMod: 1,
                    critFailureDigits: [0],
                    critSuccessDigits: [5],
                    type: "skill-test",
                    title: "Test",
                } as any,
                { parent },
            );
            const revived = defaultFromJSON(
                JSON.parse(JSON.stringify(defaultToJSON(ml))),
                { parent },
            ) as MasteryLevelModifier;
            expect(revived).toBeInstanceOf(MasteryLevelModifier);
            expect(revived.base).toBe(50);
            expect(revived.minTarget).toBe(5);
            expect(revived.maxTarget).toBe(95);
            expect(revived.successLevelMod).toBe(1);
            expect(revived.critFailureDigits).toEqual([0]);
            expect(revived.critSuccessDigits).toEqual([5]);
            expect(revived.type).toBe("skill-test");
            expect(revived.title).toBe("Test");
        });
    });

    describe("constructor", () => {
        it.todo(
            "creates an instance with default values when no data provided",
        );
        it.todo("throws when constructed without a parent");
        it.todo("initializes minTarget and maxTarget from data");
        it.todo("initializes successLevelMod from data");
        it.todo(
            "initializes critFailureDigits and critSuccessDigits from data",
        );
        it.todo("initializes testDescTable and svTable from data or defaults");
        it.todo("constructs type from parent.data.kind and parent.name");
        it.todo("constructs title from localized format string");
    });

    describe("constrainedEffective", () => {
        it.todo("clamps effective between minTarget and maxTarget");
        it.todo("returns effective when within bounds");
        it.todo("returns minTarget when effective is below");
        it.todo("returns maxTarget when effective is above");
    });

    describe("successTest", () => {
        it.todo("creates a SuccessTestResult with mlMod clone");
        it.todo("shows dialog when skipDialog is false");
        it.todo("skips dialog when skipDialog is true");
        it.todo("returns null when dialog is cancelled");
        it.todo("returns false when evaluate fails");
        it.todo("returns the test result on success");
        it.todo("applies situational modifier from dialog form data");
        it.todo("uses priorTestResult when provided in context scope");
    });

    describe("successValueTest", () => {
        it.todo("delegates to successTest");
        it.todo("returns null/false when successTest returns null/false");
    });

    describe("opposedTestStart", () => {
        it.todo("requires a targeted token when no priorTestResult");
        it.todo("returns null when no target token is available");
        it.todo("performs source success test");
        it.todo("creates OpposedTestResult with source test result");
        it.todo("sends result to chat");
    });

    describe("opposedTestResume", () => {
        it.todo("throws when priorTestResult is not provided");
        it.todo(
            "performs target success test when targetTestResult is missing",
        );
        it.todo(
            "re-displays dialog for both tests when targetTestResult exists",
        );
        it.todo("evaluates the opposed test result");
        it.todo("sends result to chat when allowed and noChat is false");
    });

    describe("inherited ValueModifier behavior", () => {
        it.todo("add, multiply, set, floor, ceiling still work correctly");
        it.todo("effective value calculation includes base and deltas");
    });

    describe("successValueTest (#78)", () => {
        afterEach(() => vi.restoreAllMocks());

        function makeContext(): SohlActionContext {
            return new SohlActionContext({
                speaker: new SohlSpeaker({ alias: "Tester" }),
            });
        }

        function makeML(): MasteryLevelModifier {
            return new MasteryLevelModifier({ baseValue: 50 } as any, {
                parent,
            });
        }

        it("calls successTest with the svTestContext (svTable in scope), not the original context", async () => {
            const ml = makeML();
            const spy = vi
                .spyOn(ml, "successTest")
                .mockResolvedValue(undefined);
            const original = makeContext();
            await ml.successValueTest(original);
            expect(spy).toHaveBeenCalledTimes(1);
            const calledCtx = spy.mock.calls[0][0];
            // Must pass a different context object (svTestContext), not original
            expect(calledCtx).not.toBe(original);
            // The scope must reference the sv-specific table
            expect(calledCtx.scope?.successStarTable).toBe(ml.svTable);
        });

        it("svTestContext.scope.targetValueFunc applies index-offset to the success level", async () => {
            // baseValue=50 → index=5; targetValueFunc(sl) = index + sl - 1
            const ml = makeML();
            const spy = vi
                .spyOn(ml, "successTest")
                .mockResolvedValue(undefined);
            await ml.successValueTest(makeContext());
            const calledCtx = spy.mock.calls[0][0];
            const fn = calledCtx.scope?.targetValueFunc as (
                sl: number,
            ) => number;
            // index(5) + successLevel(2) - 1 = 6
            expect(fn(2)).toBe(6);
        });

        it("returns undefined/false when successTest returns undefined/false", async () => {
            const ml = makeML();
            vi.spyOn(ml, "successTest").mockResolvedValue(false);
            expect(await ml.successValueTest(makeContext())).toBe(false);
            vi.spyOn(ml, "successTest").mockResolvedValue(undefined);
            expect(await ml.successValueTest(makeContext())).toBeUndefined();
        });
    });
});

describe("MasteryLevelModifier.successTest — headless / skipDialog (#551)", () => {
    let toChatSpy: MockInstance<(data?: PlainObject) => Promise<void>>;

    beforeEach(() => {
        // Stub the result's chat output so tests don't touch the chat/roll shims.
        toChatSpy = vi
            .spyOn(SuccessTestResult.prototype, "toChat")
            .mockResolvedValue(undefined);
    });
    afterEach(() => vi.restoreAllMocks());

    /** A real SkillLogic to own the test's entities (result, modifier, roll). */
    function makeParent() {
        return makeItemLogic(
            SkillLogic,
            ITEM_KIND.SKILL,
            { skillBaseFormula: "", masteryLevelBase: 0 },
            {},
        );
    }

    /** A mastery-level modifier of the given base, owned by `parent`. */
    function makeML(parent: any, base = 50): MasteryLevelModifier {
        return new MasteryLevelModifier(
            {
                baseValue: base,
                critSuccessDigits: [0, 5],
                critFailureDigits: [0, 5],
            } as any,
            { parent },
        );
    }

    /**
     * A real {@link SohlSpeaker} the running user owns — the state a GM-fired
     * timed event has. `isOwner` is derived from a token/actor in production, so
     * it is stubbed here. Passed as a genuine SohlSpeaker so SohlActionContext
     * keeps it as-is rather than re-wrapping (which would drop ownership).
     */
    function ownedSpeaker(name = "GM"): SohlSpeaker {
        const speaker = new SohlSpeaker({ alias: name });
        Object.defineProperty(speaker, "isOwner", {
            get: () => true,
            configurable: true,
        });
        return speaker;
    }

    /** A headless action context (skipDialog) with an owned speaker. */
    function ctx(overrides: Record<string, unknown> = {}): SohlActionContext {
        return new SohlActionContext({
            speaker: ownedSpeaker(),
            skipDialog: true,
            ...overrides,
        } as any);
    }

    it("bypasses the dialog when context.skipDialog is set", async () => {
        const dialogSpy = vi.spyOn(FoundryHelpersMock, "dialog");
        const parent = makeParent();
        const result = await makeML(parent).successTest(ctx());
        expect(dialogSpy).not.toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it("opens the dialog when skipDialog is not set", async () => {
        const dialogSpy = vi.spyOn(FoundryHelpersMock, "dialog");
        const parent = makeParent();
        // The mocked dialog resolves to null → the test is treated as cancelled.
        const result = await makeML(parent).successTest(
            ctx({ skipDialog: false }),
        );
        expect(dialogSpy).toHaveBeenCalledTimes(1);
        expect(result).toBeUndefined();
    });

    it("seeds a freshly-rolled d100 (regression: not hardcoded to 99)", async () => {
        const totals = new Set<number>();
        for (let i = 0; i < 40; i++) {
            const parent = makeParent();
            const result = await makeML(parent).successTest(ctx());
            expect(result).toBeTruthy();
            const total = (result as SuccessTestResult).roll.total;
            expect(total).toBeGreaterThanOrEqual(1);
            expect(total).toBeLessThanOrEqual(100);
            totals.add(total);
        }
        // A hardcoded 99 default would yield a single distinct value.
        expect(totals.size).toBeGreaterThan(1);
    });

    it("applies context.scope.situationalModifier when headless", async () => {
        const parent = makeParent();
        const result = await makeML(parent, 50).successTest(
            ctx({ scope: { situationalModifier: -10 } }),
        );
        expect(result).toBeTruthy();
        // base 50 + situational −10 → effective 40.
        expect(
            (result as SuccessTestResult).masteryLevelModifier.effective,
        ).toBe(40);
    });

    it("posts the result to chat on success, but not when noChat is set", async () => {
        await makeML(makeParent()).successTest(ctx());
        expect(toChatSpy).toHaveBeenCalledTimes(1);

        toChatSpy.mockClear();
        await makeML(makeParent()).successTest(ctx({ noChat: true }));
        expect(toChatSpy).not.toHaveBeenCalled();
    });

    it("returns false when the acting speaker is not owned by the running user", async () => {
        // A plain SohlSpeaker with no token/actor is not owned (isOwner false).
        const notOwned = new SohlSpeaker({ alias: "NPC" });
        const result = await makeML(makeParent()).successTest(
            new SohlActionContext({
                speaker: notOwned,
                skipDialog: true,
            } as any),
        );
        expect(result).toBe(false);
    });
});

describe("getStandardSuccessValueTable (#70)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("calls sohl.i18n.localize with SOHL.MasteryLevel.SvTable.* keys", () => {
        const localize = vi.spyOn(sohl.i18n, "localize").mockReturnValue("loc");
        getStandardSuccessValueTable();
        expect(localize).toHaveBeenCalledWith(
            expect.stringMatching(/^SOHL\.MasteryLevel\.SvTable\./),
        );
    });

    it("returns table entries whose label and description come from i18n", () => {
        vi.spyOn(sohl.i18n, "localize").mockReturnValue("translated");
        const table = getStandardSuccessValueTable();
        expect(table.length).toBeGreaterThan(0);
        expect(table.every((e) => e.label === "translated")).toBe(true);
        expect(table.every((e) => e.description === "translated")).toBe(true);
    });

    it("returns entries with required LimitedDescription shape", () => {
        const table = getStandardSuccessValueTable();
        for (const entry of table) {
            expect(typeof entry.maxValue).toBe("number");
            expect(Array.isArray(entry.lastDigits)).toBe(true);
            expect(typeof entry.success).toBe("boolean");
            expect(typeof entry.result).toBe("number");
        }
    });
});
