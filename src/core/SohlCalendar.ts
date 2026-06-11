/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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

const { SchemaField, StringField, BooleanField } = foundry.data.fields;

/**
 * The decomposed time components produced by {@link SohlCalendarData}, extending
 * Foundry's base {@link foundry.data.CalendarData.TimeComponents} with SoHL
 * era information so a date can be rendered relative to the world's epoch.
 */
export interface SohlCalendarComponents
    extends foundry.data.CalendarData.TimeComponents {
    /** Year number within the current era (always positive). */
    eraYear: number;
    /** True when the date falls before the era's epoch (negative years). */
    beforeEra: boolean;
    /** Era display name appropriate to {@link beforeEra}. */
    eraName: string;
    /** Era abbreviation appropriate to {@link beforeEra}. */
    eraAbbrev: string;
}

/**
 * SoHL's world calendar — a {@link foundry.data.CalendarData} subclass that adds
 * an era model (epoch name/abbreviation, before-era labelling, optional year
 * zero) on top of Foundry's year/month/day/season schema, and overrides the
 * timestamp formatters to render SoHL-style dates (e.g. `15 Highsun 722TR`).
 *
 * The active world calendar is available at runtime as `sohl.calendar`.
 */
export class SohlCalendarData extends foundry.data
    .CalendarData<foundry.data.CalendarData.TimeComponents> {
    /** Calendar display name. */
    declare name: string;
    /** Calendar description. */
    declare description: string;
    /** Year-level configuration (epoch, first weekday, leap-year rule). */
    declare years: {
        /** The year treated as the calendar's zero point. */
        yearZero: number;
        /** Index of the weekday the year starts on. */
        firstWeekday: number;
        /** Leap-year cadence. */
        leapYear: {
            /** First year a leap year occurs. */
            leapStart: number;
            /** Number of years between leap years. */
            leapInterval: number;
        };
    };
    /** Month definitions. */
    declare months: {
        /** Ordered list of months. */
        values: [
            {
                /** Month name (or i18n key). */
                name: string;
                /** Short month abbreviation. */
                abbreviation: string;
                /** 1-based position in the year. */
                ordinal: number;
                /** Number of days in a normal year. */
                days: number;
                /** Number of days in a leap year. */
                leapDays: number;
            },
        ];
    };
    /** Weekday definitions and time-unit divisions. */
    declare days: {
        /** Ordered list of weekdays. */
        values: [
            {
                /** Weekday name (or i18n key). */
                name: string;
                /** Short weekday abbreviation. */
                abbreviation: string;
                /** 1-based position in the week. */
                ordinal: number;
            },
        ];
        /** Total days per year. */
        daysPerYear: number;
        /** Hours per day. */
        hoursPerDay: number;
        /** Minutes per hour. */
        minutesPerHour: number;
        /** Seconds per minute. */
        secondsPerMinute: number;
    };
    /** Season definitions. */
    declare seasons: {
        /** Ordered list of seasons. */
        values: [
            {
                /** Season name (or i18n key). */
                name: string;
                /** Short season abbreviation. */
                abbreviation: string;
                /** First month of the season (1-based). */
                monthStart: number;
                /** Last month of the season (1-based). */
                monthEnd: number;
                /** First day within the start month. */
                dayStart: number;
                /** Last day within the end month. */
                dayEnd: number;
            },
        ];
    };
    /** Era model layered on top of the base schema. */
    era!: {
        /** Whether the era includes a year zero. */
        hasYearZero: boolean;
        /** Era name for dates on or after the epoch. */
        name: string;
        /** Era abbreviation for dates on or after the epoch. */
        abbrev: string;
        /** Era name for dates before the epoch. */
        beforeName: string;
        /** Era abbreviation for dates before the epoch. */
        beforeAbbrev: string;
        /** Free-text description of the era. */
        description: string;
    };

    /** @inheritdoc */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return {
            ...super.defineSchema(),
            era: new SchemaField({
                hasYearZero: new BooleanField({ initial: false }),
                name: new StringField({
                    required: true,
                    initial: "",
                }),
                abbrev: new StringField({
                    required: true,
                    initial: "",
                }),
                beforeName: new StringField({
                    required: true,
                    initial: "",
                }),
                beforeAbbrev: new StringField({
                    required: true,
                    initial: "",
                }),
                description: new StringField({
                    required: false,
                    initial: "",
                }),
            }),
        };
    }

    /**
     * Resolve a month's name by index (supports negative indices, per
     * `Array.prototype.at`).
     *
     * @param monthIndex - Zero-based month index.
     * @returns The month's name.
     * @throws Error if the index does not correspond to a defined month.
     */
    getMonthName(monthIndex: number): string {
        const month = this.months.values.at(monthIndex);
        if (!month) throw new Error(`Invalid month index: ${monthIndex}`);
        return month.name;
    }

    /**
     * Resolve a weekday's name by index (supports negative indices, per
     * `Array.prototype.at`).
     *
     * @param weekdayIndex - Zero-based weekday index.
     * @returns The weekday's name.
     * @throws Error if the index does not correspond to a defined weekday.
     */
    getWeekdayName(weekdayIndex: number): string {
        const weekday = this.days.values.at(weekdayIndex);
        if (!weekday) throw new Error(`Invalid weekday index: ${weekdayIndex}`);
        return weekday.name;
    }

    /** The current world time decomposed into {@link SohlCalendarComponents}. */
    get worldDate(): SohlCalendarComponents {
        return this.timeToComponents(fvttWorldTime());
    }

    /**
     * Expand a world time integer into an object containing the relevant time components.
     * @param time - A time in seconds (default: `0`)
     * @returns The time expressed as components
     */
    override timeToComponents(time: number): SohlCalendarComponents {
        const components: SohlCalendarComponents = super.timeToComponents(
            time,
        ) as SohlCalendarComponents;
        if (components.year < 0) {
            components.beforeEra = true;
            components.eraName = this.era.beforeName;
            components.eraAbbrev = this.era.beforeAbbrev;
            components.eraYear = Math.abs(components.year);
        } else {
            components.beforeEra = false;
            components.eraName = this.era.name;
            components.eraAbbrev = this.era.abbrev;
            components.eraYear =
                components.year + (this.era.hasYearZero ? 0 : 1);
        }
        return components;
    }

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
    static override formatTimestamp(
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

        if (calendar instanceof SohlCalendarData) {
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
    static formatDefault(
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

        if (calendar instanceof SohlCalendarData) {
            const sc = components as SohlCalendarComponents;
            return `${dd} ${calendar.getMonthName(sc.month)} ${sc.eraYear}${sc.eraAbbrev} ${hh}:${mm}:${ss}`;
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
    static formatRelativeTime(
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
        const rel =
            short ? parts.join(" ") : fvttGetListFormatter().format(parts);
        return sohl.i18n.format(
            relTime < 0 ? "SOHL.TIME.Until" : "TIME.Since",
            { since: rel },
        );
    }
}
