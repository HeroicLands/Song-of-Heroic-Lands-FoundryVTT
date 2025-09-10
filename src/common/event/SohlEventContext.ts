import type { SohlActor } from "@common/actor/SohlActor";
import { SohlSpeaker } from "@common/SohlSpeaker";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlMap } from "@utils/collection/SohlMap";
import type { DocumentId, DocumentUuid } from "@utils/helpers";

export class SohlEventContext {
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
    }: Partial<SohlEventContext.Data> = {}) {
        if (!speaker) {
            throw new Error("SohlEventContext requires a speaker.");
        }
        this.speaker = new SohlSpeaker(speaker);

        this.target = null;
        if (targetUuid) {
            let target = fromUuidSync(targetUuid);
            if (!target) {
                throw new Error(`Target with uuid ${targetUuid} not found`);
            } else if (Object.hasOwn(target, "getBarAttribute")) {
                // If document has getBarAttribute, it's a TokenDocument
                this.target = target;
            } else if (target instanceof Token) {
                this.target = target.document;
            } else if (["assembly", "entity"].includes(target.type)) {
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
     * @summary Converts the SohlEventContext to JSON.
     * @returns {Object} The JSON representation of the SohlEventContext.
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
            scope: SohlMap.defaultToJSON(this.scope),
        };
    }

    /**
     * @summary Creates an SohlEventContext from data.
     * @description Converts plain object data into an SohlEventContext instance.
     * @param {Object} data - The data to convert.
     * @returns {SohlEventContext} A new SohlEventContext instance.
     */
    static fromData<T extends typeof SohlEventContext>(
        this: T,
        data: Partial<SohlEventContext.Data>,
    ): InstanceType<T> {
        return new this(data) as InstanceType<T>;
    }
}

export namespace SohlEventContext {
    export interface Data {
        speaker: SohlSpeaker.Data;
        targetUuid: DocumentUuid | null;
        userId: DocumentId;
        skipDialog: boolean;
        noChat: boolean;
        type: string;
        title: string;
        scope: UnknownObject;
    }
}
