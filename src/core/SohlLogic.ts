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
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import {
    ACTION_SUBTYPE,
    ActorKinds,
    defineType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { instanceToJSON } from "@src/utils/helpers";
import { SohlContextMenu } from "@src/utils/SohlContextMenu";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { SohlActionData, SohlAction } from "@src/core/SohlAction";
import { SohlMap } from "@src/utils/collection/SohlMap";

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: intrinsicActionLabels,
} = defineType("SOHL.SohlLogic.INTRINSIC_ACTION", {
    POSTFINALIZE: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.SohlLogic.INTRINSIC_ACTION.postfinalize.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-gears",
        executor: "postfinalize",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
} as StrictObject<Partial<SohlActionData>>);
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

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
    actions: SohlMap<string, SohlAction>;

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

    get id(): DocumentId {
        return this.parent.parent.id;
    }

    get name(): string {
        return this.parent.parent.name;
    }

    get type(): string {
        return this.parent.parent.type;
    }

    get item(): SohlItem {
        if ("item" in this.parent) {
            return this.parent.item as SohlItem;
        } else {
            throw new Error("SohlLogic must be present in an Item");
        }
    }

    get actor(): SohlActor | null {
        if ("actor" in this.parent) {
            return this.parent.actor as SohlActor;
        } else {
            return this.item?.actor ?? null;
        }
    }

    get speaker(): SohlSpeaker {
        return (
            this.actor?.getSpeaker() ??
            this.item?.actor?.getSpeaker() ??
            new SohlSpeaker()
        );
    }

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

    get defaultIntrinsicActionName(): string {
        return "";
    }

    // get intrinsicActions(): ActionLogic[] {
    //     const actions = Object.keys(INTRINSIC_ACTION).map((key) => {
    //         const data = INTRINSIC_ACTION[key];
    //         data.title ??= intrinsicActionLabels[key];
    //         return data;
    //     });

    //     // return actions.map((data) => {
    //     //     return new ActionLogic(data, { parent: this });
    //     // });
    // }

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!options.parent) {
            throw new Error(
                "SohlLogic must be constructed with a parent item or actor.",
            );
        }
        this._parent = options.parent;
        this.actions = new SohlMap<string, SohlAction>(
            this.data.actionDefs.map((def: SohlActionData) => [
                def.title,
                new SohlAction(def, this.data as any),
            ]),
        );
    }

    toJSON(): PlainObject {
        return instanceToJSON(this);
    }

    setDefaultAction(action: SohlAction[]): void {
        // Ensure there is at most one default, all others set to Essential
        let hasDefault = false;
        action.forEach((act) => {
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

        // If no default was specified, then make the requested default action the default
        if (!hasDefault) {
            const defaultAction = action.find(
                (act) => act.data.title === this.defaultIntrinsicActionName,
            );
            if (
                defaultAction &&
                defaultAction.data.subType === ACTION_SUBTYPE.INTRINSIC_ACTION
            ) {
                defaultAction.data.group = SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        action.sort((actA: SohlAction, actB: SohlAction) => {
            const groupA =
                actA.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            const groupB =
                actB.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            return collator.compare(groupA, groupB);
        });

        // If after all that, we still don't have a default action, then
        // set the first action as the default
        // const firstAction = events.find(
        //     (evt) => evt instanceof SohlAction,
        // ) as SohlAction;
        // if (!hasDefault && firstAction) {
        //     firstAction.contextGroup = SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        //     events = events.filter((evt) => evt.id !== firstAction.id);
        //     events.unshift(firstAction);
        // }
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        // let result: SohlContextMenu.Entry[] = this.actions.reduce(
        //     (ary: SohlContextMenu.Entry[], a: SohlAction) => {
        //         let cond: SohlContextMenu.Condition = a.contextCondition;
        //         if (isBoolean(cond)) {
        //             cond = () =>
        //                 !!(
        //                     cond ||
        //                     a.contextGroup !==
        //                         SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN
        //                 );
        //         }

        //         const newAction: SohlContextMenu.Entry =
        //             new SohlContextMenu.Entry({
        //                 id: a.title,
        //                 name: a.title,
        //                 iconFAClass: a.contextIconClass,
        //                 condition: cond,
        //                 group: toSohlContextMenuSortGroup(a.contextGroup),
        //             });
        //         ary.push(newAction);
        //         return ary;
        //     },
        //     [],
        // );
        // return result;
        return [];
    }

    /**
     * Intrinsic action performed after finalize lifecycle stage.
     * This is intended for modules to hook into (or ActionItems to override)
     * to perform additional logic after the main lifecycle stages have completed.
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
     * **Phase 1 — Initialize.**
     *
     * Set up base state from persisted data: create ValueModifiers, set base
     * values. Called on every item before any item's
     * {@link evaluate} runs.
     *
     * **Safe to access:** own persisted data fields (`this.data.*`).
     *
     * **Not safe to access:** sibling items on the same actor — they may not
     * have initialized yet. Cross-item reads belong in {@link evaluate}.
     */
    abstract initialize(): void;

    /**
     * **Phase 2 — Evaluate.**
     *
     * Compute derived values that depend on sibling items being initialized.
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
     * **Phase 3 — Finalize.**
     *
     * Resolve cross-item dependencies that require all items to have been
     * evaluated. Called on every item after ALL items have completed
     * {@link evaluate}.
     *
     * **Safe to access:** all sibling items' initialized and evaluated state.
     */
    abstract finalize(): void;
}

/**
 * The base data interface for all Logic classes.
 *
 * Every actor/item data interface (e.g., {@link SohlItemData},
 * {@link SohlActorData}, {@link GearData}) ultimately extends this.
 * The corresponding {@link SohlDataModel} class implements it via
 * Foundry's schema system.
 */
export interface SohlLogicData<
    TParent extends SohlDocument = SohlDocument,
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> {
    parent: TParent | null;
    logic: TLogic;
    kind: string;
    shortcode: string;
    actionDefs: SohlActionData[];
}
