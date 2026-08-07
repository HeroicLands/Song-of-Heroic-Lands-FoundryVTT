import { describe, it, expect } from "vitest";
import {
    SOHL_MIGRATIONS,
    migrateDocumentSource,
    planMigrations,
} from "@src/entity/migration/MigrationRegistry";

/** The affliction-actions migration step (#1183). */
const STEP = SOHL_MIGRATIONS.find((s) => s.version === "0.8.0");

/** Run every 0.8.0 Item migrator over `source`. */
function migrateItem(source: Record<string, unknown>) {
    return migrateDocumentSource(
        source as any,
        "Item",
        planMigrations("0.7.0", "0.8.0"),
    );
}

describe("affliction intrinsic-actions migration (#1183)", () => {
    it("is registered at 0.8.0", () => {
        expect(STEP).toBeDefined();
        expect(STEP?.migrators?.Item).toBeTypeOf("function");
    });

    it("renames a persisted healingCheck schedule to courseCheck", () => {
        const update = migrateItem({
            type: "affliction",
            system: {
                scheduledActions: [
                    {
                        actionName: "healingCheck",
                        anchor: 100,
                        interval: 400,
                        sceneUuid: "",
                        payload: {},
                    },
                    {
                        actionName: "onsetCheck",
                        anchor: 0,
                        interval: 10,
                        sceneUuid: "",
                        payload: {},
                    },
                ],
            },
        });
        const entries = (update as any)["system.scheduledActions"];
        expect(entries.map((e: any) => e.actionName)).toEqual([
            "courseCheck",
            "onsetCheck",
        ]);
        // The whole array is rewritten (never an element by index).
        expect(entries[0].anchor).toBe(100);
        expect(entries[0].interval).toBe(400);
    });

    it("renames a persisted healingCheck last-run record to courseCheck", () => {
        const update = migrateItem({
            type: "affliction",
            system: { lastRun: { healingCheck: 900, onsetCheck: 5 } },
        });
        expect((update as any)["system.lastRun"]).toEqual({
            courseCheck: 900,
            onsetCheck: 5,
        });
    });

    it("drops the retired diagnosisBonusBase field", () => {
        const update = migrateItem({
            type: "affliction",
            system: { diagnosisBonusBase: 5 },
        });
        expect(update).toHaveProperty("system.-=diagnosisBonusBase");
    });

    it("leaves an affliction that needs nothing untouched", () => {
        expect(
            migrateItem({ type: "affliction", system: { levelBase: 2 } }),
        ).toEqual({});
    });

    it("ignores items that are not afflictions", () => {
        expect(
            migrateItem({
                type: "trauma",
                system: {
                    lastRun: { healingCheck: 900 },
                    diagnosisBonusBase: 5,
                },
            }),
        ).toEqual({});
    });
});
