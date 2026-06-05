import { describe, it, expect } from "vitest";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { instanceToJSON, instanceFromJSON } from "@src/utils/helpers";
import type { SuccessTestResult } from "@src/domain/result/SuccessTestResult";

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

        it("stores scope passed via the scope key, flat (not nested)", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                scope: { situationalModifier: 5 },
            });
            expect(ctx.scope).toHaveProperty("situationalModifier", 5);
            // Regression: the scope key must not be re-wrapped as scope.scope.
            expect(ctx.scope).not.toHaveProperty("scope");
        });

        it("defaults scope to an empty object", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.scope).toEqual({});
        });

        it("does not absorb unknown top-level keys into scope", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                situationalModifier: 5,
            } as any);
            expect(ctx.scope).not.toHaveProperty("situationalModifier");
        });

        it("carries a typed scope generic", () => {
            const ctx = new SohlActionContext<
                Partial<SuccessTestResult.ContextScope>
            >({
                speaker: createSpeaker(),
                scope: { situationalModifier: 3 },
            });
            const mod: number | undefined = ctx.scope.situationalModifier;
            expect(mod).toBe(3);
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
        it("returns a new, independent instance", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                type: "orig",
            });
            const copy = ctx.clone();
            expect(copy).toBeInstanceOf(SohlActionContext);
            expect(copy).not.toBe(ctx);
            expect(copy.type).toBe("orig");
        });

        it("preserves scope flat across a clone round-trip", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                scope: { situationalModifier: 7 },
            });
            const copy = ctx.clone();
            // Regression: toJSON emits a scope key; reconstructing must not
            // re-nest it as scope.scope.
            expect(copy.scope).toHaveProperty("situationalModifier", 7);
            expect(copy.scope).not.toHaveProperty("scope");
        });
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

    describe("serialization round-trip", () => {
        it("rehydrates as a live SohlActionContext with a live speaker", () => {
            const ctx = new SohlActionContext({
                speaker: createSpeaker(),
                type: "strike",
                scope: { situationalModifier: 4 },
            });

            const revived = instanceFromJSON<SohlActionContext>(
                JSON.stringify(instanceToJSON(ctx)),
            );

            expect(revived).toBeInstanceOf(SohlActionContext);
            expect(revived.speaker).toBeInstanceOf(SohlSpeaker);
            expect(revived.type).toBe("strike");
            expect(revived.scope).toHaveProperty("situationalModifier", 4);
        });
    });
});
