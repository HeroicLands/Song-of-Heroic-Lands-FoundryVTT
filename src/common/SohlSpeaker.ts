/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
    SOHL_SPEAKER_ROLL_MODE,
    SOHL_SPEAKER_STYLE,
    SohlSpeakerRollMode,
} from "@src/utils/constants";
import { SohlActor } from "@src/common/actor/foundry/SohlActor";
import { SohlTokenDocument } from "@src/common/token/SohlTokenDocument";
import { FilePath, isFilePath, HTMLString } from "@src/utils/helpers";
import {
    toHTMLWithContent,
    toHTMLWithTemplate,
} from "@src/common/FoundryProxy";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { SohlSpeakerStyle } from "@src/utils/constants";
import {
    getSetting as fvttGetSetting,
    getToken as fvttGetToken,
    getActor as fvttGetActor,
    getScene as fvttGetScene,
    getUser as fvttGetUser,
    currentUser as fvttCurrentUser,
    applyRollMode as fvttApplyRollMode,
    createChatMessage as fvttCreateChatMessage,
} from "@src/common/foundry-helpers";

export class SohlSpeaker {
    _speaker!: SohlSpeaker.Data;
    readonly rollMode: string;
    readonly token: SohlTokenDocument | null;
    readonly actor: SohlActor | null;
    readonly scene: Scene | null;
    readonly name: string;
    readonly user: User | null;

    /**
     * Construct a SohlSpeaker instance.
     *
     * @param options
     * @param options.rollMode The roll mode to use.
     * @param options.user The user ID.
     * @param options.token The token ID.
     * @param options.actor The actor ID.
     * @param options.scene The scene ID.
     * @param options.alias The alias to use.
     */
    constructor(data: Partial<SohlSpeaker.Data> = {}) {
        this.token = null;
        this.actor = null;
        this.scene = null;
        this.rollMode =
            data.rollMode ||
            (fvttGetSetting("core", "rollMode") as string) ||
            SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        if (data.token) {
            if (!(canvas instanceof foundry.canvas.Canvas)) {
                throw new Error("Canvas is not initialized");
            } else {
                this.token = (fvttGetToken(data.token) ||
                    null) as SohlTokenDocument | null;
            }
            this.actor = this.token?.actor || null;
        }
        if (!this.actor && data.actor) {
            this.actor = fvttGetActor(data.actor);
        }
        if (data.scene) {
            this.scene = fvttGetScene(data.scene);
        }

        this.user = data.user ? fvttGetUser(data.user) : fvttCurrentUser();
        if (data.alias) {
            this.name = data.alias;
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

    getChatMessageSpeaker(): foundry.documents.ChatMessage.SpeakerData {
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
            scene: this.scene?.id ?? "",
            alias: this.name,
            user: this.user?.id || null,
            rollMode: this.rollMode,
        };
    }

    toChat(
        input: HTMLString | FilePath,
        data?: PlainObject,
        options?: PlainObject,
    ): Promise<ChatMessage | undefined> {
        if (isFilePath(input)) {
            return this._toChatWithTemplate(input, data, options);
        } else {
            return this._toChatWithContent(input, data, options);
        }
    }

    /**
     * Sends a chat message using a template.
     * @param template The template to use.
     * @param data The data for the message.
     * @param options The options for the message.
     */
    protected async _toChatWithTemplate(
        template: FilePath,
        data: PlainObject = {},
        options: Partial<SohlSpeaker.ChatOptions> = {},
    ): Promise<ChatMessage | undefined> {
        const messageData = await this._prepareChat(data, options);
        messageData.content = await toHTMLWithTemplate(template, data);
        if (messageData.rollMode) {
            fvttApplyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        return fvttCreateChatMessage(messageData) as Promise<
            ChatMessage | undefined
        >;
    }

    /**
     * Sends a chat message with content.
     * @param content The HTML content of the message.
     * @param data The data for the message.
     * @param options The options for the message.
     */
    protected async _toChatWithContent(
        content: HTMLString,
        data: PlainObject = {},
        options: Partial<SohlSpeaker.ChatOptions> = {},
    ): Promise<ChatMessage | undefined> {
        const messageData = await this._prepareChat(data, options);

        messageData.content = toHTMLWithContent(content, data);
        if (messageData.rollMode) {
            fvttApplyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        return fvttCreateChatMessage(messageData) as Promise<
            ChatMessage | undefined
        >;
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
        options: Partial<SohlSpeaker.ChatOptions> = {
            style: SOHL_SPEAKER_STYLE.OTHER,
        },
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
        flavor: string;
        sound: string;
        rolls: SimpleRoll[];
        style: SohlSpeakerStyle;
        user: string;
    }

    export interface Data extends foundry.documents.ChatMessage.SpeakerData {
        rollMode: SohlSpeakerRollMode;
        user: string;
    }
}
