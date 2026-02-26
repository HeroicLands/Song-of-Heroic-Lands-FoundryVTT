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

import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlBase } from "@common/SohlBase";
import { SohlSpeaker } from "@common/SohlSpeaker";

export class SohlActionContext extends SohlBase {
    speaker: SohlSpeaker;
    target: SohlTokenDocument | null;
    skipDialog: boolean;
    noChat: boolean;
    type: string;
    title: string;
    scope: UnknownObject;

    constructor(data: Partial<SohlActionContext.Data> = {}) {
        super(data);
        const {
            speaker,
            target = null,
            skipDialog = false,
            noChat = false,
            type = "",
            title = "",
            ...scope
        } = data;

        if (!speaker) {
            throw new Error("SohlActionContext requires a speaker.");
        }
        if (speaker instanceof SohlSpeaker) this.speaker = speaker;
        else this.speaker = new SohlSpeaker(speaker);

        this.target = null;
        if (target) {
            if (target instanceof foundry.canvas.placeables.Token) {
                this.target = (
                    target as foundry.canvas.placeables.Token
                ).document;
            } else {
                const type = (target as any).documentName;
                if (type === "Token") {
                    this.target = target as SohlTokenDocument;
                } else if (type === "Actor") {
                    const tokens: Token[] = (
                        target as SohlActor
                    ).getActiveTokens();
                    if (tokens.length) {
                        this.target = tokens[0].document;
                    }
                } else {
                    throw new Error(
                        `Target with uuid ${target.uuid} is not a valid token or actor.`,
                    );
                }
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
}

export namespace SohlActionContext {
    export interface Data {
        speaker: SohlSpeaker | Partial<SohlSpeaker.Data>;
        target:
            | SohlActor
            | SohlTokenDocument
            | foundry.canvas.placeables.Token
            | null;
        userId: DocumentId;
        skipDialog: boolean;
        noChat: boolean;
        type: string;
        title: string;
        scope: UnknownObject;
    }
}
