import { describe, it, expect } from "vitest";
import {
    planMigrations,
    migrateDocumentSource,
    resolveFromVersion,
    SOHL_MIGRATIONS,
    type MigrationSource,
    type MigrationStep,
} from "@src/entity/migration/MigrationRegistry";
import { compareVersions } from "@src/entity/migration/version";

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

    it("hands each step the previous step's output, not the untouched source", () => {
        // Payloads replace whole objects and merge at the root, so two steps
        // that both rewrite `system` only compose if the second sees the
        // first's result. Reading the original source instead would spread the
        // stale `gone` key back in and silently undo step one.
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "drop a retired key",
                migrators: {
                    Item: (src) => {
                        const system = { ...src.system };
                        delete system.gone;
                        return { system };
                    },
                },
            },
            {
                version: "0.6.0",
                description: "stamp a new key",
                migrators: {
                    Item: (src) => ({ system: { ...src.system, added: true } }),
                },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(
            migrateDocumentSource(
                { type: "skill", system: { gone: "x", kept: 1 } },
                "Item",
                plan,
            ),
        ).toEqual({ system: { kept: 1, added: true } });
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
    it("is frozen so the registry cannot be mutated at runtime", () => {
        expect(Object.isFrozen(SOHL_MIGRATIONS)).toBe(true);
    });

    it("is registered in ascending version order", () => {
        const versions = SOHL_MIGRATIONS.map((s) => s.version);
        expect(versions).toEqual([...versions].sort(compareVersions));
    });

    it("describes every step", () => {
        for (const step of SOHL_MIGRATIONS) {
            expect(step.version).toMatch(/^\d+\.\d+\.\d+/);
            expect(step.description.length).toBeGreaterThan(0);
        }
    });
});

// ---------------------------------------------------------------------------
// 0.9.0 — strip the retired system.docUrl field (#1394)
// ---------------------------------------------------------------------------

describe("0.9.0 — strip system.docUrl (#1394)", () => {
    const step = SOHL_MIGRATIONS.find((s) => s.version === "0.9.0");

    it("is registered at the version that removes the field", () => {
        expect(step).toBeDefined();
        expect(step!.description).toContain("docUrl");
    });

    it("targets exactly the document kinds that carried the field", () => {
        // `defineSohlDataSchema` was spread into the Actor and Item system
        // schemas. Combatants carry it too but are never walked by the runner,
        // and effects / region behaviours never had it.
        expect(Object.keys(step!.migrators ?? {}).sort()).toEqual([
            "Actor",
            "Item",
        ]);
    });

    for (const kind of ["Actor", "Item"] as const) {
        describe(kind, () => {
            const migrate = () => step!.migrators![kind]!;

            it("omits docUrl from the payload", () => {
                const update = migrate()({
                    type: "skill",
                    system: {
                        shortcode: "sk-x",
                        docUrl: "https://heroiclands.org/sohl/skill/x/",
                        masteryLevelBase: 30,
                    },
                });
                expect(update).toEqual({
                    system: { shortcode: "sk-x", masteryLevelBase: 30 },
                });
                expect(update!.system).not.toHaveProperty("docUrl");
            });

            it("writes the whole system object back, never a deletion key", () => {
                // Foundry v14 prunes any key absent from the schema out of the
                // change set too, so `{"system.-=docUrl": null}` would delete
                // nothing. A root-level key is the only payload the runner's
                // non-recursive update turns into a forced replacement.
                const update = migrate()({
                    type: "being",
                    system: { shortcode: "b-x" },
                });
                expect(Object.keys(update!)).toEqual(["system"]);
            });

            it("preserves every other field verbatim, including arrays", () => {
                const system = {
                    shortcode: "b-x",
                    actionDefs: [{ shortcode: "a", subType: "intrinsic" }],
                    nested: { deep: [1, 2, 3] },
                };
                const update = migrate()({ type: "being", system });
                expect(update!.system).toEqual(system);
            });

            it("does not mutate the source it was handed", () => {
                const system = { shortcode: "b-x", docUrl: "https://x.test/" };
                migrate()({ type: "being", system });
                expect(system.docUrl).toBe("https://x.test/");
            });

            it("no-ops for a document that carries no system data", () => {
                expect(migrate()({ type: "base" })).toBeUndefined();
            });

            it("still emits a payload when the source shows no docUrl", () => {
                // The runner only writes when the payload is non-empty, and
                // rewriting the record is the whole point: Foundry has already
                // pruned docUrl out of the source a migrator can see, so the
                // stale value survives only in the database until the document
                // is written again.
                const update = migrate()({
                    type: "being",
                    system: { shortcode: "b-x" },
                });
                expect(update).toEqual({ system: { shortcode: "b-x" } });
            });
        });
    }

    it("folds through the runner for a world upgrading to 0.9.0", () => {
        const plan = planMigrations("0.8.2", "0.9.0");
        expect(plan.map((s) => s.version)).toContain("0.9.0");
        const update = migrateDocumentSource(
            {
                type: "weapongear",
                system: { shortcode: "wg-x", docUrl: "https://x.test/" },
            },
            "Item",
            plan,
        );
        expect(update).toEqual({ system: { shortcode: "wg-x" } });
    });

    it("does not run for a world already at 0.9.0", () => {
        expect(planMigrations("0.9.0", "0.9.0")).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// 0.9.0 — stamp the new required affiliation subType (#1405)
// ---------------------------------------------------------------------------

describe("0.9.0 — affiliation subType (#1405)", () => {
    const step = SOHL_MIGRATIONS.find((s) =>
        s.description.toLowerCase().includes("affiliation"),
    );
    const migrate = (source: MigrationSource) => step!.migrators!.Item!(source);

    it("is registered at the version that adds the field, with an Item migrator", () => {
        expect(step).toBeDefined();
        expect(step!.version).toBe("0.9.0");
        expect(Object.keys(step!.migrators ?? {})).toEqual(["Item"]);
    });

    it("stamps the social default on an affiliation with no subType", () => {
        expect(
            migrate({ type: "affiliation", system: { society: "Guild" } }),
        ).toEqual({ system: { society: "Guild", subType: "social" } });
    });

    it("stamps an affiliation whose subType is blank or null", () => {
        expect(
            migrate({ type: "affiliation", system: { subType: "" } }),
        ).toEqual({ system: { subType: "social" } });
        expect(
            migrate({ type: "affiliation", system: { subType: null } }),
        ).toEqual({ system: { subType: "social" } });
    });

    it("replaces a subType that is not a declared choice", () => {
        // A hand-edited or third-party value fails the field's `choices`
        // validation and is dropped, landing where an absent value does.
        expect(
            migrate({ type: "affiliation", system: { subType: "religious" } }),
        ).toEqual({ system: { subType: "social" } });
    });

    it("leaves an already-valid subType alone, writing nothing", () => {
        expect(
            migrate({ type: "affiliation", system: { subType: "divine" } }),
        ).toBeUndefined();
    });

    it("ignores items of every other type", () => {
        expect(migrate({ type: "skill", system: {} })).toBeUndefined();
        expect(migrate({ type: "mystery", system: {} })).toBeUndefined();
    });

    it("preserves every other field verbatim — the payload replaces, it does not merge", () => {
        // The runner updates non-recursively, so a bare `{"system.subType": …}`
        // would replace the whole system object with that one key.
        const system = {
            shortcode: "aff-x",
            society: "Guild",
            level: 3,
            relation: { peoni: "nemesis" },
        };
        expect(migrate({ type: "affiliation", system })).toEqual({
            system: { ...system, subType: "social" },
        });
    });

    it("tolerates an affiliation with no system data at all", () => {
        expect(migrate({ type: "affiliation" })).toEqual({
            system: { subType: "social" },
        });
    });

    it("does not mutate the source it was handed", () => {
        const system = { society: "Guild" };
        migrate({ type: "affiliation", system });
        expect(system).toEqual({ society: "Guild" });
    });

    it("folds through the runner alongside the docUrl strip", () => {
        // Both 0.9.0 steps touch an affiliation, and each returns a whole
        // `system` replacement, so the later one wins outright. That is correct
        // here because the source a migrator sees has *already* been pruned of
        // `docUrl` by Foundry (see the 0.9.0 strip above) — so restating the
        // source cannot reintroduce it, and the single surviving payload carries
        // both the strip and the stamp.
        const plan = planMigrations("0.8.2", "0.9.0");
        const update = migrateDocumentSource(
            { type: "affiliation", system: { shortcode: "aff-x" } },
            "Item",
            plan,
        );
        expect(update).toEqual({
            system: { shortcode: "aff-x", subType: "social" },
        });
    });
});

describe("0.9.0 — alphanumeric shortcode renames (#1397)", () => {
    const step = SOHL_MIGRATIONS.find((s) => s.description.includes("#1397"));
    const migrate = (source: MigrationSource) => step!.migrators!.Item!(source);

    it("is registered at 0.9.0 with an Item migrator", () => {
        expect(step).toBeDefined();
        expect(step!.version).toBe("0.9.0");
        // Only item types carried a malformed code; no actor is touched.
        expect(Object.keys(step!.migrators ?? {})).toEqual(["Item"]);
    });

    it("renames each of the three retired keys", () => {
        expect(
            migrate({ type: "trauma", system: { shortcode: "self-pro" } }),
        ).toEqual({ system: { shortcode: "selfpro" } });
        expect(
            migrate({ type: "trauma", system: { shortcode: "self-suf" } }),
        ).toEqual({ system: { shortcode: "selfsuf" } });
        expect(
            migrate({ type: "weapongear", system: { shortcode: "B&CFl" } }),
        ).toEqual({ system: { shortcode: "BCFl" } });
    });

    it("is scoped by type, so an unrelated item keeping the old string is left alone", () => {
        // `(type, shortcode)` is the identity — the bare code means nothing on
        // its own, and another type may legitimately use the same string.
        expect(
            migrate({ type: "skill", system: { shortcode: "self-pro" } }),
        ).toBeUndefined();
        expect(
            migrate({ type: "trauma", system: { shortcode: "B&CFl" } }),
        ).toBeUndefined();
    });

    it("writes nothing for a document that never carried a retired key", () => {
        expect(
            migrate({ type: "trauma", system: { shortcode: "selfpro" } }),
        ).toBeUndefined();
        expect(
            migrate({ type: "weapongear", system: { shortcode: "bsw" } }),
        ).toBeUndefined();
        expect(migrate({ type: "trauma", system: {} })).toBeUndefined();
        expect(migrate({ type: "trauma" })).toBeUndefined();
    });

    it("ignores a non-string shortcode rather than throwing", () => {
        expect(
            migrate({ type: "trauma", system: { shortcode: null } }),
        ).toBeUndefined();
        expect(
            migrate({ type: "trauma", system: { shortcode: 42 } }),
        ).toBeUndefined();
    });

    it("does not read inherited Object properties as a rename table", () => {
        // `type` and `shortcode` come from stored data, so a lookup on a plain
        // object literal would otherwise resolve "constructor" or "toString".
        expect(
            migrate({ type: "constructor", system: { shortcode: "self-pro" } }),
        ).toBeUndefined();
        expect(
            migrate({ type: "trauma", system: { shortcode: "constructor" } }),
        ).toBeUndefined();
        expect(
            migrate({ type: "trauma", system: { shortcode: "toString" } }),
        ).toBeUndefined();
    });

    it("preserves every other field — the payload replaces, it does not merge", () => {
        const system = {
            shortcode: "self-pro",
            subType: "psycond",
            category: "behavior",
            levelBase: 2,
        };
        expect(migrate({ type: "trauma", system })).toEqual({
            system: { ...system, shortcode: "selfpro" },
        });
    });

    it("folds together with the other 0.9.0 steps into one payload", () => {
        // A world on 0.8.2 runs all three steps; the rename must survive the
        // docUrl strip rewriting the same `system` object.
        const plan = planMigrations("0.8.2", "0.9.0");
        expect(
            migrateDocumentSource(
                {
                    type: "trauma",
                    system: { shortcode: "self-pro", docUrl: "https://x/y" },
                },
                "Item",
                plan,
            ),
        ).toEqual({ system: { shortcode: "selfpro" } });
    });
});
