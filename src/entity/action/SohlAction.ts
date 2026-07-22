/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import {
    ACTION_SUBTYPE,
    ActionSubType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import {
    fvttCurrentUser,
    fvttExecuteMacro,
    fvttWorldTime,
} from "@src/core/FoundryHelpers";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import {
    resolveContextActor,
    resolveContextItem,
} from "@src/apps/logic/ContextMenuEntry";
import { SohlEntity } from "../SohlEntity";

/**
 * Predicate deciding whether an action is currently available. Invoked
 * programmatically with the owning `item` and `actor` documents; the
 * compiled expression sees their logic layer as `itemLogic` / `actorLogic`.
 * Returns `true` when the action may run/appear. Compiled from
 * `data.trigger` by `compileTrigger`.
 */
export type ActionTriggerFn = (item?: SohlItem, actor?: SohlActor) => boolean;
/**
 * Predicate deciding whether an action's UI entry (e.g. a context-menu
 * item) is shown for a given DOM element. Compiled from `data.visible` by
 * `compileVisibility`, composing the visibility source with execute
 * permission and {@link ActionTriggerFn}.
 */
export type ActionVisibilityFn = (element: HTMLElement) => boolean;
/**
 * The callable that performs an action, given a {@link SohlActionContext}.
 * For Intrinsic actions this is a bound logic method; for Script actions it
 * runs the referenced Foundry Macro via `Macro#execute`.
 */
export type ActionExecutorFn = (context: SohlActionContext) => Promise<unknown>;

/**
 * An executable **action** attached to a document (an actor or item) and
 * surfaced as an entry on that document's **context menu** (and on chat-card
 * buttons). Choosing the entry runs the action.
 *
 * A **Script action** is, in effect, a _macro attached to a document_: instead of
 * sitting on the macro bar it lives on a specific actor or item and runs with that
 * document as its context. An **intrinsic action** (below) is the same thing
 * authored in code rather than typed by a GM.
 *
 * Actions are how a character or item *does* something — run a skill test, make
 * an attack, activate a mystical ability. They come in two flavors that differ
 * only in where the executor comes from:
 *
 * - **Intrinsic actions** — defined in code by Logic classes via
 *   `defineIntrinsicActions()`. The `executor` is the *name of a method* on the
 *   scoped target logic (e.g. `useMystery` on a Mystery), looked up and bound at
 *   construction. This is how the system ships its built-in actions.
 * - **Script actions** — GM-authored. The `executor` is the **UUID of a
 *   Foundry `Macro`**; running the action invokes `Macro#execute` (which
 *   enforces the `MACRO_SCRIPT` permission and ownership) with a
 *   {@link SohlActionContext}-derived scope. No code is stored on, or compiled
 *   from, the document — see the security model's "reference code, never
 *   compile it" rule. Stored per-document and permission-gated; there is no
 *   end-user authoring UI.
 *
 * Either way, an action carries:
 * - a **scope** (`SELF` / `ITEM` / `ACTOR`) selecting which logic the executor
 *   binds to — i.e. what `this` is when it runs (the action's own logic, the
 *   owning item's, or the owning actor's);
 * - a {@link trigger} predicate (availability) and a {@link visible} predicate
 *   (UI display), each authored as a {@link sohl.entity.expr.SafeExpression} string;
 * - an {@link executor} that performs the work.
 *
 * The constructor compiles `trigger`/`visible` and resolves/binds `executor`
 * from their stored string forms, so a finished `SohlAction` is ready to
 * {@link execute}. See {@link sohl.core.logic.SohlLogic.getContextOptions} for how actions become
 * context-menu entries.
 *
 * A Script action's Macro is an ordinary Foundry script Macro, so it can use
 * the full client API (`actor`, `token`, and the SoHL `sohl`/`.logic` surfaces
 * are passed in scope). If the behavior outgrows a single Macro, reach for a
 * Foundry **module** instead.
 *
 * @example
 * // An intrinsic action definition (from a Logic class's
 * // defineIntrinsicActions): the executor is the name of a method on the
 * // scoped target logic, bound at construction.
 * { subType: "intrinsic", scope: "self", executor: "useMystery", trigger: "true" }
 *
 * @example
 * // A Script action references a GM-authored Macro by UUID; the Macro body is
 * // where the GM's code lives (never on the action).
 * { subType: "script", scope: "actor", executor: "Macro.p8f2c1a0d9e7b6a5" }
 */
export class SohlAction extends SohlEntity {
    /** The persisted action definition (see {@link SohlAction.Data}). */
    data: SohlAction.Data;

    /**
     * The callable that performs the action. For Intrinsic actions, the named
     * method on the scoped target logic, bound to that target; for Script
     * actions, a thunk that runs the referenced Foundry Macro via
     * `Macro#execute` (permission-gated; no code is compiled from data). A
     * no-op resolving to `undefined` when no executor is defined. See
     * {@link ActionExecutorFn}.
     */
    executor: ActionExecutorFn;
    /**
     * Availability predicate compiled from `data.trigger`; gates
     * {@link execute} and composes into {@link visible}. See
     * {@link ActionTriggerFn}.
     */
    trigger: ActionTriggerFn;
    /**
     * UI-visibility predicate compiled from `data.visible`, composed with
     * execute permission and {@link trigger}. See {@link ActionVisibilityFn}.
     */
    visible: ActionVisibilityFn;

    /**
     * Builds a new action for a given actor, merging the actor's speaker into
     * the action's context. This is a convenience for constructing actions
     * from a document's data model, which is where the speaker is known.
     * @param actor - The actor whose speaker is merged into the action's context.
     * @param data - The action definition.
     * @param options - Construction options; `options.parent` is the data model the action belongs to and supplies the logic targets used to bind the executor.
     * @returns A new {@link SohlAction} instance.
     */
    static create(
        actor: SohlActor,
        data: Partial<SohlAction.Data>,
        options: Partial<SohlAction.Options>,
    ): SohlAction {
        options.parent = actor.logic;
        return new entity.SohlAction(data, options);
    }

    /**
     * Builds an action, compiling its trigger and visibility predicates and
     * resolving its executor.
     *
     * The executor is resolved against the target logic selected by
     * `data.scope` (SELF → this data model's logic, ITEM → the parent item's
     * logic, ACTOR → the owning actor's logic). For Intrinsic actions the
     * executor is the named method on that target (bound to it); for Script
     * actions it runs the Foundry Macro named by `data.executor` (a UUID) via
     * `Macro#execute`. When no executor is supplied, a no-op resolving to
     * `undefined` is used.
     * @param data - The action definition.
     * @param options - Construction options; `options.parent` is the data
     *   model the action belongs to and supplies the logic targets used to
     *   bind the executor.
     * @throws If `options.parent` or `data` is missing, if `data.scope` is
     *   unknown, or if an Intrinsic executor names a non-existent method on
     *   the resolved target.
     */
    constructor(
        data: Partial<SohlAction.Data>,
        options: Partial<SohlAction.Options>,
    ) {
        if (!options?.parent) {
            throw new Error("Parent Logic is required to create a SohlAction.");
        }

        if (!data) {
            throw new Error("Action data is required to create a SohlAction.");
        }
        super(data, options);

        this.data = {
            shortcode: "",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: "",
            scope: SOHL_ACTION_SCOPE.SELF,
            executor: "",
            trigger: "true",
            visible: "false",
            iconFAClass: "",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            minActorOwnership: 0,
            ...data,
        };
        // trigger must be compiled first — visible composes with it.
        this.trigger = compileTrigger(
            data.trigger,
            this.data.title,
            this.parent,
        );
        this.visible = compileVisibility(this.data, this.trigger, this.parent);
        if (data.executor) {
            let target: SohlLogic | undefined;
            let func: Function;

            // Use this.data, not the raw input — the SELF default merged
            // above must apply when the definition omits `scope`.
            switch (this.data.scope) {
                case SOHL_ACTION_SCOPE.SELF:
                    target = this.parent;
                    break;

                case SOHL_ACTION_SCOPE.ITEM:
                    target = this.parent.item?.logic as SohlLogic;
                    break;

                case SOHL_ACTION_SCOPE.ACTOR:
                    target = this.parent.actor?.logic as SohlLogic;
                    break;
                default:
                    throw new Error(`Unknown action scope: ${this.data.scope}`);
            }

            if (this.data.subType === ACTION_SUBTYPE.INTRINSIC) {
                func = (target as any)?.[this.data.executor ?? ""];
                if (!func || typeof func !== "function") {
                    throw new Error(
                        `The target of this action does not have a function named "${this.data.executor ?? ""}".`,
                    );
                }

                this.executor = func.bind(target);
            } else {
                // Script actions reference a Foundry Macro by UUID (GM-authored
                // "homebrew"). The macro runs through Macro#execute, which
                // enforces MACRO_SCRIPT + ownership; no code is ever compiled
                // from data. See docs/concepts/security-model.md.
                //
                // The SohlActionContext is exposed to the macro as `sohlContext`,
                // NOT `scope`: Foundry's `Macro##executeScript` already declares a
                // fixed `scope` parameter, so passing a `scope` scope-key builds
                // an AsyncFunction with a duplicate parameter name (SyntaxError),
                // silently swallowing the macro's return value.
                const macroUuid = this.data.executor ?? "";
                this.executor = (ctx: SohlActionContext) => {
                    const { item, actor } = this.resolveContext();
                    return fvttExecuteMacro(macroUuid, {
                        actor,
                        item,
                        speaker: ctx?.speaker,
                        sohlContext: ctx,
                    });
                };
            }
        } else {
            this.executor = (ctx: SohlActionContext) => Promise.resolve();
        }
    }

    /** The action's shortcode identifier. */
    get shortcode(): string {
        return this.data.shortcode;
    }

    /** @inheritdoc */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            ...this.data,
        };
    }

    /**
     * Executes the action.
     *
     * Gating, in order: for `SCRIPT` only, the current user must
     * satisfy `data.minActorOwnership` (see
     * {@link userMeetsExecutePermission}); then `trigger` must return
     * truthy. Either failure causes the action to be skipped (with an
     * informational log) rather than throw.
     * @param actionContext - The context in which to execute the action.
     * @returns The result of the executor, or `undefined` if the action
     *   was gated out.
     */
    async execute(actionContext: SohlActionContext): Promise<unknown> {
        const { item, actor } = this.resolveContext();
        if (
            this.data.subType === ACTION_SUBTYPE.SCRIPT &&
            !userMeetsExecutePermission(this.data, actor)
        ) {
            sohl.log.info(
                `Action "${this.data.title}" blocked by execute permission.`,
            );
            return undefined;
        }
        if (!this.trigger(item, actor)) {
            sohl.log.info(
                `Action "${this.data.title}" not triggerable; skipping.`,
            );
            return undefined;
        }
        const result = await Promise.resolve(this.executor(actionContext));
        // Generic run record (issue #579): stamp `system.lastRun[shortcode]` on
        // the owning document for flagged actions, so "when did X last happen
        // here?" is answerable without a bespoke field. This is the one
        // chokepoint every invocation funnels through (context menu, actions tab,
        // chat-card `[Perform]`, timed event), so no executor stamps it itself.
        if (this.data.recordsLastRun) await this.recordLastRun();
        return result;
    }

    /**
     * Stamp this action's run time into the owning document's generic run record
     * (`system.lastRun[shortcode]`), keyed by the action shortcode. A no-op when
     * the owning document can't be resolved or persisted (e.g. a detached test
     * double). The record is the past-tense mirror of `system.scheduledActions`.
     *
     * @returns A promise that resolves once the record is persisted.
     */
    private async recordLastRun(): Promise<void> {
        // Walk action → logic → data model → document (as resolveContext does).
        const doc = (this.parent as any)?.parent?.parent;
        if (typeof doc?.update !== "function") return;
        const lastRun = {
            ...((doc.system?.lastRun as Record<string, number>) ?? {}),
            [this.data.shortcode]: fvttWorldTime(),
        };
        await doc.update({ "system.lastRun": lastRun });
    }

    /**
     * Resolve the item and actor associated with this action from its
     * parent data model.
     * @returns The owning item (if any) and the owning actor (if any).
     */
    private resolveContext(): {
        item: SohlItem | undefined;
        actor: SohlActor | undefined;
    } {
        // Walk action → logic → data model → document. `this.parent` is the
        // owning SohlLogic, whose `.parent` is the data model, whose `.parent`
        // is the Foundry document — the level that actually carries
        // `documentName` / `type`. (A data model has neither, so stopping one
        // level short yielded an undefined item/actor, which then failed the
        // SCRIPT execute-permission gate.)
        const parentDoc = (this.parent as any)?.parent?.parent;
        const documentName = parentDoc?.documentName;
        const item: SohlItem | undefined =
            documentName === "Item" ? (parentDoc as SohlItem) : undefined;
        const actor: SohlActor | undefined =
            item?.actor ??
            (documentName === "Actor" ? (parentDoc as SohlActor) : undefined);
        return { item, actor };
    }
}

export namespace SohlAction {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind: string = "SohlAction";

    /** Persisted definition of an action — the data a {@link SohlAction} is built from. */
    export interface Data extends SohlEntity.Data {
        /** Unique code for this action on a given Logic instance. */
        shortcode: string;

        /** Whether this is an intrinsic or custom action */
        subType: ActionSubType;

        /** Display title for this action */
        title: string;

        /** Execution context: Self, Parent Item, or Owning Actor */
        scope: string;

        /**
         * Reference to the code that performs the action — **never** inline
         * code. For an intrinsic action, the name of a method on the scoped
         * target logic; for a Script action, the UUID of a Foundry `Macro`.
         */
        executor: string;

        /**
         * {@link sohl.entity.expr.SafeExpression} determining whether an action may be executed.
         * Note that this layers with visible; this determines whether
         * the action can be invoked regardless of whether it is visible
         * in the UI.
         */
        trigger: string;

        /** {@link sohl.entity.expr.SafeExpression} determining whether this action appears in the UI */
        visible: string;

        /** FontAwesome CSS class for the action's icon */
        iconFAClass: string;

        /** Context menu group for sorting this action */
        group: string;

        /**
         * Minimum Foundry document-ownership level (matching
         * `CONST.DOCUMENT_OWNERSHIP_LEVELS`) the current user must hold on
         * the action's parent actor to execute it. GMs always pass.
         * Only enforced for Script actions; Intrinsic actions run for any
         * user (lifecycle calls must work everywhere).
         */
        minActorOwnership: number;

        /**
         * When `true`, {@link SohlAction.execute} stamps this document's
         * `system.lastRun[shortcode]` with the current world time each time the
         * action performs (issue #579) — a generic run record, no bespoke field.
         * Set it on actions where "when did this last happen here?" is worth
         * answering (recurring checks, tests); omit for trivial/UI actions so
         * they don't force a write. Optional; defaults to off.
         */
        recordsLastRun?: boolean;
    }

    /** Options for a {@link sohl.entity.modifier.ValueModifier}. */
    export interface Options extends SohlEntity.Options {}
}

/**
 * Compile an action's `visible` source string into a predicate. The
 * predicate is the UI gate: a context-menu entry for the action shows iff
 * `visible(element)` returns truthy.
 *
 * **Composition.** Visibility is `visibleSource AND scriptPermission AND
 * trigger`:
 *
 * 1. The visibility source is evaluated as a SafeExpression with
 *    `{element, itemLogic, isGM}` (its public contract; `itemLogic` is the
 *    resolved row item's logic layer, or `undefined`; `isGM` reflects
 *    whether the current user is a GM). If false, the action is hidden.
 *    The owning actor's logic is reachable as `itemLogic.actorLogic`.
 * 2. For `SCRIPT` subtypes, the current user must satisfy
 *    `data.minActorOwnership` against the surrounding actor (see
 *    {@link userMeetsExecutePermission}). This mirrors `execute()`'s
 *    hard gate so unauthorized scripted actions don't appear in the
 *    menu only to be no-op'd on click.
 * 3. Finally `trigger(item, actor)` must return truthy.
 *
 * Any UI surface that consults visibility therefore reflects both
 * domain availability and execution permission without duplication.
 *
 * Parse and evaluation errors are caught and logged; the action is
 * treated as hidden rather than allowed to bubble.
 * @param data - The full action data; used for source, title, subType, and
 *   `minActorOwnership`.
 * @param trigger - The compiled trigger predicate to compose with.
 * @param parent - The owning action's logic, used as the expression's parent.
 * @returns A visibility predicate.
 */
function compileVisibility(
    data: SohlAction.Data,
    trigger: ActionTriggerFn,
    parent: SohlLogic,
): ActionVisibilityFn {
    const source = data.visible;
    const title = data.title;
    const text = source && source.trim() ? source : "true";
    let expression: SafeExpression;
    try {
        expression = new SafeExpression({ source: text }, { parent });
    } catch (err) {
        sohl.log.warn(
            "Failed to compile action visibility expression; action will be hidden:",
            { action: title, source: text, error: err },
        );
        return () => false;
    }
    const isScript = data.subType === ACTION_SUBTYPE.SCRIPT;
    return (element: HTMLElement): boolean => {
        try {
            const item = resolveContextItem(element);
            const visible = !!expression.evaluate({
                element,
                itemLogic: item?.logic,
                isGM: !!fvttCurrentUser()?.isGM,
            });
            if (!visible) return false;
            const actor = resolveContextActor(element) ?? item?.actor;
            if (isScript && !userMeetsExecutePermission(data, actor)) {
                return false;
            }
            return trigger(item, actor ?? undefined);
        } catch (err) {
            sohl.log.warn(
                "Action visibility expression threw; action will be hidden:",
                { action: title, source: text, element, error: err },
            );
            return false;
        }
    };
}

/**
 * Compile an action's `trigger` source string into a predicate. The
 * predicate is invoked programmatically (not from a DOM event); callers
 * pass the owning `item` and `actor` **documents**, and the predicate
 * exposes their logic layer to the expression as `itemLogic` /
 * `actorLogic` (the stable, computed view authors write against). Parse
 * and evaluation errors are caught and logged; the action is treated as
 * inactive rather than allowed to bubble.
 * @param source - The safe-expression source from `data.trigger`. Treated as
 *   `"true"` if blank/missing.
 * @param title - The owning action's title, used in log output.
 * @param parent - The owning action's logic, used as the expression's parent.
 * @returns A trigger predicate accepting `item` / `actor` documents, exposing
 *   `itemLogic` / `actorLogic` to the expression.
 */
function compileTrigger(
    source: string | undefined,
    title: string,
    parent: SohlLogic,
): ActionTriggerFn {
    const text = source && source.trim() ? source : "true";
    let expression: SafeExpression;
    try {
        expression = new SafeExpression({ source: text }, { parent });
    } catch (err) {
        sohl.log.warn(
            "Failed to compile action trigger expression; action will be inactive:",
            { action: title, source: text, error: err },
        );
        return () => false;
    }
    return (item?: SohlItem, actor?: SohlActor): boolean => {
        try {
            return !!expression.evaluate({
                itemLogic: item?.logic,
                actorLogic: actor?.logic,
            });
        } catch (err) {
            sohl.log.warn(
                "Action trigger expression threw; action will be inactive:",
                { action: title, source: text, item, actor, error: err },
            );
            return false;
        }
    };
}

/**
 * Whether the current user satisfies `data.minActorOwnership` against
 * the given actor. The required value is the minimum Foundry
 * `CONST.DOCUMENT_OWNERSHIP_LEVELS` (0..3) the user must have on the
 * actor. `testUserPermission` returns true for GMs regardless of the
 * configured level, so no explicit GM short-circuit is needed.
 *
 * The check is only meaningful for Script actions — Intrinsic actions
 * run unconditionally, since their lifecycle calls (`postInitialize`,
 * etc.) must run on every browser regardless of who owns the document.
 * Callers are responsible for confining this check to the subtypes
 * where it applies.
 * @param data - The action data to read `minActorOwnership` from.
 * @param actor - The actor to test ownership against.
 * @returns Whether the current user is permitted to execute the action.
 */
export function userMeetsExecutePermission(
    data: SohlAction.Data,
    actor: SohlActor | undefined | null,
): boolean {
    if (!actor) return false;
    const user = fvttCurrentUser();
    if (!user) return false;
    const required = data.minActorOwnership ?? 3; // default: OWNER
    return !!(actor as any).testUserPermission?.(user, required);
}

/**
 * Authoring gate for `actionDefs` updates: any mutation that adds, removes,
 * or modifies a Script entry requires the calling user to be a GM.
 * Intrinsic entries are unaffected.
 *
 * Returns `true` to allow the update, `false` to block it. Callers (typically
 * `_preUpdate` hooks on `SohlActor` and `SohlItem`) should `return false`
 * from the lifecycle hook to cancel the persist.
 * @param oldActionDefs - The pre-update actionDefs (from the live document).
 * @param newActionDefs - The post-update actionDefs (from the `changes` payload).
 * @param user - The user attempting the update.
 * @returns Whether the mutation is permitted.
 */
export function isScriptActionMutationAllowed(
    oldActionDefs: SohlAction.Data[] | undefined,
    newActionDefs: SohlAction.Data[] | undefined,
    user: any,
): boolean {
    if (user?.isGM) return true;
    const pickScripts = (defs: SohlAction.Data[] | undefined): string =>
        JSON.stringify(
            (defs ?? []).filter((a) => a.subType === ACTION_SUBTYPE.SCRIPT),
        );
    return pickScripts(oldActionDefs) === pickScripts(newActionDefs);
}
registerEntity("SohlAction", SohlAction);
