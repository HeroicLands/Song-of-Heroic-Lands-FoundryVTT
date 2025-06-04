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
    SohlClassRegistry,
    ContextMenuCondition,
    CONTEXTMENU_SORT_GROUP,
    SohlContextMenuEntry,
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

export abstract class SohlPerformer<
        TData extends SohlPerformer.Data = SohlPerformer.Data,
    >
    extends SohlBase
    implements SohlPerformer.Shape<TData>
{
    readonly parent: TData;
    readonly actions: SohlAction[];
    readonly events: SohlEvent[];

    get item(): SohlItem | null {
        if ("item" in this.parent) {
            return this.parent.item as SohlItem;
        } else {
            return null;
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

    get defaultIntrinsicActionName() {
        return "";
    }

    constructor(parent: TData, data?: PlainObject, options?: PlainObject) {
        if (!parent) {
            throw new Error(
                "SohlPerformer must be constructed with a parent item or actor.",
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

    setDefaultAction() {
        // Ensure there is at most one default, all others set to Essential
        let hasDefault = false;
        this.actions.forEach((a) => {
            const isDefault = a.contextGroup === CONTEXTMENU_SORT_GROUP.DEFAULT;
            if (hasDefault) {
                if (isDefault) {
                    a.contextGroup = CONTEXTMENU_SORT_GROUP.ESSENTIAL;
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
                defaultAction.contextGroup = CONTEXTMENU_SORT_GROUP.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        this.actions.sort((a: SohlAction, b: SohlAction) => {
            const contextGroupA =
                a.contextGroup || CONTEXTMENU_SORT_GROUP.GENERAL;
            const contextGroupB =
                b.contextGroup || CONTEXTMENU_SORT_GROUP.GENERAL;
            return collator.compare(contextGroupA, contextGroupB);
        });

        // If after all that, we still don't have a default action, then
        // set the first action as the default
        if (!hasDefault && this.actions.length) {
            this.actions[0].contextGroup = CONTEXTMENU_SORT_GROUP.DEFAULT;
        }
    }

    _getContextOptions() {
        let result = this.actions.reduce(
            (ary: SohlContextMenuEntry[], a: SohlAction) => {
                let cond: ContextMenuCondition = a.contextCondition;
                if (typeof cond !== "function") {
                    cond = () =>
                        !!(
                            cond &&
                            a.contextGroup !== CONTEXTMENU_SORT_GROUP.HIDDEN
                        );
                }

                if (cond) {
                    const newAction = {
                        id: a.name,
                        name: a.name,
                        icon: `<i class="${a.contextIconClass}${a.contextGroup === CONTEXTMENU_SORT_GROUP.DEFAULT ? " fa-beat-fade" : ""}"></i>`,
                        condition: cond,
                        callback: (element: HTMLElement) =>
                            a.execute({ element }),
                        group: a.contextGroup,
                    } as SohlContextMenuEntry;
                    ary.push(newAction);
                }
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
    abstract initialize(context?: SohlAction.Context): void;

    /**
     * Evaluates business logic using current and sibling state.
     */
    abstract evaluate(context?: SohlAction.Context): void;

    /**
     * Final stage of lifecycle — compute derived values, cleanup, etc.
     */
    abstract finalize(context?: SohlAction.Context): void;
}

export namespace SohlPerformer {
    export interface Shape<
        TData extends SohlPerformer.Data = SohlPerformer.Data,
    > {
        readonly parent: TData;
        readonly actions: SohlAction[];
        readonly events: SohlEvent[];
        get item(): SohlItem | null;
        get actor(): SohlActor | null;
        get typeLabel(): string;
        get label(): string;
        get defaultIntrinsicActionName(): string;
        initialize(context?: SohlAction.Context): void;
        evaluate(context?: SohlAction.Context): void;
        finalize(context?: SohlAction.Context): void;
    }

    export interface Metadata extends SohlClassRegistry.Metadata {
        effectKeys: PlainObject;
        defaultAction: string;
        intrinsicActions: SohlContextMenuEntry[];
    }

    export class Element extends SohlClassRegistry.Element implements Metadata {
        effectKeys: PlainObject;
        defaultAction: string;
        intrinsicActions: SohlContextMenuEntry[];

        constructor(data: Partial<Metadata>) {
            if (!data.kind) {
                throw new Error(
                    "PerformerClassRegistryElement must have a kind",
                );
            }
            super(data.kind, data.ctor);
            this.effectKeys = data.effectKeys || {};
            this.defaultAction = data.defaultAction || "";
            this.intrinsicActions = Object.values(
                SohlPerformer.INTRINSIC_ACTIONS,
            );
            if (data.intrinsicActions) {
                this.intrinsicActions.push(...data.intrinsicActions);
            }
        }
    }

    export interface Constructor<
        D extends Data = Data,
        T extends SohlPerformer<D> = SohlPerformer<D>,
    > {
        new (parent: D, data?: PlainObject, options?: PlainObject): T;
    }

    export const INTRINSIC_ACTIONS: StrictObject<SohlContextMenuEntry> = {
        INITIALIZE: {
            id: "initialize",
            name: "Initialize",
            iconClass: "fas fa-gears",
            condition: true,
            group: CONTEXTMENU_SORT_GROUP.HIDDEN,
        },
        EVALUATE: {
            id: "evaluate",
            name: "Evaluate",
            iconClass: "fas fa-gears",
            condition: true,
            group: CONTEXTMENU_SORT_GROUP.HIDDEN,
        },
        FINALIZE: {
            id: "finalize",
            name: "Finalize",
            iconClass: "fas fa-gears",
            condition: true,
            group: CONTEXTMENU_SORT_GROUP.HIDDEN,
        },
    } as const;

    export interface Data {
        readonly parent: SohlItem | SohlActor;
        readonly logic: SohlPerformer<any>;
        actionList: PlainObject[];
        eventList: PlainObject[];
    }
}
