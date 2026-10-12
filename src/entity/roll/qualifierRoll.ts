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

import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { defaultRng } from "@src/entity/random/createRng";
import type { Rng } from "@src/entity/random/Rng";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";

/** The rolled dice, number of successes, and matching caller-defined effect. */
export interface QualifierRollResult<T> {
    /** The individual d10 results; empty when a TN clamp resolves the batch. */
    rolls: number[];
    /** Number of dice whose result was at or below the target number. */
    successCount: number;
    /** The caller's effect-ladder entry at index {@link successCount}. */
    result: T;
}

/**
 * Roll a batch of independent d10 qualifiers against one target number.
 *
 * Each die succeeds when its value is less than or equal to `targetNumber`; the
 * total success count selects the same-index entry from the caller's `effectLadder`.
 * No critical results apply. A TN at or below 0 deterministically fails every
 * die, and a TN at or above 10 deterministically succeeds every die; either
 * clamp returns no die values and consumes neither the injected RNG nor any
 * queued {@link SimpleRoll.forceValues | forced values}. A zero-die batch has no
 * rolls and selects ladder entry zero.
 *
 * The ladder must provide an entry for every possible count from 0 through
 * `numDice`. This function builds one {@link SimpleRoll}, preserving its existing
 * FIFO forced-value seam and accepting an injected seeded {@link Rng}. The
 * owning Logic is required because `SimpleRoll` is a parented `SohlEntity`.
 *
 * @param numDice - Nonnegative integer number of d10s to roll.
 * @param targetNumber - Safe integer TN shared by every die.
 * @param effectLadder - Caller-supplied results indexed by success count.
 * @param parent - Logic that owns the transient roll entity.
 * @param rng - Optional isolated random stream; defaults to `sohl.random`.
 * @returns Individual die values, the number of successes, and the matching
 *   caller-defined ladder entry.
 * @throws {RangeError} If `numDice` or `targetNumber` is invalid, or if the
 *   ladder does not contain every rung from zero through `numDice`.
 */
export function qualifierRoll<T>(
    numDice: number,
    targetNumber: number,
    effectLadder: readonly T[],
    parent: SohlLogic<any>,
    rng: Rng = defaultRng(),
): QualifierRollResult<T> {
    if (!Number.isSafeInteger(numDice) || numDice < 0) {
        throw new RangeError("numDice must be a nonnegative safe integer");
    }
    if (!Number.isSafeInteger(targetNumber)) {
        throw new RangeError("targetNumber must be a safe integer");
    }
    if (!Array.isArray(effectLadder) || effectLadder.length < numDice + 1) {
        throw new RangeError(`effectLadder must contain at least ${numDice + 1} entries`);
    }
    for (let count = 0; count <= numDice; count++) {
        if (!(count in effectLadder)) {
            throw new RangeError(`effectLadder is missing the ${count} success rung`);
        }
    }

    const roll = new SimpleRoll({ numDice, dieFaces: 10 }, { parent });
    let successCount: number;
    if (targetNumber <= 0) {
        successCount = 0;
    } else if (targetNumber >= 10) {
        successCount = numDice;
    } else {
        roll.roll(rng);
        successCount = roll.rolls.filter((value) => value <= targetNumber).length;
    }

    return {
        rolls: [...roll.rolls],
        successCount,
        result: effectLadder[successCount],
    };
}
