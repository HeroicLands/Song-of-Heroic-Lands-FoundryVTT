/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { buildStats } from "@heroiclands/package-build/engine/helpers";

/**
 * The version a compiled document claims it was built by is an agreement
 * between this repository and the shared toolchain, and neither side can check
 * it alone: the toolchain owns the `_stats` block, this repository owns the
 * version that ships in it.
 *
 * It was a hand-maintained literal, frozen at `0.6.0` while the system shipped
 * releases up to `0.8.2` (#1548). A document that under-reports its version is
 * eligible for migrations it does not need — the same defect `_stats.coreVersion`
 * had before it started following the manifest's `compatibility.minimum`
 * (#1533).
 */
describe("compiled pack documents", () => {
    const repoRoot = path.resolve(__dirname, "../..");

    /** The shipped system version — what `system.json` is stamped with. */
    const shippedVersion: string = JSON.parse(
        fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
    ).version;

    /** The stamp itself. `buildStats` is untyped JS, so name its one field. */
    const stamped = () => buildStats() as { systemVersion: string };

    it("stamp the shipped system version, not a frozen literal", () => {
        expect(stamped().systemVersion).toBe(shippedVersion);
    });

    it("stamp a version that has moved past the frozen 0.6.0", () => {
        // Guards the fix rather than the value: were the literal restored, the
        // assertion above would still pass on a hypothetical 0.6.0 release.
        expect(stamped().systemVersion).not.toBe("0.6.0");
    });
});
