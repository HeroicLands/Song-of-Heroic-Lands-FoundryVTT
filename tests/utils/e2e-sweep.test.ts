/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time e2e helper (plain ESM, no Foundry). Imported by relative path
// because the sweep script lives outside the `@src` alias tree.
import { resolveSweepVersion } from "../../utils/e2e-sweep.mjs";

describe("resolveSweepVersion — the build a sweep names", () => {
    it("accepts an exact build and returns it", () => {
        expect(resolveSweepVersion(["14.367"])).toBe("14.367");
    });

    it("trims surrounding whitespace", () => {
        expect(resolveSweepVersion(["  14.367  "])).toBe("14.367");
    });

    it("ignores arguments after the version", () => {
        expect(resolveSweepVersion(["14.359", "--whatever"])).toBe("14.359");
    });

    // The sweep's whole product is a citable result — "the full suite passed on
    // <build>". A version nobody named cannot be cited, so there is deliberately
    // no default: the script must not silently sweep some build of its own
    // choosing, and must never hardcode "the newest release" (which rots).
    it.each([[[]], [[""]], [["   "]]])(
        "refuses to guess when no version is given (%j)",
        (argv) => {
            expect(() => resolveSweepVersion(argv as string[])).toThrow(
                /name the build/i,
            );
        },
    );

    // felddy takes `FOUNDRY_VERSION` verbatim, so a bare major or a tag would
    // resolve to whatever the registry serves that week — the exact drift the
    // pin exists to prevent.
    it.each([["14"], ["latest"], ["v14.367"], ["14.367.1"], ["14."]])(
        "rejects %j — a sweep must name one exact build",
        (version) => {
            expect(() => resolveSweepVersion([version])).toThrow(
                /exact Foundry build/i,
            );
        },
    );
});
