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

import { SimpleRoll, DataField, RegisterClass } from "@utils";
import { foundry, game, canvas } from "@foundry";
import { SohlBase } from "@logic/common/core";
import Handlebars from "handlebars";

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

export enum ChatMessageStyle {
    OTHER = 0,
    OUT_OF_CHARACTER = 1,
    IN_CHARACTER = 2,
    EMOTE = 3,
}

/**
 * Common values for chat message sounds.
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
export function isChatMessageRollMode(value: string): value is string {
    return (
        value === ChatMessageRollMode.SYSTEM ||
        value === ChatMessageRollMode.PUBLIC ||
        value === ChatMessageRollMode.SELF ||
        value === ChatMessageRollMode.BLIND ||
        value === ChatMessageRollMode.PRIVATE
    );
}

export interface ChatOptions {
    flavor?: string;
    sound?: string;
    rolls?: SimpleRoll[];
    style?: ChatMessageStyle;
    user?: string;
}

export function isChatOptions(data: any): data is ChatOptions {
    return (
        typeof data === "object" &&
        (data.flavor === undefined || typeof data.flavor === "string") &&
        (data.sound === undefined || typeof data.sound === "string") &&
        (data.rolls === undefined || Array.isArray(data.rolls)) &&
        (data.style === undefined || typeof data.style === "number") &&
        (data.user === undefined || typeof data.user === "string")
    );
}

export interface SohlSpeakerData {
    token?: string;
    actor?: string;
    scene?: string;
    alias?: string;
}

export function isSohlSpeakerData(data: any): data is SohlSpeakerData {
    return (
        typeof data === "object" &&
        (data.token === undefined || typeof data.token === "string") &&
        (data.actor === undefined || typeof data.actor === "string") &&
        (data.scene === undefined || typeof data.scene === "string") &&
        (data.alias === undefined || typeof data.alias === "string")
    );
}

@RegisterClass("SohlSpeaker", "0.6.0")
export class SohlSpeaker extends SohlBase {
    @DataField("speaker", {
        initial: (data: unknown) => {
            return data as SohlSpeakerData;
        },
        validator: isSohlSpeakerData,
    })
    speaker!: SohlSpeakerData;

    @DataField("rollMode", {
        type: String,
        initial: ChatMessageRollMode.SYSTEM,
        validator: isChatMessageRollMode,
    })
    rollMode!: string;

    /**
     * Gets the name of the speaker.
     */
    get name() {
        if (!this.speaker || typeof this.speaker !== "object") {
            throw new Error("Invalid speaker data.");
        }

        // Use alias if provided
        if (this.speaker.alias) {
            return this.speaker.alias;
        }

        // Fallback to token name if alias is not available
        if (this.speaker.token) {
            const token = game.scenes?.active?.tokens?.get(this.speaker.token);
            if (token) {
                return token.name;
            }
        }

        // Fallback to actor name if token is not available
        if (this.speaker.actor) {
            const actor = game.actors?.get(this.speaker.actor); // Assuming `game.actors` is available in Foundry VTT
            if (actor) {
                return actor.name;
            }
        }

        // Default to "Unknown Speaker" if no name can be determined
        return "Unknown Speaker";
    }

    get isOwner() {
        if (!this.speaker || typeof this.speaker !== "object") return false;
        if (this.speaker?.alias) {
            return true; // Alias is always considered owner
        }

        if (this.speaker?.token) {
            const token = canvas.tokens.get(this.speaker.token);
            if (token) {
                return token.isOwner;
            }
        } else if (this.speaker?.actor) {
            const actor = game.actors?.get(this.speaker.actor);
            if (actor) {
                return actor.isOwner;
            }
        }

        // If no token or actor is found, return false
        return false;
    }

    /**
     * Sends a chat message using a template.
     * @param {string} template - The template to use.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    async toChatWithTemplate(
        template: string,
        data: PlainObject = {},
        options: PlainObject = {},
    ): Promise<void> {
        const messageData = await this._prepareChat(data, options);
        messageData.content =
            await foundry.applications.handlebars.renderTemplate(
                template,
                data,
            );
        if (messageData.rollMode) {
            foundry.documents.ChatMessage.applyRollMode(
                messageData,
                messageData.rollMode,
            );
            delete messageData.rollMode;
        }

        await foundry.documents.ChatMessage.create(messageData);
    }

    /**
     * Sends a chat message with content.
     * @param {string} content - The content of the message.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    async toChatWithContent(
        content: string,
        data: PlainObject = {},
        options: PlainObject = {},
    ): Promise<void> {
        const messageData = await this._prepareChat(data, options);

        const compiled = Handlebars.compile(content);
        messageData.content = compiled(messageData, {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true,
        });
        if (messageData.rollMode) {
            foundry.documents.ChatMessage.applyRollMode(
                messageData,
                messageData.rollMode,
            );
            delete messageData.rollMode;
        }

        await foundry.documents.ChatMessage.create(messageData);
    }

    /**
     * Prepares chat message data.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={ style: CONST.CHAT_MESSAGE_STYLES.OTHER }] - The options for the message.
     * @returns {PlainObject} The prepared message data.
     * @private
     */
    async _prepareChat(
        data: PlainObject = {},
        options: ChatOptions = { style: ChatMessageStyle.OTHER },
    ): Promise<PlainObject> {
        const msgOptions = Object.fromEntries(
            Object.entries(options).filter(([key]) => key !== "rollMode"),
        );
        const msgData: PlainObject = {
            rolls: [] as (typeof foundry.dice.Roll)[],
            ...data,
            ...msgOptions,
            user: options.user,
            speaker: this.speaker,
        };

        if (options.rolls) {
            for (const roll of options.rolls) {
                msgData.rolls.push(await roll.createRoll());
            }
        }

        if (this.rollMode) {
            msgData.rollMode = this.rollMode;
        }

        return msgData;
    }
}
