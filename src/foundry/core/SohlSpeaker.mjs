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

import { SohlBase } from "../../logic/common/core/SohlBase.js";
import { SimpleRoll } from "../../utils/SimpleRoll.js";

/**
 * Options for creating a SohlSpeaker instance.
 * @typedef {Object} SohlSpeakerOptions
 * @property {SohlActor} [actor] - The associated actor.
 * @property {TokenDocument} [token] - The associated token.
 * @property {string} [alias] - The alias for the speaker.
 * @property {Scene} [scene] - The associated scene.
 */

/**
 * Enum for chat message roll modes.
 */
export const ChatMessageRollMode = {
    SYSTEM: "roll",
    PUBLIC: "publicroll",
    SELF: "selfroll",
    BLIND: "blindroll",
    PRIVATE: "gmroll",
};

/**
 * Enum for chat message sounds.
 */
export const ChatMessageSounds = {
    DICE: "sounds/dice.wav",
    LOCK: "sounds/lock.wav",
    NOTIFICATION: "sounds/notify.wav",
    COMBAT: "sounds/drums.wav",
};

/**
 * Checks if a value is a valid ChatMessageRollMode.
 * @param {string} value - The value to check.
 * @returns {boolean} True if the value is a valid ChatMessageRollMode.
 */
export function isChatMessageRollMode(value) {
    return (
        value === ChatMessageRollMode.SYSTEM ||
        value === ChatMessageRollMode.PUBLIC ||
        value === ChatMessageRollMode.SELF ||
        value === ChatMessageRollMode.BLIND ||
        value === ChatMessageRollMode.PRIVATE
    );
}

/**
 * Options for sending a chat message.
 * @typedef {Object} ToChatOptions
 * @property {string} [flavor] - The flavor text for the message.
 * @property {string} [sound] - The sound to play with the message.
 * @property {SimpleRoll[]} [rolls] - The rolls to include in the message.
 * @property {number} [style] - The style of the message.
 */

/**
 * Class representing a chat speaker.
 * @extends SohlBase
 */
export class SohlSpeaker extends SohlBase {
    static {
        const ele = registerClass(this, "SohlSpeaker", "0.6.0");
        registerDataField(ele, "speaker", {
            type: Object,
            initial: () => ChatMessage.getSpeaker(),
        });
        registerDataField(ele, "rollMode", {
            type: String,
            initial: ChatMessageRollMode.SYSTEM,
        });
        sohl.classRegistry.set("SohlSpeaker", ele);
    }

    speaker;
    rollMode;
    _actor;
    _token;
    _alias;
    _scene;

    /**
     * Creates a SohlSpeaker instance.
     * @param {SohlBaseParent} parent - The parent object.
     * @param {SohlSpeakerData} [data={}] - The data for the chat speaker.
     * @param {SohlSpeakerOptions} [options={}] - The options for the chat speaker.
     */
    constructor(parent, data = {}, options = {}) {
        super(parent, data, options);
        this._token = data.token ? game.tokens.get(data.token) : options.token;
        this._actor =
            this._token?.actor || game.actors.get(data.actor) || options.actor;
        this._scene = data.scene ? game.scenes.get(data.scene) : options.scene;
        this._alias = data.alias || options.alias;
    }

    /**
     * Gets the associated actor.
     * @returns {SohlActor|undefined}
     */
    get actor() {
        return this._actor;
    }

    /**
     * Gets the associated token.
     * @returns {TokenDocument|undefined}
     */
    get token() {
        return this._token;
    }

    /**
     * Gets the alias of the speaker.
     * @returns {string|undefined}
     */
    get alias() {
        return this._alias;
    }

    /**
     * Gets the associated scene.
     * @returns {Scene|undefined}
     */
    get scene() {
        return this._scene;
    }

    /**
     * Gets the name of the speaker.
     * @returns {string}
     */
    get name() {
        return (
            this._token?.name || this._actor?.name || this._alias || "(unknown)"
        );
    }

    /**
     * Checks if the speaker is the owner.
     * @returns {boolean}
     */
    get isOwner() {
        return cast < any > this._actor?.isOwner ?? false;
    }

    /**
     * Sends a chat message using a template.
     * @param {string} template - The template to use.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ToChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    async toChatWithTemplate(template, data = {}, options = {}) {
        const messageData = this._prepareChat(data, options);
        messageData.content =
            await foundry.applications.handlebars.renderTemplate(
                template,
                data,
            );
        (await cast) < any > foundry.documents.ChatMessage.create(messageData);
    }

    /**
     * Sends a chat message with content.
     * @param {string} content - The content of the message.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ToChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    async toChatWithContent(content, data = {}, options = {}) {
        const messageData = this._prepareChat(data, options);

        const compiled = Handlebars.compile(content);
        messageData.content = compiled(messageData, {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true,
        });

        (await cast) < any > foundry.documents.ChatMessage.create(messageData);
    }

    /**
     * Prepares chat message data.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ToChatOptions} [options={ style: CONST.CHAT_MESSAGE_STYLES.OTHER }] - The options for the message.
     * @returns {PlainObject} The prepared message data.
     * @private
     */
    async _prepareChat(
        data = {},
        options = { style: CONST.CHAT_MESSAGE_STYLES.OTHER },
    ) {
        const msgOptions = Object.fromEntries(
            Object.entries(options).filter(([key]) => key !== "rollMode"),
        );
        const msgData = {
            rolls: [],
            ...data,
            ...msgOptions,
            user: game.user.id,
            speaker: this.speaker,
        };
        if (options.rolls) {
            for (const roll of options.rolls) {
                msgData.rolls.push(await SohlSystem.createRoll(roll));
            }
        }
        ChatMessage.applyRollMode(msgData, this.rollMode);
        return msgData;
    }
}
