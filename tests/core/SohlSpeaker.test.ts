import { describe, it, expect, vi } from "vitest";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { instanceFromJSON, HTMLString } from "@src/utils/helpers";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

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
        it("resolves HTML before posting — content is a string, not a Promise", async () => {
            const captured: any[] = [];
            vi.spyOn(
                FoundryHelpers,
                "fvttCreateChatMessage",
            ).mockImplementation(async (data: any) => {
                captured.push(data);
                return null;
            });

            const speaker = new SohlSpeaker({ alias: "Test" });
            // HTMLString cast — <p> tag ensures isFilePath returns false
            await speaker.toChat("<p>Hello</p>" as HTMLString);

            expect(captured).toHaveLength(1);
            expect(typeof captured[0].content).toBe("string");
            expect(captured[0].content).toBe("<p>Hello</p>");

            vi.restoreAllMocks();
        });
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
