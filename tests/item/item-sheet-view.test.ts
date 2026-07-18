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

import { describe, it, expect, vi, afterEach } from "vitest";
import {
    localizeSubType,
    keyTransferredEffects,
    findSimilarItem,
    type ItemMatchKey,
} from "@src/document/item/logic/item-sheet-view";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("item-sheet-view", () => {
    describe("localizeSubType", () => {
        it("returns an empty string when there is no subtype", () => {
            expect(localizeSubType("", "skill")).toBe("");
        });

        it("returns the localized label when an entry exists", () => {
            vi.spyOn(sohl.i18n, "localize").mockImplementation((key: string) =>
                key === "SOHL.skill.SubType.social" ? "Social" : key,
            );
            expect(localizeSubType("social", "skill")).toBe("Social");
        });

        it("falls back to the raw subtype when unlocalized", () => {
            // Default test stub returns the key unchanged → no localization.
            expect(localizeSubType("social", "skill")).toBe("social");
        });

        it("builds the key from the kind prefix", () => {
            const spy = vi.spyOn(sohl.i18n, "localize").mockReturnValue("X");
            localizeSubType("ranged", "weapongear");
            expect(spy).toHaveBeenCalledWith("SOHL.weapongear.SubType.ranged");
        });
    });

    describe("keyTransferredEffects", () => {
        it("keys enabled effects by id", () => {
            const a = { id: "a", disabled: false };
            const b = { id: "b" };
            expect(keyTransferredEffects([a, b])).toEqual({ a, b });
        });

        it("excludes disabled effects", () => {
            const a = { id: "a", disabled: true };
            const b = { id: "b", disabled: false };
            expect(keyTransferredEffects([a, b])).toEqual({ b });
        });

        it("returns an empty object for null/undefined input", () => {
            expect(keyTransferredEffects(null)).toEqual({});
            expect(keyTransferredEffects(undefined)).toEqual({});
        });
    });

    describe("findSimilarItem", () => {
        const make = (
            name: string,
            type: string,
            subType?: unknown,
        ): ItemMatchKey => ({ name, type, system: { subType } });

        const items: ItemMatchKey[] = [
            make("Sword", "weapongear", "melee"),
            make("Dagger", "weapongear", "melee"),
        ];

        it("matches on name, type, and subtype together", () => {
            const hit = findSimilarItem(
                make("Dagger", "weapongear", "melee"),
                items,
            );
            expect(hit).toBe(items[1]);
        });

        it("does not match when the subtype differs", () => {
            expect(
                findSimilarItem(make("Sword", "weapongear", "thrown"), items),
            ).toBeUndefined();
        });

        it("does not match when the type differs", () => {
            expect(
                findSimilarItem(make("Sword", "miscgear", "melee"), items),
            ).toBeUndefined();
        });

        it("returns undefined against an empty collection", () => {
            expect(
                findSimilarItem(make("Sword", "weapongear", "melee"), []),
            ).toBeUndefined();
        });
    });
});
