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
 * The run record follows the **act**, not the offer (#1192).
 *
 * `system.lastRun[shortcode]` records "the world time that action last
 * *performed* on this document". Under the Check/Test split (#1181) a `*Check`
 * only posts a card inviting one test — it rolls nothing and changes nothing —
 * so stamping the record there answered "when was the offer posted?", and said
 * the check had happened even when the player never touched the card. The
 * `*Test` is what performs, so it is what records.
 *
 * These are structural assertions over the action definitions; the stamping
 * mechanism itself is covered in `Action.test.ts`.
 */

import { describe, it, expect } from "vitest";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import type { SohlAction } from "@src/entity/action/SohlAction";

/** Every recurring `*Check` → the `*Test` it offers, by action shortcode. */
const PAIRS: {
    logic: { defineIntrinsicActions(): Partial<SohlAction.Data>[] };
    label: string;
    check: string;
    test: string;
}[] = [
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "healingCheck",
        test: "healingtest",
    },
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "bloodLossAdvanceCheck",
        test: "bloodLossAdvanceTest",
    },
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "courseCheck",
        test: "courseTest",
    },
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "psycheRecovery",
        test: "psycheRecoveryTest",
    },
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "auralShockRecovery",
        test: "auralShockRecoveryTest",
    },
    {
        logic: TraumaLogic,
        label: "Trauma",
        check: "pallRecovery",
        test: "pallRecoveryTest",
    },
    {
        logic: AfflictionLogic,
        label: "Affliction",
        check: "healingCheck",
        test: "healingTest",
    },
    {
        logic: AfflictionLogic,
        label: "Affliction",
        check: "courseCheck",
        test: "courseTest",
    },
];

/**
 * Find an action definition by shortcode on a logic class.
 * @param logic - The logic class whose intrinsic actions to search.
 * @param shortcode - The action shortcode.
 * @returns The action definition.
 */
function actionFor(
    logic: { defineIntrinsicActions(): Partial<SohlAction.Data>[] },
    shortcode: string,
): Partial<SohlAction.Data> | undefined {
    return logic
        .defineIntrinsicActions()
        .find((a) => a.shortcode === shortcode);
}

describe("the run record follows the act, not the offer (#1192)", () => {
    it.each(PAIRS)("$label $test records its run", ({ logic, test }) => {
        const action = actionFor(logic, test);
        expect(action, test).toBeDefined();
        expect(action?.recordsLastRun, `${test} must record its run`).toBe(
            true,
        );
    });

    it.each(PAIRS)(
        "$label $check does not record a run — it only offers",
        ({ logic, check }) => {
            const action = actionFor(logic, check);
            expect(action, check).toBeDefined();
            expect(
                action?.recordsLastRun ?? false,
                `${check} offers only, so it must not stamp a run record`,
            ).toBe(false);
        },
    );
});
