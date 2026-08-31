import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { legacyTraitError, runWorldMigrations } from "@src/core/foundry/migration";
import * as FH from "@src/core/FoundryHelpers";
import type { MigrationStep } from "@src/entity/migration/MigrationRegistry";

describe("legacyTraitError — retired trait item type is unrecognized (#651)", () => {
    it("returns null for a non-trait document", () => {
        expect(legacyTraitError({ type: "trauma", name: "x" })).toBeNull();
        expect(legacyTraitError({ type: "skill" })).toBeNull();
        expect(legacyTraitError(null)).toBeNull();
        expect(legacyTraitError(undefined)).toBeNull();
    });

    it("flags a legacy trait document as an unrecognized retired type", () => {
        const err = legacyTraitError({ type: "trait", name: "Bloodlust" });
        expect(err).toContain('Unrecognized item type "trait"');
        expect(err).toContain('"Bloodlust"');
        expect(err).toContain("retired");
        expect(err).toContain("not migrated automatically");
    });

    it("never auto-converts — it only reports (no trauma/attribute payload)", () => {
        // The message tells the GM to resolve it by hand; it is not a conversion plan.
        const err = legacyTraitError({ type: "trait", name: "X" }) as string;
        expect(err).toContain("by hand");
    });

    it("falls back to the id, then to (unknown), when the name is absent", () => {
        expect(legacyTraitError({ type: "trait", id: "abc123" })).toContain("[abc123]");
        expect(legacyTraitError({ type: "trait" })).toContain("(unknown)");
    });

    it("also fires when Foundry fell the document back to base (type on _source)", () => {
        expect(
            legacyTraitError({
                type: "base",
                name: "Legacy",
                _source: { type: "trait" },
            }),
        ).toContain('Unrecognized item type "trait"');
        // A genuine base item is not flagged.
        expect(legacyTraitError({ type: "base", _source: { type: "base" } })).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// runWorldMigrations — the version-keyed runner (#957)
// ---------------------------------------------------------------------------

/** A live-document double: carries a source and records update calls. */
function mkDoc(over: Record<string, unknown> = {}): any {
    return {
        id: "id-" + Math.random().toString(36).slice(2, 8),
        type: "base",
        toObject() {
            return { type: this.type, system: {} };
        },
        update: vi.fn(async () => {}),
        updateEmbeddedDocuments: vi.fn(async () => {}),
        items: [],
        effects: [],
        ...over,
    };
}

/** A minimal `game`-like world with sized collections. */
function mkGame(actors: any[] = [], items: any[] = [], scenes: any[] = []): any {
    const coll = (arr: any[]): any => {
        const c: any = arr.slice();
        c.size = arr.length;
        return c;
    };
    return { actors: coll(actors), items: coll(items), scenes: coll(scenes) };
}

describe("runWorldMigrations — version-keyed runner (#957)", () => {
    let getSpy: any;
    let setSpy: any;
    let verSpy: any;

    beforeEach(() => {
        getSpy = vi.spyOn(FH, "fvttGetSetting");
        setSpy = vi.spyOn(FH, "fvttSetSetting").mockResolvedValue(undefined);
        verSpy = vi.spyOn(FH, "fvttSystemVersion").mockReturnValue("0.7.0");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("stamps a fresh (empty) world to the current version, running nothing", async () => {
        getSpy.mockReturnValue(""); // no stored version
        const summary = await runWorldMigrations(mkGame());
        expect(summary.to).toBe("0.7.0");
        expect(summary.from).toBe("0.7.0"); // fresh world resolves from === current
        expect(summary.planned).toBe(0);
        expect(summary.applied).toBe(0);
        expect(summary.stamped).toBe(true);
        expect(setSpy).toHaveBeenCalledWith("sohl", "systemMigrationVersion", "0.7.0");
    });

    it("does nothing when the world is already at the current version", async () => {
        getSpy.mockReturnValue("0.7.0");
        const actor = mkDoc({ type: "being" });
        const summary = await runWorldMigrations(mkGame([actor]));
        expect(summary.planned).toBe(0);
        expect(summary.stamped).toBe(false);
        expect(setSpy).not.toHaveBeenCalled();
        expect(actor.update).not.toHaveBeenCalled();
    });

    it("returns early without stamping when the system version is unknown", async () => {
        getSpy.mockReturnValue("0.6.0");
        verSpy.mockReturnValue("");
        const summary = await runWorldMigrations(mkGame([mkDoc()]));
        expect(summary.to).toBe("");
        expect(summary.planned).toBe(0);
        expect(summary.stamped).toBe(false);
        expect(setSpy).not.toHaveBeenCalled();
    });

    it("migrates a populated legacy world across the in-scope types, then stamps", async () => {
        getSpy.mockReturnValue(""); // empty + populated → legacy → from 0.0.0
        const steps: MigrationStep[] = [
            {
                version: "0.7.0",
                description: "touch every in-scope kind",
                migrators: {
                    Actor: () => ({ "system.a": 1 }),
                    Item: () => ({ "system.i": 1 }),
                    ActiveEffect: () => ({ "system.e": 1 }),
                },
            },
        ];
        const effect = mkDoc();
        const item = mkDoc({ type: "skill", effects: [mkDoc()] });
        const actor = mkDoc({
            type: "being",
            items: [item],
            effects: [effect],
        });
        const summary = await runWorldMigrations(mkGame([actor]), steps);

        expect(summary.from).toBe("0.0.0");
        expect(summary.planned).toBe(1);
        expect(summary.stamped).toBe(true);
        // Top-level actor updated.
        expect(actor.update).toHaveBeenCalledTimes(1);
        // Embedded items updated as a batch on the actor.
        expect(actor.updateEmbeddedDocuments).toHaveBeenCalledWith(
            "Item",
            expect.arrayContaining([expect.objectContaining({ _id: item.id, "system.i": 1 })]),
            expect.any(Object),
        );
        // Embedded effects updated on the actor and on the item.
        expect(actor.updateEmbeddedDocuments).toHaveBeenCalledWith(
            "ActiveEffect",
            expect.arrayContaining([expect.objectContaining({ "system.e": 1 })]),
            expect.any(Object),
        );
        expect(item.updateEmbeddedDocuments).toHaveBeenCalledWith(
            "ActiveEffect",
            expect.any(Array),
            expect.any(Object),
        );
        expect(setSpy).toHaveBeenCalledWith("sohl", "systemMigrationVersion", "0.7.0");
    });

    it("writes embedded documents on the same terms as top-level ones", async () => {
        // The two paths must agree on the update options. Left to Foundry's
        // defaults an embedded update is diffed, so a payload that restates the
        // document's current data — how a migration that removes a field has to
        // be expressed — is diffed away and the record is never rewritten;
        // and `recursive` decides whether a root-level key replaces or merges,
        // so the same migrator would mean different things depending on where
        // the document lives.
        getSpy.mockReturnValue("0.6.0");
        const steps: MigrationStep[] = [
            {
                version: "0.7.0",
                description: "rewrite system",
                migrators: {
                    Actor: () => ({ system: { a: 1 } }),
                    Item: () => ({ system: { i: 1 } }),
                },
            },
        ];
        const item = mkDoc({ type: "skill" });
        const actor = mkDoc({ type: "being", items: [item] });
        await runWorldMigrations(mkGame([actor]), steps);

        const [, topOptions] = actor.update.mock.calls[0];
        const [, , embeddedOptions] = actor.updateEmbeddedDocuments.mock.calls[0];
        expect(topOptions).toEqual({ diff: false, recursive: false });
        expect(embeddedOptions).toEqual(topOptions);
    });

    it("catches a per-document error, counts it, and still stamps the version", async () => {
        getSpy.mockReturnValue("0.6.0");
        const steps: MigrationStep[] = [
            {
                version: "0.7.0",
                description: "bump",
                migrators: { Actor: () => ({ "system.a": 1 }) },
            },
        ];
        const bad = mkDoc({
            type: "being",
            update: vi.fn(async () => {
                throw new Error("boom");
            }),
        });
        const good = mkDoc({ type: "being" });
        const summary = await runWorldMigrations(mkGame([bad, good]), steps);
        expect(summary.errors).toBe(1);
        expect(summary.applied).toBe(1); // the good actor still migrated
        expect(good.update).toHaveBeenCalledTimes(1);
        expect(summary.stamped).toBe(true);
    });
});
