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

import { SohlSpeaker } from "@common/SohlSpeaker";
import { AIExecutionResult } from "@utils/ai/AIExecutionResult";
import { SohlUser } from "@common/user/SohlUser";
import { toHTMLString } from "@utils/helpers";

export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}

export abstract class AIAdapter {
    static AI_MESSAGE = new RegExp(`^\s*(?:sage|ai)\s+`, "i");

    abstract completePrompt(
        prompt: string,
        options?: CompletionOptions,
    ): Promise<string>;
    abstract summarizeCode(code: string): Promise<string>;
    abstract simulateOutcome(description: string): Promise<string>;

    /**
     * @summary Handle a ChatBot message.
     * @description
     * This function determines whether a message is being sent to a ChatBot and
     * if so routes the message to the ChatBot hander.
     *
     * @remarks
     * ChatBot messages are either sent by the user using the "/whisper sage",
     * "/whisper ai" or "/sage" command, or by replying to a ChatBot message
     * sent to a particular user.
     *
     * This function should be called from the `chatMessage` hook to intercept
     * these commands.
     *
     * @param chatLog   The ChatLog application instance.
     * @param message   Text of the message being posted.
     * @param chatData  The chat data object containing the speaker and user
     * @returns `false` to prevent the message from continuing to parse.
     */
    static chatMessage(
        chatLog: ChatLog,
        message: string,
        chatData: {
            speaker?: SohlSpeaker.Data;
            user: SohlUser | null;
        } = { user: (game as any).user as SohlUser | null },
    ): boolean | void {
        void chatLog;
        let match: RegExpMatchArray | null = message.match(
            /^(?:\/whisper (?:sage|ai)\s+)([^]*)/i,
        );
        if (match) {
            const speaker = new SohlSpeaker(chatData.speaker);
            this.handleAIChatCommand(speaker, match[1], chatData.user);
            return false;
        }
    }

    static handleAIChatCommand(
        speaker: SohlSpeaker,
        message: string,
        user: SohlUser | null = null,
    ): void {
        void user;
        let result: AIExecutionResult;
        try {
            result = { message: "Not Yet Implemented" } as AIExecutionResult;
        } catch (error: any) {
            result = {
                message: "Error sending message to AI: " + error.message,
            };
        }

        const aiSpeaker = new SohlSpeaker({
            scene: (speaker.scene as any)?.id || null,
            actor: null,
            token: null,
            alias: "Sage",
        });
        speaker.toChat(toHTMLString(result.message));
    }
}
