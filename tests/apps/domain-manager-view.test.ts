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

import { describe, it, expect } from "vitest";
import { buildDomainGroups } from "@src/apps/logic/domain-manager-view";
import { DOMAIN_FAMILY, domainFamilyLabels } from "@src/utils/constants";
import type { DomainEntry } from "@src/core/SohlDomains";

function entry(over: Partial<DomainEntry>): DomainEntry {
    return {
        family: DOMAIN_FAMILY.ARCANE,
        source: "system",
        shortcode: "sohl.fire",
        sort: 0,
        label: "Fire",
        ...over,
    } as DomainEntry;
}

describe("domain-manager-view", () => {
    describe("buildDomainGroups", () => {
        it("groups entries under their family with the family label key", () => {
            const groups = buildDomainGroups([
                entry({ family: DOMAIN_FAMILY.ARCANE, label: "Fire" }),
            ]);
            expect(groups).toHaveLength(1);
            expect(groups[0].family).toBe(DOMAIN_FAMILY.ARCANE);
            expect(groups[0].familyLabel).toBe(domainFamilyLabels.ARCANE);
            expect(groups[0].entries.map((e) => e.label)).toEqual(["Fire"]);
        });

        it("drops families with no entries", () => {
            const groups = buildDomainGroups([
                entry({ family: DOMAIN_FAMILY.DIVINE }),
            ]);
            expect(groups.map((g) => g.family)).toEqual([DOMAIN_FAMILY.DIVINE]);
        });

        it("sorts within a family by sort then label", () => {
            const groups = buildDomainGroups([
                entry({ label: "Zeta", sort: 1 }),
                entry({ label: "Beta", sort: 1 }),
                entry({ label: "Alpha", sort: 0 }),
            ]);
            expect(groups[0].entries.map((e) => e.label)).toEqual([
                "Alpha",
                "Beta",
                "Zeta",
            ]);
        });

        it("flags world entries as deletable and sohl.* world entries as overrides", () => {
            const groups = buildDomainGroups([
                entry({ source: "world", shortcode: "sohl.fire" }),
                entry({ source: "world", shortcode: "world.custom" }),
                entry({ source: "system", shortcode: "sohl.water" }),
            ]);
            const rows = groups[0].entries;
            const byCode = (c: string) => rows.find((r) => r.shortcode === c)!;
            expect(byCode("sohl.fire")).toMatchObject({
                canDelete: true,
                isOverride: true,
            });
            expect(byCode("world.custom")).toMatchObject({
                canDelete: true,
                isOverride: false,
            });
            expect(byCode("sohl.water")).toMatchObject({
                canDelete: false,
                isOverride: false,
            });
        });

        it("returns an empty array for no entries", () => {
            expect(buildDomainGroups([])).toEqual([]);
        });
    });
});
