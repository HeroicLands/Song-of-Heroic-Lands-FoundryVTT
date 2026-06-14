import { describe, it, expect } from "vitest";
import {
    selectActorTokens,
    selectActorCombatant,
    type TokenActorRef,
    type CombatantTokenRef,
} from "@src/document/actor/logic/token-helpers";

/** A minimal scene-token stand-in carrying the fields the selector reads. */
const token = (
    actorId: string | null,
    actorLink: boolean,
): TokenActorRef & { tag: string } => ({
    actorId,
    actorLink,
    tag: `${actorId ?? "none"}:${actorLink ? "linked" : "unlinked"}`,
});

describe("selectActorTokens", () => {
    describe("synthetic (token) actor — embeddedToken provided", () => {
        it("returns the embedded token when it is on the active scene", () => {
            const embedded = token("a1", false);
            const scene = [token("a2", true), embedded, token("a3", false)];
            expect(selectActorTokens(scene, "a1", embedded)).toEqual([
                embedded,
            ]);
        });

        it("returns empty when the embedded token is not on the active scene", () => {
            const embedded = token("a1", false);
            const scene = [token("a2", true), token("a3", false)];
            expect(selectActorTokens(scene, "a1", embedded)).toEqual([]);
        });

        it("returns empty for an empty scene", () => {
            const embedded = token("a1", false);
            expect(selectActorTokens([], "a1", embedded)).toEqual([]);
        });

        it("ignores actorId/actorLink — identity of the embedded token is what matters", () => {
            // Another token references the same actor and is linked, but the
            // synthetic actor is represented only by its own embedded token.
            const embedded = token("a1", false);
            const scene = [token("a1", true), embedded];
            expect(selectActorTokens(scene, "a1", embedded)).toEqual([
                embedded,
            ]);
        });
    });

    describe("world (linked) actor — embeddedToken null", () => {
        it("returns all linked tokens whose actorId matches", () => {
            const t1 = token("a1", true);
            const t2 = token("a1", true);
            const scene = [t1, token("a2", true), t2, token("a1", false)];
            expect(selectActorTokens(scene, "a1", null)).toEqual([t1, t2]);
        });

        it("excludes unlinked tokens even if their actorId matches", () => {
            const scene = [token("a1", false), token("a1", false)];
            expect(selectActorTokens(scene, "a1", null)).toEqual([]);
        });

        it("excludes linked tokens belonging to a different actor", () => {
            const scene = [token("a2", true), token("a3", true)];
            expect(selectActorTokens(scene, "a1", null)).toEqual([]);
        });

        it("returns empty for an empty scene", () => {
            expect(selectActorTokens([], "a1", null)).toEqual([]);
        });
    });
});

/** A minimal combatant stand-in carrying the field the selector reads. */
const combatant = (
    tokenId: string | null,
): CombatantTokenRef & { tag: string } => ({
    tokenId,
    tag: tokenId ?? "none",
});

describe("selectActorCombatant", () => {
    it("returns the combatant whose tokenId is one of the actor's tokens", () => {
        const target = combatant("t2");
        const combatants = [combatant("t1"), target, combatant("t3")];
        const result = selectActorCombatant(combatants, new Set(["t2", "t9"]));
        expect(result).toBe(target);
    });

    it("returns the first match when several combatants qualify", () => {
        const first = combatant("t2");
        const second = combatant("t3");
        const combatants = [combatant("t1"), first, second];
        const result = selectActorCombatant(combatants, new Set(["t2", "t3"]));
        expect(result).toBe(first);
    });

    it("returns null when no combatant matches", () => {
        const combatants = [combatant("t1"), combatant("t2")];
        expect(selectActorCombatant(combatants, new Set(["t9"]))).toBeNull();
    });

    it("ignores combatants with a null tokenId", () => {
        const target = combatant("t2");
        const combatants = [combatant(null), target];
        expect(selectActorCombatant(combatants, new Set(["t2"]))).toBe(target);
    });

    it("returns null for an empty token set", () => {
        const combatants = [combatant("t1")];
        expect(selectActorCombatant(combatants, new Set())).toBeNull();
    });

    it("returns null for no combatants", () => {
        expect(selectActorCombatant([], new Set(["t1"]))).toBeNull();
    });
});
