import { SohlSpeaker, SohlSpeakerData } from "@common";
import { AIExecutionResult } from "./AIAgentCommandDefinition";

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
        chatLog: foundry.applications.sidebar.tabs.ChatLog,
        message: string,
        chatData: {
            speaker?: SohlSpeakerData;
            user?: foundry.documents.User;
        } = { user: game.user },
    ): boolean | void {
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
        user: foundry.documents.User,
    ): void {
        let result: AIExecutionResult;
        try {
            result = { message: "Not Yet Implememnted" } as AIExecutionResult;
        } catch (error: any) {
            result = {
                message: "Error sending message to AI: " + error.message,
            };
        }

        const aiSpeaker = new SohlSpeaker({
            scene: speaker.scene?.id || null,
            actor: null,
            token: null,
            alias: "Sage",
        });
        speaker.toChat(result.message);
    }
}
