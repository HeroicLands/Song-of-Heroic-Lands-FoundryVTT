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

import { SohlActor } from "@foundry/actor";
import { SohlBaseParent, SohlSpeaker } from "@logic/common/core";
import { SohlItem } from "@foundry/item";
import { foundryHelpers } from "@utils";

export class ActionContext {
    private _speaker: SohlSpeaker;
    private _chat: SohlSpeaker;
    private _item?: SohlItem;
    private _user: User;
    private _actor?: SohlActor;

    /**
     * @param {Object} options - The options to initialize the context.
     * @param {SohlSpeaker|PlainObject} [options.speaker] - The speaker object or plain object.
     * @param {string} [options.rollMode] - The roll mode to use.
     * @param {string} [options.logicUuid] - The UUID of the logic.
     * @param {string} [options.userId] - The user ID.
     */
    constructor(
        parent: SohlBaseParent,
        options: {
            speaker: SohlSpeaker | PlainObject;
            rollMode?: string;
            logicUuid?: string;
            userId?: string;
        },
    ) {
        if (!options.speaker) {
            throw new Error("ActionContext requires a speaker.");
        }
        if ((options.speaker as SohlSpeaker).chatMessageSpeaker) {
            this._speaker = (options.speaker as SohlSpeaker).chatMessageSpeaker;
            this._chat = options.speaker as SohlSpeaker;
            if (options.rollMode) {
                this._chat.rollMode = options.rollMode;
            }
        } else {
            this._speaker = options.speaker as SohlSpeaker;
            this._chat = new SohlSpeaker(parent, {
                speaker: options.speaker,
                rollMode: options.rollMode,
            });
        }

        if (options.logicUuid)
            this._item = foundryHelpers.fromUuidSync(
                options.logicUuid,
            ) as unknown as SohlItem;

        this._user = getUser(options.userId);

        if (this._speaker.token)
            this._token = canvas.tokens?.get(this._speaker.token);
        this._actor =
            this._token ?
                this._token.actor
            :   game.actors?.get(this._speaker.actor);

        if (!this._actor) this._actor = this._item?.entity?.actor;

        this._chat ||= new SohlSpeaker({
            speaker: this._speaker,
            rollMode: options.rollMode,
        });
    }

    /**
     * @summary Gets the chat context.
     * @returns {SohlSpeaker} The chat context associated with this action context.
     */
    get chat(): SohlSpeaker {
        return this._chat;
    }

    /**
     * @summary Converts the ActionContext to JSON.
     * @returns {Object} The JSON representation of the ActionContext.
     */
    toJSON(): Record<string, unknown> {
        const { speaker, rollMode } = this._chat.toJSON();
        return {
            userId: this._user.id,
            speaker: this._speaker,
            logic: this._item?.uuid,
            rollMode: this._chat.rollMode,
        };
    }

    /**
     * @summary Creates an ActionContext from data.
     * @description Converts plain object data into an ActionContext instance.
     * @param {Object} data - The data to convert.
     * @returns {ActionContext} A new ActionContext instance.
     */
    static fromData(data: Record<string, unknown>): ActionContext {
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
        fn: string | ((args: Record<string, unknown>) => unknown),
        thisArg: unknown,
        params: Record<string, unknown> = { async: false },
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
            logic: this._item,
            speaker: this._speaker,
            user: this._user,
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
function getUser(userId: string | undefined): User {
    throw new Error("Function not implemented.");
}
