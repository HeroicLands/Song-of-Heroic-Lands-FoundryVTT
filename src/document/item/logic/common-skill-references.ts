/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { fvttResolveUuidAsync } from "@src/core/FoundryHelpers";
import { ITEM_KIND } from "@src/utils/constants";

/** A skill reference shown on an Affiliation sheet. */
export interface CommonSkillRow {
    uuid: string;
    label: string;
    unavailable: boolean;
}

/**
 * Resolve an exact native skill Item UUID, including a compendium Item in an
 * installed module.
 * @param uuid - The persisted Foundry Item UUID.
 * @returns The skill document, or `undefined` if missing or of another type.
 */
export async function resolveCommonSkillReference(uuid: string): Promise<any | undefined> {
    if (!uuid) return undefined;
    try {
        const document = await fvttResolveUuidAsync(uuid);
        return document?.documentName === "Item" && document.type === ITEM_KIND.SKILL ?
                document
            :   undefined;
    } catch {
        return undefined;
    }
}

/**
 * Resolve display names without changing the persisted UUID list. Unavailable
 * references retain their exact UUID so the owner can identify and remove them.
 * @param uuids - The affiliation's native skill Item UUIDs.
 * @returns Display rows in persisted order.
 */
export async function commonSkillRows(uuids: readonly string[]): Promise<CommonSkillRow[]> {
    return Promise.all(
        uuids.map(async (uuid) => {
            const skill = await resolveCommonSkillReference(uuid);
            return { uuid, label: skill?.name ?? uuid, unavailable: !skill };
        }),
    );
}
