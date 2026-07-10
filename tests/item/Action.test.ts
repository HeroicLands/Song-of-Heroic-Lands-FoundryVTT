import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    SohlAction,
    userMeetsExecutePermission,
    isScriptActionMutationAllowed,
} from "@src/entity/action/SohlAction";
import { ACTION_SUBTYPE } from "@src/utils/constants";
import * as ContextMenuEntryModule from "@src/apps/logic/ContextMenuEntry";
// Resolves to the mock-swapped shim in tests (vitest.config.ts alias); spy on
// it instead of poking raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/** Foundry `CONST.DOCUMENT_OWNERSHIP_LEVELS` mirror for test readability. */
const OWNERSHIP = { NONE: 0, LIMITED: 1, OBSERVER: 2, OWNER: 3 } as const;

/**
 * Build a stub actor whose `testUserPermission` returns the given result
 * regardless of arguments. The default `documentName: "Actor"` lets the
 * stub serve as the owning document `SohlAction.resolveContext` walks to
 * (action → logic → data model → document).
 */
function stubActor(allow: boolean): any {
    return {
        documentName: "Actor",
        testUserPermission: () => allow,
    };
}

function makeActionData(
    overrides: Partial<SohlAction.Data> = {},
): SohlAction.Data {
    return {
        subType: "intrinsic",
        title: "test-action",
        scope: "self",
        executor: "",
        trigger: "true",
        visible: "true",
        iconFAClass: "sohl-question",
        group: "general",
        minActorOwnership: 3,
        ...overrides,
    } as SohlAction.Data;
}

/**
 * Build a stub parent Logic for a {@link SohlAction}. `resolveContext()` walks
 * action → logic → data model → document, so the owning `doc` sits two levels
 * below the Logic: `logic.parent` is the data model, whose `.parent` is the
 * document.
 */
function stubLogic(doc?: any): any {
    return { parent: { parent: doc } };
}

function makeAction(overrides: Partial<SohlAction.Data> = {}): SohlAction {
    return new SohlAction(makeActionData(overrides), { parent: stubLogic() });
}

/**
 * Build an action whose `resolveContext()` will surface the given actor
 * — i.e. the parent Logic's backing document mimics a `SohlActor`.
 */
function makeActionOnActor(
    actor: any,
    overrides: Partial<SohlAction.Data> = {},
): SohlAction {
    return new SohlAction(makeActionData(overrides), {
        parent: stubLogic(actor),
    });
}

function mockElement(opts: { itemId?: string } = {}): HTMLElement {
    const closest = (selector: string): HTMLElement | null => {
        if (selector === "[data-item-id]" && opts.itemId) {
            return {
                dataset: { itemId: opts.itemId },
            } as unknown as HTMLElement;
        }
        return null;
    };
    return { closest } as unknown as HTMLElement;
}

describe("SohlAction.visible", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        warnSpy = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("returns true when source is 'true'", () => {
        const action = makeAction({ visible: "true" });
        expect(action.visible(mockElement())).toBe(true);
    });

    it("returns false when source is 'false'", () => {
        const action = makeAction({ visible: "false" });
        expect(action.visible(mockElement())).toBe(false);
    });

    it("defaults missing source to 'true'", () => {
        const action = makeAction({ visible: "" });
        expect(action.visible(mockElement())).toBe(true);
    });

    it("exposes element to the expression", () => {
        const action = makeAction({ visible: "defined(element)" });
        expect(action.visible(mockElement())).toBe(true);
    });

    it("resolves item lazily from a [data-item-id] ancestor", () => {
        const action = makeAction({ visible: "defined(item)" });
        // No data-item-id ancestor → item is undefined.
        expect(action.visible(mockElement())).toBe(false);
    });

    it("exposes isGM, true when the current user is a GM", () => {
        const userSpy = vi
            .spyOn(FoundryHelpers, "fvttCurrentUser")
            .mockReturnValue({ isGM: true } as any);
        const action = makeAction({ visible: "isGM" });
        expect(action.visible(mockElement())).toBe(true);
        userSpy.mockRestore();
    });

    it("exposes isGM, false when the current user is not a GM", () => {
        const userSpy = vi
            .spyOn(FoundryHelpers, "fvttCurrentUser")
            .mockReturnValue({ isGM: false } as any);
        const action = makeAction({ visible: "isGM" });
        expect(action.visible(mockElement())).toBe(false);
        userSpy.mockRestore();
    });

    it("returns false (hidden) on compile error and warns", () => {
        const action = makeAction({
            visible: "item.logic.hasAttr('per')", // method call — rejected
        });
        expect(action.visible(mockElement())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to compile"),
            expect.objectContaining({ action: "test-action" }),
        );
    });

    it("returns false (hidden) on evaluation error and warns", () => {
        const action = makeAction({ visible: "matches('x', '[')" });
        expect(action.visible(mockElement())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("threw"),
            expect.objectContaining({ action: "test-action" }),
        );
    });
});

describe("SohlAction.trigger", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        warnSpy = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("returns true when source is 'true'", () => {
        const action = makeAction({ trigger: "true" });
        expect(action.trigger()).toBe(true);
    });

    it("returns false when source is 'false'", () => {
        const action = makeAction({ trigger: "false" });
        expect(action.trigger()).toBe(false);
    });

    it("defaults missing source to 'true'", () => {
        const action = makeAction({ trigger: "" });
        expect(action.trigger()).toBe(true);
    });

    it("exposes item and actor to the expression", () => {
        const action = makeAction({
            trigger: "defined(item) && defined(actor)",
        });
        const item = { type: "skill" } as any;
        const actor = { type: "character" } as any;
        expect(action.trigger(item, actor)).toBe(true);
        expect(action.trigger(item)).toBe(false);
        expect(action.trigger(undefined, actor)).toBe(false);
        expect(action.trigger()).toBe(false);
    });

    it("can read properties via lazy member access", () => {
        const action = makeAction({
            trigger: "item.type === 'skill' && actor.type === 'character'",
        });
        expect(
            action.trigger(
                { type: "skill" } as any,
                { type: "character" } as any,
            ),
        ).toBe(true);
        expect(
            action.trigger(
                { type: "gear" } as any,
                { type: "character" } as any,
            ),
        ).toBe(false);
    });

    it("returns false (inactive) on compile error and warns", () => {
        const action = makeAction({ trigger: "item.method('x')" });
        expect(action.trigger()).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to compile"),
            expect.objectContaining({ action: "test-action" }),
        );
    });
});

describe("SohlAction.visible composes with trigger and permission", () => {
    it("returns false when trigger is false even if visible source is true", () => {
        const action = makeAction({
            visible: "true",
            trigger: "false",
        });
        expect(action.visible(mockElement())).toBe(false);
    });

    it("returns true when both visible source and trigger are true", () => {
        const action = makeAction({
            visible: "true",
            trigger: "true",
        });
        expect(action.visible(mockElement())).toBe(true);
    });

    it("skips the trigger check when visible source is false", () => {
        // trigger="missing" would throw on eval; we should never reach it
        // because visible source is false and short-circuits.
        const action = makeAction({
            visible: "false",
            trigger: "missing",
        });
        expect(action.visible(mockElement())).toBe(false);
    });

    it("hides SCRIPT action when actor.testUserPermission denies the level", () => {
        const restore = vi
            .spyOn(ContextMenuEntryModule, "resolveContextActor")
            .mockReturnValue(stubActor(false));
        try {
            const action = makeAction({
                subType: ACTION_SUBTYPE.SCRIPT,
                visible: "true",
                trigger: "true",
                minActorOwnership: OWNERSHIP.OWNER,
            });
            expect(action.visible(mockElement())).toBe(false);
        } finally {
            restore.mockRestore();
        }
    });

    it("shows SCRIPT action when actor.testUserPermission allows the level", () => {
        const restore = vi
            .spyOn(ContextMenuEntryModule, "resolveContextActor")
            .mockReturnValue(stubActor(true));
        try {
            const action = makeAction({
                subType: ACTION_SUBTYPE.SCRIPT,
                visible: "true",
                trigger: "true",
                minActorOwnership: OWNERSHIP.OWNER,
            });
            expect(action.visible(mockElement())).toBe(true);
        } finally {
            restore.mockRestore();
        }
    });

    it("does not check permission for Intrinsic action (lifecycle calls work for all users)", () => {
        // Actor would deny via testUserPermission, but Intrinsic bypasses
        // the permission gate.
        const restore = vi
            .spyOn(ContextMenuEntryModule, "resolveContextActor")
            .mockReturnValue(stubActor(false));
        try {
            const action = makeAction({
                subType: ACTION_SUBTYPE.INTRINSIC,
                visible: "true",
                trigger: "true",
                minActorOwnership: OWNERSHIP.OWNER,
            });
            expect(action.visible(mockElement())).toBe(true);
        } finally {
            restore.mockRestore();
        }
    });
});

describe("SohlAction.execute gates on permission then trigger", () => {
    let infoSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        infoSpy = vi
            .spyOn(sohl.log, "info" as any)
            .mockImplementation(() => {});
    });
    afterEach(() => {
        infoSpy.mockRestore();
    });

    it("skips execution when trigger is false (no-op + info log)", async () => {
        const action = makeAction({ trigger: "false" });
        const result = await action.execute({ speaker: {} } as any);
        expect(result).toBeUndefined();
        expect(infoSpy).toHaveBeenCalledWith(
            expect.stringContaining("not triggerable"),
        );
    });

    it("blocks SCRIPT action when actor.testUserPermission denies", async () => {
        const action = makeActionOnActor(stubActor(false), {
            subType: ACTION_SUBTYPE.SCRIPT,
            trigger: "true",
            minActorOwnership: OWNERSHIP.OWNER,
        });
        const result = await action.execute({ speaker: {} } as any);
        expect(result).toBeUndefined();
        expect(infoSpy).toHaveBeenCalledWith(
            expect.stringContaining("blocked by execute permission"),
        );
    });

    it("runs SCRIPT action when actor.testUserPermission allows", async () => {
        const action = makeActionOnActor(stubActor(true), {
            subType: ACTION_SUBTYPE.SCRIPT,
            trigger: "true",
            executor: "",
            minActorOwnership: OWNERSHIP.OWNER,
        });
        await action.execute({ speaker: {} } as any);
        const blocked = infoSpy.mock.calls.filter((args) =>
            String(args[0]).includes("blocked"),
        );
        expect(blocked).toEqual([]);
    });

    it("runs Intrinsic action even when actor.testUserPermission denies", async () => {
        const action = makeActionOnActor(stubActor(false), {
            subType: ACTION_SUBTYPE.INTRINSIC,
            trigger: "true",
            executor: "",
            minActorOwnership: OWNERSHIP.OWNER,
        });
        await action.execute({ speaker: {} } as any);
        const blocked = infoSpy.mock.calls.filter((args) =>
            String(args[0]).includes("blocked"),
        );
        expect(blocked).toEqual([]);
    });
});

describe("SohlAction SCRIPT action runs a referenced Macro (no compiled code)", () => {
    let infoSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        infoSpy = vi
            .spyOn(sohl.log, "info" as any)
            .mockImplementation(() => {});
    });
    afterEach(() => {
        infoSpy.mockRestore();
        vi.restoreAllMocks();
    });

    const MACRO_UUID = "Macro.abcdef0123456789";

    it("executes the referenced Macro via the shim, passing the action scope", async () => {
        const macroSpy = vi
            .spyOn(FoundryHelpers, "fvttExecuteMacro")
            .mockResolvedValue("macro-ran");
        const actor = stubActor(true);
        const action = makeActionOnActor(actor, {
            subType: ACTION_SUBTYPE.SCRIPT,
            executor: MACRO_UUID,
            trigger: "true",
            minActorOwnership: OWNERSHIP.OWNER,
        });
        const ctx = { speaker: { alias: "Gwen" } } as any;
        const result = await action.execute(ctx);

        expect(macroSpy).toHaveBeenCalledTimes(1);
        const [uuidArg, scopeArg] = macroSpy.mock.calls[0];
        expect(uuidArg).toBe(MACRO_UUID);
        // The action context is exposed to the macro as `sohlContext`, not
        // `scope` — the latter collides with Foundry's fixed macro parameter.
        expect(scopeArg).toEqual(
            expect.objectContaining({ actor, sohlContext: ctx }),
        );
        expect(result).toBe("macro-ran");
    });

    it("never compiles the executor string as code — an invalid-JS executor does not throw at construction", () => {
        // The old textToFunction path threw when compiling invalid JS. A macro
        // reference is opaque data, so construction must not parse it as code.
        expect(() =>
            makeAction({
                subType: ACTION_SUBTYPE.SCRIPT,
                executor: "}{ this is not valid javascript (",
            }),
        ).not.toThrow();
    });

    it("still enforces execute permission before running the macro", async () => {
        const macroSpy = vi
            .spyOn(FoundryHelpers, "fvttExecuteMacro")
            .mockResolvedValue(undefined);
        const action = makeActionOnActor(stubActor(false), {
            subType: ACTION_SUBTYPE.SCRIPT,
            executor: MACRO_UUID,
            trigger: "true",
            minActorOwnership: OWNERSHIP.OWNER,
        });
        const result = await action.execute({ speaker: {} } as any);
        expect(result).toBeUndefined();
        expect(macroSpy).not.toHaveBeenCalled();
        expect(infoSpy).toHaveBeenCalledWith(
            expect.stringContaining("blocked by execute permission"),
        );
    });
});

describe("userMeetsExecutePermission", () => {
    it("returns false when actor is null", () => {
        expect(userMeetsExecutePermission(makeActionData(), null)).toBe(false);
    });

    it("returns false when actor.testUserPermission denies", () => {
        expect(
            userMeetsExecutePermission(
                makeActionData({ minActorOwnership: OWNERSHIP.OWNER }),
                stubActor(false),
            ),
        ).toBe(false);
    });

    it("returns true when actor.testUserPermission allows", () => {
        expect(
            userMeetsExecutePermission(
                makeActionData({ minActorOwnership: OWNERSHIP.OWNER }),
                stubActor(true),
            ),
        ).toBe(true);
    });

    it("passes the configured minActorOwnership to testUserPermission", () => {
        const user = { isGM: false } as any;
        const userSpy = vi
            .spyOn(FoundryHelpers, "fvttCurrentUser")
            .mockReturnValue(user);
        const spy = vi.fn().mockReturnValue(true);
        const actor = { testUserPermission: spy } as any;
        userMeetsExecutePermission(
            makeActionData({ minActorOwnership: OWNERSHIP.OBSERVER }),
            actor,
        );
        expect(spy).toHaveBeenCalledWith(user, OWNERSHIP.OBSERVER);
        userSpy.mockRestore();
    });

    it("defaults to OWNER when minActorOwnership is missing", () => {
        const spy = vi.fn().mockReturnValue(true);
        const actor = { testUserPermission: spy } as any;
        const data = makeActionData();
        delete (data as any).minActorOwnership;
        userMeetsExecutePermission(data, actor);
        expect(spy).toHaveBeenCalledWith(expect.anything(), OWNERSHIP.OWNER);
    });
});

describe("isScriptActionMutationAllowed", () => {
    const intrinsic = (title: string): SohlAction.Data =>
        makeActionData({
            title,
            subType: ACTION_SUBTYPE.INTRINSIC,
        });
    const script = (title: string, body = "1"): SohlAction.Data =>
        makeActionData({
            title,
            subType: ACTION_SUBTYPE.SCRIPT,
            executor: body,
        });

    it("GM may mutate freely", () => {
        const user = { isGM: true };
        expect(
            isScriptActionMutationAllowed([script("a")], [script("b")], user),
        ).toBe(true);
        expect(isScriptActionMutationAllowed([script("a")], [], user)).toBe(
            true,
        );
    });

    it("non-GM may add/remove/modify non-SCRIPT_ACTION entries", () => {
        const user = { isGM: false };
        expect(
            isScriptActionMutationAllowed(
                [intrinsic("a")],
                [intrinsic("a"), intrinsic("b")],
                user,
            ),
        ).toBe(true);
        expect(isScriptActionMutationAllowed([intrinsic("a")], [], user)).toBe(
            true,
        );
    });

    it("non-GM cannot add a SCRIPT_ACTION", () => {
        const user = { isGM: false };
        expect(isScriptActionMutationAllowed([], [script("a")], user)).toBe(
            false,
        );
    });

    it("non-GM cannot remove a SCRIPT_ACTION", () => {
        const user = { isGM: false };
        expect(isScriptActionMutationAllowed([script("a")], [], user)).toBe(
            false,
        );
    });

    it("non-GM cannot modify a SCRIPT_ACTION's body", () => {
        const user = { isGM: false };
        expect(
            isScriptActionMutationAllowed(
                [script("a", "1")],
                [script("a", "1 + 1")],
                user,
            ),
        ).toBe(false);
    });

    it("non-GM may pass through when SCRIPT_ACTION set is unchanged", () => {
        const user = { isGM: false };
        const s = script("a");
        expect(isScriptActionMutationAllowed([s], [s], user)).toBe(true);
        // Adding a non-script entry alongside an unchanged script is fine.
        expect(
            isScriptActionMutationAllowed([s], [s, intrinsic("b")], user),
        ).toBe(true);
    });
});

describe("ActionLogic", () => {
    describe("constructor / properties", () => {
        it.todo("executor - is assigned during initialize");
        it("trigger - is assigned during initialize", () => {
            const action = makeAction({ trigger: "true" });
            expect(typeof action.trigger).toBe("function");
        });
        it("visible - is assigned during initialize", () => {
            const action = makeAction({ visible: "true" });
            expect(typeof action.visible).toBe("function");
        });
    });

    describe("execute", () => {
        it.todo("calls executor with the provided action context");
        it.todo("returns a Promise wrapping the executor result");
    });

    describe("initialize", () => {
        it.todo(
            "sets visible to a function returning true when data.visible is 'true'",
        );
        it.todo("creates trigger function from data.trigger text");
        it.todo("resolves executor to self when scope is SELF");
        it.todo("resolves executor to parent item logic when scope is ITEM");
        it.todo("resolves executor to owning actor logic when scope is ACTOR");
        it.todo("throws when scope is unknown");
        it.todo(
            "binds intrinsic action executor to the named method on target",
        );
        it.todo("throws when intrinsic action method does not exist on target");
        it.todo(
            "runs the referenced Foundry Macro for a Script action's executor",
        );
        it.todo("sets executor to a no-op when data.executor is empty");
    });

    describe("evaluate", () => {
        it.todo("calls super.evaluate");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("ActionDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType as a StringField with ActionSubTypes choices");
        it.todo("defines title as a StringField");
        it.todo("defines scope as a StringField with SohlActionScopes choices");
        it.todo("defines executor as a StringField");
        it.todo("defines trigger as a StringField");
        it.todo("defines visible as a StringField defaulting to 'true'");
        it.todo("defines iconFAClass as a StringField");
        it.todo(
            "defines group as a StringField with context menu sort group choices",
        );
        it.todo("defines minActorOwnership as a NumberField (0..3, init 3)");
    });

    describe("prepareBaseData", () => {
        it.todo("defaults title to item name when title is blank");
    });
});
