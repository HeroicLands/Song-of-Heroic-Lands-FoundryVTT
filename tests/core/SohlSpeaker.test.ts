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
        const revived = instanceFromJSON<SohlSpeaker>(JSON.stringify(sp.toJSON()));
        expect(revived).toBeInstanceOf(SohlSpeaker);
        expect(revived.name).toBe("Char1");
    });
});

describe("SohlSpeaker", () => {
    describe("constructor", () => {
        it("resolves a document speaker without requiring a rendered canvas", () => {
            const token: any = {
                id: "token",
                parent: { id: "token" },
                data: { isOwner: true },
                actor: { logic: { id: "actor" } },
            };
            const lookup = vi
                .spyOn(FoundryHelpers, "fvttGetToken")
                .mockReturnValue({ logic: token });
            const previous = (globalThis as any).canvas;
            try {
                (globalThis as any).canvas = { ...previous, ready: false };
                const speaker = new SohlSpeaker({ token: "token" });
                expect(speaker.tokenLogic).toBe(token);
                expect(speaker.isOwner).toBe(true);
            } finally {
                (globalThis as any).canvas = previous;
                lookup.mockRestore();
            }
        });

        it("retains actor identity and resolves ownership after world insertion", () => {
            let actor: any;
            const lookup = vi.spyOn(FoundryHelpers, "fvttGetActor").mockImplementation(() => actor);
            try {
                const speaker = new SohlSpeaker({ actor: "new-actor", alias: "New actor" });
                expect(speaker.isOwner).toBe(false);
                expect((speaker.toJSON() as any).actor).toBe("new-actor");
                actor = {
                    logic: {
                        id: "new-actor",
                        parent: { id: "new-actor" },
                        data: { isOwner: true },
                    },
                };
                expect(speaker.actorLogic).toBe(actor.logic);
                expect(speaker.isOwner).toBe(true);
                expect(speaker.getChatMessageSpeaker().actor).toBe("new-actor");
                expect(speaker.name).toBe("New actor");
            } finally {
                lookup.mockRestore();
            }
        });

        it.todo("initializes token, actor, scene to null by default");
        it.todo("sets rollMode from data or falls back to core setting or SYSTEM default");
        it.todo("resolves token from data.token via fvttGetToken");
        it.todo("derives actor from resolved token");
        it.todo("resolves actor from data.actor when no token is available");
        it.todo("resolves scene from data.scene via fvttGetScene");
        it.todo("resolves user from data.user or falls back to current user");
        it.todo("uses data.alias for name when provided");
        it.todo("falls back to token name, actor name, character name, or user name");
        it.todo("defaults name to 'Unknown Speaker' when nothing else is available");
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
        it.todo("returns plain object with token, actor, scene, alias, user, rollMode");
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
            vi.spyOn(FoundryHelpers, "fvttCreateChatMessage").mockImplementation(
                async (data: any) => {
                    captured.push(data);
                    return null;
                },
            );

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
        it("attributes prepared chat to the live canonical actor instead of an uninitialized cache", async () => {
            let actor: any;
            const lookup = vi.spyOn(FoundryHelpers, "fvttGetActor").mockImplementation(() => actor);
            try {
                const speaker = new SohlSpeaker({
                    actor: "late-actor",
                    scene: "arena",
                    alias: "Owner actor",
                });
                actor = { logic: { parent: { id: "late-actor" }, data: { isOwner: true } } };
                const message = await (speaker as any)._prepareChat(
                    { speaker: { actor: "wrong-actor" }, content: "card" },
                    { user: "answering-owner", rollMode: "publicroll" },
                );
                expect(message.speaker).toEqual({
                    actor: "late-actor",
                    token: null,
                    scene: "arena",
                    alias: "Owner actor",
                });
                expect(message.user).toBe("answering-owner");
            } finally {
                lookup.mockRestore();
            }
        });
        it.todo("sets speaker property on the message data");
    });
});
