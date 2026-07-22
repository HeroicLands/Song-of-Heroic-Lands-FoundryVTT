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
 * **Offer to schedule** a timed effect (issue #579) — the consent step that
 * replaces auto-scheduling. It serves both moments in a recurring effect's life:
 * the **first** schedule when the effect is created ("set a reminder to perform a
 * healing check in 5 days?"), and the **next** schedule after a check is performed.
 * Same mechanism either way — offer, and only a human's yes schedules it — so the
 * Prime Directive (`nothing auto-schedules`) is structural.
 *
 * Following the [self-sufficient action contract](https://kb.heroiclands.org/dev/concepts/action-cards/)
 * and the prefer-dialog rule: the decision comes from `context.scope.schedule`
 * when a caller pre-supplied it, else from a private dialog **whose affirmative
 * (Schedule) is the default** — the human is present on this client, so it prompts
 * (a dialog, not a chat card) with the rolled cadence shown, and they just hit OK
 * (or decline). `skipDialog` is honored only when the caller is certain
 * (scripted/bulk); prefer leaving it off. On yes it persists and arms via
 * {@link sohl.core.logic.SohlSystem.schedule}; on no it clears any schedule via
 * `sohl.unschedule` (a harmless no-op when nothing was scheduled).
 *
 * @module offerSchedule
 */

import { dialog } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import type { Schedulable } from "@src/entity/event/scheduled-actions";

/**
 * The minimal action-context surface {@link offerSchedule} reads — a
 * {@link sohl.entity.action.SohlActionContext} satisfies it, and a caller (e.g.
 * an injury-creation flow) can hand a plain object to pre-answer or suppress the
 * offer.
 */
export interface OfferContext {
    /** When true, suppress the dialog and take the answer from `scope`. */
    skipDialog?: boolean;
    /** Pre-supplied answer (`scope.schedule`) — any action scope satisfies it. */
    scope?: { schedule?: boolean };
}

/**
 * Render a duration in seconds as a short human phrase (`"5 days"`, `"4 hours"`,
 * `"30 minutes"`) for the offer prompt. Falls back to seconds for tiny values.
 *
 * @param seconds - The interval in seconds.
 * @returns A unit phrase describing the interval.
 */
export function describeInterval(seconds: number): string {
    const s = Math.max(0, Math.round(seconds));
    const units: [number, string][] = [
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
        [1, "second"],
    ];
    for (const [size, name] of units) {
        if (s >= size) {
            const n = Math.round(s / size);
            return `${n} ${name}${n === 1 ? "" : "s"}`;
        }
    }
    return "0 seconds";
}

/**
 * Offer to schedule (or reschedule) `actionName` on `doc` at `interval` seconds
 * from now, per the consent model (issue #579).
 *
 * @param context - The action context; `scope.schedule` (a boolean) pre-answers
 *   the offer, and `skipDialog` suppresses the interactive prompt.
 * @param doc - The document the schedule lives on (the effect item).
 * @param actionName - The action to (re)schedule — matches the
 *   `SOHL.Reminder.effect.<actionName>` label key.
 * @param interval - Seconds until the occurrence (the rolled cadence / default).
 * @returns A promise that resolves once the schedule is armed or cleared.
 */
export async function offerSchedule(
    context: OfferContext,
    doc: Schedulable,
    actionName: string,
    interval: number,
): Promise<void> {
    let schedule = context.scope?.schedule;

    if (schedule == null && !context.skipDialog) {
        const effect = sohl.i18n.localize(`SOHL.Reminder.effect.${actionName}`);
        const confirmed = await dialog({
            title: sohl.i18n.localize("SOHL.Schedule.title"),
            content: toHTMLString(`<p>{{prompt}}</p>`),
            data: {
                prompt: sohl.i18n.format("SOHL.Schedule.prompt", {
                    effect,
                    when: describeInterval(interval),
                }),
            },
            buttons: [
                {
                    action: "yes",
                    label: sohl.i18n.localize("SOHL.Schedule.yes"),
                    icon: "fa-solid fa-hourglass-half",
                    default: true,
                },
                {
                    action: "no",
                    label: sohl.i18n.localize("SOHL.Schedule.no"),
                },
            ],
            callback: (_formData: unknown, action: string) => action === "yes",
            rejectClose: false,
        });
        schedule = confirmed === true;
    }

    if (schedule) await sohl.schedule(doc, actionName, interval);
    else await sohl.unschedule(doc, actionName);
}
