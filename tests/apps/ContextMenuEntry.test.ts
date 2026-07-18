import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    compileCondition,
    compileMenuEntry,
    makeConditionContext,
    resolveContextItem,
    resolveContextActor,
} from "@src/apps/logic/ContextMenuEntry";

// String conditions compile to a SafeExpression, which (as a SohlEntity)
// requires an owning parent logic. A truthy stand-in is enough here.
const mockParent = { id: "test" } as any;

/** compileCondition with the mock parent supplied (for string conditions). */
const cond = (
    source: string,
    entryName: string,
): ((target: HTMLElement) => boolean) =>
    compileCondition(source, entryName, mockParent);

interface RowSpec {
    itemId?: string;
    actorId?: string;
}

/**
 * Build a mock HTMLElement whose `closest()` returns mock ancestor rows
 * for `[data-item-id]` and `[data-actor-id]` queries.
 */
function mockTarget(
    opts: { item?: RowSpec; actor?: RowSpec } = {},
): HTMLElement {
    const closest = (selector: string): HTMLElement | null => {
        if (selector === "[data-item-id]" && opts.item) {
            return {
                dataset: { itemId: opts.item.itemId },
            } as unknown as HTMLElement;
        }
        if (selector === "[data-actor-id]" && opts.actor) {
            return {
                dataset: { actorId: opts.actor.actorId },
            } as unknown as HTMLElement;
        }
        return null;
    };
    return { closest } as unknown as HTMLElement;
}

describe("compileCondition", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        warnSpy = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("compiles 'true' to a predicate that returns true", () => {
        const fn = cond("true", "always-show");
        expect(fn(mockTarget())).toBe(true);
    });

    it("compiles 'false' to a predicate that returns false", () => {
        const fn = cond("false", "never-show");
        expect(fn(mockTarget())).toBe(false);
    });

    it("makes target available to the expression", () => {
        const fn = cond("defined(target)", "target-check");
        expect(fn(mockTarget())).toBe(true);
    });

    it("returns false (hidden) when itemLogic is not present", () => {
        const fn = cond("defined(itemLogic)", "needs-item");
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false (hidden) when actorLogic is not present", () => {
        const fn = cond("defined(actorLogic)", "needs-actor");
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false on compile error and warns", () => {
        const fn = cond("item.logic.hasAttr('per')", "bad-source");
        expect(fn(mockTarget())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to compile"),
            expect.objectContaining({ entry: "bad-source" }),
        );
    });

    it("returns false on evaluation error and warns", () => {
        // matches() throws on an invalid regex pattern
        const fn = cond("matches('x', '[')", "bad-eval");
        expect(fn(mockTarget())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("threw"),
            expect.objectContaining({ entry: "bad-eval" }),
        );
    });
});

describe("compileMenuEntry", () => {
    const baseEntry = (over: Record<string, unknown> = {}): any => ({
        id: "e1",
        name: "Entry",
        group: "primary",
        icon: "<i></i>",
        condition: "true",
        callback: () => {},
        ...over,
    });

    it("emits a `visible` predicate and drops the legacy `condition` key", () => {
        // Foundry v14 deprecated ContextMenuEntry#condition in favor of
        // #visible; the compiled entry must carry the new key and NOT the old
        // one, or Foundry's ContextMenu logs a compatibility warning.
        const compiled = compileMenuEntry(baseEntry(), mockParent);
        expect(typeof compiled.visible).toBe("function");
        expect("condition" in compiled).toBe(false);
    });

    it("visible reflects the compiled string condition", () => {
        expect(
            compileMenuEntry(baseEntry({ condition: "true" }), mockParent)
                .visible(mockTarget()),
        ).toBe(true);
        expect(
            compileMenuEntry(baseEntry({ condition: "false" }), mockParent)
                .visible(mockTarget()),
        ).toBe(false);
    });

    it("passes a function-form condition through as visible", () => {
        const fn = (): boolean => true;
        expect(compileMenuEntry(baseEntry({ condition: fn })).visible).toBe(fn);
    });

    it("preserves the entry's display fields", () => {
        const compiled = compileMenuEntry(
            baseEntry({ id: "x", name: "Foo", icon: "<b></b>", group: "g" }),
            mockParent,
        );
        expect(compiled.id).toBe("x");
        expect(compiled.name).toBe("Foo");
        expect(compiled.icon).toBe("<b></b>");
        expect(compiled.group).toBe("g");
    });

    it("resolves a default callback from functionName when none is given", () => {
        const compiled = compileMenuEntry(
            baseEntry({ callback: undefined, functionName: "doThing" }),
            mockParent,
        );
        expect(typeof compiled.callback).toBe("function");
    });

    it("throws when an entry has neither callback nor functionName", () => {
        expect(() =>
            compileMenuEntry(
                baseEntry({ callback: undefined, functionName: undefined }),
                mockParent,
            ),
        ).toThrow(/does not have a callback/);
    });
});

describe("makeConditionContext", () => {
    it("exposes target, itemLogic, and actorLogic as own properties", () => {
        const target = mockTarget();
        const ctx = makeConditionContext(target);
        expect(Object.prototype.hasOwnProperty.call(ctx, "target")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "itemLogic")).toBe(
            true,
        );
        expect(Object.prototype.hasOwnProperty.call(ctx, "actorLogic")).toBe(
            true,
        );
        expect(ctx.target).toBe(target);
    });

    it("defines itemLogic and actorLogic as lazy getters", () => {
        const ctx = makeConditionContext(mockTarget());
        const itemDesc = Object.getOwnPropertyDescriptor(ctx, "itemLogic");
        const actorDesc = Object.getOwnPropertyDescriptor(ctx, "actorLogic");
        expect(typeof itemDesc?.get).toBe("function");
        expect(typeof actorDesc?.get).toBe("function");
    });

    it("does not resolve itemLogic when the expression never references it", () => {
        // Resolution starts with a DOM walk; if the expression never touches
        // `itemLogic`, the lazy getter must never trigger that walk.
        const target = mockTarget();
        const closestSpy = vi.spyOn(target, "closest");
        const fn = cond("true", "no-item");
        fn(target);
        expect(closestSpy).not.toHaveBeenCalledWith("[data-item-id]");
    });

    it("resolves itemLogic only when the expression references it", () => {
        const target = mockTarget();
        const closestSpy = vi.spyOn(target, "closest");
        const fn = cond("defined(itemLogic)", "uses-item");
        fn(target);
        expect(closestSpy).toHaveBeenCalledWith("[data-item-id]");
    });
});

describe("resolveContextItem / resolveContextActor", () => {
    it("returns undefined when target has no data-item-id ancestor", () => {
        expect(resolveContextItem(mockTarget())).toBeUndefined();
    });

    it("returns undefined when target has no data-actor-id ancestor", () => {
        expect(resolveContextActor(mockTarget())).toBeUndefined();
    });

    it("returns undefined when actor lookup fails even with data-item-id", () => {
        // No actor row → resolveContextActor returns undefined → item lookup
        // short-circuits
        expect(
            resolveContextItem(mockTarget({ item: { itemId: "abc123" } })),
        ).toBeUndefined();
    });
});
