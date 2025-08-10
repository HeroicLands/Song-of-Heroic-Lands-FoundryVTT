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
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    toSohlContextMenuSortGroup,
} from "@utils/constants";
import { isBoolean, toDocumentId } from "@utils/helpers";
import { SohlClassRegistry } from "@utils/SohlClassRegistry";
import { SohlBase } from "@common/SohlBase";
import { SohlEvent } from "@common/event/SohlEvent";
import { SohlIntrinsicAction } from "@common/event/SohlIntrinsicAction";
import { SohlScriptAction } from "@common/event/SohlScriptAction";
import { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlAction } from "@common/event/SohlAction";
import type { SohlItem } from "@common/item/SohlItem";
import type { SohlActor } from "@common/actor/SohlActor";

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: intrinsicActionLabels,
} = defineType("SOHL.SohlLogic.INTRINSIC_ACTION", {
    INITIALIZE: {
        id: toDocumentId("8QWJPT998Hqxwxkw"),
        label: "SOHL.SohlLogic.INTRINSIC_ACTION.INITIALIZE",
        iconFAClass: "fas fa-gears",
        functionName: "initialize",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    EVALUATE: {
        id: toDocumentId("Ew4AvrixUNP6rQZy"),
        label: "SOHL.SohlLogic.INTRINSIC_ACTION.EVALUATE",
        iconFAClass: "fas fa-gears",
        functionName: "evaluate",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    FINALIZE: {
        id: toDocumentId("8o5D6qVtFF43vTL9"),
        label: "SOHL.SohlLogic.INTRINSIC_ACTION.FINALIZE",
        iconFAClass: "fas fa-gears",
        functionName: "finalize",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
} as StrictObject<Partial<SohlIntrinsicAction.Data>>);
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

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
        const dataModel = this.parent as any;
        const type = dataModel.parent.type;
        const typeLabel = sohl.i18n.localize(
            `TYPE.${["assembly", "entity"].includes(type) ? "ITEM" : "ACTOR"}.${dataModel.parent.type}`,
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
            name: (this.parent as any).parent.name,
        });
    }

    get defaultIntrinsicActionName(): string {
        return "";
    }

    get intrinsicActions(): SohlAction[] {
        const actions = Object.keys(INTRINSIC_ACTION).map((key) => {
            const data = INTRINSIC_ACTION[key];
            data.label ??= intrinsicActionLabels[key];
            return data;
        });

        return actions.map((data) => {
            return new SohlIntrinsicAction(this, data);
        });
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
        const actionKeys = new Set<string>();
        this.actions = this.parent.actionList.reduce(
            (ary: SohlAction[], action) => {
                ary.push(new SohlScriptAction(this, action));
                actionKeys.add(action.label);
                return ary;
            },
            [],
        );
        this.intrinsicActions.reduce((ary: SohlAction[], a: SohlAction) => {
            if (!actionKeys.has(a.label)) {
                actionKeys.add(a.label);
                ary.push(a);
            }
            return ary;
        }, this.actions);
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
                a.contextGroup === SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
            if (hasDefault) {
                if (isDefault) {
                    a.contextGroup = SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL;
                }
            } else {
                hasDefault ||= isDefault;
            }
        });

        // If no default was specified, then make the requested default action the default
        if (!hasDefault) {
            const defaultAction = this.actions.find(
                (a) => a.label === this.defaultIntrinsicActionName,
            );
            if (defaultAction) {
                defaultAction.contextGroup =
                    SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        this.actions.sort((a: SohlAction, b: SohlAction) => {
            const contextGroupA =
                a.contextGroup || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            const contextGroupB =
                b.contextGroup || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            return collator.compare(contextGroupA, contextGroupB);
        });

        // If after all that, we still don't have a default action, then
        // set the first action as the default
        if (!hasDefault && this.actions.length) {
            this.actions[0].contextGroup = SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
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
                            a.contextGroup !==
                                SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN
                        );
                }
                let callback: SohlContextMenu.Callback;

                const newAction: SohlContextMenu.Entry =
                    new SohlContextMenu.Entry({
                        id: a.label,
                        name: a.label,
                        iconClass: a.contextIconClass,
                        // @ts-expect-error `ContextMenu.Condition` is misdefined, it should accept this
                        condition: cond,
                        group: toSohlContextMenuSortGroup(a.contextGroup),
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

    export interface Constructor<D extends Data = Data> {
        new (parent: D, data?: PlainObject, options?: PlainObject): Logic;
    }

    export interface Data extends foundry.abstract.TypeDataModel<any, any> {
        readonly parent: SohlItem | SohlActor;
        readonly logic: Logic;
        actionList: PlainObject[];
        eventList: PlainObject[];
    }
}
