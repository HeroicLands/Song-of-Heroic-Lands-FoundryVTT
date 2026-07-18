import { describe, it, expect, vi, afterEach } from "vitest";
import {
    runStrikeModeTest,
    resolveStrikeMode,
} from "@src/document/item/logic/strikeModeTest";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/*
 * The shared strike-mode resolution + dispatch used by both WeaponGearLogic and
 * combat-technique SkillLogic. Strike modes are duck-typed here: the helper only
 * reads `id`, `name`, `attack`, and (for melee) `defense.block` /
 * `defense.counterstrike`, each of which exposes `successTest`.
 */

/** A stub modifier whose successTest records its call and returns a tagged result. */
function stubModifier(tag: string) {
    return { successTest: vi.fn(async (_ctx: unknown) => ({ tag })) };
}

/** A melee strike mode with attack + block + counterstrike modifiers. */
function meleeMode(id: string, name: string): any {
    return {
        id,
        name,
        isMelee: true,
        attack: stubModifier(`${id}:attack`),
        defense: {
            block: stubModifier(`${id}:block`),
            counterstrike: stubModifier(`${id}:counterstrike`),
        },
    };
}

/** A missile strike mode — attack only, no `defense`. */
function missileMode(id: string, name: string): any {
    return { id, name, isMelee: false, attack: stubModifier(`${id}:attack`) };
}

/** A minimal StrikeModeCombatant. */
function combatant(name: string, strikeModes: any[]): any {
    return { name, strikeModes };
}

function ctxWith(strikeModeId?: string): any {
    return new SohlActionContext({
        speaker: new SohlSpeaker({ alias: "Tester" }),
        ...(strikeModeId ? { scope: { strikeModeId } } : {}),
    });
}

describe("resolveStrikeMode", () => {
    afterEach(() => vi.restoreAllMocks());

    it("uses the mode named by scope.strikeModeId", async () => {
        const [a, b] = [meleeMode("m1", "Cut"), meleeMode("m2", "Thrust")];
        const dlg = vi.spyOn(FoundryHelpers, "dialog");
        const sm = await resolveStrikeMode(
            combatant("Sword", [a, b]),
            ctxWith("m2"),
        );
        expect(sm).toBe(b);
        expect(dlg).not.toHaveBeenCalled();
    });

    it("auto-selects the only mode when none is specified (no prompt)", async () => {
        const only = meleeMode("m1", "Cut");
        const dlg = vi.spyOn(FoundryHelpers, "dialog");
        const sm = await resolveStrikeMode(
            combatant("Dagger", [only]),
            ctxWith(),
        );
        expect(sm).toBe(only);
        expect(dlg).not.toHaveBeenCalled();
    });

    it("prompts to choose when 2+ modes and none specified", async () => {
        const [a, b] = [meleeMode("m1", "Cut"), meleeMode("m2", "Thrust")];
        const dlg = vi.spyOn(FoundryHelpers, "dialog").mockResolvedValue("m2");
        const sm = await resolveStrikeMode(
            combatant("Sword", [a, b]),
            ctxWith(),
        );
        expect(dlg).toHaveBeenCalledTimes(1);
        expect(sm).toBe(b);
    });

    it("returns undefined without prompting when there are no modes", async () => {
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const dlg = vi.spyOn(FoundryHelpers, "dialog");
        const sm = await resolveStrikeMode(combatant("Fist", []), ctxWith());
        expect(sm).toBeUndefined();
        expect(dlg).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });

    it("returns undefined (with a warning) when scope names an unknown mode", async () => {
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const dlg = vi.spyOn(FoundryHelpers, "dialog");
        const sm = await resolveStrikeMode(
            combatant("Sword", [meleeMode("m1", "Cut")]),
            ctxWith("nope"),
        );
        expect(sm).toBeUndefined();
        expect(dlg).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });

    it("returns undefined when the picker is dismissed", async () => {
        vi.spyOn(FoundryHelpers, "dialog").mockResolvedValue(null);
        const sm = await resolveStrikeMode(
            combatant("Sword", [
                meleeMode("m1", "Cut"),
                meleeMode("m2", "Thrust"),
            ]),
            ctxWith(),
        );
        expect(sm).toBeUndefined();
    });

    it("passes the mode names via `data`, never interpolated into the content (Rule #10)", async () => {
        const evil = meleeMode("m1", "<img src=x onerror=alert(1)>");
        const spy = vi
            .spyOn(FoundryHelpers, "dialog")
            .mockResolvedValue(undefined);
        await resolveStrikeMode(
            combatant("Sword", [evil, meleeMode("m2", "Thrust")]),
            ctxWith(),
        );
        const spec = spy.mock.calls[0]![0] as any;
        expect(spec.content).not.toContain("<img");
        expect(spec.data.strikeModes).toContainEqual({
            id: "m1",
            name: "<img src=x onerror=alert(1)>",
        });
    });
});

describe("runStrikeModeTest", () => {
    afterEach(() => vi.restoreAllMocks());

    it("dispatches an attack to the mode's attack modifier", async () => {
        const sm = meleeMode("m1", "Cut");
        const result = await runStrikeModeTest(
            combatant("Sword", [sm]),
            "attack",
            ctxWith("m1"),
        );
        expect(sm.attack.successTest).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tag: "m1:attack" });
    });

    it("dispatches a block to the mode's defense.block modifier", async () => {
        const sm = meleeMode("m1", "Cut");
        const result = await runStrikeModeTest(
            combatant("Sword", [sm]),
            "block",
            ctxWith("m1"),
        );
        expect(sm.defense.block.successTest).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tag: "m1:block" });
    });

    it("dispatches a counterstrike to the mode's defense.counterstrike modifier", async () => {
        const sm = meleeMode("m1", "Cut");
        const result = await runStrikeModeTest(
            combatant("Sword", [sm]),
            "counterstrike",
            ctxWith("m1"),
        );
        expect(sm.defense.counterstrike.successTest).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tag: "m1:counterstrike" });
    });

    it("passes the SAME context (with scope) through to successTest", async () => {
        // Regression guard: the pre-refactor code discarded the passed context
        // and rolled with a fresh empty one, losing speaker/skipDialog/title.
        const sm = meleeMode("m1", "Cut");
        const ctx = ctxWith("m1");
        await runStrikeModeTest(combatant("Sword", [sm]), "attack", ctx);
        expect(sm.attack.successTest).toHaveBeenCalledWith(ctx);
    });

    it("returns false for a block on a missile mode", async () => {
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const sm = missileMode("m1", "Throw");
        const result = await runStrikeModeTest(
            combatant("Javelin", [sm]),
            "block",
            ctxWith("m1"),
        );
        expect(result).toBe(false);
        expect(sm.attack.successTest).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });

    it("returns false when no strike mode resolves", async () => {
        vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const result = await runStrikeModeTest(
            combatant("Fist", []),
            "attack",
            ctxWith(),
        );
        expect(result).toBe(false);
    });
});
