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

import type { AstrologyTraditions } from "@src/entity/astrology";

/**
 * Foundry-free view-model builder for the Astrology Traditions settings menu
 * ({@link AstrologyTraditionsMenu}): turn the resolved traditions registry into
 * display rows. Pure — the app supplies the merged registry (built-ins + world
 * overrides) and the set of world-defined keys.
 */

/** One tradition row for the settings list. */
export interface TraditionRow {
    /** The tradition key (an Affiliation `society`). */
    key: string;
    /** The tradition's display label. */
    label: string;
    /** How many signs the tradition defines. */
    signCount: number;
    /** Whether this tradition is world-authored/overridden (vs. a shipped built-in). */
    isWorld: boolean;
}

/** The render context for the Astrology Traditions menu. */
export interface AstrologyTraditionsViewModel {
    /** All traditions (built-in + world), sorted by label. */
    traditions: TraditionRow[];
    /** Whether any traditions exist at all. */
    hasTraditions: boolean;
    /** Whether the world has authored/overridden any traditions (enables Clear). */
    hasWorld: boolean;
}

/**
 * Build the Astrology Traditions view model: a label-sorted list of every
 * tradition, each flagged as a shipped built-in or a world entry.
 * @param registry - The merged tradition key → tradition map (built-ins + world).
 * @param worldKeys - The keys that come from the world setting (marks `isWorld`).
 * @returns The template render context.
 */
export function buildAstrologyTraditionsViewModel(
    registry: AstrologyTraditions,
    worldKeys: Iterable<string>,
): AstrologyTraditionsViewModel {
    const world = new Set(worldKeys);
    const traditions: TraditionRow[] = Object.values(registry ?? {})
        .map((t) => ({
            key: t.key,
            label: t.label,
            signCount: t.signs?.length ?? 0,
            isWorld: world.has(t.key),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return {
        traditions,
        hasTraditions: traditions.length > 0,
        hasWorld: world.size > 0,
    };
}
