import { describe, it, expect } from "vitest";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";

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

        it("defaults target to undefined", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.target).toBeUndefined();
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
            // The forked context carries the scope flat, not re-nested as
            // scope.scope.
            expect(copy.scope).toHaveProperty("situationalModifier", 7);
            expect(copy.scope).not.toHaveProperty("scope");
        });
    });

    describe("character", () => {
        it("returns undefined when speaker.user has no character", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.character).toBeUndefined();
        });
    });

    describe("token", () => {
        it("returns undefined when speaker has no token", () => {
            const ctx = new SohlActionContext({ speaker: createSpeaker() });
            expect(ctx.token).toBeUndefined();
        });
    });
});
