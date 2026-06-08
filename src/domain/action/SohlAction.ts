/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActionContext } from "@src/core/SohlActionContext";
import type { SohlLogic } from "@src/core/SohlLogic";
import type { SohlDataModel } from "@src/core/SohlDataModel";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import {
    ACTION_SUBTYPE,
    ActionSubType,
    SOHL_ACTION_SCOPE,
} from "@src/utils/constants";
import { textToFunction } from "@src/utils/helpers";
import { fvttCurrentUser } from "@src/core/FoundryHelpers";
import { SafeExpression, STANDARD_HELPERS } from "@src/utils/SafeExpression";
import { SohlContextMenu } from "@src/utils/SohlContextMenu";

/**
 * Predicate deciding whether an action is currently available. Invoked
 * programmatically with the owning `item` and `actor`; returns `true` when
 * the action may run/appear. Compiled from `data.trigger` by
 * {@link compileTrigger}.
 */
export type ActionTriggerFn = (item?: SohlItem, actor?: SohlActor) => boolean;
/**
 * Predicate deciding whether an action's UI entry (e.g. a context-menu
 * item) is shown for a given DOM element. Compiled from `data.visible` by
 * {@link compileVisibility}, composing the visibility source with execute
 * permission and {@link ActionTriggerFn}.
 */
export type ActionVisibilityFn = (element: HTMLElement) => boolean;
/**
 * The callable that performs an action, given a {@link SohlActionContext}.
 * For INTRINSIC actions this is a bound logic method; for SCRIPT actions it
 * is compiled from the action's executor source.
 */
export type ActionExecutorFn = (context: SohlActionContext) => Promise<unknown>;

/**
 * Logic for the **Action** item type — an executable procedure attached to
 * a document.
 *
 * Actions represent anything a character or item can *do*: performing a skill
 * test, making an attack, activating a mystical ability, using an item, or
 * triggering a custom script. They appear as clickable entries in context menus
 * and chat cards.
 *
 * There are two subtypes:
 * - **Intrinsic actions** — Built-in actions defined by Logic classes (e.g.,
 *   `attackTest` on a StrikeMode, `healingTest` on a Trauma). These call
 *   a named method on the target logic.
 * - **Custom actions** — User-defined actions with arbitrary executor code.
 *
 * Each action has:
 * - An **executor** function that performs the action
 * - A **trigger** predicate that determines when the action is available
 * - A **visible** flag/function controlling UI display
 * - A **scope** (SELF, ITEM, or ACTOR) determining which logic object
 *   the executor runs against
 *
 * During initialization, the Action resolves its executor, trigger, and
 * visibility from stored string representations into callable functions,
 * and binds them to the appropriate target logic based on scope.
 *
 * @typeParam TData - The Action data interface.
 */
export class SohlAction {
    /** The persisted action definition (see {@link SohlActionData}). */
    data: SohlActionData;
    /** The data model this action was constructed against (its parent). */
    parent: SohlDocument;
    /**
     * The callable that performs the action. For INTRINSIC actions, the
     * named method on the scoped target logic, bound to that target; for
     * SCRIPT actions, the compiled executor source. A no-op resolving to
     * `undefined` when no executor is defined. See {@link ActionExecutorFn}.
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
     * Builds an action, compiling its trigger and visibility predicates and
     * resolving its executor.
     *
     * The executor is resolved against the target logic selected by
     * `data.scope` (SELF → this data model's logic, ITEM → the parent item's
     * logic, ACTOR → the owning actor's logic). For INTRINSIC actions the
     * executor is the named method on that target (bound to it); for other
     * subtypes it is compiled from `data.executor` source. When no executor
     * is supplied, a no-op resolving to `undefined` is used.
     * @param data - The action definition.
     * @param dataModel - The data model the action belongs to; supplies the
     *   logic targets used to bind the executor.
     * @throws If `dataModel` or `data` is missing, if `data.scope` is
     *   unknown, or if an INTRINSIC executor names a non-existent method on
     *   the resolved target.
     */
    constructor(data: SohlActionData, dataModel: SohlDataModel<any, any>) {
        if (!dataModel) {
            throw new Error("Data model is required to create a SohlAction.");
        }

        if (!data) {
            throw new Error("Action data is required to create a SohlAction.");
        }

        this.data = data;
        this.parent = dataModel;
        // trigger must be compiled first — visible composes with it.
        this.trigger = compileTrigger(data.trigger, data.title);
        this.visible = compileVisibility(data, this.trigger);
        if (data.executor) {
            let target: SohlLogic | undefined;
            let func: Function;

            switch (data.scope) {
                case SOHL_ACTION_SCOPE.SELF:
                    target = dataModel.logic;
                    break;

                case SOHL_ACTION_SCOPE.ITEM:
                    target = (dataModel as any).item?.logic as SohlLogic;
                    break;

                case SOHL_ACTION_SCOPE.ACTOR:
                    target = (dataModel as any).item?.actor?.logic as SohlLogic;
                    break;
                default:
                    throw new Error(`Unknown action scope: ${data.scope}`);
            }

            if (data.subType === ACTION_SUBTYPE.INTRINSIC) {
                func = (target as any)?.[data.executor ?? ""];
                if (!func || typeof func !== "function") {
                    throw new Error(
                        `The target of this action does not have a function named "${data.executor ?? ""}".`,
                    );
                }

                this.executor = func.bind(target);
            } else {
                func = textToFunction(data.executor ?? "", ["context"], {
                    isAsync: data.isAsync,
                });
                this.executor = func.bind(target);
            }
        } else {
            this.executor = (ctx: SohlActionContext) => Promise.resolve();
        }
    }

    /**
     * Executes the action synchronously.
     *
     * @param actionContext - The context in which to execute the action, including any additional data.
     * @returns The result of the function call.
     * @throws If execution returns a Thenable (e.g., Promise), which is unsupported.
     * @see {@link Action.execute} for the asynchronous version of this method.
     */
    executeSync(actionContext: SohlActionContext): unknown {
        if (this.data.isAsync) {
            throw new Error(
                "Synchronous execution is not supported for this action.",
            );
        }
        const r = this.execute(actionContext);
        if (r && typeof (r as any).then === "function") {
            throw new Error(
                "Thenable returned when synchronous execution expected.",
            );
        }
        return r;
    }

    /**
     * Executes the action asynchronously.
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
        return Promise.resolve(this.executor(actionContext));
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
        const parentDoc = (this.parent as any)?.parent;
        const documentName = parentDoc?.documentName;
        const item: SohlItem | undefined =
            documentName === "Item" ? (parentDoc as SohlItem) : undefined;
        const actor: SohlActor | undefined =
            item?.actor ??
            (documentName === "Actor" ? (parentDoc as SohlActor) : undefined);
        return { item, actor };
    }
}

/** Persisted definition of an action — the data a {@link SohlAction} is built from. */
export interface SohlActionData {
    /** Whether this is an intrinsic or custom action */
    subType: ActionSubType;

    /** Display title for this action */
    title: string;

    /** Whether this action executes asynchronously */
    isAsync: boolean;

    /** Execution context: Self, Parent Item, or Owning Actor */
    scope: string;

    /** Function name or code that performs the action */
    executor: string;

    /** Predicate determining when this action is available */
    trigger: string;

    /** Controls whether this action appears in the UI */
    visible: string;

    /** FontAwesome CSS class for the action's icon */
    iconFAClass: string;

    /** Context menu group for sorting this action */
    group: string;

    /**
     * Minimum Foundry document-ownership level (matching
     * `CONST.DOCUMENT_OWNERSHIP_LEVELS`) the current user must hold on
     * the action's parent actor to execute it. GMs always pass.
     * Only enforced for `SCRIPT` actions; INTRINSIC actions run for any
     * user (lifecycle calls must work everywhere).
     */
    minActorOwnership: number;
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
 *    `{element, item}` (its public contract). If false, the action is
 *    hidden.
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
 * @param data The full action data; used for source, title, subType, and
 *   `minActorOwnership`.
 * @param trigger The compiled trigger predicate to compose with.
 * @returns A visibility predicate.
 */
function compileVisibility(
    data: SohlActionData,
    trigger: ActionTriggerFn,
): ActionVisibilityFn {
    const source = data.visible;
    const title = data.title;
    const text = source && source.trim() ? source : "true";
    let expression: SafeExpression;
    try {
        expression = new SafeExpression(text, STANDARD_HELPERS);
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
            const item = SohlContextMenu.resolveItem(element);
            const visible = !!expression.evaluate({
                element,
                item,
            });
            if (!visible) return false;
            const actor = SohlContextMenu.resolveActor(element) ?? item?.actor;
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
 * predicate is invoked programmatically (not from a DOM event), so its
 * `item` and `actor` bindings are supplied directly by the caller rather
 * than resolved from an element. Parse and evaluation errors are caught
 * and logged; the action is treated as inactive rather than allowed to
 * bubble.
 * @param source The safe-expression source from `data.trigger`. Treated as
 *   `"true"` if blank/missing.
 * @param title The owning action's title, used in log output.
 * @returns A trigger predicate that accepts `item` and `actor` bindings.
 */
function compileTrigger(
    source: string | undefined,
    title: string,
): ActionTriggerFn {
    const text = source && source.trim() ? source : "true";
    let expression: SafeExpression;
    try {
        expression = new SafeExpression(text, STANDARD_HELPERS);
    } catch (err) {
        sohl.log.warn(
            "Failed to compile action trigger expression; action will be inactive:",
            { action: title, source: text, error: err },
        );
        return () => false;
    }
    return (item?: SohlItem, actor?: SohlActor): boolean => {
        try {
            return !!expression.evaluate({ item, actor });
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
 * The check is only meaningful for `SCRIPT` actions — INTRINSIC actions
 * run unconditionally, since their lifecycle calls (`postInitialize`,
 * etc.) must run on every browser regardless of who owns the document.
 * Callers are responsible for confining this check to the subtypes
 * where it applies.
 * @param data The action data to read `minActorOwnership` from.
 * @param actor The actor to test ownership against.
 * @returns Whether the current user is permitted to execute the action.
 */
export function userMeetsExecutePermission(
    data: SohlActionData,
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
 * or modifies a `SCRIPT` entry requires the calling user to be a GM.
 * `INTRINSIC` entries are unaffected.
 *
 * Returns `true` to allow the update, `false` to block it. Callers (typically
 * `_preUpdate` hooks on `SohlActor` and `SohlItem`) should `return false`
 * from the lifecycle hook to cancel the persist.
 * @param oldActionDefs The pre-update actionDefs (from the live document).
 * @param newActionDefs The post-update actionDefs (from the `changes` payload).
 * @param user The user attempting the update.
 * @returns Whether the mutation is permitted.
 */
export function isScriptActionMutationAllowed(
    oldActionDefs: SohlActionData[] | undefined,
    newActionDefs: SohlActionData[] | undefined,
    user: any,
): boolean {
    if (user?.isGM) return true;
    const pickScripts = (defs: SohlActionData[] | undefined): string =>
        JSON.stringify(
            (defs ?? []).filter((a) => a.subType === ACTION_SUBTYPE.SCRIPT),
        );
    return pickScripts(oldActionDefs) === pickScripts(newActionDefs);
}
