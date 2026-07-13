/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
    buildChangeTypesMap,
    resolveEffectMetadataType,
    resolveEffectKeyChoices,
} from "@src/document/effect/logic/effect-sheet-view";
import { ACTIVE_EFFECT_SCOPE, ITEM_KIND } from "@src/utils/constants";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("effect-sheet-view", () => {
    describe("buildChangeTypesMap", () => {
        it("localizes each entry by its label", () => {
            vi.spyOn(sohl.i18n, "localize").mockImplementation((key: string) =>
                key === "EFFECT.Add" ? "Add" : key,
            );
            const map = buildChangeTypesMap({ add: { label: "EFFECT.Add" } });
            expect(map).toEqual({ add: "Add" });
        });

        it("falls back to the registry key when an entry has no label", () => {
            // Default stub returns the key unchanged.
            expect(buildChangeTypesMap({ custom: {} })).toEqual({
                custom: "custom",
            });
        });

        it("returns an empty object for nullish input", () => {
            expect(buildChangeTypesMap(null)).toEqual({});
            expect(buildChangeTypesMap(undefined)).toEqual({});
        });
    });

    describe("resolveEffectMetadataType", () => {
        it("uses the parent type for 'this' scope", () => {
            expect(
                resolveEffectMetadataType(
                    ACTIVE_EFFECT_SCOPE.THIS,
                    "effect",
                    "weapongear",
                    "being",
                ),
            ).toBe("weapongear");
        });

        it("falls back to the document type for 'this' scope without a parent", () => {
            expect(
                resolveEffectMetadataType(
                    ACTIVE_EFFECT_SCOPE.THIS,
                    "effect",
                    undefined,
                    "being",
                ),
            ).toBe("effect");
        });

        it("uses the actor type for 'actor' scope", () => {
            expect(
                resolveEffectMetadataType(
                    ACTIVE_EFFECT_SCOPE.ACTOR,
                    "effect",
                    "weapongear",
                    "being",
                ),
            ).toBe("being");
        });

        it("returns the scope itself for an item-kind scope", () => {
            expect(
                resolveEffectMetadataType(
                    ITEM_KIND.SKILL,
                    "effect",
                    undefined,
                    undefined,
                ),
            ).toBe(ITEM_KIND.SKILL);
        });

        it("returns an empty string when scope is undefined", () => {
            expect(
                resolveEffectMetadataType(
                    undefined,
                    "effect",
                    undefined,
                    undefined,
                ),
            ).toBe("");
        });
    });

    describe("resolveEffectKeyChoices", () => {
        it("returns an empty map for an item kind with no populated key choices", () => {
            // ITEM_METADATA KeyChoices are currently empty arrays, which are
            // ignored (only value-keyed maps are usable as select choices).
            expect(resolveEffectKeyChoices(ITEM_KIND.SKILL)).toEqual({});
        });

        it("returns an empty map for an unknown type", () => {
            expect(resolveEffectKeyChoices("being")).toEqual({});
            expect(resolveEffectKeyChoices("")).toEqual({});
        });

        it("returns the melee strike-mode effect keys (change path → label)", () => {
            const choices = resolveEffectKeyChoices(
                ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE,
            );
            // localize is identity in tests, so labels are the lang keys.
            expect(choices["mod:attack"]).toBe(
                "SOHL.MeleeStrikeMode.EffectKey.ATTACK",
            );
            expect(choices["mod:defense.block"]).toBe(
                "SOHL.MeleeStrikeMode.EffectKey.BLOCK",
            );
            // Missile-only keys are absent from the melee set.
            expect(choices["mod:draw"]).toBeUndefined();
        });

        it("returns the missile strike-mode effect keys", () => {
            const choices = resolveEffectKeyChoices(
                ACTIVE_EFFECT_SCOPE.MISSILE_STRIKE_MODE,
            );
            expect(choices["mod:baseRange"]).toBe(
                "SOHL.MissileStrikeMode.EffectKey.BASE_RANGE",
            );
            expect(choices["mod:draw"]).toBe(
                "SOHL.MissileStrikeMode.EffectKey.DRAW",
            );
        });
    });
});
