import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    compileCondition,
    compileMenuEntry,
    makeConditionContext,
    makeLogicMethodCallback,
    resolveContextItem,
    resolveContextActor,
} from "@src/apps/logic/ContextMenuEntry";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { makeMockSpeaker } from "@tests/mocks/logicHarness";

// String conditions compile to a SafeExpression, which (as a SohlEntity)
// requires an owning parent logic. A truthy stand-in is enough here.
const mockParent = { id: "test" } as any;

/** compileCondition with the mock parent supplied (for string conditions). */
const cond = (source: string, entryName: string): ((target: HTMLElement) => boolean) =>
    compileCondition(source, entryName, mockParent);

interface RowSpec {
    itemId?: string;
    actorId?: string;
    uuid?: string;
}

/**
 * Build a mock HTMLElement whose `closest()` returns mock ancestor rows
 * for `[data-item-id]` and `[data-actor-id]` queries.
 */
function mockTarget(opts: { item?: RowSpec; actor?: RowSpec } = {}): HTMLElement {
    const closest = (selector: string): HTMLElement | null => {
        if (selector === "[data-item-id]" && opts.item) {
            return {
                dataset: {
                    itemId: opts.item.itemId,
                    uuid: opts.item.uuid,
                },
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
            compileMenuEntry(baseEntry({ condition: "true" }), mockParent).visible(mockTarget()),
        ).toBe(true);
        expect(
            compileMenuEntry(baseEntry({ condition: "false" }), mockParent).visible(mockTarget()),
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
        expect(Object.prototype.hasOwnProperty.call(ctx, "itemLogic")).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(ctx, "actorLogic")).toBe(true);
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
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns undefined when target has no data-item-id ancestor", () => {
        expect(resolveContextItem(mockTarget())).toBeUndefined();
    });

    it("returns undefined when target has no data-actor-id ancestor", () => {
        expect(resolveContextActor(mockTarget())).toBeUndefined();
    });

    it("returns undefined when the row carries neither a resolvable actor nor a uuid", () => {
        expect(resolveContextItem(mockTarget({ item: { itemId: "abc123" } }))).toBeUndefined();
    });

    describe("data-uuid fallback (#1132)", () => {
        it("resolves the item from the row's data-uuid when no actor marker is present", () => {
            const item = { documentName: "Item", id: "abc123" } as any;
            const resolve = vi.spyOn(FoundryHelpersMock, "fvttResolveUuid").mockReturnValue(item);

            expect(
                resolveContextItem(
                    mockTarget({
                        item: {
                            itemId: "abc123",
                            uuid: "Actor.act1.Item.abc123",
                        },
                    }),
                ),
            ).toBe(item);
            expect(resolve).toHaveBeenCalledWith("Actor.act1.Item.abc123");
        });

        it("resolves the actor from the uuid-resolved item's owner", () => {
            const actor = { documentName: "Actor", id: "act1" } as any;
            vi.spyOn(FoundryHelpersMock, "fvttResolveUuid").mockReturnValue({
                documentName: "Item",
                id: "abc123",
                actor,
            } as any);

            expect(
                resolveContextActor(
                    mockTarget({
                        item: {
                            itemId: "abc123",
                            uuid: "Actor.act1.Item.abc123",
                        },
                    }),
                ),
            ).toBe(actor);
        });

        it("prefers the actor-embedded lookup over the uuid fallback", () => {
            const embedded = { documentName: "Item", id: "abc123" } as any;
            const actor = {
                documentName: "Actor",
                id: "act1",
                items: new Map([["abc123", embedded]]),
            } as any;
            vi.spyOn(FoundryHelpersMock, "fvttGetActor").mockReturnValue(actor);
            const resolve = vi
                .spyOn(FoundryHelpersMock, "fvttResolveUuid")
                .mockReturnValue({ documentName: "Item", id: "other" } as any);

            expect(
                resolveContextItem(
                    mockTarget({
                        item: {
                            itemId: "abc123",
                            uuid: "Actor.act1.Item.abc123",
                        },
                        actor: { actorId: "act1" },
                    }),
                ),
            ).toBe(embedded);
            expect(resolve).not.toHaveBeenCalled();
        });

        it("ignores a data-uuid that does not resolve to an Item", () => {
            vi.spyOn(FoundryHelpersMock, "fvttResolveUuid").mockReturnValue({
                documentName: "Actor",
                id: "act1",
            } as any);

            expect(
                resolveContextItem(
                    mockTarget({
                        item: { itemId: "abc123", uuid: "Actor.act1" },
                    }),
                ),
            ).toBeUndefined();
        });
    });
});

/**
 * #1188 — `makeLogicMethodCallback` is the fallback callback for an entry that
 * names a `functionName` but supplies no `callback`. Its resolver guarded on
 * `data-effect-id` (an *effect* marker) before an *item* lookup and then passed
 * the row's bare `data-item-id` to a UUID resolver, so the item never resolved
 * and the click was skipped with a warn. It now shares the one resolution path
 * every other context-menu consumer uses.
 */
describe("makeLogicMethodCallback (#1188)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    /** An item row whose logic records the method calls made on it. */
    function itemWithLogic(): { item: any; calls: unknown[] } {
        const calls: unknown[] = [];
        const item: any = {
            documentName: "Item",
            id: "abc123",
            logic: {
                // A real logic always resolves a speaker (blank when the item
                // is unowned); the context refuses to build without one.
                speaker: makeMockSpeaker(),
                doTheThing(ctx: unknown) {
                    calls.push(ctx);
                },
            },
        };
        return { item, calls };
    }

    it("invokes the named method on the item resolved through the actor row", () => {
        const { item, calls } = itemWithLogic();
        const actor = {
            documentName: "Actor",
            id: "act1",
            items: new Map([["abc123", item]]),
            getSpeaker: () => undefined,
        } as any;
        item.actor = actor;
        vi.spyOn(FoundryHelpersMock, "fvttGetActor").mockReturnValue(actor);
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});

        makeLogicMethodCallback(
            "doTheThing",
            "Do The Thing",
        )(
            mockTarget({
                item: { itemId: "abc123" },
                actor: { actorId: "act1" },
            }),
        );

        expect(calls).toHaveLength(1);
        expect(warn).not.toHaveBeenCalled();
    });

    it("invokes the named method on a world item resolved by the row's data-uuid", () => {
        const { item, calls } = itemWithLogic();
        vi.spyOn(FoundryHelpersMock, "fvttResolveUuid").mockReturnValue(item);
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});

        makeLogicMethodCallback(
            "doTheThing",
            "Do The Thing",
        )(mockTarget({ item: { itemId: "abc123", uuid: "Item.abc123" } }));

        expect(calls).toHaveLength(1);
        expect(warn).not.toHaveBeenCalled();
    });

    it("warns when the resolved logic has no such method", () => {
        const { item } = itemWithLogic();
        vi.spyOn(FoundryHelpersMock, "fvttResolveUuid").mockReturnValue(item);
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});

        makeLogicMethodCallback(
            "missingMethod",
            "Missing",
        )(mockTarget({ item: { itemId: "abc123", uuid: "Item.abc123" } }));

        expect(warn).toHaveBeenCalledOnce();
    });
});
