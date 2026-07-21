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
 * **Offer to reschedule** a recurring timed effect (issue #579) — the consent
 * step that replaces the retired auto-re-arm. After a recurring check
 * (injury healing, blood-loss advance, affliction/lasting-condition course) is
 * *performed*, the system does not silently arm the next occurrence: it **offers**
 * it, and only a human's yes schedules it. This makes the Prime Directive
 * (`nothing auto-schedules`) structural for timed effects, alongside #587's
 * remind-don't-perform.
 *
 * It follows the self-sufficient-action contract (see
 * https://kb.heroiclands.org/dev/concepts/action-cards/): the decision comes from
 * `context.scope.reschedule` when pre-filled (a scripted/headless run), else from
 * a private yes/no dialog defaulting to **No** when interactive, else (skipDialog
 * with nothing supplied) defaults to No. On yes it persists **and** arms the next
 * occurrence via {@link sohl.core.logic.SohlSystem.schedule}; on no it clears the
 * schedule via `sohl.unschedule`, so the loop simply stops and does not resurrect
 * on reload.
 *
 * @module reschedule
 */

import { dialog } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { Schedulable } from "@src/entity/event/scheduled-actions";

/**
 * Offer to schedule the next occurrence of `actionName` on `doc` at `interval`
 * seconds from now, per the consent model (issue #579).
 *
 * @param context - The action context; `scope.reschedule` (a boolean) pre-answers
 *   the offer, and `skipDialog` suppresses the interactive prompt.
 * @param doc - The document the schedule lives on (the effect item).
 * @param actionName - The recurring action to (re)schedule — matches the
 *   `SOHL.Reminder.effect.<actionName>` label key.
 * @param interval - Seconds until the next occurrence (the freshly rolled cadence).
 * @returns A promise that resolves once the schedule is (re)armed or cleared.
 */
export async function offerReschedule(
    context: SohlActionContext,
    doc: Schedulable,
    actionName: string,
    interval: number,
): Promise<void> {
    let reschedule = (context.scope as { reschedule?: boolean } | undefined)
        ?.reschedule;

    if (reschedule == null && !context.skipDialog) {
        const effect = sohl.i18n.localize(`SOHL.Reminder.effect.${actionName}`);
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Reschedule.title"),
            content: toHTMLString(`<p>{{prompt}}</p>`),
            data: {
                prompt: sohl.i18n.format("SOHL.Reschedule.prompt", { effect }),
            },
            buttons: [
                {
                    action: "yes",
                    label: sohl.i18n.localize("SOHL.Reschedule.yes"),
                    icon: "fa-solid fa-hourglass-half",
                },
                {
                    action: "no",
                    label: sohl.i18n.localize("SOHL.Reschedule.no"),
                    default: true,
                },
            ],
            callback: (_formData: unknown, action: string) => action === "yes",
            rejectClose: false,
        });
        reschedule = confirmed === true;
    }

    if (reschedule) await sohl.schedule(doc, actionName, interval);
    else await sohl.unschedule(doc, actionName);
}
