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
    SOHL_ACTION_ROLE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SOHL_EVENT_STATE,
    SohlActionRole,
    SohlActionScope,
} from "@utils/constants";
import { SohlEvent } from "@common/event/SohlEvent";
import { SohlTemporal } from "./SohlTemporal";
import type { SohlEventContext } from "./SohlEventContext";

/**
 * @summary Base class for all Action instances
 */
export abstract class SohlAction extends SohlEvent {
    scope!: SohlActionScope;
    notes!: string;
    description!: string;
    contextIconClass!: string;
    contextCondition!: boolean | ((element: HTMLElement) => boolean);
    contextGroup!: string;
    isAsync!: boolean;
    permissions!: {
        execute: SohlActionRole;
    };
    private _function?: Function;

    constructor(data?: Partial<SohlAction.Data>, options?: PlainObject) {
        super(data, options);
        this.scope = data?.scope || SOHL_ACTION_SCOPE.SELF;
        this.notes = data?.notes || "";
        this.description = data?.description || "";
        this.contextIconClass = data?.contextIconClass || "fa-solid fa-gear";
        this.contextCondition = data?.contextCondition || true;
        this.contextGroup =
            data?.contextGroup || SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        this.isAsync = data?.isAsync || false;
        this.permissions = {
            execute: data?.permissions?.execute || SOHL_ACTION_ROLE.OWNER,
        };
    }

    get function(): Function {
        if (!this._function) {
            this._function = this.getFunction();
        }
        return this._function;
    }

    protected abstract getFunction(): Function;

    /**
     * Executes the intrinsic action synchronously.
     *
     * @remarks
     * Subclasses should override this method to provide custom synchronous behavior. The default
     * implementation throws an error if the result of the execution is a Promise, indicating
     * that synchronous execution is not supported.
     *
     * Either this method or {@link SohlAction.execute} must be implemented by subclasses,
     * but not both.
     *
     * @param actionContext - The context in which to execute the action, including any additional data.
     * @returns The result of the function call.
     * @throws If execution returns a Promise, which is unsupported.
     * @see {@link SohlAction.execute} for the asynchronous version of this method.
     */
    executeSync(actionContext: SohlEventContext): unknown {
        if (this.isAsync) {
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
     * Executes the intrinsic action asynchronously.
     *
     * @remarks
     * Subclasses should override this method to provide custom asynchronous behavior. The default
     * implementation calls the synchronous version of the method and wraps the result in a Promise.
     *
     * Either this method or {@link SohlAction.executeSync} must be implemented by subclasses,
     * but not both.
     *
     * @param actionContext - The context in which to execute the action, including any additional data.
     * @returns The result of the function call coerced as a Promise.
     */
    execute(actionContext: SohlEventContext): Promise<unknown> | unknown {
        return Promise.resolve(this.function(actionContext));
    }

    // Wire into lifecycle: actions are instantaneous by default (IMMEDIATE termination).
    private _running?: Promise<unknown>;

    protected override async _onActivate(ctx: SohlEventContext): Promise<void> {
        if (this._running) return; // guard against re-entry
        this._running = Promise.resolve(this.execute(ctx));
        let result;
        try {
            result = await this._running;
        } finally {
            this._running = undefined;
            this.setState(SOHL_EVENT_STATE.EXPIRED, {
                at: SohlTemporal.now(),
            });
        }
    }
}

export namespace SohlAction {
    export interface Data extends SohlEvent.Data {
        scope: SohlActionScope;
        notes: string;
        description: string;
        contextIconClass: string;
        contextCondition: boolean | ((element: HTMLElement) => boolean);
        contextGroup: string;
        isAsync: boolean;
        permissions: {
            execute: SohlActionRole;
        };
    }

    export interface ExecuteOptions {
        element?: HTMLElement;
    }

    export interface Constructor extends Function {
        new (data: PlainObject, options: PlainObject): SohlAction;
    }
}
