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

/**
 * @module ActionContext
 * @summary Represents the full context provided to a SohlItem Action execution.
 * @description All values here are provided in domain-safe proxy form.
 */

import { SohlActor } from "@common/actor";
import { isSohlSpeakerData, SohlSpeaker, SohlSpeakerData } from "@common";
import { SohlItem } from "@common/item";
import {
    defaultToJSON,
    foundryHelpers,
    DocumentId,
    DocumentUuid,
} from "@utils";

export interface ActionData {
    speaker?: SohlSpeakerData;
    itemUuid?: DocumentUuid;
    targetUuid?: DocumentUuid;
    userId?: DocumentId;
    skipDialog: boolean;
    noChat: boolean;
    type: string;
    title: string;
    scope: UnknownObject;
}

export class ActionContext {
    private _speaker: SohlSpeaker;
    user: foundry.documents.User;
    item?: SohlItem;
    actor?: SohlActor;
    skipDialog: boolean;
    noChat: boolean;
    type: string;
    title: string;
    scope: UnknownObject;

    /**
     * @param {Object} data - The options to initialize the context.
     * @param {SohlSpeaker|PlainObject} [data.speaker] - The speaker object or plain object.
     * @param {string} [data.rollMode] - The roll mode to use.
     * @param {string} [data.logicUuid] - The UUID of the logic.
     * @param {string} [data.userId] - The user ID.
     */
    constructor(data: Partial<ActionData>) {
        if (!data.speaker) {
            throw new Error("ActionContext requires a speaker.");
        }
        if (isSohlSpeakerData(data.speaker)) {
            this._speaker = new SohlSpeaker(data.speaker);
        } else {
            this._speaker = data.speaker as SohlSpeaker;
        }

        if (data.targetUuid) {
            let target = foundryHelpers.fromUuidSync(data.targetUuid);
            if (target instanceof SohlActor) {
                this.actor = target;
            } else if (target instanceof SohlItem) {
                this.item = target;
                this.actor = target.actor;
            }
        }

        this.user = game.users.get(data.userId) ?? game.user;
        this.skipDialog = data.skipDialog ?? false;
        this.noChat = data.noChat ?? false;
        this.type = data.type ?? "";
        this.title = data.title ?? "";
        this.scope = data.scope ?? {};
    }

    get character(): SohlActor | null {
        return this.user.character ?? null;
    }

    get token(): foundry.documents.TokenDocument | null {
        return game.canvas.tokens?.get(this._speaker._token) ?? null;
    }

    /**
     * @summary Gets the speaker.
     * @returns {SohlSpeaker} The speaker associated with this action context.
     */
    get speaker(): SohlSpeaker {
        return this._speaker;
    }

    /**
     * @summary Converts the ActionContext to JSON.
     * @returns {Object} The JSON representation of the ActionContext.
     */
    toJSON(): Record<string, unknown> {
        return {
            userId: this.user.id,
            speaker: this._speaker.toJSON(),
            skipDialog: this.skipDialog,
            noChat: this.noChat,
            type: this.type,
            title: this.title,
            itemUuid: (this.item as any)?.uuid,
            scope: defaultToJSON(this.scope),
        };
    }

    /**
     * @summary Creates an ActionContext from data.
     * @description Converts plain object data into an ActionContext instance.
     * @param {Object} data - The data to convert.
     * @returns {ActionContext} A new ActionContext instance.
     */
    static fromData(data: ActionData): ActionContext {
        return new ActionContext(data);
    }

    async evaluateAsync(
        fn: string | ((args: Record<string, unknown>) => unknown),
        thisArg: unknown,
        params: Record<string, unknown> = {},
    ): Promise<unknown> {
        params.async = true;
        return this.evaluate(fn, thisArg, params);
    }

    evaluate(
        fn: string | ((args: UnknownObject) => unknown),
        thisArg: unknown,
        params: {
            async?: boolean;
            [key: string]: unknown;
        } = { async: false },
    ): unknown {
        if (typeof fn !== "string" && typeof fn !== "function") {
            throw new Error("evaluateSync requires a function or string.");
        }
        if (!thisArg) {
            throw new Error("evaluateSync requires a thisArg.");
        }

        const asyncAllowed = params.async;
        delete params.async;

        const args = {
            logic: this.item,
            speaker: this._speaker,
            user: this.user,
            ...params,
        };
        if (typeof fn === "string") {
            if (
                typeof (thisArg as Record<string, unknown>)[fn] !== "function"
            ) {
                throw new Error(`${fn} is not a function on thisArg.`);
            }
            fn = (thisArg as Record<string, unknown>)[fn] as (
                args: Record<string, unknown>,
            ) => unknown;
        }
        const result = fn.call(thisArg, args);

        // unless specifically allowed, promises are ignored
        return !asyncAllowed && result instanceof Promise ? undefined : result;
    }
}
