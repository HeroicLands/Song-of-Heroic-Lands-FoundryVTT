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

    it("chains whole-object payloads, so two steps touching `system` compose", () => {
        // Every migrator builds its payload by spreading the system it is handed.
        // Handing each step the untouched source would let the later payload
        // silently discard the earlier step's edit; each step's own field must
        // survive.
        const source: MigrationSource = {
            type: "affiliation",
            system: { shortcode: "gd", society: "Guild" },
        };
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "a",
                migrators: {
                    Item: (src) => ({
                        system: { ...src.system, subType: "social" },
                    }),
                },
            },
            {
                version: "0.6.0",
                description: "b",
                migrators: {
                    Item: (src) => ({ system: { ...src.system, level: 3 } }),
                },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(migrateDocumentSource(source, "Item", plan)).toEqual({
            system: {
                shortcode: "gd",
                society: "Guild",
                subType: "social",
                level: 3,
            },
        });
    });

    it("lets the later step win on a field both steps write", () => {
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "a",
                migrators: { Item: () => ({ system: { tier: 1 } }) },
            },
            {
                version: "0.6.0",
                description: "b",
                migrators: { Item: () => ({ system: { tier: 2 } }) },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(migrateDocumentSource({ type: "skill" }, "Item", plan)).toEqual({
            system: { tier: 2 },
        });
    });

    it("does not let a later step reinstate a key an earlier one removed", () => {
        // The strip-then-restate shape: step a drops a retired key, step b
        // spreads what it is handed. Chaining means b spreads the *stripped*
        // system, so the key stays gone.
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "strip retired",
                migrators: {
                    Item: (src) => {
                        const system = { ...src.system };
                        delete system.retired;
                        return { system };
                    },
                },
            },
            {
                version: "0.6.0",
                description: "stamp tier",
                migrators: {
                    Item: (src) => ({ system: { ...src.system, tier: 2 } }),
                },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(
            migrateDocumentSource(
                { type: "skill", system: { keep: 1, retired: "x" } },
                "Item",
                plan,
            ),
        ).toEqual({ system: { keep: 1, tier: 2 } });
    });

    it("does not feed a dot-path payload forward — it only accumulates", () => {
        // Expanding `system.bar` into the source would need Foundry; a later
        // step still sees the original `system` object.
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "dot path",
                migrators: { Item: () => ({ "system.bar": 42 }) },
            },
            {
                version: "0.6.0",
                description: "reads system",
                migrators: {
                    Item: (src) => ({ system: { ...src.system, seen: true } }),
                },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(
            migrateDocumentSource(
                { type: "skill", system: { foo: 1 } },
                "Item",
                plan,
            ),
        ).toEqual({ "system.bar": 42, system: { foo: 1, seen: true } });
    });

    it("replaces rather than chains when a payload is not an object", () => {
        const chained: MigrationStep[] = [
            {
                version: "0.5.0",
                description: "a",
                migrators: { Item: () => ({ system: { tier: 1 } }) },
            },
            {
                version: "0.6.0",
                description: "b",
                migrators: { Item: () => ({ system: null }) },
            },
        ];
        const plan = planMigrations("", "0.6.0", chained);
        expect(migrateDocumentSource({ type: "skill" }, "Item", plan)).toEqual({
            system: null,
        });
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
                system: { shortcode: "wgx", docUrl: "https://x.test/" },
            },
            "Item",
            plan,
        );
        expect(update).toEqual({ system: { shortcode: "wgx" } });
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
            shortcode: "affx",
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
        // Every 0.9.0 step that touches an affiliation returns a whole `system`
        // object; the folder chains them, so each spreads what the previous step
        // produced and every edit survives into the single payload.
        const plan = planMigrations("0.8.2", "0.9.0");
        const update = migrateDocumentSource(
            { type: "affiliation", system: { shortcode: "affx" } },
            "Item",
            plan,
        );
        expect(update).toEqual({
            system: { shortcode: "affx", subType: "social" },
        });
    });
});

describe("0.9.0 — alphanumeric shortcodes (#1397)", () => {
    const step = SOHL_MIGRATIONS.find((s) =>
        s.description.toLowerCase().includes("shortcode"),
    );
    const migrateItem = (source: MigrationSource) =>
        step!.migrators!.Item!(source);
    const migrateActor = (source: MigrationSource) =>
        step!.migrators!.Actor!(source);

    it("is registered at 0.9.0 with an Actor and an Item migrator", () => {
        expect(step).toBeDefined();
        expect(step!.version).toBe("0.9.0");
        expect(Object.keys(step!.migrators ?? {}).sort()).toEqual([
            "Actor",
            "Item",
        ]);
    });

    it("maps the three shipped keys to their replacements", () => {
        expect(
            migrateItem({
                type: "trauma",
                name: "Self-protective",
                system: { shortcode: "self-pro" },
            }),
        ).toEqual({ system: { shortcode: "selfpro" } });
        expect(
            migrateItem({
                type: "trauma",
                name: "Self-sufficient",
                system: { shortcode: "self-suf" },
            }),
        ).toEqual({ system: { shortcode: "selfsuf" } });
        expect(
            migrateItem({
                type: "weapongear",
                name: "Ball & Chain Flail",
                system: { shortcode: "B&CFl" },
            }),
        ).toEqual({ system: { shortcode: "BCFl" } });
    });

    it("repairs any other non-alphanumeric key, preserving case", () => {
        expect(
            migrateItem({ type: "skill", system: { shortcode: "my_code" } }),
        ).toEqual({ system: { shortcode: "mycode" } });
        expect(
            migrateActor({ type: "being", system: { shortcode: "Sir Kay" } }),
        ).toEqual({ system: { shortcode: "SirKay" } });
    });

    it("leaves an already-valid shortcode alone, writing nothing", () => {
        expect(
            migrateItem({ type: "weapongear", system: { shortcode: "bsw" } }),
        ).toBeUndefined();
        expect(
            migrateActor({ type: "being", system: { shortcode: "BCap2" } }),
        ).toBeUndefined();
    });

    it("leaves a blank or absent shortcode to the create/update guard", () => {
        expect(
            migrateItem({ type: "skill", system: { shortcode: "" } }),
        ).toBeUndefined();
        expect(migrateItem({ type: "skill", system: {} })).toBeUndefined();
        expect(migrateItem({ type: "skill" })).toBeUndefined();
    });

    it("falls back to the name slug when nothing alphanumeric survives", () => {
        expect(
            migrateItem({
                type: "skill",
                name: "Deep Wound",
                system: { shortcode: "—!—" },
            }),
        ).toEqual({ system: { shortcode: "deepwound" } });
    });

    it("leaves an unrepairable key untouched rather than inventing one", () => {
        // No alphanumerics in either the shortcode or the name: there is nothing
        // to derive from, and a random id would sever the identity outright.
        expect(
            migrateItem({
                type: "skill",
                name: "—",
                system: { shortcode: "?" },
            }),
        ).toBeUndefined();
    });

    it("preserves every other field verbatim — the payload replaces, it does not merge", () => {
        const system = {
            shortcode: "self-pro",
            subType: "psycond",
            category: "quirk",
            levelBase: 2,
        };
        expect(
            migrateItem({ type: "trauma", name: "Self-protective", system }),
        ).toEqual({ system: { ...system, shortcode: "selfpro" } });
    });

    it("does not mutate the source it was handed", () => {
        const system = { shortcode: "self-pro" };
        migrateItem({ type: "trauma", name: "Self-protective", system });
        expect(system).toEqual({ shortcode: "self-pro" });
    });

    it("composes with the other 0.9.0 steps on one document", () => {
        const plan = planMigrations("0.8.2", "0.9.0");
        const update = migrateDocumentSource(
            {
                type: "affiliation",
                name: "Guild of Ash",
                system: { shortcode: "aff-x" },
            },
            "Item",
            plan,
        );
        // Both repairs land: the shortcode is alphanumeric *and* the required
        // subType is stamped.
        expect(update).toEqual({
            system: { shortcode: "affx", subType: "social" },
        });
    });
});
