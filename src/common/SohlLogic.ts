/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    defineType,
    isBoolean,
    isFunction,
    SohlClassRegistry,
    SohlContextMenu,
    toHTMLString,
} from "@utils";
import { SohlBase, SohlDataModel } from "@common";
import {
    SohlAction,
    SohlEvent,
    SohlIntrinsicAction,
    ScriptAction,
} from "@common/event";
import { SohlItem } from "@common/item";
import { SohlActor } from "@common/actor";

export class SohlLogic extends SohlBase implements SohlLogic.Logic {
    readonly parent: SohlLogic.Data;
    readonly actions: SohlAction[];
    readonly events: SohlEvent[];

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
            return this.item?.actor || null;
        }
    }

    get typeLabel(): string {
        let baseLabel: string;
        const dataModel = this.parent as unknown as SohlDataModel<any>;
        const type = dataModel.parent.type;
        const typeLabel = sohl.i18n.localize(
            `TYPE.${dataModel instanceof SohlItem.DataModel ? "ITEM" : "ACTOR"}.${dataModel.parent.type}`,
        );
        if (typeof (this.parent as any).subType === "string") {
            return sohl.i18n.format("SOHL.BASEDATA.labelWithSubtype", {
                type: typeLabel,
                subtype: sohl.i18n.localize(
                    `SOHL.PERFORMER.${type}.${(this.parent as any).subType}`,
                ),
            });
        } else {
            return typeLabel;
        }
    }

    get label(): string {
        return sohl.i18n.format("SOHL.BASEDATA.docName", {
            type: this.typeLabel,
            name: (this.parent as unknown as SohlDataModel<any>).parent.name,
        });
    }

    get defaultIntrinsicActionName(): string {
        return "";
    }

    constructor(
        parent: SohlLogic.Data,
        data?: PlainObject,
        options?: PlainObject,
    ) {
        if (!parent) {
            throw new Error(
                "SohlLogic must be constructed with a parent item or actor.",
            );
        }
        super(data, options);
        this.parent = parent;
        const intrinsics = (
            Object.values(
                (this.constructor as any)._metadata.intrinsicActions,
            ) as PlainObject[]
        ).map(
            (a: PlainObject) => new SohlIntrinsicAction(this, a) as SohlAction,
        ) as SohlAction[];
        const scripts = this.parent.actionList.map(
            (a: PlainObject) => new ScriptAction(this, a),
        ) as SohlAction[];
        this.actions = intrinsics.concat(scripts);
        this.setDefaultAction();
        this.events = this.parent.eventList.map(
            (e: PlainObject) => new SohlEvent(this, e),
        );
    }

    setDefaultAction(): void {
        // Ensure there is at most one default, all others set to Essential
        let hasDefault = false;
        this.actions.forEach((a) => {
            const isDefault =
                a.contextGroup === SohlContextMenu.SORT_GROUP.DEFAULT;
            if (hasDefault) {
                if (isDefault) {
                    a.contextGroup = SohlContextMenu.SORT_GROUP.ESSENTIAL;
                }
            } else {
                hasDefault ||= isDefault;
            }
        });

        // If no default was specified, then make the requested default action the default
        if (!hasDefault) {
            const defaultAction = this.actions.find(
                (a) => a.name === this.defaultIntrinsicActionName,
            );
            if (defaultAction) {
                defaultAction.contextGroup = SohlContextMenu.SORT_GROUP.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        this.actions.sort((a: SohlAction, b: SohlAction) => {
            const contextGroupA =
                a.contextGroup || SohlContextMenu.SORT_GROUP.GENERAL;
            const contextGroupB =
                b.contextGroup || SohlContextMenu.SORT_GROUP.GENERAL;
            return collator.compare(contextGroupA, contextGroupB);
        });

        // If after all that, we still don't have a default action, then
        // set the first action as the default
        if (!hasDefault && this.actions.length) {
            this.actions[0].contextGroup = SohlContextMenu.SORT_GROUP.DEFAULT;
        }
    }

    _getContextOptions(): ContextMenu.Entry[] {
        // @ts-expect-error `ContextMenu.Entry` is misdefined, it should accept this
        let result: ContextMenu.Entry[] = this.actions.reduce(
            (ary: SohlContextMenu.Entry[], a: SohlAction) => {
                // @ts-expect-error `ContextMenu.Condition` is misdefined, it should accept this
                let cond: ContextMenu.Condition = a.contextCondition;
                if (isBoolean(cond)) {
                    cond = () =>
                        !!(
                            cond ||
                            a.contextGroup !== SohlContextMenu.SORT_GROUP.HIDDEN
                        );
                }
                let callback: SohlContextMenu.Callback;

                const newAction: SohlContextMenu.Entry =
                    new SohlContextMenu.Entry({
                        id: a.name,
                        name: a.name,
                        iconClass: a.contextIconClass,
                        // @ts-expect-error `ContextMenu.Condition` is misdefined, it should accept this
                        condition: cond,
                        group: SohlContextMenu.toSortGroup(a.contextGroup),
                    });
                ary.push(newAction);
                return ary;
            },
            [],
        );
        return result;
    }

    /**
     * Initializes base state for this participant.
     * Should not rely on sibling or external logic state.
     */
    initialize(context?: SohlAction.Context): void {}

    /**
     * Evaluates business logic using current and sibling state.
     */
    evaluate(context?: SohlAction.Context): void {}

    /**
     * Final stage of lifecycle — compute derived values, cleanup, etc.
     */
    finalize(context?: SohlAction.Context): void {}
}

export namespace SohlLogic {
    export interface Logic {
        readonly parent: Data;
        readonly actions: SohlAction[];
        readonly events: SohlEvent[];
        get item(): SohlItem;
        get actor(): SohlActor | null;
        get typeLabel(): string;
        get label(): string;
        get defaultIntrinsicActionName(): string;
        initialize(context?: SohlAction.Context): void;
        evaluate(context?: SohlAction.Context): void;
        finalize(context?: SohlAction.Context): void;
    }

    export interface EffectKeyData {
        name: string;
        abbrev: string;
    }

    export interface Metadata extends SohlClassRegistry.Metadata {
        effectKeys: StrictObject<EffectKeyData>;
        defaultAction: string;
        intrinsicActions: SohlContextMenu.Entry[];
    }

    export class Element extends SohlClassRegistry.Element implements Metadata {
        effectKeys: StrictObject<EffectKeyData>;
        defaultAction: string;
        intrinsicActions: SohlContextMenu.Entry[];

        constructor(data: Partial<Metadata>) {
            if (!data.kind) {
                throw new Error("LogicClassRegistryElement must have a kind");
            }
            super(data.kind, data.ctor);
            this.effectKeys = data.effectKeys || {};
            this.defaultAction = data.defaultAction || "";
            this.intrinsicActions = IntrinsicActions;
            if (data.intrinsicActions) {
                this.intrinsicActions.push(...data.intrinsicActions);
            }
        }
    }

    export interface Constructor<D extends Data = Data> {
        new (parent: D, data?: PlainObject, options?: PlainObject): Logic;
    }

    export const {
        kind: INTRINSIC_ACTION,
        values: IntrinsicActions,
        isValue: isIntrinsicAction,
    } = defineType("SOHL.Injury.INTRINSIC_ACTION", {
        INITIALIZE: new SohlContextMenu.Entry({
            id: "initialize",
            name: "Initialize",
            iconFAClass: "fas fa-gears",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.HIDDEN,
        }),
        EVALUATE: new SohlContextMenu.Entry({
            id: "evaluate",
            name: "Evaluate",
            iconFAClass: "fas fa-gears",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.HIDDEN,
        }),
        FINALIZE: new SohlContextMenu.Entry({
            id: "finalize",
            name: "Finalize",
            iconFAClass: "fas fa-gears",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.HIDDEN,
        }),
    } as StrictObject<SohlContextMenu.Entry>);
    export type IntrinsicAction =
        (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

    export interface Data extends foundry.abstract.TypeDataModel<any, any> {
        readonly parent: SohlItem | SohlActor;
        readonly logic: Logic;
        actionList: PlainObject[];
        eventList: PlainObject[];
    }
}
