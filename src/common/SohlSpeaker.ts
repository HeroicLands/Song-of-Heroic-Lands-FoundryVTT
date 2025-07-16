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
    toHTMLWithTemplate,
} from "@utils";
import Handlebars from "handlebars";
import { getSystemSetting } from "./FoundryProxy";
import { SohlUser } from "./user/SohlUser";
import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents/_types.mjs";

export class SohlSpeaker {
    _speaker!: SohlSpeaker.Data;
    readonly rollMode: string;
    readonly token: SohlTokenDocument | null;
    readonly actor: SohlActor | null;
    readonly scene: Scene | null;
    readonly name: string;
    readonly user: SohlUser;

    constructor({
        rollMode,
        user,
        alias,
        token,
        actor,
        scene,
    }: Partial<SohlSpeaker.Data> = {}) {
        this.token = null;
        this.actor = null;
        this.scene = null;
        this.rollMode =
            rollMode ||
            getSystemSetting<SohlSpeaker.RollMode>("rollMode", "core") ||
            SohlSpeaker.ROLL_MODE.SYSTEM;
        if (token) {
            this.token = canvas.tokens?.get(token);
            this.actor = this.token?.actor;
        }
        if (!this.actor && actor) {
            this.actor = fvtt.game.actors?.get(actor);
        }
        if (scene) {
            this.scene = fvtt.game.scenes?.get(scene);
        }

        this.user = user ? fvtt.game.users?.get(user) : fvtt.game.user;
        if (alias) {
            this.name = alias;
        } else if (this.token?.name) {
            this.name = this.token.name;
        } else if (this.actor?.name) {
            this.name = this.actor.name;
        } else if ((this.user as any)?.character?.name) {
            this.name = (this.user as any).character.name;
        } else {
            this.name = this.user?.name || "Unknown Speaker";
        }
    }

    getChatMessageSpeaker(): ChatMessageData {
        return {
            alias: this.name,
            token: this.token?.id ?? null,
            actor: this.actor?.id ?? null,
            scene: (this.scene as any)?.id ?? null,
        };
    }

    get isOwner() {
        if (this.token) {
            return this.token.isOwner;
        } else if (this.actor) {
            return this.actor.isOwner;
        }

        // If no token or actor is found, return false
        return false;
    }

    toJSON(): JsonValue {
        return {
            token: this.token?.id ?? "",
            actor: this.actor?.id ?? "",
            scene: (this.scene as any)?.id ?? "",
            alias: this.name,
            user: this.user.id,
            rollMode: this.rollMode,
        };
    }

    toChat(
        input: HTMLString | FilePath,
        data?: PlainObject,
        options?: PlainObject,
    ): Promise<ChatMessage> {
        if (isFilePath(input)) {
            return this._toChatWithTemplate(input, data, options);
        } else {
            return this._toChatWithContent(input, data, options);
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
    ): Promise<ChatMessage> {
        const messageData = await this._prepareChat(data, options);
        messageData.content = await toHTMLWithTemplate(template, data);
        if (messageData.rollMode) {
            ChatMessage.applyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        // ChatMessage.create() exists, but TS doesn't realize it because ChatMessage extends
        // ClientDocumentMixin, and TS loses track of the fact that it is a Document.
        return (fvtt.documents.ChatMessage as any).create(messageData);
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
    ): Promise<ChatMessage> {
        const messageData = await this._prepareChat(data, options);

        const compiled = Handlebars.compile(content);
        messageData.content = toHTMLWithContent(content, data);
        if (messageData.rollMode) {
            ChatMessage.applyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        // ChatMessage.create() exists, but TS doesn't realize it because ChatMessage extends
        // ClientDocumentMixin, and TS loses track of the fact that it is a Document.
        return (fvtt.documents.ChatMessage as any).create(messageData);
    }

    /**
     * Prepares chat message data.
     * @param {PlainObject} [data={}] - The data for the message.
     * @param {ChatOptions} [options={ style: SohlSpeaker.STYLE.OTHER }] - The options for the message.
     * @returns {PlainObject} The prepared message data.
     * @private
     */
    async _prepareChat(
        data: PlainObject = {},
        options: SohlSpeaker.ChatOptions = { style: SohlSpeaker.STYLE.OTHER },
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

        if (this.rollMode) {
            msgData.rollMode = this.rollMode;
        }

        return msgData;
    }
}

export namespace SohlSpeaker {
    export const {
        kind: ROLL_MODE,
        values: RollModes,
        isValue: isRollMode,
    } = defineType("SOHL.SohlSpeaker.ROLL_MODE", {
        SYSTEM: "roll",
        PUBLIC: "publicroll",
        SELF: "selfroll",
        BLIND: "blindroll",
        PRIVATE: "gmroll",
    });
    export type RollMode = (typeof ROLL_MODE)[keyof typeof ROLL_MODE];

    export const {
        kind: STYLE,
        values: styles,
        isValue: isStyle,
    } = defineType("SOHL.SohlSpeaker.STYLE", {
        OTHER: 0,
        OUT_OF_CHARACTER: 1,
        IN_CHARACTER: 2,
        EMOTE: 3,
    });
    export type ChatMessageStyle = (typeof STYLE)[keyof typeof STYLE];

    export const {
        kind: SOUND,
        values: sounds,
        isValue: isSound,
    } = defineType("SOHL.SohlSpeaker.SOUND", {
        DICE: "sounds/dice.wav",
        LOCK: "sounds/lock.wav",
        NOTIFICATION: "sounds/notify.wav",
        COMBAT: "sounds/drums.wav",
    });
    export type ChatMessageSound = (typeof SOUND)[keyof typeof SOUND];

    export interface ChatOptions {
        flavor?: string;
        sound?: string;
        rolls?: SimpleRoll[];
        style?: ChatMessageStyle;
        user?: string;
    }

    export namespace ChatOptions {
        export function isA(data: any): data is ChatOptions {
            return (
                typeof data === "object" &&
                (data.flavor === undefined ||
                    typeof data.flavor === "string") &&
                (data.sound === undefined || isSound(data.sound)) &&
                (data.rolls === undefined || Array.isArray(data.rolls)) &&
                (data.style === undefined || isStyle(data.style)) &&
                (data.user === undefined || typeof data.user === "string")
            );
        }
    }

    export interface Data {
        token: DocumentId | null;
        actor: DocumentId | null;
        scene: DocumentId | null;
        alias: string | null;
        rollMode?: RollMode;
        user: DocumentId;
    }

    export namespace Data {
        export function isA(data: any): data is Data {
            if (typeof data !== "object" || data === null) return false;
            if (
                !["token", "actor", "scene", "alias"].every(
                    (key) => !data[key] || typeof data[key] === "string",
                )
            )
                return false;
            if (data.rollMode && !isRollMode(data.rollMode)) return false;
            return true;
        }
    }
}
