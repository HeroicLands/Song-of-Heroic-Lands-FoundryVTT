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

import type { SuccessTestResult } from "./SuccessTestResult";
import type { QualifierRollResult } from "@src/entity/roll/qualifierRoll";
import { qualifierRoll } from "@src/entity/roll/qualifierRoll";
import { dialog, fvttCurrentUser } from "@src/core/FoundryHelpers";
import { toFilePath } from "@src/utils/helpers";

/** Optional routine-specific qualifier rules; no expense or time is invented. */
export interface ValueDiamondAllocationOptions<T = unknown> {
    /** Omit this to return a chosen die count for caller-controlled resolution. */
    qualifier?: { targetNumber: number; effectLadder: readonly T[] };
    /** Crafting permits a 10% reduction per diamond; other routines can disable it. */
    allowTimeReduction?: boolean;
    /** Post a transparent allocation summary unless the caller suppresses it. */
    noChat?: boolean;
}
/** The accepted choice, kept separate from the original Success Value result. */
export interface ValueDiamondAllocation<T = unknown> {
    earned: number;
    qualifiers: number;
    timeDiamonds: number;
    timeReductionPercent: number;
    unspent: number;
    qualifierResult?: QualifierRollResult<T>;
}
const pending = new WeakSet<SuccessTestResult>();
const accepted = new WeakMap<SuccessTestResult, ValueDiamondAllocation>();

/**
 * Copy a receipt so callers cannot change its spending counts or recorded dice.
 * @param allocation - Accepted allocation stored against the local result.
 * @returns A separately mutable copy of the allocation data.
 */
function copyAllocation<T>(allocation: ValueDiamondAllocation<T>): ValueDiamondAllocation<T> {
    return {
        ...allocation,
        ...(allocation.qualifierResult ?
            {
                qualifierResult: {
                    ...allocation.qualifierResult,
                    rolls: [...allocation.qualifierResult.rolls],
                },
            }
        :   {}),
    };
}

/**
 * Offer the controller a post-roll choice of qualifier dice or faster crafting.
 * No choice occurs on cancellation. No original result, item, expense, or timer
 * is mutated. One accepted spending choice is recorded against this local result;
 * repeated calls return its receipt without drawing more dice. Cancellation and
 * a zero-spend choice leave the offer retryable. A configured qualifier batch rolls only after accepting a valid
 * choice; otherwise its chosen count is returned for the routine to resolve.
 * @param result - The recorded Success Value test that earned the diamonds.
 * @param options - Optional qualifier ladder and routine-specific availability.
 * @returns The accepted allocation, or undefined when refused or cancelled.
 */
export async function offerValueDiamondAllocation<T = unknown>(
    result: SuccessTestResult,
    options: ValueDiamondAllocationOptions<T> = {},
): Promise<ValueDiamondAllocation<T> | undefined> {
    const authorized = () =>
        result.item.actor?.isOwner && result.speaker.userId === fvttCurrentUser().id;
    const earned = result.valueDiamonds;
    if (
        !result.isSuccessValue ||
        !Number.isSafeInteger(earned) ||
        earned <= 0 ||
        earned > 5 ||
        !authorized() ||
        pending.has(result)
    )
        return undefined;
    const receipt = accepted.get(result);
    if (receipt) return copyAllocation(receipt as ValueDiamondAllocation<T>);
    const qualifier = options.qualifier;
    if (
        qualifier &&
        (!Number.isSafeInteger(qualifier.targetNumber) ||
            !Array.isArray(qualifier.effectLadder) ||
            Array.from({ length: earned + 1 }, (_, i) => i).some(
                (i) => !(i in qualifier.effectLadder),
            ))
    ) {
        throw new RangeError("Qualifier rules must cover every possible diamond allocation");
    }
    pending.add(result);
    try {
        const response = await dialog({
            title: sohl.i18n.localize("SOHL.ValueDiamonds.allocate"),
            template: toFilePath("systems/sohl/templates/dialog/value-diamond-allocation.hbs"),
            buttons: [
                {
                    action: "ok",
                    label: sohl.i18n.localize("SOHL.ValueDiamonds.accept"),
                    default: true,
                },
                { action: "cancel", label: sohl.i18n.localize("SOHL.ValueDiamonds.cancel") },
            ],
            // Native DialogV2 treats a null callback value as the button action.
            // Return a truthy envelope so Cancel keeps its explicit identity.
            callback: (data, action) => ({ action, data }),
            data: {
                earned,
                qualifiers: 0,
                time: 0,
                maxTime: options.allowTimeReduction === false ? 0 : Math.min(3, earned),
                allowTime: options.allowTimeReduction !== false,
            },
        });
        if (
            !response ||
            typeof response !== "object" ||
            (response.action != null && response.action !== "ok") ||
            !response.data ||
            typeof response.data !== "object" ||
            Array.isArray(response.data) ||
            !authorized() ||
            result.valueDiamonds !== earned
        )
            return undefined;
        const qualifiers = Number(response.data.qualifiers ?? 0);
        const timeDiamonds = Number(response.data.time ?? 0);
        if (
            ![qualifiers, timeDiamonds].every((n) => Number.isSafeInteger(n) && n >= 0) ||
            qualifiers + timeDiamonds > earned ||
            timeDiamonds > 3 ||
            (options.allowTimeReduction === false && timeDiamonds !== 0)
        )
            return undefined;
        const allocation: ValueDiamondAllocation<T> = {
            earned,
            qualifiers,
            timeDiamonds,
            timeReductionPercent: timeDiamonds * 10,
            unspent: earned - qualifiers - timeDiamonds,
        };
        if (qualifier && qualifiers > 0)
            allocation.qualifierResult = qualifierRoll(
                qualifiers,
                qualifier.targetNumber,
                qualifier.effectLadder,
                result.parent,
            );
        if (qualifiers + timeDiamonds > 0) accepted.set(result, copyAllocation(allocation));
        if (!options.noChat)
            await result.speaker.toChat(
                toFilePath("systems/sohl/templates/chat/value-diamond-allocation.hbs"),
                { ...allocation, title: result.title },
            );
        return allocation;
    } finally {
        pending.delete(result);
    }
}
