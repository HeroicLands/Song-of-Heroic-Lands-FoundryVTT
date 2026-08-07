import { describe, it, expect } from "vitest";
import {
    planMigrations,
    migrateDocumentSource,
    resolveFromVersion,
    SOHL_MIGRATIONS,
    type MigrationStep,
} from "@src/entity/migration/MigrationRegistry";

/** A few synthetic steps to exercise the planner/folder without real migrations. */
const STEPS: MigrationStep[] = [
    {
        version: "0.5.0",
        description: "rename foo → bar on skills",
        migrators: {
            Item: (src) =>
                src.type === "skill" ?
                    { "system.bar": (src.system as any)?.foo ?? 0 }
                :   undefined,
        },
    },
    {
        version: "0.6.0",
        description: "default actor biography",
        migrators: {
            Actor: () => ({ "system.bio": "" }),
        },
    },
    {
        version: "0.7.0",
        description: "effect tweak",
        migrators: {
            ActiveEffect: () => ({ "system.migrated": true }),
        },
    },
];

describe("planMigrations", () => {
    it("returns steps with from < version <= to, sorted ascending", () => {
        const plan = planMigrations("0.5.0", "0.7.0", STEPS);
        expect(plan.map((s) => s.version)).toEqual(["0.6.0", "0.7.0"]);
    });

    it("excludes the from-version itself (exclusive lower bound)", () => {
        const plan = planMigrations("0.6.0", "0.7.0", STEPS);
        expect(plan.map((s) => s.version)).toEqual(["0.7.0"]);
    });

    it("includes the to-version itself (inclusive upper bound)", () => {
        const plan = planMigrations("0.4.0", "0.6.0", STEPS);
        expect(plan.map((s) => s.version)).toEqual(["0.5.0", "0.6.0"]);
    });

    it("treats an empty from-version as 0.0.0 (runs everything up to to)", () => {
        const plan = planMigrations("", "0.7.0", STEPS);
        expect(plan.map((s) => s.version)).toEqual(["0.5.0", "0.6.0", "0.7.0"]);
    });

    it("returns nothing when already current", () => {
        expect(planMigrations("0.7.0", "0.7.0", STEPS)).toEqual([]);
    });

    it("returns nothing for an empty target version", () => {
        expect(planMigrations("0.5.0", "", STEPS)).toEqual([]);
    });

    it("sorts out-of-order registrations by version", () => {
        const unordered = [STEPS[2], STEPS[0], STEPS[1]];
        const plan = planMigrations("", "0.7.0", unordered);
        expect(plan.map((s) => s.version)).toEqual(["0.5.0", "0.6.0", "0.7.0"]);
    });
});

describe("migrateDocumentSource", () => {
    it("returns an empty object when no step targets the document kind", () => {
        const plan = planMigrations("", "0.7.0", STEPS);
        // No step has a Scene migrator.
        expect(migrateDocumentSource({ type: "base" }, "Scene", plan)).toEqual(
            {},
        );
    });

    it("applies the matching kind's migrator and returns its update payload", () => {
        const plan = planMigrations("", "0.7.0", STEPS);
        const update = migrateDocumentSource(
            { type: "skill", system: { foo: 42 } },
            "Item",
            plan,
        );
        expect(update).toEqual({ "system.bar": 42 });
    });

    it("skips a migrator whose predicate returns undefined (no-op)", () => {
        const plan = planMigrations("", "0.7.0", STEPS);
        // A non-skill item: the only Item migrator returns undefined.
        expect(
            migrateDocumentSource({ type: "weapongear" }, "Item", plan),
        ).toEqual({});
    });

    it("merges updates across steps in order, later steps winning on collisions", () => {
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "a",
                migrators: { Actor: () => ({ "system.a": 1, "system.b": 1 }) },
            },
            {
                version: "0.6.0",
                description: "b",
                migrators: { Actor: () => ({ "system.b": 2 }) },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(migrateDocumentSource({ type: "being" }, "Actor", plan)).toEqual(
            {
                "system.a": 1,
                "system.b": 2,
            },
        );
    });
});

describe("resolveFromVersion", () => {
    it("uses the stored version verbatim when present", () => {
        expect(resolveFromVersion("0.6.0", "0.7.0", true)).toBe("0.6.0");
        expect(resolveFromVersion("0.6.0", "0.7.0", false)).toBe("0.6.0");
    });

    it("treats an unpopulated world with no stored version as fresh (stamp, run nothing)", () => {
        // from === current → planMigrations yields []
        expect(resolveFromVersion("", "0.7.0", false)).toBe("0.7.0");
    });

    it("treats a populated world with no stored version as legacy (run everything)", () => {
        expect(resolveFromVersion("", "0.7.0", true)).toBe("0.0.0");
    });
});

describe("SOHL_MIGRATIONS", () => {
    it("ships empty — infrastructure only (#957)", () => {
        expect(SOHL_MIGRATIONS).toEqual([]);
    });

    it("is frozen so the registry cannot be mutated at runtime", () => {
        expect(Object.isFrozen(SOHL_MIGRATIONS)).toBe(true);
    });
});
