import { describe, it, expect } from "vitest";
import { SohlActionContext } from "@src/common/core/SohlActionContext";
import { SohlSpeaker } from "@src/common/core/SohlSpeaker";

function createSpeaker(): SohlSpeaker {
    return new SohlSpeaker({ alias: "Test Speaker" });
}

describe("SohlActionContext", () => {
    describe("constructor", () => {
        it("throws when no speaker is provided", () => {
            expect(() => new SohlActionContext({})).toThrow(
                "SohlActionContext requires a speaker",
            );
        });

        it("accepts a SohlSpeaker instance", () => {
            const speaker = createSpeaker();
            const ctx = new SohlActionContext({ speaker });
            expect(ctx.speaker).toBe(speaker);
        });

        it("constructs SohlSpeaker from plain data", () => {
            const ctx = new SohlActionContext({
                speaker: { alias: "From Data" } as any,
            });
            expect(ctx.speaker).toBeInstanceOf(SohlSpeaker);
        });

        it("defaults target to null", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.target).toBeNull();
        });

        it("defaults skipDialog to false", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.skipDialog).toBe(false);
        });

        it("defaults noChat to false", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.noChat).toBe(false);
        });

        it("defaults type to empty string", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.type).toBe("");
        });

        it("defaults title to empty string", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.title).toBe("");
        });

        it("accepts all options", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                skipDialog: true,
                noChat: true,
                type: "test-type",
                title: "Test Title",
            });
            expect(ctx.skipDialog).toBe(true);
            expect(ctx.noChat).toBe(true);
            expect(ctx.type).toBe("test-type");
            expect(ctx.title).toBe("Test Title");
        });

        it("captures extra properties as scope", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                situationalModifier: 5,
            } as any);
            expect(ctx.scope).toHaveProperty("situationalModifier", 5);
        });

        it.todo("resolves Token placeable to its document");
        it.todo("accepts TokenDocument directly as target");
        it.todo("resolves Actor to its first active token document");
        it.todo("throws for invalid target type");
    });

    describe("toJSON", () => {
        it("returns a plain object with expected properties", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                type: "test",
                title: "Test",
            });
            const json = ctx.toJSON();
            expect(typeof json).toBe("object");
            expect(json.type).toBe("test");
            expect(json.title).toBe("Test");
            expect(json.skipDialog).toBe(false);
            expect(json.noChat).toBe(false);
        });
    });

    describe("clone", () => {
        it.todo("returns a new instance with merged data via cloneInstance");
    });

    describe("character", () => {
        it("returns null when speaker.user has no character", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.character).toBeNull();
        });
    });

    describe("token", () => {
        it("returns null when speaker has no token", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.token).toBeNull();
        });
    });
});
