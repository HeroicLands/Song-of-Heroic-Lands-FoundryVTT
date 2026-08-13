import { describe, it, expect, vi, afterEach } from "vitest";
import { SohlItemBaseLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { ContextMenuEntry } from "@src/apps/logic/ContextMenuEntry";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import {
    makeItemLogic,
    makeItemData,
    makeActorLogic,
    makeMockActor,
    makeMockSpeaker,
} from "@tests/mocks/logicHarness";

/**
 * SohlItemBaseLogic / SohlActorBaseLogic are the concrete classes under
 * test: they add only no-op lifecycle methods, so all observed behavior is
 * the SohlLogic base class.
 */

function scriptAction(
    shortcode: string,
    group: string,
): Record<string, unknown> {
    return {
        shortcode,
        subType: ACTION_SUBTYPE.SCRIPT,
        title: `title-${shortcode}`,
        scope: SOHL_ACTION_SCOPE.SELF,
        executor: "",
        trigger: "true",
        visible: "true",
        iconFAClass: "sohl-question",
        group,
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("SohlLogic", () => {
    describe("constructor", () => {
        it("throws when options.parent is not provided", () => {
            expect(() => new SohlItemBaseLogic({}, {})).toThrow(
                /must be constructed with a parent/,
            );
        });

        it("stores the parent data model, aliased as data", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(logic.parent).toBe(logic.data);
            expect(logic.data.kind).toBe("misc");
        });

        it("builds the actions map from intrinsic actions plus actionDefs", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [scriptAction("custom", "general")],
            });
            expect(logic.actions.has("editDocument")).toBe(true);
            expect(logic.actions.has("custom")).toBe(true);
        });
    });

    describe("intrinsic action override", () => {
        it("a script action with an intrinsic's shortcode replaces it in actions", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction(
                        "editDocument",
                        SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
                    ),
                ],
            });
            const editAction = logic.actions.get("editDocument")!;
            expect(editAction.data.subType).toBe(ACTION_SUBTYPE.SCRIPT);
        });

        it("hides the intrinsic: exactly one action and one menu entry per shortcode", () => {
            const baseline = makeItemLogic(SohlItemBaseLogic, "misc");
            const overridden = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction(
                        "editDocument",
                        SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
                    ),
                ],
            });
            // Overriding an intrinsic must not grow the action set.
            expect(overridden.actions.size()).toBe(baseline.actions.size());
            const shortcodes = Array.from(overridden.actions.values()).map(
                (a) => a.shortcode,
            );
            expect(shortcodes.filter((s) => s === "editDocument")).toHaveLength(
                1,
            );
            // The context menu mirrors the deduped set — one entry per action.
            expect(overridden.getContextOptions()).toHaveLength(
                overridden.actions.size(),
            );
        });

        it("executeAction runs the overriding script, never the shadowed intrinsic", async () => {
            const actor = makeMockActor();
            const logic = makeItemLogic(
                SohlItemBaseLogic,
                "misc",
                {
                    actionDefs: [
                        scriptAction(
                            "editDocument",
                            SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
                        ),
                    ],
                },
                { actor },
            );
            const script = logic.actions.get("editDocument")!;
            const scriptSpy = vi
                .spyOn(script, "execute")
                .mockResolvedValue("script-ran");
            // The intrinsic action is never built; its executor method must not
            // be reached through the (now script-only) action dispatch.
            const intrinsicMethodSpy = vi
                .spyOn(logic, "editDocument")
                .mockResolvedValue(undefined);

            const result = await logic.executeAction("editDocument");

            expect(result).toBe("script-ran");
            expect(scriptSpy).toHaveBeenCalledTimes(1);
            expect(intrinsicMethodSpy).not.toHaveBeenCalled();
        });

        it("leaves the shadowed intrinsic's method on the logic so a script can build on it", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction(
                        "editDocument",
                        SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
                    ),
                ],
            });
            // The override hides the intrinsic action, but its capability — the
            // executor method — is untouched, so an overriding macro can call
            // `ctx.thisLogic.editDocument(ctx)` directly.
            expect(typeof logic.editDocument).toBe("function");
        });

        it("leaves non-overridden intrinsics and non-colliding scripts intact", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction(
                        "custom",
                        SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
                    ),
                ],
            });
            expect(logic.actions.get("editDocument")!.data.subType).toBe(
                ACTION_SUBTYPE.INTRINSIC,
            );
            expect(logic.actions.get("custom")!.data.subType).toBe(
                ACTION_SUBTYPE.SCRIPT,
            );
        });
    });

    describe("document accessors", () => {
        it("id / name / type come from the owning document", () => {
            const logic = makeItemLogic(
                SohlItemBaseLogic,
                "misc",
                {},
                { id: "item123", name: "My Item" },
            );
            expect(logic.id).toBe("item123");
            expect(logic.name).toBe("My Item");
            expect(logic.kind).toBe("misc");
        });

        it("item returns the owning item when the data has one", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(logic.item).toBe(logic.data.item);
        });

        it("item throws when the logic is not embedded in an item", () => {
            const logic = makeActorLogic(SohlActorBaseLogic, "being");
            expect(() => logic.item).toThrow(/must be present in an Item/);
        });

        it("actor comes from the data when present (actor logic)", () => {
            const logic = makeActorLogic(SohlActorBaseLogic, "being");
            // SohlActorData does not declare `actor`; the harness's actor
            // data object exposes it as a non-enumerable getter at runtime.
            expect(logic.actor).toBe((logic.data as any).actor);
        });

        it("actor falls back to item.actor for item logic", () => {
            const actor = makeMockActor();
            const logic = makeItemLogic(
                SohlItemBaseLogic,
                "misc",
                {},
                { actor },
            );
            expect(logic.actor).toBe(actor);
        });

        it("actor is null when the item is unowned", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(logic.actor).toBeNull();
        });
    });

    describe("speaker", () => {
        it("returns the actor's speaker when an actor is available", () => {
            const actor = makeMockActor();
            const speaker = makeMockSpeaker();
            actor.getSpeaker.mockReturnValue(speaker);
            const logic = makeItemLogic(
                SohlItemBaseLogic,
                "misc",
                {},
                { actor },
            );
            expect(logic.speaker).toBe(speaker);
        });

        it("returns a blank SohlSpeaker when no actor resolves", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(logic.speaker).toBeInstanceOf(SohlSpeaker);
        });
    });

    describe("labels", () => {
        it("typeLabel localizes the document type", () => {
            const localize = vi.spyOn(sohl.i18n, "localize");
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            void logic.typeLabel;
            expect(localize).toHaveBeenCalledWith("TYPES.Item.misc");
        });

        it("typeLabel uses the ACTOR namespace for actor kinds", () => {
            const localize = vi.spyOn(sohl.i18n, "localize");
            const logic = makeActorLogic(SohlActorBaseLogic, "being");
            void logic.typeLabel;
            expect(localize).toHaveBeenCalledWith("TYPES.Actor.being");
        });

        it("label formats type and name through docLabelFormat", () => {
            const format = vi.spyOn(sohl.i18n, "format");
            const logic = makeItemLogic(
                SohlItemBaseLogic,
                "misc",
                {},
                { name: "My Item" },
            );
            void logic.label;
            expect(format).toHaveBeenCalledWith(
                "SOHL.docLabelFormat",
                expect.objectContaining({ name: "My Item" }),
            );
        });
    });

    describe("default action normalization", () => {
        it("keeps a single DEFAULT action and demotes extras to ESSENTIAL", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction("first", SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT),
                    scriptAction(
                        "second",
                        SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
                    ),
                ],
            });
            const groups = Array.from(logic.actions.values()).map(
                (a) => a.data.group,
            );
            expect(
                groups.filter(
                    (g) => g === SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
                ),
            ).toHaveLength(1);
            expect(logic.actions.get("second")!.data.group).toBe(
                SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            );
        });

        it("promotes the first action to DEFAULT when none is marked", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction("a", SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL),
                ],
            });
            const first = Array.from(logic.actions.values())[0];
            expect(first.data.group).toBe(SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT);
        });

        it("sorts actions by sort group", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction("gen", SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL),
                    scriptAction("ess", SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL),
                    scriptAction("def", SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT),
                ],
            });
            const groups = Array.from(logic.actions.values()).map(
                (a) => a.data.group,
            );
            const sorted = [...groups].sort((a, b) => a.localeCompare(b));
            expect(groups).toEqual(sorted);
        });
    });

    describe("getContextOptions", () => {
        it("returns one ContextMenuEntry per action", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction("a", SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL),
                ],
            });
            const entries = logic.getContextOptions();
            expect(entries).toHaveLength(logic.actions.size());
            for (const entry of entries) {
                expect(entry).toBeInstanceOf(ContextMenuEntry);
                expect(typeof entry.condition).toBe("function");
                expect(typeof entry.callback).toBe("function");
            }
        });

        it("entry conditions delegate to the action's visible predicate", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc", {
                actionDefs: [
                    scriptAction("a", SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL),
                ],
            });
            const action = logic.actions.get("a")!;
            const visibleSpy = vi
                .spyOn(action, "visible")
                .mockReturnValue(true);
            const entries = logic.getContextOptions();
            const entry = entries.find((e) => e.id === action.data.title)!;
            const el = {} as HTMLElement;
            expect((entry.condition as (t: HTMLElement) => boolean)(el)).toBe(
                true,
            );
            expect(visibleSpy).toHaveBeenCalledWith(el);
        });
    });

    describe("toJSON", () => {
        it("serializes to a plain object", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            const json = logic.toJSON();
            expect(json).toBeTypeOf("object");
        });
    });

    describe("lifecycle", () => {
        it("postFinalize is a no-op by default", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(() => logic.postFinalize({} as any)).not.toThrow();
        });

        it("base item logic lifecycle methods are no-ops", () => {
            const logic = makeItemLogic(SohlItemBaseLogic, "misc");
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("the edit/delete intrinsic actions resolve to real methods", () => {
            // Regression: the executor string must match the method name
            // case-sensitively or SohlAction's constructor throws.
            const data = makeItemData("misc");
            expect(
                () => new SohlItemBaseLogic({}, { parent: data }),
            ).not.toThrow();
        });
    });
});
