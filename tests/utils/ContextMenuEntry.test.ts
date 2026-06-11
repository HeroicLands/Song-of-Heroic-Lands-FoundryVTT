import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    compileCondition,
    makeConditionContext,
    resolveContextItem,
    resolveContextActor,
} from "@src/utils/ContextMenuEntry";

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
        const fn = compileCondition("true", "always-show");
        expect(fn(mockTarget())).toBe(true);
    });

    it("compiles 'false' to a predicate that returns false", () => {
        const fn = compileCondition("false", "never-show");
        expect(fn(mockTarget())).toBe(false);
    });

    it("makes target available to the expression", () => {
        const fn = compileCondition("defined(target)", "target-check");
        expect(fn(mockTarget())).toBe(true);
    });

    it("returns false (hidden) when item is not present", () => {
        const fn = compileCondition("defined(item)", "needs-item");
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false (hidden) when actor is not present", () => {
        const fn = compileCondition("defined(actor)", "needs-actor");
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false on compile error and warns", () => {
        const fn = compileCondition(
            "item.logic.hasAttr('per')", // method call — rejected
            "bad-source",
        );
        expect(fn(mockTarget())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to compile"),
            expect.objectContaining({ entry: "bad-source" }),
        );
    });

    it("returns false on evaluation error and warns", () => {
        // matches() throws on an invalid regex pattern
        const fn = compileCondition("matches('x', '[')", "bad-eval");
        expect(fn(mockTarget())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("threw"),
            expect.objectContaining({ entry: "bad-eval" }),
        );
    });
});

describe("makeConditionContext", () => {
    it("exposes target, item, and actor as own properties", () => {
        const target = mockTarget();
        const ctx = makeConditionContext(target);
        expect(Object.prototype.hasOwnProperty.call(ctx, "target")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "item")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "actor")).toBe(true);
        expect(ctx.target).toBe(target);
    });

    it("defines item and actor as lazy getters", () => {
        const ctx = makeConditionContext(mockTarget());
        const itemDesc = Object.getOwnPropertyDescriptor(ctx, "item");
        const actorDesc = Object.getOwnPropertyDescriptor(ctx, "actor");
        expect(typeof itemDesc?.get).toBe("function");
        expect(typeof actorDesc?.get).toBe("function");
    });

    it("does not resolve item when the expression never references it", () => {
        // Resolution starts with a DOM walk; if the expression never touches
        // `item`, the lazy getter must never trigger that walk.
        const target = mockTarget();
        const closestSpy = vi.spyOn(target, "closest");
        const fn = compileCondition("true", "no-item");
        fn(target);
        expect(closestSpy).not.toHaveBeenCalledWith("[data-item-id]");
    });

    it("resolves item only when the expression references it", () => {
        const target = mockTarget();
        const closestSpy = vi.spyOn(target, "closest");
        const fn = compileCondition("defined(item)", "uses-item");
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
