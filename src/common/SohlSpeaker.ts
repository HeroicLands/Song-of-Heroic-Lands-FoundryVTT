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
    isSohlSpeakerRollMode,
    isSohlSpeakerSound,
    isSohlSpeakerStyle,
    SOHL_SPEAKER_ROLL_MODE,
    SOHL_SPEAKER_STYLE,
    SohlSpeakerRollMode,
} from "@utils/constants";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import {
    FilePath,
    isFilePath,
    toHTMLWithContent,
    DocumentId,
    HTMLString,
    toHTMLWithTemplate,
} from "@utils/helpers";
import { SimpleRoll } from "@utils/SimpleRoll";
import Handlebars from "handlebars";
import { SohlUser } from "@common/user/SohlUser";
import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents/_types.mjs";
import { SohlSpeakerStyle } from "@utils/constants";

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
            (game as any).settings.get("core", "rollMode") ||
            SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        if (token) {
            this.token = canvas.tokens?.get(token);
            this.actor = this.token?.actor;
        }
        if (!this.actor && actor) {
            this.actor = (game as any).actors?.get(actor);
        }
        if (scene) {
            this.scene = (game as any).scenes?.get(scene);
        }

        this.user = user ? (game as any).users?.get(user) : (game as any).user;
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
        return (foundry.documents as any).ChatMessage.create(messageData);
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

        messageData.content = toHTMLWithContent(content, data);
        if (messageData.rollMode) {
            ChatMessage.applyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        // ChatMessage.create() exists, but TS doesn't realize it because ChatMessage extends
        // ClientDocumentMixin, and TS loses track of the fact that it is a Document.
        return (foundry.documents as any).ChatMessage.create(messageData);
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
        options: SohlSpeaker.ChatOptions = { style: SOHL_SPEAKER_STYLE.OTHER },
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
    export interface ChatOptions {
        flavor?: string;
        sound?: string;
        rolls?: SimpleRoll[];
        style?: SohlSpeakerStyle;
        user?: string;
    }

    export namespace ChatOptions {
        export function isA(data: any): data is ChatOptions {
            return (
                typeof data === "object" &&
                (data.flavor === undefined ||
                    typeof data.flavor === "string") &&
                (data.sound === undefined || isSohlSpeakerSound(data.sound)) &&
                (data.rolls === undefined || Array.isArray(data.rolls)) &&
                (data.style === undefined || isSohlSpeakerStyle(data.style)) &&
                (data.user === undefined || typeof data.user === "string")
            );
        }
    }

    export interface Data {
        token: DocumentId | null;
        actor: DocumentId | null;
        scene: DocumentId | null;
        alias: string | null;
        rollMode?: SohlSpeakerRollMode;
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
            if (data.rollMode && !isSohlSpeakerRollMode(data.rollMode))
                return false;
            return true;
        }
    }
}
