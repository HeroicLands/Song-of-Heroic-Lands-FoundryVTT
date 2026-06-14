import { describe, it, expect } from "vitest";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { instanceFromJSON } from "@src/utils/helpers";

describe("SohlSpeaker serialization round-trip", () => {
    it("tags its toJSON with the kind so it can be revived", () => {
        const json = new SohlSpeaker({ alias: "Char1" }).toJSON() as any;
        expect(json.__kind).toBe("SohlSpeaker");
        expect(json.alias).toBe("Char1");
    });

    it("rehydrates as a live SohlSpeaker via the kind registry", () => {
        const sp = new SohlSpeaker({ alias: "Char1" });
        const revived = instanceFromJSON<SohlSpeaker>(
            JSON.stringify(sp.toJSON()),
        );
        expect(revived).toBeInstanceOf(SohlSpeaker);
        expect(revived.name).toBe("Char1");
    });
});

describe("SohlSpeaker", () => {
    describe("constructor", () => {
        it.todo("initializes token, actor, scene to null by default");
        it.todo(
            "sets rollMode from data or falls back to core setting or SYSTEM default",
        );
        it.todo("resolves token from data.token via fvttGetToken");
        it.todo("derives actor from resolved token");
        it.todo("resolves actor from data.actor when no token is available");
        it.todo("resolves scene from data.scene via fvttGetScene");
        it.todo("resolves user from data.user or falls back to current user");
        it.todo("uses data.alias for name when provided");
        it.todo(
            "falls back to token name, actor name, character name, or user name",
        );
        it.todo(
            "defaults name to 'Unknown Speaker' when nothing else is available",
        );
    });

    describe("getChatMessageSpeaker", () => {
        it.todo("returns SpeakerData with alias, token, actor, and scene ids");
        it.todo("returns null ids for missing token, actor, or scene");
    });

    describe("isOwner", () => {
        it.todo("returns token.isOwner when token exists");
        it.todo("returns actor.isOwner when actor exists but no token");
        it.todo("returns false when neither token nor actor exists");
    });

    describe("toJSON", () => {
        it.todo(
            "returns plain object with token, actor, scene, alias, user, rollMode",
        );
    });

    describe("toChat", () => {
        it.todo("delegates to _toChatWithTemplate for FilePath inputs");
        it.todo("delegates to _toChatWithContent for HTMLString inputs");
    });

    describe("_toChatWithTemplate", () => {
        it.todo("prepares chat data and renders template content");
        it.todo("applies roll mode to the message");
        it.todo("creates a chat message via fvttCreateChatMessage");
    });

    describe("_toChatWithContent", () => {
        it.todo("prepares chat data with direct HTML content");
        it.todo("applies roll mode to the message");
        it.todo("creates a chat message via fvttCreateChatMessage");
    });

    describe("_prepareChat", () => {
        it.todo("merges data and options into message data object");
        it.todo("includes empty rolls array by default");
        it.todo("evaluates roll objects from options.rolls");
        it.todo("includes rollMode from speaker");
        it.todo("sets speaker property on the message data");
    });
});
