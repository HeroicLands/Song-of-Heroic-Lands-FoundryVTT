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
 * Shared roll primitive for **timed / automated trauma & affliction effects**
 * (injury healing, blood-loss advance, affliction course, infection, shock
 * re-tests). These fire on the active GM with no user present, so they resolve a
 * d100 roll-under mastery test **headlessly**, via
 * {@link sohl.entity.modifier.MasteryLevelModifier.successTest} with `skipDialog`
 * — no dialog, situational inputs from the action scope, attributed to the owning
 * document's speaker (which the GM owns). Foundry-free at the boundary: it builds
 * an entity modifier and a `SohlActionContext`, and `successTest` only reaches
 * Foundry when a dialog is shown (which `skipDialog` suppresses).
 */

import { entity } from "@src/entity/registry";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";

/** Options for {@link rollTimedTest}. */
export interface TimedTestOptions {
    /** Suppress the result chat card (e.g. when catching up many checkpoints). */
    noChat?: boolean;
    /** Test-type id for labeling/chat. */
    type?: string;
    /** Display title for the test. */
    title?: string;
    /** A flat situational modifier to the effective mastery level (e.g. a fatigue penalty). */
    situationalModifier?: number;
    /** Roll last-digits promoting a success to a critical (default `[0, 5]`). */
    critSuccessDigits?: number[];
    /** Roll last-digits promoting a failure to a critical (default `[0, 5]`). */
    critFailureDigits?: number[];
}

/**
 * Roll a headless d100 roll-under mastery test at effective mastery level `eml`,
 * owned by `parent`, and return the evaluated result. Used by the timed trauma /
 * affliction effects (recovery tests are typically `Healing Base × Healing Rate`).
 *
 * The caller reads the outcome off the result —
 * {@link sohl.entity.result.SuccessTestResult.normSuccessLevel} (the canonical
 * −1/0/1/2 level), `isSuccess`, `isCritical`, `lastDigit`.
 *
 * @param parent - The logic that owns the test (its speaker attributes the roll).
 * @param eml - The effective mastery level to roll under.
 * @param options - See {@link TimedTestOptions}.
 * @returns The evaluated {@link sohl.entity.result.SuccessTestResult}, `undefined`
 *   if cancelled, or `false` on error (e.g. the speaker is not owned).
 */
export async function rollTimedTest(
    parent: SohlLogic<any>,
    eml: number,
    options: TimedTestOptions = {},
): Promise<SuccessTestResult | undefined | false> {
    const mlMod = new entity.MasteryLevelModifier(
        {
            critSuccessDigits: options.critSuccessDigits ?? [0, 5],
            critFailureDigits: options.critFailureDigits ?? [0, 5],
        },
        { parent },
    ).setBase(eml) as MasteryLevelModifier;

    const context = new SohlActionContext({
        speaker: parent.speaker,
        skipDialog: true,
        noChat: options.noChat ?? false,
        type: options.type ?? "",
        title: options.title ?? "",
        scope: { situationalModifier: options.situationalModifier ?? 0 },
    });

    return mlMod.successTest(context);
}
