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

import type { SohlCalendarData } from "@src/core/foundry/SohlCalendar";
import {
    type DateParts,
    worldTimeToDateParts,
    datePartsToWorldTime,
    skipDays,
    monthChoices,
} from "@src/core/logic/date-picker-logic";
import { dialog, fvttWorldTime } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";

/**
 * The picker dialog body. **Author-static** Handlebars source (Rule #10): the
 * month names, current values, and unit maxima ride in `data` (escaped), and the
 * labels are static localization keys. Live preview / validity / day-skip are
 * wired in {@link openDatePickerDialog}'s render hook; the `data-*` hooks below
 * are its handles.
 */
const DIALOG_CONTENT = toHTMLString(
    `<div class="date-picker-dialog">
        <div class="date-picker-dialog__grid">
            <label>{{localize "SOHL.DatePicker.month"}}</label>
            <select name="month">
                {{#each months}}<option value="{{index}}"{{#if selected}} selected{{/if}}>{{name}}</option>{{/each}}
            </select>
            <label>{{localize "SOHL.DatePicker.day"}}</label>
            <input type="number" name="day" value="{{day}}" min="1" step="1" />
            <label>{{localize "SOHL.DatePicker.year"}}</label>
            <input type="number" name="year" value="{{year}}" min="1" step="1" />
            <label>{{localize "SOHL.DatePicker.time"}}</label>
            <div class="date-picker-dialog__time">
                <input type="number" name="hour" value="{{hour}}" min="0" max="{{maxHour}}" step="1" />:<input type="number" name="minute" value="{{minute}}" min="0" max="{{maxMinute}}" step="1" />:<input type="number" name="second" value="{{second}}" min="0" max="{{maxSecond}}" step="1" />
            </div>
            <label>{{localize "SOHL.DatePicker.skip"}}</label>
            <div class="date-picker-dialog__skip">
                <a data-skip="back" data-tooltip="{{localize "SOHL.DatePicker.skipBack"}}"><i class="fa-solid fa-angles-left"></i></a>
                <input type="number" name="skip" value="1" min="1" step="1" />
                <a data-skip="fwd" data-tooltip="{{localize "SOHL.DatePicker.skipForward"}}"><i class="fa-solid fa-angles-right"></i></a>
            </div>
        </div>
        <div class="date-picker-dialog__preview" data-preview></div>
        <div class="date-picker-dialog__invalid" data-invalid hidden>{{localize "SOHL.DatePicker.invalid"}}</div>
    </div>`,
);

/**
 * The active SoHL calendar, narrowed for its component/era API.
 * @returns The active {@link sohl.core.foundry.SohlCalendarData}.
 */
function activeCalendar(): SohlCalendarData {
    return sohl.calendar as unknown as SohlCalendarData;
}

/**
 * Open the calendar-aware date-picker dialog for a stored worldTime value.
 *
 * Displays month/day/year and hour/minute/second inputs plus a day-skip stepper
 * (which rolls months/years over correctly via {@link skipDays}), previews the
 * resulting date live with the calendar's formatter, and shows a red
 * "Invalid Date Format" when the parts don't resolve to a real date. **Now**
 * chooses the current world time; **Clear** chooses the empty value.
 *
 * @param current - The field's current worldTime (seconds since epoch), or
 *   `null`/`undefined` when unset (the dialog then opens on the current world time).
 * @returns The chosen worldTime number, `null` to clear the field, or `undefined`
 *   if the dialog was cancelled/dismissed.
 */
export async function openDatePickerDialog(
    current: number | null | undefined,
): Promise<number | null | undefined> {
    const calendar = activeCalendar();
    const startTime = typeof current === "number" ? current : fvttWorldTime();
    const parts = worldTimeToDateParts(calendar, startTime);
    const { hoursPerDay, minutesPerHour, secondsPerMinute } = calendar.days;

    const result = await dialog({
        title: sohl.i18n.localize("SOHL.DatePicker.title"),
        content: DIALOG_CONTENT,
        data: {
            months: monthChoices(calendar).map((c) => ({
                ...c,
                selected: c.index === parts.monthIndex,
            })),
            day: parts.day,
            year: parts.eraYear,
            hour: parts.hour,
            minute: parts.minute,
            second: parts.second,
            maxHour: hoursPerDay - 1,
            maxMinute: minutesPerHour - 1,
            maxSecond: secondsPerMinute - 1,
        },
        buttons: [
            {
                action: "set",
                label: sohl.i18n.localize("SOHL.DatePicker.set"),
                icon: "fa-solid fa-check",
                default: true,
            },
            {
                action: "now",
                label: sohl.i18n.localize("SOHL.DatePicker.now"),
                icon: "fa-solid fa-clock",
            },
            {
                action: "clear",
                label: sohl.i18n.localize("SOHL.DatePicker.clear"),
                icon: "fa-solid fa-xmark",
            },
            {
                action: "cancel",
                label: sohl.i18n.localize("SOHL.DatePicker.cancel"),
            },
        ],
        // Wire live preview/validity + the day-skip stepper. Runs after render.
        render: (element: HTMLElement) => wireDialog(element, calendar),
        callback: (formData, action) => {
            if (action === "now") return { action, worldTime: fvttWorldTime() };
            if (action === "clear") return { action, worldTime: null };
            if (action === "cancel") return { action, worldTime: undefined };
            return {
                action,
                worldTime: datePartsToWorldTime(
                    calendar,
                    formToParts(formData as Record<string, unknown>),
                ),
            };
        },
        rejectClose: false,
    });

    if (result == null || result.action === "cancel") return undefined;
    if (result.action === "clear") return null;
    return typeof result.worldTime === "number" ? result.worldTime : undefined;
}

/**
 * Build {@link DateParts} from a dialog form's parsed values (after-era only).
 * @param form - The parsed form values (`month`, `day`, `year`, `hour`, …).
 * @returns The editable date parts.
 */
function formToParts(form: Record<string, unknown>): DateParts {
    return {
        monthIndex: Number(form.month),
        day: Number(form.day),
        eraYear: Number(form.year),
        beforeEra: false,
        hour: Number(form.hour),
        minute: Number(form.minute),
        second: Number(form.second),
    };
}

/**
 * Wire the dialog's live behaviour: recompute the preview / validity on any
 * field change, and apply the day-skip stepper. The `set` button is disabled
 * while the entered parts are invalid.
 * @param element - The dialog's rendered root element.
 * @param calendar - The active calendar.
 */
function wireDialog(element: HTMLElement, calendar: SohlCalendarData): void {
    const q = <T extends HTMLElement>(sel: string): T | null =>
        element.querySelector<T>(sel);
    const fields = [
        "month",
        "day",
        "year",
        "hour",
        "minute",
        "second",
    ] as const;
    const inputs = Object.fromEntries(
        fields.map((n) => [n, q<HTMLInputElement>(`[name="${n}"]`)]),
    ) as Record<(typeof fields)[number], HTMLInputElement | null>;
    const preview = q<HTMLElement>("[data-preview]");
    const invalid = q<HTMLElement>("[data-invalid]");
    const setBtn = q<HTMLButtonElement>('button[data-action="set"]');
    const skipInput = q<HTMLInputElement>('[name="skip"]');

    const readParts = (): DateParts => ({
        monthIndex: Number(inputs.month?.value),
        day: Number(inputs.day?.value),
        eraYear: Number(inputs.year?.value),
        beforeEra: false,
        hour: Number(inputs.hour?.value),
        minute: Number(inputs.minute?.value),
        second: Number(inputs.second?.value),
    });
    const writeParts = (p: DateParts): void => {
        if (inputs.month) inputs.month.value = String(p.monthIndex);
        if (inputs.day) inputs.day.value = String(p.day);
        if (inputs.year) inputs.year.value = String(p.eraYear);
        if (inputs.hour) inputs.hour.value = String(p.hour);
        if (inputs.minute) inputs.minute.value = String(p.minute);
        if (inputs.second) inputs.second.value = String(p.second);
    };
    const recompute = (): void => {
        const time = datePartsToWorldTime(calendar, readParts());
        const ok = time !== null;
        if (preview)
            preview.textContent =
                ok ? calendar.format(time!, "sohl.default" as never) : "";
        if (invalid) invalid.hidden = ok;
        if (setBtn) setBtn.disabled = !ok;
    };

    for (const input of Object.values(inputs)) {
        input?.addEventListener("change", recompute);
    }
    const applySkip = (dir: 1 | -1): void => {
        const n = Math.max(1, Math.trunc(Number(skipInput?.value) || 1));
        const next = skipDays(calendar, readParts(), dir * n);
        if (!next) return;
        writeParts(next);
        recompute();
    };
    q<HTMLElement>('[data-skip="back"]')?.addEventListener("click", () =>
        applySkip(-1),
    );
    q<HTMLElement>('[data-skip="fwd"]')?.addEventListener("click", () =>
        applySkip(1),
    );

    recompute();
}
