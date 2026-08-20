/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Imported by relative path, not the `@src` alias, because the pack-build
// scripts live outside that tree.
import {
    ITEM_BUILDERS,
    itemBuilder,
} from "../../../utils/packs/item-builders.mjs";
import { ITEM_TYPES } from "../../../utils/packs/item-docs.mjs";
import { DEFAULT_ITEM_ART } from "../sohl/default-item-art.mjs";

const BUILDERS = ITEM_BUILDERS as Record<string, unknown>;

describe("ITEM_BUILDERS (the one registry keyed by item type, #1504)", () => {
    it("maps every registered type to a builder function", () => {
        expect(Object.keys(BUILDERS).length).toBeGreaterThan(0);
        for (const [type, builder] of Object.entries(BUILDERS)) {
            expect(typeof builder, type).toBe("function");
        }
    });

    it("is the source ITEM_TYPES derives from, so the two cannot disagree", () => {
        // Not "these two hand-written lists happen to match" — ITEM_TYPES is
        // built from the registry's keys, so a type with no builder cannot be
        // whitelisted in the first place.
        expect([...ITEM_TYPES].sort()).toEqual(Object.keys(BUILDERS).sort());
    });

    it("does not advertise the retired `trait` type (#651)", () => {
        // `trait` was retired: it is absent from `documentTypes.Item` in
        // system.json, and world migration reports a surviving one as an
        // unrecognized type. Advertising it here made every `type: trait` note
        // pass the whitelist and then die on a missing builder (#1504).
        expect(ITEM_TYPES.has("trait")).toBe(false);
        expect(BUILDERS["trait"]).toBeUndefined();
        expect(DEFAULT_ITEM_ART).not.toHaveProperty("trait");
    });

    it("keeps the registry in step with the per-type default art", () => {
        // The third list that could drift (#1504): default item artwork.
        expect(Object.keys(DEFAULT_ITEM_ART).sort()).toEqual(
            [...ITEM_TYPES].sort(),
        );
    });
});

describe("itemBuilder (lookup that fails loudly)", () => {
    it("returns the registered builder for a known type", () => {
        expect(itemBuilder("skill")).toBe(BUILDERS["skill"]);
        expect(itemBuilder("weapongear")).toBe(BUILDERS["weapongear"]);
    });

    it("throws a named error for an unregistered type", () => {
        // The old failure was `BUILDERS[type] is not a function`, swallowed as a
        // per-file compile error; an unregistered type now names itself.
        expect(() => itemBuilder("trait")).toThrow(/no builder.*trait/i);
        expect(() => itemBuilder("nonesuch")).toThrow(/no builder/i);
    });
});
