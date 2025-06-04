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

import { SohlActor } from "@common/actor";
import { SohlTokenDocument } from "@common/token";
import {
    defineType,
    FilePath,
    isFilePath,
    SimpleRoll,
    toHTMLWithContent,
    DocumentId,
    HTMLString,
} from "@utils";
import Handlebars from "handlebars";
import { getSystemSetting } from "./FoundryProxy";

export const {
    kind: CHATMESSAGE_ROLL_MODE,
    values: chatMessageRollModes,
    isValue: isChatMessageRollMode,
} = defineType({
    SYSTEM: "roll",
    PUBLIC: "publicroll",
    SELF: "selfroll",
    BLIND: "blindroll",
    PRIVATE: "gmroll",
});
export type ChatMessageRollMode =
    (typeof CHATMESSAGE_ROLL_MODE)[keyof typeof CHATMESSAGE_ROLL_MODE];

export const {
    kind: CHATMESSAGE_STYLE,
    values: chatMessageStyles,
    isValue: isChatMessageStyle,
} = defineType({
    OTHER: 0,
    OUT_OF_CHARACTER: 1,
    IN_CHARACTER: 2,
    EMOTE: 3,
});
export type ChatMessageStyle =
    (typeof CHATMESSAGE_STYLE)[keyof typeof CHATMESSAGE_STYLE];

export const {
    kind: CHATMESSAGE_SOUND,
    values: chatMessageSounds,
    isValue: isChatMessageSound,
} = defineType({
    DICE: "sounds/dice.wav",
    LOCK: "sounds/lock.wav",
    NOTIFICATION: "sounds/notify.wav",
    COMBAT: "sounds/drums.wav",
});
export type ChatMessageSound =
    (typeof CHATMESSAGE_SOUND)[keyof typeof CHATMESSAGE_SOUND];

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
    token: DocumentId | null;
    actor: DocumentId | null;
    scene: DocumentId | null;
    alias: string | null;
    rollMode?: ChatMessageRollMode;
}

export function isSohlSpeakerData(data: any): data is SohlSpeakerData {
    if (typeof data !== "object" || data === null) return false;
    if (
        !["token", "actor", "scene", "alias"].every(
            (key) => !data[key] || typeof data[key] === "string",
        )
    )
        return false;
    if (data.rollMode && !isChatMessageRollMode(data.rollMode)) return false;
    return true;
}

export class SohlSpeaker {
    _speaker!: SohlSpeakerData;
    _rollMode!: string;
    _token: SohlTokenDocument | null;
    _actor: SohlActor | null;
    _scene: AnyConstructor | null;
    _name: string;

    constructor(
        data: SohlSpeakerData = {
            actor: null,
            token: null,
            scene: null,
            alias: null,
        },
    ) {
        this._speaker = data;
        this._token = null;
        this._actor = null;
        this._scene = null;
        this._rollMode =
            data.rollMode ||
            getSystemSetting<ChatMessageRollMode>("rollMode", "core") ||
            CHATMESSAGE_ROLL_MODE.SYSTEM;
        if (data.token) {
            this._token = canvas.tokens?.get(data.token);
            this._actor = this._token?.actor;
        }
        if (!this._actor && data.actor) {
            this._actor = fvtt.game.actors?.get(data.actor);
        }
        if (data.scene) {
            this._scene = fvtt.game.scenes?.get(data.scene);
        }

        if (this._speaker.alias) {
            this._name = this._speaker.alias;
        } else if (this._token?.name) {
            this._name = this._token.name;
        } else if (this._actor?.name) {
            this._name = this._actor.name;
        } else {
            this._name = "Unknown Speaker";
        }
    }

    get name(): string {
        return this._name;
    }

    get token(): SohlTokenDocument | null {
        return this._token;
    }

    get actor(): SohlActor | null {
        return this._actor;
    }

    get scene(): AnyConstructor | null {
        return this._scene;
    }

    get rollMode(): string {
        return this._rollMode;
    }

    get isOwner() {
        if (!this._speaker || typeof this._speaker !== "object") return false;
        if (this._speaker?.alias) {
            return true; // Alias is always considered owner
        }

        if (this._speaker?.token) {
            const token = canvas.tokens.get(this._speaker.token);
            if (token) {
                return token.isOwner;
            }
        } else if (this._speaker?.actor) {
            const actor = fvtt.game.actors?.get(this._speaker.actor);
            if (actor) {
                return actor.isOwner;
            }
        }

        // If no token or actor is found, return false
        return false;
    }

    toJSON(): JsonValue {
        return {
            token: this._token?.id ?? "",
            actor: this._actor?.id ?? "",
            scene: (this._scene as any)?.id ?? "",
            alias: this._speaker.alias ?? "",
            rollMode: this._rollMode,
        };
    }

    toChat(
        input: HTMLString | FilePath,
        data?: PlainObject,
        options?: PlainObject,
    ): void {
        if (isFilePath(input)) {
            this._toChatWithTemplate(input, data, options);
        } else {
            this._toChatWithContent(input, data, options);
        }
    }

    /**
     * Sends a chat message using a template.
     * @param {string} template - The template to use.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    protected async _toChatWithTemplate(
        template: FilePath,
        data: PlainObject = {},
        options: PlainObject = {},
    ): Promise<void> {
        const messageData = await this._prepareChat(data, options);
        messageData.content = await (
            fvtt.applications.handlebars as any
        ).renderTemplate(template, data);
        if (messageData.rollMode) {
            ChatMessage.applyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        // ChatMessage.create() exists, but TS doesn't realize it because ChatMessage extends
        // ClientDocumentMixin, and TS loses track of the fact that it is a Document.
        await (fvtt.documents.ChatMessage as any).create(messageData);
    }

    /**
     * Sends a chat message with content.
     * @param {string} content - The content of the message.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={}] - The options for the message.
     * @returns {Promise<void>}
     */
    protected async _toChatWithContent(
        content: HTMLString,
        data: PlainObject = {},
        options: PlainObject = {},
    ): Promise<void> {
        const messageData = await this._prepareChat(data, options);

        const compiled = Handlebars.compile(content);
        messageData.content = toHTMLWithContent(content, data);
        if (messageData.rollMode) {
            ChatMessage.applyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        // ChatMessage.create() exists, but TS doesn't realize it because ChatMessage extends
        // ClientDocumentMixin, and TS loses track of the fact that it is a Document.
        await (fvtt.documents.ChatMessage as any).create(messageData);
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
        options: ChatOptions = { style: CHATMESSAGE_STYLE.OTHER },
    ): Promise<PlainObject> {
        const msgOptions = Object.fromEntries(
            Object.entries(options).filter(([key]) => key !== "rollMode"),
        );
        const msgData: PlainObject = {
            rolls: [] as (typeof foundry.dice.Roll)[],
            ...data,
            ...msgOptions,
            user: options.user,
            speaker: this._speaker,
        };

        if (options.rolls) {
            for (const roll of options.rolls) {
                msgData.rolls.push(await roll.createRoll());
            }
        }

        if (this._rollMode) {
            msgData.rollMode = this._rollMode;
        }

        return msgData;
    }
}
