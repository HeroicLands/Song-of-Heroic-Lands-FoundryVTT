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
    SohlAction,
    SohlEvent,
    SohlIntrinsicAction,
    ScriptAction,
} from "@logic/common/core/event";
import {
    ContextMenuCondition,
    foundryHelpers,
    RegisterClass,
    SohlContextMenu,
} from "@utils";
import { ContextMenuSortGroup, ContextMenuEntry } from "@utils";
import { SohlPerformerData } from "@logic/common/core";
import { SohlItemProxy } from "../item";
import { SohlActorProxy } from "../actor";

@RegisterClass("SohlPerformer", "0.6.0")
export class SohlPerformer<P extends SohlPerformerData = SohlPerformerData> {
    readonly parent: P;
    readonly actions!: SohlAction[];
    readonly events!: SohlEvent[];

    readonly intrinsicActions = {
        INITIALIZE: {
            name: "initialize",
            iconClass: "fas fa-gears",
            condition: true,
            group: ContextMenuSortGroup.HIDDEN,
        },
        EVALUATE: {
            name: "evaluate",
            iconClass: "fas fa-gears",
            condition: true,
            group: ContextMenuSortGroup.HIDDEN,
        },
        FINALIZE: {
            name: "finalize",
            iconClass: "fas fa-gears",
            condition: true,
            group: ContextMenuSortGroup.HIDDEN,
        },
    } as const;

    get item(): SohlItemProxy | null {
        if ("item" in this.parent) {
            return this.parent.item as SohlItemProxy;
        } else {
            return null;
        }
    }

    get actor(): SohlActorProxy | null {
        if ("actor" in this.parent) {
            return this.parent.actor as SohlActorProxy;
        } else {
            return this.item?.actor || null;
        }
    }

    get defaultIntrinsicActionName() {
        return "";
    }

    constructor(parent: P, data: PlainObject = {}, options: PlainObject = {}) {
        this.parent = parent;
        const intrinsics = Object.values(this.intrinsicActions).map(
            (a: PlainObject) => new SohlIntrinsicAction(this, a),
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
            const isDefault = a.contextGroup === ContextMenuSortGroup.DEFAULT;
            if (hasDefault) {
                if (isDefault) {
                    a.contextGroup = ContextMenuSortGroup.ESSENTIAL;
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
                defaultAction.contextGroup = ContextMenuSortGroup.DEFAULT;
                hasDefault = true;
            }
        }

        const collator = new Intl.Collator(sohl.i18n.lang);
        this.actions.sort((a: SohlAction, b: SohlAction) => {
            const contextGroupA =
                a.contextGroup || ContextMenuSortGroup.GENERAL;
            const contextGroupB =
                b.contextGroup || ContextMenuSortGroup.GENERAL;
            return collator.compare(contextGroupA, contextGroupB);
        });

        // If after all that, we still don't have a default action, then
        // set the first action as the default
        if (!hasDefault && this.actions.length) {
            this.actions[0].contextGroup = ContextMenuSortGroup.DEFAULT;
        }
    }

    _getContextOptions() {
        let result = this.actions.reduce(
            (ary: ContextMenuEntry[], a: SohlAction) => {
                let cond: ContextMenuCondition = a.contextCondition;
                if (typeof cond !== "function") {
                    cond = () =>
                        !!(
                            cond &&
                            a.contextGroup !== ContextMenuSortGroup.HIDDEN
                        );
                }

                if (cond) {
                    const newAction = {
                        id: a.name,
                        name: a.name,
                        icon: `<i class="${a.contextIconClass}${a.contextGroup === ContextMenuSortGroup.DEFAULT ? " fa-beat-fade" : ""}"></i>`,
                        condition: cond,
                        callback: (element: HTMLElement) =>
                            a.execute({ element }),
                        group: a.contextGroup,
                    } as ContextMenuEntry;
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
    initialize(options: PlainObject = {}): void {}

    /**
     * Evaluates business logic using current and sibling state.
     */
    evaluate(options: PlainObject = {}): void {}

    /**
     * Final stage of lifecycle — compute derived values, cleanup, etc.
     */
    finalize(options: PlainObject = {}): void {}
}
