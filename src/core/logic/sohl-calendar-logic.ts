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

import { fvttWorldTime, fvttGetListFormatter } from "@src/core/FoundryHelpers";
import type { SohlCalendarComponents } from "@src/core/foundry/SohlCalendar";

/**
 * Format time components as a YYYY-MM-DD HH:MM:SS timestamp.
 * @remarks
 * SoHL calendar: " 0722-04-15 14:30:00" (leading space for after-era)
 * or "-0051-04-15 00:00:00" for 51 years before the era.
 * Foreign calendar: the same shape without the era-sign prefix and
 * without year-zero adjustment.
 * @param calendar - The calendar to use for formatting
 * @param components - The time components to format
 * @param _options - Formatting options (not used)
 * @returns The formatted timestamp
 */
export function formatTimestamp(
    calendar: foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents>,
    components: foundry.data.CalendarData.TimeComponents,
    _options: PlainObject = {},
): string {
    components = calendar.timeToComponents(
        calendar.componentsToTime(components),
    );
    const month = calendar.months!.values[components.month];
    const mm = month.ordinal.paddedString(2);
    const dd = (components.dayOfMonth + 1).paddedString(2);
    const h = components.hour.paddedString(2);
    const m = components.minute.paddedString(2);
    const s = components.second.paddedString(2);

    if ((calendar as any).isSohlCalendar) {
        const sc = components as SohlCalendarComponents;
        const yyyy = sc.eraYear.paddedString(4);
        return `${sc.beforeEra ? "-" : " "}${yyyy}-${mm}-${dd} ${h}:${m}:${s}`;
    }

    const yyyy = components.year.paddedString(4);
    return `${yyyy}-${mm}-${dd} ${h}:${m}:${s}`;
}

/**
 * Format time components using the default formatting rules.
 * @remarks
 * SoHL calendar: "15 Highsun 722TR 14:30:00".
 * Foreign calendar: "15 {monthName} {year} 14:30:00" (no era data).
 * @param calendar - The calendar to use for formatting
 * @param components - The time components to format
 * @param _options - Formatting options (not used)
 * @returns The formatted timestamp
 */
export function formatDefault(
    calendar: foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents>,
    components: foundry.data.CalendarData.TimeComponents,
    _options: PlainObject = {},
): string {
    components = calendar.timeToComponents(
        calendar.componentsToTime(components),
    );
    const dd = components.dayOfMonth + 1;
    const monthName = calendar.months!.values[components.month]?.name ?? "";
    const hh = String(components.hour).padStart(2, "0");
    const mm = String(components.minute).padStart(2, "0");
    const ss = String(components.second).padStart(2, "0");

    if ((calendar as any).isSohlCalendar) {
        const sc = components as SohlCalendarComponents;
        return `${dd} ${(calendar as any).getMonthName(sc.month)} ${sc.eraYear}${sc.eraAbbrev} ${hh}:${mm}:${ss}`;
    }

    const localizedMonth = sohl.i18n.localize(monthName);
    return `${dd} ${localizedMonth} ${components.year} ${hh}:${mm}:${ss}`;
}

/**
 * Format time components relative to the current time.
 *
 * @remarks
 * The output will describe the time either in the future or in the past.
 *   for future as "{years}, {days}, {hours}, {minutes}, {seconds} in the future"
 *   for past as "{years}, {days}, {hours}, {minutes}, {seconds} ago".
 *  Components with a zero value are omitted from the output.
 *  If the time is the current time, "now" is returned.
 * @param calendar - The calendar to use for formatting
 * @param components - The time components to format
 * @param options - Formatting options
 * @param options.short - Whether to use short format (default: `false`)
 * @param options.maxTerms - The maximum number of time components to include (default: `0`, all)
 * @param options.fromComponents - The reference time to measure from (default: the current world time)
 * @returns The formatted timestamp
 */
export function formatRelativeTime(
    calendar: foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents>,
    components: foundry.data.CalendarData.TimeComponents,
    {
        short = false,
        maxTerms = 0,
        fromComponents = undefined,
    }: {
        short?: boolean;
        maxTerms?: number;
        fromComponents?: foundry.data.CalendarData.TimeComponents;
    } = {},
): string {
    const fromTime =
        fromComponents ?
            calendar.componentsToTime(fromComponents)
        :   fvttWorldTime();
    let nTime: number = calendar.componentsToTime(components);
    let relTime: number = fromTime - nTime;
    const nComponents = calendar.timeToComponents(Math.abs(relTime));
    const terms = {
        year: "TIME.Year",
        day: "TIME.Day",
        hour: "TIME.Hour",
        minute: "TIME.Minute",
        second: "TIME.Second",
    };
    const plurals = new Intl.PluralRules(sohl.i18n.lang);
    let parts = (
        Object.entries(terms) as [
            keyof foundry.data.CalendarData.TimeComponents,
            string,
        ][]
    ).reduce((arr: string[], [k, t]) => {
        const v = Math.round(nComponents[k] as number);
        if (v < 1) return arr;
        if (short) arr.push(`${v}${sohl.i18n.localize(t + ".abbr")}`);
        else
            arr.push(
                `${v} ${sohl.i18n.localize(`${t}.${plurals.select(v)}`).toLowerCase()}`,
            );
        return arr;
    }, []);
    if (!parts.length) return sohl.i18n.localize("TIME.Now");
    if (maxTerms) parts = parts.slice(0, maxTerms);
    const rel = short ? parts.join(" ") : fvttGetListFormatter().format(parts);
    return sohl.i18n.format(relTime < 0 ? "SOHL.TIME.Until" : "TIME.Since", {
        since: rel,
    });
}
