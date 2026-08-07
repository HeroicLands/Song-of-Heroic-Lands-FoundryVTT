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

import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { FilePath, toFilePath } from "@src/utils/helpers";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { SohlAction } from "@src/entity/action/SohlAction";

/**
 * The contract an item logic must satisfy to carry the **improvement flag** and
 * the **Skill Development Roll** (SDR) — the shared progression seam behind the
 * ☆ star, the _Improvement Flag_ checkbox, and the _Improve with SDR_ action.
 *
 * Implemented by {@link sohl.document.item.logic.SkillLogic} and
 * {@link sohl.document.item.logic.MysticalAbilityLogic}. Both drive the exact
 * same executors ({@link setImproveFlag}, {@link unsetImproveFlag},
 * {@link toggleImproveFlag}, {@link improveWithSDR}) and the exact same action
 * definitions ({@link defineImproveSdrActions}), so the two can never drift.
 */
export interface SdrImprovable extends SohlLogic<any> {
    /**
     * Whether this item may be improved right now — the gate every improve
     * executor checks before writing anything. Typically "the current user is a
     * GM or owns the item, and the mastery level is live".
     */
    readonly canImprove: boolean;
    /** The mastery level the SDR is rolled against and, on success, raises. */
    readonly masteryLevel: MasteryLevelModifier;
    /** The amount by which a successful {@link improveWithSDR} raises the base mastery level. */
    readonly sdrIncr: number;
    /**
     * The **Skill Base** added to the SDR's `1d100`. A Skill contributes its own
     * computed Skill Base, so natural aptitude speeds improvement; an item with
     * no Skill Base of its own (a Mystical Ability using its internal mastery
     * level) contributes `0` and improves on the raw `1d100`.
     */
    readonly sdrSkillBase: number;
}

/**
 * Flags an improvable item for improvement via a Skill Development Roll.
 *
 * The shared executor body behind every kind's `setImproveFlag` action. Writes
 * only this item's own `system.improveFlag`; a Mystical Ability that draws its
 * mastery level from an associated Skill never touches that Skill.
 *
 * @param logic - The improvable item logic.
 * @returns Resolves once the item update completes.
 */
export async function setImproveFlag(logic: SdrImprovable): Promise<void> {
    if (!logic.canImprove) return;
    const updateData: PlainObject = { "system.improveFlag": true };
    await logic.data.update(updateData);
}

/**
 * Clears an improvable item's improvement flag.
 *
 * The shared executor body behind every kind's `unsetImproveFlag` action.
 *
 * @param logic - The improvable item logic.
 * @returns Resolves once the item update completes.
 */
export async function unsetImproveFlag(logic: SdrImprovable): Promise<void> {
    if (!logic.canImprove) return;
    const updateData: PlainObject = { "system.improveFlag": false };
    await logic.data.update(updateData);
}

/**
 * Toggles an improvable item's improvement flag.
 *
 * The shared executor body behind every kind's `toggleImproveFlag` action — and
 * behind the ☆ star on the Being sheet's Skills and Mysteries tabs.
 *
 * @param logic - The improvable item logic.
 * @returns Resolves once the item update completes.
 */
export async function toggleImproveFlag(logic: SdrImprovable): Promise<void> {
    if (!logic.canImprove) return;
    if (logic.data.improveFlag) {
        await unsetImproveFlag(logic);
    } else {
        await setImproveFlag(logic);
    }
}

/**
 * Attempts to improve an item via a **Skill Development Roll** (SDR): rolls
 * `1d100 + {@link SdrImprovable.sdrSkillBase}` against the current base mastery
 * level, and on a success raises the persisted `masteryLevelBase` by
 * {@link SdrImprovable.sdrIncr}. The outcome is persisted — the improve flag is
 * cleared either way and, on success, the raised base mastery level is written
 * back — and then posted to chat.
 *
 * The shared executor body behind every kind's `improveWithSDR` action. The
 * write targets this item alone, so improving a Mystical Ability can never
 * alter the Skill it is associated with.
 *
 * @param logic - The improvable item logic.
 * @param context - The action context whose speaker receives the chat card.
 * @returns Resolves once the roll is evaluated, persisted, and the chat card is
 *   posted.
 */
export async function improveWithSDR(
    logic: SdrImprovable,
    context: SohlActionContext,
): Promise<void> {
    const updateData: PlainObject = { "system.improveFlag": false };
    const roll = SimpleRoll.fromFormula(`1d100+${logic.sdrSkillBase}`, logic);
    roll.roll();
    const isSuccess = roll.total > logic.masteryLevel.base;

    if (isSuccess) {
        // Raise from the effective opening base (which may be derived rather
        // than stored — e.g. a Skill opened from initSkillMult), never from the
        // now-nullable stored field.
        updateData["system.masteryLevelBase"] =
            logic.masteryLevel.base + logic.sdrIncr;
    }
    // The SDR renders its own card rather than `standard-test-card.hbs`: it is
    // not a success test, so it has no mastery-level modifier, no Fate button,
    // no success level, and nothing for the GM result-edit pencil to
    // re-evaluate. Its keys are the ones `sdr-card.hbs` reads (#1103).
    const chatTemplate: FilePath = toFilePath(
        "systems/sohl/templates/chat/sdr-card.hbs",
    );
    // No `type` key: `SohlSpeaker._prepareChat` spreads this object straight
    // into the ChatMessage payload, so a `type` here becomes the message's
    // *document subtype*. The SDR's old `"<kind>-<name>-improve-sdr"` label is
    // not a registered subtype, so Foundry rejected the create and the card
    // never posted at all (#1103). No template reads it.
    const chatTemplateData = {
        actorUuid: logic.actorLogic?.uuid,
        title: sohl.i18n.format("SOHL.MasteryLevel.improveSDR.title", {
            label: logic.label,
        }),
        target: logic.masteryLevel.base,
        isSuccess: isSuccess,
        rollTotal: roll.total,
        rollResult: roll.result,
        resultText:
            isSuccess ?
                sohl.i18n.format(
                    "SOHL.MasteryLevel.improveSDR.increase.title",
                    {
                        label: logic.label,
                    },
                )
            :   sohl.i18n.format(
                    "SOHL.MasteryLevel.improveSDR.noIncrease.title",
                    {
                        label: logic.label,
                    },
                ),
        resultDesc:
            isSuccess ?
                sohl.i18n.format("SOHL.MasteryLevel.improveSDR.increase.desc", {
                    label: logic.label,
                    incr: logic.sdrIncr,
                    final: logic.masteryLevel.base + logic.sdrIncr,
                })
            :   sohl.i18n.format(
                    "SOHL.MasteryLevel.improveSDR.noIncrease.desc",
                    {
                        label: logic.label,
                        incr: logic.sdrIncr,
                        final: logic.masteryLevel.base + logic.sdrIncr,
                    },
                ),
        description:
            isSuccess ?
                sohl.i18n.format("SOHL.SuccessTestResult.Success")
            :   sohl.i18n.format("SOHL.SuccessTestResult.Failure"),
        notes: "",
        sdrIncr: logic.sdrIncr,
    };

    // Persist the outcome: clear the improve flag and, on success, raise the
    // stored base mastery level so the gain the chat card announces is real.
    await logic.data.update(updateData);

    void context.speaker.toChat(chatTemplate, chatTemplateData);
}

/**
 * The four improvement-flag / SDR intrinsic action definitions, identical for
 * every improvable item kind apart from their localization keys.
 *
 * `setImproveFlag` and `unsetImproveFlag` are the two halves `toggleImproveFlag`
 * is built from: they remain reachable as executors (for scripts and macros that
 * want a known state rather than an inversion) but are hidden from the context
 * menu, which offers the single toggle instead.
 *
 * @param titlePrefix - The kind's action-title localization prefix, e.g.
 *   `"SOHL.Skill.Action"`. Each definition's `title` is `<prefix>.<shortcode>`.
 * @returns The `setImproveFlag`, `unsetImproveFlag`, `toggleImproveFlag`, and
 *   `improveWithSDR` intrinsic action definitions, in that order.
 */
export function defineImproveSdrActions(
    titlePrefix: string,
): Partial<SohlAction.Data>[] {
    return [
        {
            shortcode: "setImproveFlag",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: `${titlePrefix}.setImproveFlag`,
            scope: SOHL_ACTION_SCOPE.SELF,
            iconFAClass: "fa-solid fa-star",
            executor: "setImproveFlag",
            // Superseded by the single `toggleImproveFlag` entry; kept as an
            // executor but hidden from the context menu.
            visible: "false",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
        },
        {
            shortcode: "unsetImproveFlag",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: `${titlePrefix}.unsetImproveFlag`,
            scope: SOHL_ACTION_SCOPE.SELF,
            iconFAClass: "fa-regular fa-star",
            executor: "unsetImproveFlag",
            // Superseded by the single `toggleImproveFlag` entry; kept as an
            // executor but hidden from the context menu.
            visible: "false",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
        },
        {
            shortcode: "toggleImproveFlag",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: `${titlePrefix}.toggleImproveFlag`,
            scope: SOHL_ACTION_SCOPE.SELF,
            iconFAClass: "fa-solid fa-star-half-stroke",
            executor: "toggleImproveFlag",
            visible: "true",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        },
        {
            shortcode: "improveWithSDR",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: `${titlePrefix}.improveWithSDR`,
            scope: SOHL_ACTION_SCOPE.SELF,
            iconFAClass: "fa-solid fa-arrow-trend-up",
            executor: "improveWithSDR",
            // Offered for an item that *is* flagged for improvement — the SDR
            // is the roll a flagged item is waiting for, and it spends the flag
            // as part of its outcome (#1102).
            visible: "itemLogic.canImprove && itemLogic.data.improveFlag",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        },
    ];
}
