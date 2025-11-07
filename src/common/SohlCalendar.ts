/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const { SchemaField, StringField, BooleanField } = foundry.data.fields;

export interface SohlCalendarComponents
    extends foundry.data.CalendarData.TimeComponents {
    eraYear: number;
    beforeEra: boolean;
    eraName: string;
    eraAbbrev: string;
}

export class SohlCalendarData extends foundry.data
    .CalendarData<foundry.data.CalendarData.TimeComponents> {
    declare name: string;
    declare description: string;
    declare years: {
        yearZero: number;
        firstWeekday: number;
        leapYear: {
            leapStart: number;
            leapInterval: number;
        };
    };
    declare months: {
        values: [
            {
                name: string;
                abbreviation: string;
                ordinal: number;
                days: number;
                leapDays: number;
            },
        ];
    };
    declare days: {
        values: [
            {
                name: string;
                abbreviation: string;
                ordinal: number;
            },
        ];
        daysPerYear: number;
        hoursPerDay: number;
        minutesPerHour: number;
        secondsPerMinute: number;
    };
    declare seasons: {
        values: [
            {
                name: string;
                abbreviation: string;
                monthStart: number;
                monthEnd: number;
                dayStart: number;
                dayEnd: number;
            },
        ];
    };
    era!: {
        hasYearZero: boolean;
        name: string;
        abbrev: string;
        beforeName: string;
        beforeAbbrev: string;
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

    getMonthName(monthIndex: number): string {
        const month = this.months.values.at(monthIndex);
        if (!month) throw new Error(`Invalid month index: ${monthIndex}`);
        return month.name;
    }

    getWeekdayName(weekdayIndex: number): string {
        const weekday = this.days.values.at(weekdayIndex);
        if (!weekday) throw new Error(`Invalid weekday index: ${weekdayIndex}`);
        return weekday.name;
    }

    get worldDate(): SohlCalendarComponents {
        return this.timeToComponents(game.time.worldTime);
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
            components.eraName = this.era.beforeName;
            components.eraAbbrev = this.era.beforeAbbrev;
            components.eraYear = Math.abs(components.year);
        } else {
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
     * Example: " 1921-01-01 00:00:00" (note the preceeding space)
     * (or "-0051-01-01 00:00:00" for year 51 before the era)
     * @param calendar - The calendar to use for formatting
     * @param components - The time components to format
     * @param options - Formatting options (not used)
     * @returns The formatted timestamp
     */
    static override formatTimestamp(
        calendar: SohlCalendarData,
        components: SohlCalendarComponents,
        _options: PlainObject = {},
    ): string {
        // Ensure components are normalized
        components = calendar.timeToComponents(
            calendar.componentsToTime(components),
        );
        let eraYear = components.year;
        if (!components.beforeEra) {
            eraYear += calendar.era.hasYearZero ? 0 : 1;
        }
        const yyyy = eraYear.paddedString(4);
        const month = calendar.months.values[components.month];
        const mm = month.ordinal.paddedString(2);
        const dd = (components.dayOfMonth + 1).paddedString(2);
        const h = components.hour.paddedString(2);
        const m = components.minute.paddedString(2);
        const s = components.second.paddedString(2);
        return `${components.beforeEra ? "-" : " "}${yyyy}-${mm}-${dd} ${h}:${m}:${s}`;
    }

    /**
     * Format time components using the default formatting rules, e.g.,
     * "5 Springtide 722CE 14:30:00".
     * @param calendar - The calendar to use for formatting
     * @param components - The time components to format
     * @param options - Formatting options (not used)
     * @returns The formatted timestamp
     */
    static formatDefault(
        calendar: SohlCalendarData,
        components: SohlCalendarComponents,
        _options: PlainObject = {},
    ): string {
        // Ensure components are normalized
        components = calendar.timeToComponents(
            calendar.componentsToTime(components),
        );

        return `${components.dayOfMonth + 1} ${calendar.getMonthName(components.month)} ${components.eraYear}${components.eraAbbrev} ${String(components.hour).padStart(2, "0")}:${String(components.minute).padStart(2, "0")}:${String(
            components.second,
        ).padStart(2, "0")}`;
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
     * @returns The formatted timestamp
     */
    static formatRelativeTime(
        calendar: SohlCalendarData,
        components: SohlCalendarComponents,
        {
            short = false,
            maxTerms = 0,
            fromComponents = undefined,
        }: {
            short?: boolean;
            maxTerms?: number;
            fromComponents?: SohlCalendarComponents;
        } = {},
    ): string {
        const fromTime =
            fromComponents ?
                calendar.componentsToTime(fromComponents)
            :   game.time.worldTime;
        let nTime: number = calendar.componentsToTime(components);
        let relTime: number = fromTime - nTime;
        const nComponents: SohlCalendarComponents = calendar.timeToComponents(
            Math.abs(relTime),
        );
        const terms = {
            year: "TIME.Year",
            day: "TIME.Day",
            hour: "TIME.Hour",
            minute: "TIME.Minute",
            second: "TIME.Second",
        };
        const plurals = new Intl.PluralRules(game.i18n.lang);
        let parts = (
            Object.entries(terms) as [
                keyof foundry.data.CalendarData.TimeComponents,
                string,
            ][]
        ).reduce((arr: string[], [k, t]) => {
            const v = Math.round(nComponents[k] as number);
            if (short) arr.push(`${v}${game.i18n.localize(t + ".abbr")}`);
            else
                arr.push(
                    `${v} ${game.i18n.localize(`${t}.${plurals.select(v)}`).toLowerCase()}`,
                );
            return arr;
        }, []);
        if (!parts.length) return game.i18n.localize("TIME.Now");
        if (maxTerms) parts = parts.slice(0, maxTerms);
        const rel =
            short ?
                parts.join(" ")
            :   game.i18n.getListFormatter().format(parts);
        return game.i18n.format(
            relTime < 0 ? "TIME.Since" : "SOHL.TIME.Until",
            { since: rel },
        );
    }
}
