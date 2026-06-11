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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlActionContext } from "@src/core/SohlActionContext";
import {
    ACTION_SUBTYPE,
    ActorKinds,
    defineType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { instanceToJSON } from "@src/utils/helpers";
import {
    ContextMenuEntry,
    type ContextMenuCondition,
    resolveContextActor,
    resolveContextItem,
} from "@src/utils/ContextMenuEntry";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { SohlAction } from "@src/domain/action/SohlAction";
import { SohlMap } from "@src/utils/collection/SohlMap";
import type { SohlDataModel } from "./SohlDataModel";

/**
 * Abstract base class for all business logic in the SoHL system.
 *
 * Every actor type and item type has a corresponding Logic class that extends
 * `SohlLogic`. Logic classes are responsible for game rules, calculations, and
 * actions — separated from data persistence ({@link SohlDataModel}) and UI
 * presentation (Sheet classes).
 *
 * Logic instances are created automatically by the data model's `create()` factory
 * and are accessible via `document.system.logic` (or the convenience `document.logic`
 * accessor on {@link SohlActor} and {@link SohlItem}).
 *
 * ## Phase-batched lifecycle
 *
 * Foundry VTT's default behavior processes each embedded item fully
 * (`prepareBaseData` → `prepareEmbeddedData` → `prepareDerivedData`) before
 * moving to the next item. This means sibling items cannot depend on each
 * other — when Item B prepares, Item A may or may not be ready.
 *
 * SoHL overrides this in {@link SohlActor.prepareEmbeddedData} to run three
 * phases across **all** items with barriers between them:
 *
 * 1. **{@link initialize}** — Set up base state from persisted data: create
 *    ValueModifiers, set base values. **Cannot** read
 *    sibling items (they may not have initialized yet).
 * 2. **{@link evaluate}** — Compute derived values that depend on sibling
 *    items being initialized (e.g., a Skill reading trait attribute values
 *    for its skill base formula). All `initialize()` calls across every item
 *    on the actor complete before any `evaluate()` runs.
 * 3. **{@link finalize}** — Resolve cross-item dependencies that require
 *    sibling items to have been evaluated (e.g., fate mastery level
 *    depending on a fully computed Aura trait). All `evaluate()` calls
 *    complete before any `finalize()` runs.
 *
 * These method names are deliberately different from Foundry's
 * `prepareBaseData`/`prepareDerivedData` to signal that they follow
 * different ordering rules. Do not implement Foundry's preparation
 * methods on items — use these lifecycle methods instead.
 *
 * @typeParam TData - The data interface this logic operates on, extending
 *   {@link SohlLogicData}.
 */
export abstract class SohlLogic<
    TData extends SohlLogicData<any> = SohlLogicData<any>,
> {
    private readonly _parent: TData;
    /** Executable actions for this document, keyed by title — context-menu entries, chat-card buttons, and lifecycle hooks. */
    actions!: SohlMap<string, SohlAction>;

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            {
                shortcode: "postfinalize",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.SohlLogic.Action.postfinalize.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-gears",
                // Must match the postFinalize method name exactly — intrinsic
                // executors are resolved by case-sensitive property lookup.
                executor: "postFinalize",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }

    /**
     * The parent data model this logic is embedded in.
     */
    get parent(): TData {
        return this._parent;
    }

    /**
     * The data model this logic is associated with.
     * @remarks This is a convenience accessor for `this.parent`.
     */
    get data(): TData {
        return this.parent;
    }

    /** The owning document's id. */
    get id(): DocumentId {
        return this.parent.parent.id;
    }

    /** The owning document's name. */
    get name(): string {
        return this.parent.parent.name;
    }

    /** The owning document's type (its actor or item kind). */
    get type(): string {
        return this.parent.parent.type;
    }

    /**
     * The owning {@link SohlItem}.
     *
     * @throws If this logic is not embedded in an item.
     */
    get item(): SohlItem {
        if ("item" in this.parent) {
            return this.parent.item as SohlItem;
        } else {
            throw new Error("SohlLogic must be present in an Item");
        }
    }

    /** The owning {@link SohlActor} — the item's actor when this logic is on an item — or `null`. */
    get actor(): SohlActor | null {
        if ("actor" in this.parent) {
            return this.parent.actor as SohlActor;
        } else {
            return this.item?.actor ?? null;
        }
    }

    /** A {@link SohlSpeaker} for the owning actor/item (a blank speaker if neither resolves). */
    get speaker(): SohlSpeaker {
        return (
            this.actor?.getSpeaker() ??
            this.item?.actor?.getSpeaker() ??
            new SohlSpeaker()
        );
    }

    /** Localized type (and sub-type, when present) label for the owning document. */
    get typeLabel(): string {
        const dataModel = this.parent as any;
        const type = dataModel.parent.type;
        const typeLabel = sohl.i18n.localize(
            `TYPE.${ActorKinds.includes(type) ? "ACTOR" : "ITEM"}.${dataModel.parent.type}`,
        );
        if (typeof (this.parent as any).subType === "string") {
            return sohl.i18n.format(
                `SOHL.${type}.labelWithSubtype.${(this.parent as any).subType}`,
            );
        } else {
            return typeLabel;
        }
    }

    /** Localized display label combining the {@link typeLabel} and the document's name. */
    get label(): string {
        const dataModel = this.parent as any;
        const type = dataModel.parent.type;
        const locKey = `SOHL.${type}.${dataModel.shortcode}.label`;
        const locResult = sohl.i18n.localize(locKey);
        const name = locResult !== locKey ? locResult : dataModel.parent.name;
        return sohl.i18n.format("SOHL.docLabelFormat", {
            type: this.typeLabel,
            name,
        });
    }

    /**
     * Binds this logic to its parent data model and builds the {@link actions}
     * map from the parent's intrinsic and scripted action definitions, selecting
     * a default action.
     *
     * @param data - Reserved base data (unused by the base class).
     * @param options - Must provide `options.parent`, the data model this logic
     *   is embedded in; the parent's `actionDefs` are used to build
     *   {@link actions}.
     * @throws If no `parent` is provided.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!options.parent) {
            throw new Error(
                "SohlLogic must be constructed with a parent item or actor.",
            );
        }
        this._parent = options.parent;

        // Initialize all actions, both intrinsic ones and scripts
        const actns = [
            ...(this.constructor as any).defineIntrinsicActions(),
            ...this.data.actionDefs,
        ].map((data) => new SohlAction(data, { parent: this }));

        // Set the default action based on the parent's settings
        // and generate a map from the array of actions.
        this.actions = new SohlMap<string, SohlAction>(
            setDefaultAction(actns).map((act) => [act.shortcode, act]),
        );
    }

    /**
     * Serialize this logic to a plain object.
     *
     * @returns The plain-object representation of this logic.
     */
    toJSON(): PlainObject {
        return instanceToJSON(this);
    }

    /**
     * The context-menu options — the actions currently available — for this
     * logic's document.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the document.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): ContextMenuEntry[] {
        const entries: ContextMenuEntry[] = [];
        for (const action of this.actions.values()) {
            const data = action.data;
            const condition: ContextMenuCondition = (
                target: HTMLElement,
            ): boolean => action.visible(target);
            const callback = (element: HTMLElement) => {
                const item = resolveContextItem(element);
                const actor = resolveContextActor(element) ?? item?.actor;
                const ctx = new SohlActionContext({
                    speaker: actor?.getSpeaker(),
                } as any);
                action.execute(ctx);
            };
            entries.push(
                new ContextMenuEntry({
                    id: data.title,
                    name: data.title,
                    iconFAClass: data.iconFAClass,
                    condition,
                    callback,
                    group: data.group as any,
                }),
            );
        }
        return entries;
    }

    /**
     * Intrinsic action performed after finalize lifecycle stage.
     * This is intended for modules to hook into (or ActionItems to override)
     * to perform additional logic after the main lifecycle stages have completed.
     *
     * @param context - The action context for the post-finalize hook.
     */
    postFinalize(context: SohlActionContext): void {
        // No-op by default
    }

    /*--------------------------------------
     * Phase-batched lifecycle methods
     *
     * Called by SohlActor.prepareEmbeddedData() in three barrier-separated
     * passes across ALL items, NOT per-item like Foundry's default.
     * See the class-level JSDoc and docs/concepts/lifecycle-model.md.
     *--------------------------------------*/

    /**
     * Set up base state from persisted data: create ValueModifiers, set base
     * values.
     *
     * @remarks
     * Called on every item before any item's {@link evaluate} runs.
     *
     * **Safe to access:** own persisted data fields (`this.data.*`).
     *
     * **Not safe to access:** sibling items on the same actor — they may not
     * have initialized yet. Cross-item reads belong in {@link evaluate}.
     */
    initialize(): void {}

    /**
     * Compute derived values that depend on sibling items being initialized.
     *
     * @remarks
     * Called on every item after ALL items have completed {@link initialize}.
     *
     * **Safe to access:** sibling items' initialized state (e.g., reading
     * trait attribute values for a skill base formula).
     *
     * **Not safe to access:** sibling items' evaluated state — another item's
     * `evaluate()` may not have run yet. Dependencies on evaluated state
     * belong in {@link finalize}.
     */
    abstract evaluate(): void;

    /**
     * Resolve cross-item dependencies that require all items to have been
     * evaluated.
     *
     * @remarks
     * Called on every item after ALL items have completed {@link evaluate}.
     *
     * **Safe to access:** all sibling items' initialized and evaluated state.
     */
    abstract finalize(): void;
}

/**
 * Normalize a list of actions for display: ensure at most one is marked as
 * the default (demoting extras to "essential"), promote the configured
 * {@link defaultIntrinsicActionName} when none is marked, and sort the list
 * by context-menu group.
 *
 * @param actions - The actions to normalize; sorted and mutated in place.
 * @returns The same array, normalized and sorted.
 */
function setDefaultAction(actions: SohlAction[]): SohlAction[] {
    // Ensure there is at most one default, all others set to Essential
    let hasDefault = false;
    actions.forEach((act) => {
        const action = act as SohlAction;
        const isDefault =
            action.data.group === SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        if (hasDefault) {
            if (isDefault) {
                action.data.group = SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL;
            }
        } else {
            hasDefault ||= isDefault;
        }
    });

    const collator = new Intl.Collator(sohl.i18n.lang);
    actions.sort((actA: SohlAction, actB: SohlAction) => {
        const groupA = actA.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
        const groupB = actB.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
        return collator.compare(groupA, groupB);
    });

    // If after all that, we still don't have a default action, then
    // set the first action as the default
    const firstAction = actions.at(0);
    if (!hasDefault && firstAction) {
        firstAction.data.group = SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        actions = actions.filter(
            (act) => act.shortcode !== firstAction.shortcode,
        );
        actions.unshift(firstAction);
    }

    return actions;
}

/**
 * The base data interface for all Logic classes.
 *
 * Every actor/item data interface (e.g., {@link SohlItemData},
 * {@link SohlActorData}, {@link GearData}) ultimately extends this.
 * The corresponding {@link SohlDataModel} class implements it via
 * Foundry's schema system.
 * @remarks The base shape of every document's `system` data, reachable as `document.system` and (typed as the interface) `document.logic.data`.
 */
export interface SohlLogicData<
    TParent extends SohlDocument = SohlDocument,
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> {
    /** The Foundry document (actor or item) this data belongs to, or `null`. */
    parent: TParent | null;
    /** The logic instance built from this data. */
    logic: TLogic;
    /** The document kind (its actor or item type id). */
    kind: string;
    /** Short identity code for this document. */
    shortcode: string;
    /** Serialized action definitions used to build {@link SohlLogic.actions}. */
    actionDefs: SohlAction.Data[];
}
