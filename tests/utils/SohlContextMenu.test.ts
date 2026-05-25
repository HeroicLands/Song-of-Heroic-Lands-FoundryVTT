import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SohlContextMenu } from "@src/utils/SohlContextMenu";

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

describe("SohlContextMenu.compileCondition", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        warnSpy = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("compiles 'true' to a predicate that returns true", () => {
        const fn = SohlContextMenu.compileCondition("true", "always-show");
        expect(fn(mockTarget())).toBe(true);
    });

    it("compiles 'false' to a predicate that returns false", () => {
        const fn = SohlContextMenu.compileCondition("false", "never-show");
        expect(fn(mockTarget())).toBe(false);
    });

    it("makes target available to the expression", () => {
        const fn = SohlContextMenu.compileCondition(
            "defined(target)",
            "target-check",
        );
        expect(fn(mockTarget())).toBe(true);
    });

    it("returns false (hidden) when item is not present", () => {
        const fn = SohlContextMenu.compileCondition(
            "defined(item)",
            "needs-item",
        );
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false (hidden) when actor is not present", () => {
        const fn = SohlContextMenu.compileCondition(
            "defined(actor)",
            "needs-actor",
        );
        expect(fn(mockTarget())).toBe(false);
    });

    it("returns false on compile error and warns", () => {
        const fn = SohlContextMenu.compileCondition(
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
        const fn = SohlContextMenu.compileCondition(
            "matches('x', '[')",
            "bad-eval",
        );
        expect(fn(mockTarget())).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("threw"),
            expect.objectContaining({ entry: "bad-eval" }),
        );
    });
});

describe("SohlContextMenu.makeConditionContext", () => {
    it("exposes target, item, and actor as own properties", () => {
        const target = mockTarget();
        const ctx = SohlContextMenu.makeConditionContext(target);
        expect(Object.prototype.hasOwnProperty.call(ctx, "target")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "item")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "actor")).toBe(true);
        expect(ctx.target).toBe(target);
    });

    it("defines item and actor as lazy getters", () => {
        const ctx = SohlContextMenu.makeConditionContext(mockTarget());
        const itemDesc = Object.getOwnPropertyDescriptor(ctx, "item");
        const actorDesc = Object.getOwnPropertyDescriptor(ctx, "actor");
        expect(typeof itemDesc?.get).toBe("function");
        expect(typeof actorDesc?.get).toBe("function");
    });

    it("does not resolve item when the expression never references it", () => {
        const resolveSpy = vi.spyOn(SohlContextMenu, "resolveItem");
        try {
            const fn = SohlContextMenu.compileCondition("true", "no-item");
            fn(mockTarget());
            expect(resolveSpy).not.toHaveBeenCalled();
        } finally {
            resolveSpy.mockRestore();
        }
    });

    it("resolves item only when the expression references it", () => {
        const resolveSpy = vi.spyOn(SohlContextMenu, "resolveItem");
        try {
            const fn = SohlContextMenu.compileCondition(
                "defined(item)",
                "uses-item",
            );
            fn(mockTarget());
            expect(resolveSpy).toHaveBeenCalledTimes(1);
        } finally {
            resolveSpy.mockRestore();
        }
    });
});

describe("SohlContextMenu.resolveItem / resolveActor", () => {
    it("returns undefined when target has no data-item-id ancestor", () => {
        expect(SohlContextMenu.resolveItem(mockTarget())).toBeUndefined();
    });

    it("returns undefined when target has no data-actor-id ancestor", () => {
        expect(SohlContextMenu.resolveActor(mockTarget())).toBeUndefined();
    });

    it("returns undefined when actor lookup fails even with data-item-id", () => {
        // No actor row → resolveActor returns undefined → item lookup short-circuits
        expect(
            SohlContextMenu.resolveItem(
                mockTarget({ item: { itemId: "abc123" } }),
            ),
        ).toBeUndefined();
    });
});
