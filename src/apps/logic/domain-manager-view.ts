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

/**
 * Foundry-free view-model builder for the Domain manager app
 * ({@link DomainManagerApp}): group every registered domain by family, sort
 * within each family, and compute the per-entry delete/override flags. Pure —
 * the app supplies the already-resolved domain entries.
 */

import {
    DOMAIN_FAMILY,
    DomainFamilies,
    domainFamilyLabels,
    type DomainFamily,
} from "@src/utils/constants";
import type { DomainEntry } from "@src/entity/domain/DomainRegistry";

/** A domain entry augmented with the per-row UI flags. */
export interface DomainRenderRow extends DomainEntry {
    /** Whether the entry may be deleted through the UI (world entries only). */
    canDelete: boolean;
    /** Whether the entry shadows a system default. */
    isOverride: boolean;
}

/** A family heading with its sorted, flagged domain rows. */
export interface DomainRenderGroup {
    /** The domain family. */
    family: DomainFamily;
    /** The localization key for the family heading. */
    familyLabel: string;
    /** The family's domain rows, sorted by sort then label. */
    entries: DomainRenderRow[];
}

/**
 * Group domain entries by family, sort each family's rows by `sort` then label,
 * compute the delete/override flags, and drop empty families.
 *
 * A `world`-source entry is deletable; a `world` entry whose shortcode begins
 * with `sohl.` is flagged as overriding a system default (the only way a GM can
 * shadow a default through the UI).
 *
 * @param entries - Every registered domain entry.
 * @returns The non-empty family groups, each with its sorted rows.
 */
export function buildDomainGroups(
    entries: Iterable<DomainEntry>,
): DomainRenderGroup[] {
    const grouped = new Map<DomainFamily, DomainRenderRow[]>();
    for (const family of DomainFamilies) {
        grouped.set(family as DomainFamily, []);
    }
    for (const entry of entries) {
        const list = grouped.get(entry.family);
        if (!list) continue;
        list.push({
            ...entry,
            canDelete: entry.source === "world",
            isOverride:
                entry.source === "world" && entry.shortcode.startsWith("sohl."),
        });
    }
    for (const [, list] of grouped) {
        list.sort((a, b) => {
            if (a.sort !== b.sort) return a.sort - b.sort;
            return a.label.localeCompare(b.label);
        });
    }

    const groups: DomainRenderGroup[] = [];
    for (const [family, rows] of grouped) {
        if (rows.length === 0) continue;
        const familyKey = Object.entries(DOMAIN_FAMILY).find(
            ([, v]) => v === family,
        )?.[0];
        const familyLabel =
            familyKey ?
                domainFamilyLabels[familyKey as keyof typeof domainFamilyLabels]
            :   family;
        groups.push({ family, familyLabel, entries: rows });
    }
    return groups;
}
