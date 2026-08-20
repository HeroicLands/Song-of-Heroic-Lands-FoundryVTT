/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import path from "node:path";

import { assertPackageIdMatchesManifestFile } from "@heroiclands/content-build/engine/package-manifest";
import { FOUNDRY_PACKAGE_ID } from "@heroiclands/content-build/engine/content-package";

/**
 * The guard itself is exercised against fixture directories in the package's own
 * suite. What only *this* repository can assert is that its real shipped
 * manifest agrees with the package id its configuration declares — a repository
 * that ships no Foundry package has no manifest to check.
 *
 * It lived in the package's suite while the package was vendored here, reaching
 * the repository root through a hardcoded `../../..`. That resolved only because
 * of where the package sat, so it moved here when the package was extracted
 * (#1589, HeroicLands/content-build#1).
 */
describe("this repository's shipped manifest", () => {
    it("declares the package id the build addresses every document by", () => {
        // The regression the guard exists for (#1503): every compiled UUID takes
        // its first segment from FOUNDRY_PACKAGE_ID. If the manifest's `id` and
        // the configured `foundryPackage` drift apart, the packs address a
        // package that does not ship them — and nothing else notices.
        expect(() =>
            assertPackageIdMatchesManifestFile(
                FOUNDRY_PACKAGE_ID,
                path.resolve(__dirname, "../../assets/templates"),
            ),
        ).not.toThrow();
    });
});
