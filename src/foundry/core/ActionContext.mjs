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
 * @summary Represents the full context provided to a SohlLogic Action execution.
 * @description All values here are provided in domain-safe proxy form.
 */

import { SohlActor } from "../actor/SohlActor.mjs";
import { SohlItem } from "../item/SohlItem.mjs";
import { SohlSpeaker } from "./SohlSpeaker.mjs";

/**
 * @summary Data structure for ActionContext.
 * @description Contains optional properties for user, speaker, actor, item, rollMode, and token.
 */
export class ActionContext {
    /**
     * @summary Constructs a new ActionContext instance.
     * @description Initializes the context with the provided options.
     * @param {Object} options - The options to initialize the context.
     */
    constructor(options = {}) {
        let { speaker, actor, item, rollMode, token } = options;
        let user = options.user ?? game.user;

        if (!(actor || item || token || speaker)) {
            throw new Error(
                "ActionContext: Must provide at least one of actor, item, or token.",
            );
        }
        if (speaker) {
            token = token ?? speaker.token;
            if (token) {
                actor = actor ?? token.actor;
            } else {
                actor = actor ?? speaker.actor;
            }
        }
        if (item) {
            actor = item.actor || actor;
        } else if (token) {
            actor = token.actor || actor;
        }
        if (!speaker) {
            speaker = ChatMessage.getSpeaker({ actor, token });
        }
        this._actor = actor ?? null;
        this._item = item ?? null;
        this._token = token ?? null;
        this._user = user;
        this._actorProxy = actor?.getProxy();
        this._itemProxy = item?.getProxy();
        this._tokenProxy = token?.getProxy();
        this._userProxy = user.getProxy();
        this._chat = new SohlSpeaker({
            speaker,
            rollMode,
        });
    }

    /**
     * @summary Gets the actor proxy.
     * @returns {SohlActorProxy | null} The actor proxy or null if not available.
     */
    get actor() {
        return this._actorProxy ?? null;
    }

    /**
     * @summary Gets the item proxy.
     * @returns {SohlItemProxy | null} The item proxy or null if not available.
     */
    get item() {
        return this._itemProxy ?? null;
    }

    /**
     * @summary Gets the token proxy.
     * @returns {SohlTokenProxy | null} The token proxy or null if not available.
     */
    get token() {
        return this._tokenProxy ?? null;
    }

    /**
     * @summary Gets the user proxy.
     * @returns {SohlUserProxy} The user proxy.
     */
    get user() {
        return this._userProxy;
    }

    /**
     * @summary Gets the chat context.
     * @returns {SohlSpeaker} The chat context associated with this action context.
     */
    get chat() {
        return this._chat;
    }

    /**
     * @summary Converts the ActionContext to JSON.
     * @returns {Object} The JSON representation of the ActionContext.
     */
    toJSON() {
        const { speaker, rollMode } = this._chat.toJSON();
        return {
            user: this._user,
            speaker,
            actor: this._actor,
            item: this._item,
            rollMode,
            token: this._token,
        };
    }

    /**
     * @summary Creates an ActionContext from data.
     * @description Converts plain object data into an ActionContext instance.
     * @param {Object} data - The data to convert.
     * @returns {ActionContext} A new ActionContext instance.
     */
    static fromData(data) {
        return new ActionContext(data);
    }
}
