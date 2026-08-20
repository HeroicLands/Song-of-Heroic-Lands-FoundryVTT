/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";

// Build-time pack integrity check (plain ESM, no Foundry). Imported by relative
// path because the pack-build scripts live outside the `@src` alias tree.
import { checkSceneLevels } from "../engine/scene-levels.mjs";

/** A well-formed scene record and the sublevel record its `levels` names. */
function goodPack(): Array<[string, Record<string, unknown>]> {
    return [
        [
            "!scenes!AAAAAAAAAAAAAAAA",
            {
                _id: "AAAAAAAAAAAAAAAA",
                name: "Hearthmoor",
                initialLevel: "defaultLevel0000",
                levels: ["defaultLevel0000"],
            },
        ],
        [
            "!scenes.levels!AAAAAAAAAAAAAAAA.defaultLevel0000",
            {
                _id: "defaultLevel0000",
                name: "Ground",
                background: { src: "systems/sohl/assets/ui/parchment.jpg" },
            },
        ],
    ];
}

describe("checkSceneLevels", () => {
    it("passes a scene whose Level record is present", () => {
        expect(checkSceneLevels(goodPack())).toEqual([]);
    });

    it("passes a pack holding no scenes at all", () => {
        expect(
            checkSceneLevels([["!items!AAAAAAAAAAAAAAAA", { _id: "x" }]]),
        ).toEqual([]);
    });

    // The reported failure (#1538): the parent still names its Level, but the
    // `scenes.levels` sublevel record is gone. Foundry reads that as "no
    // levels" and persists the emptied array on the next launch, so the map
    // image is lost and `initialLevel` dangles.
    it("reports a `levels` id with no record in the scenes.levels sublevel", () => {
        const records = goodPack().filter(
            ([key]) => !key.startsWith("!scenes.levels!"),
        );
        const problems = checkSceneLevels(records);
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain("Hearthmoor");
        expect(problems[0]).toContain("defaultLevel0000");
    });

    it("reports a scene with an empty `levels` array", () => {
        const records = goodPack();
        (records[0][1] as { levels: string[] }).levels = [];
        const problems = checkSceneLevels(records);
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain("no Level");
    });

    it("reports a scene with no `levels` key at all", () => {
        const records = goodPack();
        delete (records[0][1] as { levels?: string[] }).levels;
        expect(checkSceneLevels(records)).toHaveLength(1);
    });

    it("reports an `initialLevel` that names no level of the scene", () => {
        const records = goodPack();
        (records[0][1] as { initialLevel: string }).initialLevel = "nope";
        const problems = checkSceneLevels(records);
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain("initialLevel");
    });

    it("ignores a level record keyed to a different scene", () => {
        const records = goodPack();
        records[1][0] = "!scenes.levels!BBBBBBBBBBBBBBBB.defaultLevel0000";
        expect(checkSceneLevels(records)).toHaveLength(1);
    });

    // An Adventure carries its scenes inline, levels and all, so the same
    // invariant has a second shape and a second way to ship a mapless scene.
    describe("inline scenes on an Adventure record", () => {
        function adventure(levels: unknown): Array<[string, object]> {
            return [
                [
                    "!adventures!CCCCCCCCCCCCCCCC",
                    {
                        _id: "CCCCCCCCCCCCCCCC",
                        name: "Wayfarer's Rest",
                        scenes: [
                            {
                                _id: "AAAAAAAAAAAAAAAA",
                                name: "Hearthmoor",
                                initialLevel: "defaultLevel0000",
                                levels,
                            },
                        ],
                    },
                ],
            ];
        }

        it("passes when the inline scene carries its Level object", () => {
            expect(
                checkSceneLevels(
                    adventure([
                        {
                            _id: "defaultLevel0000",
                            background: { src: "a.jpg" },
                        },
                    ]),
                ),
            ).toEqual([]);
        });

        it("reports an inline scene with no levels", () => {
            const problems = checkSceneLevels(adventure([]));
            expect(problems).toHaveLength(1);
            expect(problems[0]).toContain("Wayfarer's Rest");
            expect(problems[0]).toContain("Hearthmoor");
        });

        it("reports an inline scene whose initialLevel is absent", () => {
            const problems = checkSceneLevels(
                adventure([{ _id: "other0000000000" }]),
            );
            expect(problems).toHaveLength(1);
            expect(problems[0]).toContain("initialLevel");
        });
    });
});
