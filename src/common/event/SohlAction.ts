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

import { SohlEvent } from "@common/event";
import { SohlLogic, SohlSpeaker } from "@common";
import {
    SohlContextMenu,
    defaultToJSON,
    defineType,
    DocumentId,
    DocumentUuid,
} from "@utils";
import { SohlActor } from "@common/actor";
import { SohlItem } from "@common/item";
import { SohlUser } from "@common/user/SohlUser";
import { SohlTokenDocument } from "@common/token";

/**
 * @summary Base class for all Action instances
 */
export abstract class SohlAction<
    P extends SohlLogic = SohlLogic,
> extends SohlEvent<P> {
    scope!: SohlAction.Scope;
    notes!: string;
    description!: string;
    contextIconClass!: string;
    contextCondition!: boolean | ((element: HTMLElement) => boolean);
    contextGroup!: string;

    constructor(
        parent: P,
        data?: Partial<SohlAction.Data>,
        options?: PlainObject,
    ) {
        super(parent, data, options);
        this.scope = data?.scope || SohlAction.SCOPE.SELF;
        this.notes = data?.notes || "";
        this.description = data?.description || "";
        this.contextIconClass = data?.contextIconClass || "fa-solid fa-gear";
        this.contextCondition = data?.contextCondition || true;
        this.contextGroup =
            data?.contextGroup || SohlContextMenu.SORT_GROUP.DEFAULT;
    }

    /**
     * Executes the intrinsic action synchronously.
     * @param scope - The scope in which to execute the action, including any additional data.
     * @param scope.element - The HTML element that triggered the action, if applicable.
     * @returns The result of the function call or undefined if the result is a Promise.
     */
    abstract executeSync(scope: SohlAction.ExecuteOptions): Optional<unknown>;

    /**
     * Executes the intrinsic action, calling the function defined on the parent performer.
     * @param scope - The scope in which to execute the action, including any additional data.
     * @param scope.element - The HTML element that triggered the action, if applicable.
     * @returns The result of the function call coerced as a Promise.
     */
    abstract execute(
        scope?: SohlAction.ExecuteOptions,
    ): Promise<Optional<unknown>>;
}

export namespace SohlAction {
    export const {
        kind: SCOPE,
        values: Scopes,
        isValue: isScope,
    } = defineType("SOHL.SohlAction.Scope", {
        SELF: "self",
        ITEM: "item",
        ACTOR: "actor",
        OTHER: "other",
    });
    export type Scope = (typeof SCOPE)[keyof typeof SCOPE];

    export interface Data extends SohlEvent.Data {
        scope?: Scope;
        notes?: string;
        description?: string;
        contextIconClass?: string;
        contextCondition?: boolean | ((element: HTMLElement) => boolean);
        contextGroup?: string;
        [key: string]: any;
    }

    export interface ExecuteOptions {
        element?: HTMLElement;
        [key: string]: any;
    }

    export interface Constructor extends Function {
        new (data: PlainObject, options: PlainObject): SohlAction;
    }

    export class Context {
        speaker: SohlSpeaker;
        target: SohlTokenDocument | null;
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
        constructor({
            speaker,
            targetUuid = null,
            skipDialog = false,
            noChat = false,
            type = "",
            title = "",
            scope = {},
        }: Partial<Context.Data> = {}) {
            if (!speaker) {
                throw new Error("SohlAction.Context requires a speaker.");
            }
            this.speaker = new SohlSpeaker(speaker);

            this.target = null;
            if (targetUuid) {
                let target = fromUuidSync(targetUuid);
                if (!target) {
                    throw new Error(`Target with uuid ${targetUuid} not found`);
                } else if (target instanceof SohlTokenDocument) {
                    this.target = target;
                } else if (target instanceof Token) {
                    this.target = target.document;
                } else if (target instanceof SohlActor) {
                    // If the target is an actor, there might be any number of tokens
                    // associated with it, so we take the first active token.
                    const tokens: Token.Object[] = target.getActiveTokens();
                    if (tokens.length) {
                        this.target = (tokens[0] as Token).document;
                    }
                } else {
                    throw new Error(
                        `Target with uuid ${targetUuid} is not a valid token or actor.`,
                    );
                }
            }

            this.skipDialog = skipDialog;
            this.noChat = noChat;
            this.type = type;
            this.title = title;
            this.scope = scope;
        }

        get character(): SohlActor | null {
            return (this.speaker.user as any).character ?? null;
        }

        get token(): SohlTokenDocument | null {
            return this.speaker.token ?? null;
        }

        /**
         * @summary Converts the SohlAction.Context to JSON.
         * @returns {Object} The JSON representation of the SohlAction.Context.
         */
        toJSON(): Record<string, unknown> {
            return {
                speaker: this.speaker.toJSON(),
                target: this.target?.uuid || null,
                skipDialog: this.skipDialog,
                noChat: this.noChat,
                type: this.type,
                title: this.title,
                targetUuid: (this.target as any)?.uuid,
                scope: defaultToJSON(this.scope),
            };
        }

        /**
         * @summary Creates an SohlAction.Context from data.
         * @description Converts plain object data into an SohlAction.Context instance.
         * @param {Object} data - The data to convert.
         * @returns {SohlAction.Context} A new SohlAction.Context instance.
         */
        static fromData<T extends typeof Context>(
            this: T,
            data: Partial<Context.Data>,
        ): InstanceType<T> {
            return new this(data) as InstanceType<T>;
        }
    }

    export namespace Context {
        export interface Data {
            speaker: SohlSpeaker.Data;
            targetUuid: DocumentUuid | null;
            userId: DocumentId;
            skipDialog: boolean;
            noChat: boolean;
            type: string;
            title: string;
            scope: UnknownObject;
            [key: string]: any;
        }
    }
}
