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

import { ACTOR_KIND, GearKinds } from "@src/utils/constants";

/** Read-only weight inputs from an owned gear item. */
export interface CargoLogic {
    data: { kind: string; quantity?: number; weightBase?: number };
    weight?: { effective: number };
}

/** The actor inputs needed to report occupancy and payload. */
export interface OccupancyLogic {
    data: { kind: string; uuid?: string };
    memberLogics?: readonly OccupancyLogic[];
    body?: { weight?: { effective: number } };
    carriedWeight?: { effective: number };
    allLogics?: readonly CargoLogic[];
}

/**
 * Keep missing, invalid and negative weight inputs out of informational sums.
 * @param value - A weight or quantity input.
 * @returns A finite nonnegative number, or zero when unavailable.
 */
function nonnegative(value: number | undefined): number {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Resolve a deduplicated actor graph while preventing cyclic cohort references.
 * @param logics - Resolved root occupants.
 * @returns Distinct people and cohorts represented by those occupants.
 */
function occupancyNodes(logics: readonly OccupancyLogic[]): {
    people: OccupancyLogic[];
    cohorts: OccupancyLogic[];
} {
    const seen = new Set<string | OccupancyLogic>();
    const people: OccupancyLogic[] = [];
    const cohorts: OccupancyLogic[] = [];
    const visit = (logic: OccupancyLogic): void => {
        const key = logic.data.uuid || logic;
        if (seen.has(key)) return;
        seen.add(key);
        if (logic.data.kind === ACTOR_KIND.BEING) people.push(logic);
        else if (logic.data.kind === ACTOR_KIND.COHORT) {
            cohorts.push(logic);
            for (const member of logic.memberLogics ?? []) visit(member);
        }
    };
    for (const logic of logics) visit(logic);
    return { people, cohorts };
}

/**
 * Count physical people represented by resolved occupant handles, including cohorts.
 * @param logics - Resolved occupant logics; unresolved handles are excluded by the caller.
 * @returns Distinct Beings, preserving first encounter order.
 */
export function resolvedPeople(logics: readonly OccupancyLogic[]): OccupancyLogic[] {
    return occupancyNodes(logics).people;
}

/**
 * Sum owned cargo without rounding, so capacity comparisons keep full precision.
 * Container weight is its own weight; every contained item contributes separately.
 * @param logics - Owned item logics.
 * @returns Effective gear weight times quantity, in pounds.
 */
export function cargoWeightOf(logics: readonly CargoLogic[]): number {
    return logics.reduce((sum, item) => {
        if (!GearKinds.includes(item.data.kind as (typeof GearKinds)[number])) return sum;
        return (
            sum +
            nonnegative(item.weight?.effective ?? item.data.weightBase) *
                nonnegative(item.data.quantity ?? 1)
        );
    }, 0);
}

/**
 * Report occupant bodies, their carried gear, and cohort-owned cargo once each.
 * This value does not change movement, actions, or boarding eligibility.
 * @param logics - Resolved occupant logics.
 * @returns Informational payload weight in pounds, before display rounding.
 */
export function occupantsWeightOf(logics: readonly OccupancyLogic[]): number {
    const { people, cohorts } = occupancyNodes(logics);
    return (
        people.reduce(
            (sum, person) =>
                sum +
                nonnegative(person.body?.weight?.effective) +
                nonnegative(person.carriedWeight?.effective),
            0,
        ) + cohorts.reduce((sum, cohort) => sum + cargoWeightOf(cohort.allLogics ?? []), 0)
    );
}
