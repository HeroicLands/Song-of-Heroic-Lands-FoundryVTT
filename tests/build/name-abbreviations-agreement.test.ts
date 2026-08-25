/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The abbreviation table is stated twice, and the two copies must agree.
 *
 * It has to be stated twice. `@heroiclands/package-build` owns the build-time
 * copy — it abbreviates when it derives a page's URL from a note's name, for
 * every package's content tree. The **runtime** applies the same table when it
 * suggests a `shortcode` from a document's name in the create dialog, and
 * shipped code cannot import a `devDependency`, so it keeps its own plain-ESM
 * copy in `src/utils/name-abbreviations.mjs`.
 *
 * Nothing else compares them. This is the same seam
 * `shortcode-format-agreement.test.ts` provides for the shortcode shape rule,
 * and `manifest-package-id.test.ts` for the package id.
 *
 * A drift here is mild — a suggested default would differ from the URL the same
 * name publishes at — but it is exactly the kind that goes unnoticed for a long
 * time, which is why it is worth one assertion.
 *
 * It asserts against the **installed** package under `node_modules/`, not a
 * working copy, because that is the only form a consumer ever sees.
 */

import { describe, it, expect } from "vitest";

import { NAME_ABBREVIATIONS } from "@src/utils/name-abbreviations.mjs";
import { ABBREVIATIONS } from "@heroiclands/package-build/engine/abbreviations";

describe("the abbreviation table agrees across the boundary", () => {
    it("is not empty on either side", () => {
        // A broken import would make every case below vacuously pass.
        expect(Object.keys(ABBREVIATIONS).length).toBeGreaterThan(100);
        expect(Object.keys(NAME_ABBREVIATIONS).length).toBeGreaterThan(100);
    });

    it("has the same words", () => {
        expect(Object.keys(NAME_ABBREVIATIONS).sort()).toEqual(
            Object.keys(ABBREVIATIONS).sort(),
        );
    });

    it("maps every word to the same abbreviation", () => {
        expect({ ...NAME_ABBREVIATIONS }).toEqual({ ...ABBREVIATIONS });
    });

    it("is frozen on the runtime side, so nothing edits it in place", () => {
        expect(Object.isFrozen(NAME_ABBREVIATIONS)).toBe(true);
    });
});
