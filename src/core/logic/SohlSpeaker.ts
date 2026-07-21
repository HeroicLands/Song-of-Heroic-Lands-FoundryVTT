/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
    KIND_KEY,
} from "@src/utils/constants";
import { registerKind } from "@src/utils/kindRegistry";
import { FilePath, isFilePath, HTMLString } from "@src/utils/helpers";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlSpeakerStyle } from "@src/utils/constants";
import {
    toHTMLWithContent,
    toHTMLWithTemplate,
    fvttGetSetting,
    fvttGetToken,
    fvttGetActor,
    fvttGetUser,
    fvttCurrentUser,
    fvttApplyRollMode,
    fvttCreateChatMessage,
    fvttToFoundryRoll,
} from "@src/core/FoundryHelpers";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * Identifies who is speaking/acting and renders that voice to chat.
 *
 * A `SohlSpeaker` resolves a loose set of identifiers (token, actor, scene,
 * user ids, or an explicit alias) into the concrete documents an action needs,
 * and knows how to emit chat messages attributed to that speaker. Every
 * {@link sohl.entity.action.SohlActionContext} holds one as its `speaker`, so it is the backbone
 * of action output: results, dialogs, and roll cards are all posted through a
 * speaker.
 *
 * Resolution rules applied at construction:
 *
 * - **token** is looked up on the active canvas; its `actor` becomes the
 *   speaker's actor when present;
 * - **actor** is resolved directly only if a token did not already supply one;
 * - **user** defaults to the current user when not given;
 * - **rollMode** defaults to the core `rollMode` setting, then to the system
 *   default;
 * - **name** is the first available of: explicit `alias`, token name, actor
 *   name, the user's assigned character name, the user name, or
 *   `"Unknown Speaker"`.
 *
 * Use {@link toChat} to post a message — it accepts either inline HTML or a
 * template path and applies the speaker's roll mode automatically.
 */
export class SohlSpeaker {
    /** @internal Cached Foundry speaker-data used when building messages. */
    protected _speaker!: SohlSpeaker.Data;
    /** The roll mode applied to messages this speaker posts. */
    readonly rollMode: string;
    /** The resolved token, or `null`. */
    readonly tokenLogic?: SohlTokenDocumentLogic;
    /** The resolved actor (from the token or directly), or `null`. */
    readonly actorLogic?: SohlActorLogic<any>;
    /** The resolved scene, or `null`. */
    readonly sceneId?: string;
    /** The display name/alias used for attribution. */
    readonly name: string;
    /** The resolved user (defaults to the current user), or `null`. */
    readonly userId?: string;

    /**
     * Construct a SohlSpeaker instance, resolving the token, actor, scene,
     * user and display name from the supplied ids.
     *
     * @param data - Speaker source data.
     * @param data.rollMode - The roll mode to use.
     * @param data.user - The user ID.
     * @param data.token - The token ID; requires an initialized canvas.
     * @param data.actor - The actor ID; used only when no token is provided.
     * @param data.scene - The scene ID.
     * @param data.alias - The explicit display name, overriding all resolved names.
     * @throws {Error} If `data.token` is set but the Foundry canvas is not yet
     *   initialized.
     */
    constructor(data: Partial<SohlSpeaker.Data> = {}) {
        this.rollMode =
            data.rollMode ||
            (fvttGetSetting("core", "rollMode") as string) ||
            SOHL_SPEAKER_ROLL_MODE.SYSTEM;
        if (data.token) {
            if (!canvas.ready) {
                throw new Error("Canvas is not initialized");
            } else {
                this.tokenLogic = fvttGetToken(data.token)?.logic;
            }
            this.actorLogic = this.tokenLogic?.actor?.logic;
        }
        if (!this.actorLogic && data.actor) {
            this.actorLogic = fvttGetActor(data.actor)?.logic;
        }
        if (data.scene) {
            this.sceneId = data.scene;
        }

        this.userId = data.user ?? fvttCurrentUser().id;
        this.name =
            data.alias || this.tokenLogic?.name || this.actorLogic?.name || "";
        if (!this.name) {
            const user = fvttGetUser(data.user || "");
            this.name =
                user?.character?.name || user?.name || "Unknown Speaker";
        }
    }

    /**
     * Build Foundry's `ChatMessage` speaker data from this speaker.
     * @returns The chat message speaker data (alias and resolved ids).
     */
    getChatMessageSpeaker(): foundry.documents.ChatMessage.SpeakerData {
        return {
            alias: this.name,
            token: this.tokenLogic?.parent?.id ?? null,
            actor: this.actorLogic?.parent?.id ?? null,
            scene: this.sceneId ?? null,
        };
    }

    /** Whether the current user owns the speaker's token (or actor). */
    get isOwner() {
        if (this.tokenLogic) {
            return this.tokenLogic.data.isOwner;
        } else if (this.actorLogic) {
            return this.actorLogic.data.isOwner;
        }

        // If no token or actor is found, return false
        return false;
    }

    /**
     * Serialize to a plain object of resolved ids plus alias and roll mode.
     * @returns The plain-object representation of this speaker.
     */
    toJSON(): JsonValue {
        return {
            [KIND_KEY]: SohlSpeaker.Kind,
            token: this.tokenLogic?.id ?? "",
            actor: this.actorLogic?.id ?? "",
            scene: this.sceneId ?? "",
            alias: this.name,
            user: this.userId || null,
            rollMode: this.rollMode,
        };
    }

    /**
     * Post a chat message attributed to this speaker.
     *
     * The `input` is dispatched by type: a {@link FilePath} is rendered as a
     * Handlebars template, while an {@link HTMLString} is used as inline
     * content. The speaker's roll mode is applied automatically.
     *
     * @param input - A template path or inline HTML content.
     * @param data - Template context data — forwarded to the template or
     *   content renderer without property access.
     * @param options - Chat options; see {@link SohlSpeaker.ChatOptions} for
     *   supported fields.
     * @returns The created `ChatMessage`, or `undefined` if none was created.
     */
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
     * Sends a chat message using a Handlebars template.
     *
     * @param template - Path to the Handlebars template to render.
     * @param data - Template render context — forwarded to the renderer
     *   without property access.
     * @param options - Chat options; see {@link SohlSpeaker.ChatOptions}.
     * @returns The created `ChatMessage`, or `undefined` if none was created.
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
     * Sends a chat message with inline HTML content.
     *
     * @param content - The HTML content of the message.
     * @param data - Template context data — forwarded to the renderer
     *   without property access.
     * @param options - Chat options; see {@link SohlSpeaker.ChatOptions}.
     * @returns The created `ChatMessage`, or `undefined` if none was created.
     */
    protected async _toChatWithContent(
        content: HTMLString,
        data: PlainObject = {},
        options: Partial<SohlSpeaker.ChatOptions> = {},
    ): Promise<ChatMessage | undefined> {
        const messageData = await this._prepareChat(data, options);

        messageData.content = await toHTMLWithContent(content, data);
        if (messageData.rollMode) {
            fvttApplyRollMode(messageData, messageData.rollMode);
            delete messageData.rollMode;
        }

        return fvttCreateChatMessage(messageData) as Promise<
            ChatMessage | undefined
        >;
    }

    /**
     * Assembles the raw `ChatMessage` data object that Foundry will persist.
     *
     * Spreads `data` into the message payload, then applies speaker attribution,
     * optional rolls, and the active roll mode.
     *
     * @param data - Template context data spread into the message payload.
     * @param options - Chat-message configuration.
     * @param options.user - Id of the user posting the message.
     * @param options.rolls - {@link SimpleRoll} instances to attach to the
     *   message; each is converted to a Foundry Roll before being added.
     * @param options.rollMode - Visibility mode applied to the message.
     * @returns The assembled message data ready for `ChatMessage.create`.
     */
    protected async _prepareChat(
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
                msgData.rolls.push(await fvttToFoundryRoll(roll));
            }
        }

        // A per-call `rollMode` (e.g. `"gmroll"` for a GM-hidden card) overrides
        // the speaker's default; otherwise the speaker's mode applies.
        const rollMode = options.rollMode ?? this.rollMode;
        if (rollMode) {
            msgData.rollMode = rollMode;
        }

        return msgData;
    }
}

export namespace SohlSpeaker {
    /** Kind tag used by the kind registry and serialization. */
    export const Kind = "SohlSpeaker";

    /** Options accepted by {@link SohlSpeaker.toChat} for a chat message. */
    export interface ChatOptions {
        /** Message flavor text. */
        flavor: string;
        /** Sound to play when the message posts. */
        sound: string;
        /** Rolls to attach to the message. */
        rolls: SimpleRoll[];
        /** Chat-card style (whisper, roll, OOC, etc.). */
        style: SohlSpeakerStyle;
        /** Id of the user the message is posted as. */
        user: string;
        /**
         * Visibility mode for this message (Foundry roll mode, e.g. `"gmroll"`
         * to whisper to GMs). Overrides the speaker's default when set.
         */
        rollMode: string;
    }

    /**
     * Constructor input for {@link SohlSpeaker}: Foundry's speaker ids plus a
     * roll mode and user. Any subset may be supplied; unspecified pieces are
     * resolved from context at construction.
     */
    export interface Data {
        /** Scene Id of the scene containing the speaker */
        scene: string;
        /** Actor Id */
        actor: string;
        /** TokenDocument Id */
        token: string;
        /** Display name of the speaker */
        alias: string;
        /** Acting user Id */
        user: string;
        /** Roll mode to apply to messages from this speaker. */
        rollMode: SohlSpeakerRollMode;
    }
}

registerKind(SohlSpeaker.Kind, SohlSpeaker);
