/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { Rng } from "@src/entity/random/Rng";
import { ACTOR_KIND } from "@src/utils/constants";
import { qualifierRoll, type QualifierRollResult } from "./qualifierRoll";

/**
 * Resolve the stars of an explicitly chosen workshop as its Target Number.
 * @param workshop - The chosen Structure's logic; no location lookup is performed.
 * @returns Its authored integer star rating, one through five.
 * @throws {RangeError} When it is not a Structure or carries no valid workshop rating.
 */
export function workshopTargetNumber(workshop: StructureLogic): number {
    const rating = workshop?.data?.workshopRating;
    if (
        workshop?.data?.kind !== ACTOR_KIND.STRUCTURE ||
        !Number.isSafeInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        throw new RangeError("Choose a Structure with a workshop rating of one through five stars");
    }
    return rating;
}

/**
 * Roll qualifiers using a selected workshop's stars, retaining the ordinary per-routine API.
 * This is an explicit caller action: it writes no actors and infers no workshop.
 * @param numDice - Number of d10 qualifiers chosen by the calling routine.
 * @param workshop - The explicitly selected rated Structure.
 * @param effectLadder - Caller-defined effects indexed by the success count.
 * @param parent - Logic that owns the transient roll.
 * @param rng - Optional isolated random stream, as accepted by qualifierRoll.
 * @returns Individual dice, success count and the corresponding ladder effect.
 * @throws {RangeError} When the workshop, die count or ladder is invalid.
 */
export function workshopQualifierRoll<T>(
    numDice: number,
    workshop: StructureLogic,
    effectLadder: readonly T[],
    parent: SohlLogic<any>,
    rng?: Rng,
): QualifierRollResult<T> {
    return qualifierRoll(numDice, workshopTargetNumber(workshop), effectLadder, parent, rng);
}
