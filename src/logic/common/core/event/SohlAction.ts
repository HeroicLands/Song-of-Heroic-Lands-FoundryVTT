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

import { SohlMap } from "@utils";
import { SohlEvent } from "@logic/common/core/event";
import { RegisterClass } from "@utils";

export enum ActionScope {
    SELF = "self",
    ITEM = "item",
    ACTOR = "actor",
    OTHER = "other",
}

export interface ActionConstructor extends Function {
    new (data: PlainObject, options: PlainObject): SohlAction;
}

/**
 * @summary Type representing a SohlMap of Action instances
 */
export type ActionMap = SohlMap<string, SohlAction>;

/**
 * @summary Base class for all Action instances
 */
export abstract class SohlAction extends SohlEvent {
    scope!: ActionScope;
    notes!: string;
    description!: string;
    contextIconClass!: string;
    contextCondition!: boolean | ((element: HTMLElement) => boolean);
    contextGroup!: string;

    /**
     * Execute an action. Executes synchronously unless otherwise specified.
     *
     * @param options - Optional parameters for execution.
     * @param [options.element] - The HTML element the action applies to, if any.
     * @param [options.async=true] - If true, the action should execute asynchronously.
     * @param [options.*] - Any additional key-value pairs will be interpreted as scope values.
     *                      These values will be passed to the action logic.
     * @returns The result of execution, which may be a value or a Promise resolving to a value.
     */
    abstract execute(options?: {
        element?: HTMLElement;
        [key: string]: any;
    }): Promise<any> | any;
}
