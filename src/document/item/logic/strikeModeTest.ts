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

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { selectStrikeModeModifier } from "@src/document/actor/logic/being-sheet-view";
import { dialog } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";

/**
 * The kinds of strike-mode test a combat action can run. Maps onto the
 * `data-test-kind` values the combat tab emits, and onto the modifier
 * {@link selectStrikeModeModifier} resolves for each.
 */
export type StrikeModeTestKind = "attack" | "block" | "counterstrike";

/**
 * The scope payload carried by a strike-mode combat action's context: the id
 * of the strike mode to act with. Optional — see {@link resolveStrikeMode} for
 * how an absent id is resolved (single mode auto-selected; otherwise prompted).
 */
export interface StrikeModeTestScope {
    /** The id of the strike mode to use for the test. */
    strikeModeId?: string;
}

/**
 * The minimal surface a strike-mode combat action needs from its owning logic:
 * a display `name` and the list of `strikeModes` it exposes. Both
 * {@link sohl.document.item.logic.WeaponGearLogic} and combat-technique
 * {@link sohl.document.item.logic.SkillLogic} satisfy it (the latter wraps its
 * single `strikeMode` in a one-element array), so the same resolution and
 * dispatch logic serves weapons and techniques alike.
 */
export interface StrikeModeCombatant {
    /** Display name of the owning item (weapon or combat technique). */
    name: string;
    /** The strike modes this item exposes. */
    strikeModes: StrikeModeBase[];
}

/**
 * Resolve which strike mode a combat action should act on, per the hybrid rule:
 *
 * 1. If `context.scope.strikeModeId` is set, use that mode (the combat-tab
 *    anchors always pass it; a macro may too). An id that matches no mode
 *    resolves to `undefined` with a warning.
 * 2. Otherwise, if the item has exactly one strike mode, use it — so a
 *    single-mode weapon or a combat technique (which always has exactly one)
 *    never prompts.
 * 3. Otherwise (two or more modes, none specified), prompt the user to choose
 *    with a picker dialog.
 *
 * @param logic - The weapon or combat-technique logic exposing the strike modes.
 * @param context - The action context; its `scope.strikeModeId` is honored first.
 * @returns The resolved strike mode, or `undefined` if none could be resolved
 *   (no modes, an unknown id, or the picker was dismissed).
 */
export async function resolveStrikeMode(
    logic: StrikeModeCombatant,
    context: SohlActionContext<Partial<StrikeModeTestScope>>,
): Promise<StrikeModeBase | undefined> {
    const modes = logic.strikeModes;
    const scopeId = context.scope?.strikeModeId;

    if (scopeId) {
        const found = modes.find((m) => m.id === scopeId);
        if (!found) {
            sohl.log.warn(
                `Strike mode "${scopeId}" not found on "${logic.name}".`,
            );
        }
        return found;
    }

    if (modes.length === 0) {
        sohl.log.warn(`"${logic.name}" has no strike modes to test.`);
        return undefined;
    }
    if (modes.length === 1) return modes[0];

    // Two or more modes and none specified — ask which to use. The template is
    // author-static; the mode names ride in `data`, where Handlebars escapes
    // them (Rule #10 — never interpolate item data into the source string).
    const picked = await dialog({
        title: sohl.i18n.localize("SOHL.StrikeMode.picker.title"),
        content: toHTMLString(
            `<p>{{prompt}}</p>` +
                `<select name="strikeModeId">` +
                `{{#each strikeModes}}<option value="{{id}}">{{name}}</option>{{/each}}` +
                `</select>`,
        ),
        data: {
            prompt: sohl.i18n.localize("SOHL.StrikeMode.picker.prompt"),
            strikeModes: modes.map((m) => ({ id: m.id, name: m.name })),
        },
        buttons: [
            {
                action: "select",
                label: sohl.i18n.localize("SOHL.StrikeMode.picker.select"),
                icon: "fa-solid fa-check",
                default: true,
            },
            {
                action: "cancel",
                label: sohl.i18n.localize("SOHL.StrikeMode.picker.cancel"),
            },
        ],
        callback: (formData, action) =>
            action === "select" ?
                (formData as { strikeModeId?: string }).strikeModeId
            :   undefined,
        rejectClose: false,
    });

    if (!picked) return undefined;
    return modes.find((m) => m.id === picked);
}

/**
 * Resolve the strike mode (see {@link resolveStrikeMode}) and run the requested
 * test against it, dispatching on `testKind` to the mode's attack / block /
 * counterstrike modifier (via {@link selectStrikeModeModifier}). The `context`
 * is passed straight through to the modifier's success test, so its speaker,
 * title, and `skipDialog` flag propagate to the roll.
 *
 * Shared by {@link sohl.document.item.logic.WeaponGearLogic} and combat-technique
 * {@link sohl.document.item.logic.SkillLogic} so weapons and techniques resolve
 * and roll identically.
 *
 * @param logic - The weapon or combat-technique logic that owns the strike modes.
 * @param testKind - Which test to run: `"attack"`, `"block"`, or `"counterstrike"`.
 * @param context - The action context; its `scope.strikeModeId` selects the mode.
 * @returns The success-test result, `undefined` if the roll dialog was
 *   cancelled, or `false` when no strike mode/modifier could be resolved (e.g.
 *   a defense test requested on a missile mode).
 */
export async function runStrikeModeTest(
    logic: StrikeModeCombatant,
    testKind: StrikeModeTestKind,
    context: SohlActionContext<Partial<StrikeModeTestScope>>,
): Promise<SuccessTestResult | undefined | false> {
    const strikeMode = await resolveStrikeMode(logic, context);
    if (!strikeMode) return false;

    const modifier = selectStrikeModeModifier(strikeMode, testKind);
    if (!modifier) {
        sohl.log.warn(
            `Strike mode "${strikeMode.name}" does not support a "${testKind}" test.`,
        );
        return false;
    }

    // The `strikeModeId` in scope is inert to the success test, which adds its
    // own scope fields alongside it; widen the scope type at this one boundary.
    return (
        (await modifier.successTest(
            context as SohlActionContext<
                Partial<SuccessTestResult.ContextScope>
            >,
        )) ?? false
    );
}
