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

import { SohlEvent, SohlEventData } from "@common/event";
import { SohlPerformer } from "@common";
import { CONTEXTMENU_SORT_GROUP, defineType } from "@utils";

/**
 * @summary Base class for all Action instances
 */
export abstract class SohlAction<
    P extends SohlPerformer = SohlPerformer,
> extends SohlEvent<P> {
    scope!: SohlAction.Scope;
    notes!: string;
    description!: string;
    contextIconClass!: string;
    contextCondition!: boolean | ((element: HTMLElement) => boolean);
    contextGroup!: string;

    constructor(
        parent: P,
        data?: Partial<SohlAction.Data>,
        options?: PlainObject,
    ) {
        super(parent, data, options);
        this.scope = data?.scope || SohlAction.SCOPE.SELF;
        this.notes = data?.notes || "";
        this.description = data?.description || "";
        this.contextIconClass = data?.contextIconClass || "fa-solid fa-gear";
        this.contextCondition = data?.contextCondition || true;
        this.contextGroup =
            data?.contextGroup || CONTEXTMENU_SORT_GROUP.DEFAULT;
    }

    /**
     * Executes the intrinsic action, calling the function defined on the parent performer.
     * @param context - The scope in which to execute the action, including any additional data.
     * @param context.element - The HTML element that triggered the action, if applicable.
     * @param context.async - Whether to execute the action asynchronously. Defaults to true.
     * @returns If `async` is true, a Promise resolving to the result of the function call; if
     *      `async` is false, the result of the function call or undefined if the result is a Promise.
     */
    abstract execute(context?: SohlAction.Context): Promise<any> | any;
}

export namespace SohlAction {
    export const {
        kind: SCOPE,
        values: Scopes,
        isValue: isScope,
    } = defineType({
        SELF: "self",
        ITEM: "item",
        ACTOR: "actor",
        OTHER: "other",
    });
    export type Scope = (typeof SCOPE)[keyof typeof SCOPE];

    export interface Data extends SohlEventData {
        scope?: Scope;
        notes?: string;
        description?: string;
        contextIconClass?: string;
        contextCondition?: boolean | ((element: HTMLElement) => boolean);
        contextGroup?: string;
        [key: string]: any;
    }

    export interface Context {
        element?: HTMLElement;
        async?: boolean;
        [key: string]: any;
    }

    export interface Constructor extends Function {
        new (data: PlainObject, options: PlainObject): SohlAction;
    }
}
