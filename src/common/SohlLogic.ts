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

import { defineType, SOHL_CONTEXT_MENU_SORT_GROUP } from "@utils/constants";
import { toDocumentId } from "@utils/helpers";
import { SohlBase } from "@common/SohlBase";
import { SohlEvent } from "@common/event/SohlEvent";
import { SohlIntrinsicAction } from "@common/event/SohlIntrinsicAction";
import { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { SohlItem } from "@common/item/SohlItem";
import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlAction } from "@common/event/SohlAction";
import type { SohlDataModel } from "@common/SohlDataModel";
import { SohlSpeaker } from "./SohlSpeaker";

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: intrinsicActionLabels,
} = defineType("SOHL.SohlLogic.INTRINSIC_ACTION", {
    INITIALIZE: {
        id: toDocumentId("8QWJPT998Hqxwxkw"),
        title: "initialize",
        iconFAClass: "fas fa-gears",
        functionName: "initialize",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    EVALUATE: {
        id: toDocumentId("Ew4AvrixUNP6rQZy"),
        title: "evaluate",
        iconFAClass: "fas fa-gears",
        functionName: "evaluate",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    FINALIZE: {
        id: toDocumentId("8o5D6qVtFF43vTL9"),
        title: "finalize",
        iconFAClass: "fas fa-gears",
        functionName: "finalize",
        condition: true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
} as StrictObject<Partial<SohlIntrinsicAction.Data>>);
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

export abstract class SohlLogic<
    TData extends SohlDataModel.Data<any> = SohlDataModel.Data<any>,
> extends SohlBase {
    private readonly _parent: TData;

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

    get nestedIn(): SohlItem | null {
        return this.item?.nestedIn ?? null;
    }

    get typeLabel(): string {
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
            data.title ??= intrinsicActionLabels[key];
            return data;
        });

        return actions.map((data) => {
            return new SohlIntrinsicAction(data, { parent: this });
        });
    }

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!options.parent) {
            throw new Error(
                "SohlLogic must be constructed with a parent item or actor.",
            );
        }
        super(data, options);
        this._parent = options.parent;
    }

    setDefaultAction(events: SohlEvent[]): void {
        // Ensure there is at most one default, all others set to Essential
        let hasDefault = false;
        events.forEach((evt) => {
            if (evt instanceof SohlIntrinsicAction) {
                const action = evt as SohlIntrinsicAction;
                const isDefault =
                    action.contextGroup ===
                    SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
                if (hasDefault) {
                    if (isDefault) {
                        action.contextGroup =
                            SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL;
                    }
                } else {
                    hasDefault ||= isDefault;
                }
            }
        });

        // If no default was specified, then make the requested default action the default
        if (!hasDefault) {
            const defaultAction = events.find(
                (evt) => evt.title === this.defaultIntrinsicActionName,
            );
            if (defaultAction && defaultAction instanceof SohlIntrinsicAction) {
                defaultAction.contextGroup =
                    SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        events.sort((evtA: SohlEvent, evtB: SohlEvent) => {
            const contextGroupA =
                (evtA as any).contextGroup ||
                SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            const contextGroupB =
                (evtB as any).contextGroup ||
                SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
            return collator.compare(contextGroupA, contextGroupB);
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
     * Initializes base state for this participant.
     * Should not rely on sibling or external logic state.
     */
    abstract initialize(context?: SohlEventContext): void;

    /**
     * Evaluates business logic using current and sibling state.
     */
    abstract evaluate(context?: SohlEventContext): void;

    /**
     * Final stage of lifecycle — compute derived values, cleanup, etc.
     */
    abstract finalize(context?: SohlEventContext): void;
}

export namespace SohlLogic {
    export interface EffectKeyData {
        name: string;
        abbrev: string;
    }

    export interface Data<
        TParent extends SohlDocument,
        TLogic extends SohlLogic<any>,
    > extends SohlDataModel.Data<TParent> {
        readonly parent: TParent;
        readonly logic: TLogic;
        readonly kind: string;
    }
}
