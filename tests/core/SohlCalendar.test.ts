/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    afterAll,
    afterEach,
} from "vitest";
import { SohlCalendarData } from "@src/core/foundry/SohlCalendar";
import {
    formatTimestamp,
    formatDefault,
    formatRelativeTime,
} from "@src/core/logic/sohl-calendar-logic";
// Mock-swapped shim (vitest alias); spy on it instead of touching raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";
import { readFileSync } from "node:fs";

afterEach(() => {
    vi.restoreAllMocks();
});

const SECONDS_PER_DAY = 24 * 60 * 60;
const SOHL_YEAR_DAYS = 360;
const SOHL_YEAR_SECONDS = SOHL_YEAR_DAYS * SECONDS_PER_DAY;

function makeSohlConfig(overrides: any = {}): any {
    return {
        name: "Test SoHL",
        years: { yearZero: 720, firstWeekday: 0 },
        era: {
            name: "TR",
            abbrev: "TR",
            beforeName: "BTR",
            beforeAbbrev: "BTR",
            description: "",
            hasYearZero: false,
            ...(overrides.era ?? {}),
        },
        months: {
            values: Array.from({ length: 12 }, (_, i) => ({
                name: `Month${i}`,
                abbreviation: `M${i}`,
                ordinal: i + 1,
                days: 30,
            })),
        },
        days: {
            values: Array.from({ length: 10 }, (_, i) => ({
                name: `Day${i}`,
                abbreviation: `D${i}`,
                ordinal: i + 1,
            })),
            daysPerYear: 360,
            hoursPerDay: 24,
            minutesPerHour: 60,
            secondsPerMinute: 60,
        },
        seasons: { values: [] },
        ...overrides,
    };
}

function makeForeignConfig(): any {
    return {
        name: "Foreign",
        years: { yearZero: 0, firstWeekday: 0 },
        months: {
            values: [
                { name: "Jan", abbreviation: "Jan", ordinal: 1, days: 31 },
                { name: "Feb", abbreviation: "Feb", ordinal: 2, days: 28 },
                { name: "Mar", abbreviation: "Mar", ordinal: 3, days: 31 },
                { name: "Apr", abbreviation: "Apr", ordinal: 4, days: 30 },
                { name: "May", abbreviation: "May", ordinal: 5, days: 31 },
                { name: "Jun", abbreviation: "Jun", ordinal: 6, days: 30 },
                { name: "Jul", abbreviation: "Jul", ordinal: 7, days: 31 },
                { name: "Aug", abbreviation: "Aug", ordinal: 8, days: 31 },
                { name: "Sep", abbreviation: "Sep", ordinal: 9, days: 30 },
                { name: "Oct", abbreviation: "Oct", ordinal: 10, days: 31 },
                { name: "Nov", abbreviation: "Nov", ordinal: 11, days: 30 },
                { name: "Dec", abbreviation: "Dec", ordinal: 12, days: 31 },
            ],
        },
        days: {
            values: Array.from({ length: 7 }, (_, i) => ({
                name: `Day${i}`,
                abbreviation: `D${i}`,
                ordinal: i + 1,
            })),
            daysPerYear: 365,
            hoursPerDay: 24,
            minutesPerHour: 60,
            secondsPerMinute: 60,
        },
        seasons: { values: [] },
    };
}

const ForeignCalendar = (foundry as any).data.CalendarData;
const { StringField, BooleanField, SchemaField } = (foundry as any).data.fields;

describe("SohlCalendarData", () => {
    describe("defineSchema", () => {
        const schema = SohlCalendarData.defineSchema() as any;
        const eraField = schema.era;

        it("adds an 'era' SchemaField to the parent schema", () => {
            expect(eraField).toBeInstanceOf(SchemaField);
        });

        it("defines era.hasYearZero as a BooleanField", () => {
            expect(eraField.fields.hasYearZero).toBeInstanceOf(BooleanField);
        });

        it("defines era.name as a required StringField with empty initial", () => {
            const f = eraField.fields.name;
            expect(f).toBeInstanceOf(StringField);
            expect(f.options.required).toBe(true);
            expect(f.options.initial).toBe("");
        });

        it("defines era.abbrev as a required StringField", () => {
            const f = eraField.fields.abbrev;
            expect(f).toBeInstanceOf(StringField);
            expect(f.options.required).toBe(true);
        });

        it("defines era.beforeName as a required StringField", () => {
            const f = eraField.fields.beforeName;
            expect(f).toBeInstanceOf(StringField);
            expect(f.options.required).toBe(true);
        });

        it("defines era.beforeAbbrev as a required StringField", () => {
            const f = eraField.fields.beforeAbbrev;
            expect(f).toBeInstanceOf(StringField);
            expect(f.options.required).toBe(true);
        });

        it("defines era.description as an optional StringField", () => {
            const f = eraField.fields.description;
            expect(f).toBeInstanceOf(StringField);
            expect(f.options.required).toBe(false);
        });
    });

    describe("getMonthName", () => {
        const cal = new SohlCalendarData(makeSohlConfig());

        it("returns the name of the month at the given index", () => {
            expect(cal.getMonthName(0)).toBe("Month0");
            expect(cal.getMonthName(11)).toBe("Month11");
        });

        it("throws for invalid month index", () => {
            expect(() => cal.getMonthName(99)).toThrow(/Invalid month/);
            expect(() => cal.getMonthName(-99)).toThrow(/Invalid month/);
        });
    });

    describe("getWeekdayName", () => {
        const cal = new SohlCalendarData(makeSohlConfig());

        it("returns the name of the weekday at the given index", () => {
            expect(cal.getWeekdayName(0)).toBe("Day0");
            expect(cal.getWeekdayName(9)).toBe("Day9");
        });

        it("throws for invalid weekday index", () => {
            expect(() => cal.getWeekdayName(99)).toThrow(/Invalid weekday/);
        });
    });

    describe("worldDate", () => {
        it("returns era-enriched components for the current world time", () => {
            vi.spyOn(FoundryHelpers, "fvttWorldTime").mockReturnValue(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.worldDate;
            expect(c.year).toBe(0);
            expect(c.eraName).toBe("TR");
            expect(c.eraYear).toBe(1);
            expect(c.beforeEra).toBe(false);
        });
    });

    describe("timeToComponents", () => {
        it("calls super.timeToComponents and adds era fields", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(0);
            expect(c.year).toBe(0);
            expect(c.month).toBe(0);
            expect(c.eraName).toBeDefined();
            expect(c.eraAbbrev).toBeDefined();
        });

        it("flags beforeEra and uses beforeName for negative years", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(-SOHL_YEAR_SECONDS);
            expect(c.year).toBe(-1);
            expect(c.beforeEra).toBe(true);
            expect(c.eraName).toBe("BTR");
            expect(c.eraAbbrev).toBe("BTR");
        });

        it("uses era.name and clears beforeEra for non-negative years", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(SOHL_YEAR_SECONDS);
            expect(c.year).toBe(1);
            expect(c.beforeEra).toBe(false);
            expect(c.eraName).toBe("TR");
        });

        it("returns abs(year) as eraYear for negative years", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(-5 * SOHL_YEAR_SECONDS);
            expect(c.year).toBe(-5);
            expect(c.eraYear).toBe(5);
        });

        it("adjusts eraYear by +1 when hasYearZero is false", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            expect(cal.timeToComponents(0).eraYear).toBe(1);
            expect(cal.timeToComponents(SOHL_YEAR_SECONDS).eraYear).toBe(2);
        });

        it("returns year as eraYear when hasYearZero is true", () => {
            const cal = new SohlCalendarData(
                makeSohlConfig({ era: { hasYearZero: true } }),
            );
            expect(cal.timeToComponents(0).eraYear).toBe(0);
            expect(cal.timeToComponents(SOHL_YEAR_SECONDS).eraYear).toBe(1);
        });
    });

    describe("formatTimestamp (static)", () => {
        it("SoHL calendar: formats as ' YYYY-MM-DD HH:MM:SS' with leading space for after-era", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(0);
            expect(formatTimestamp(cal, c)).toBe(" 0001-01-01 00:00:00");
        });

        it("SoHL calendar: formats with '-' prefix and abs year for before-era", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(-51 * SOHL_YEAR_SECONDS);
            expect(formatTimestamp(cal, c)).toBe("-0051-01-01 00:00:00");
        });

        it("SoHL calendar: skips year-zero adjustment when hasYearZero is true", () => {
            const cal = new SohlCalendarData(
                makeSohlConfig({ era: { hasYearZero: true } }),
            );
            const c = cal.timeToComponents(0);
            expect(formatTimestamp(cal, c)).toBe(" 0000-01-01 00:00:00");
        });

        it("pads year to 4 digits, month/day/time to 2 digits", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(
                100 * SOHL_YEAR_SECONDS +
                    35 * SECONDS_PER_DAY +
                    9 * 3600 +
                    5 * 60 +
                    7,
            );
            const out = formatTimestamp(cal, c);
            expect(out).toMatch(/^ \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
        });

        it("Foreign calendar: formats as 'YYYY-MM-DD HH:MM:SS' (no sign prefix, no year-zero adjustment)", () => {
            const cal = new ForeignCalendar(makeForeignConfig());
            const c = cal.timeToComponents(0);
            const out = formatTimestamp(cal, c);
            expect(out).toBe("0000-01-01 00:00:00");
            expect(out).not.toMatch(/^[- ]/);
        });

        it("Foreign calendar: does not access calendar.era and does not crash", () => {
            const cal = new ForeignCalendar(makeForeignConfig());
            expect((cal as any).era).toBeUndefined();
            const c = cal.timeToComponents(365 * SECONDS_PER_DAY);
            expect(() => formatTimestamp(cal, c)).not.toThrow();
        });
    });

    describe("formatDefault (static)", () => {
        it("SoHL calendar: formats as 'day monthName eraYear+eraAbbrev HH:MM:SS'", () => {
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(
                14 * SECONDS_PER_DAY + 14 * 3600 + 30 * 60,
            );
            expect(formatDefault(cal, c)).toBe("15 Month0 1TR 14:30:00");
        });

        it("Foreign calendar: formats as 'day monthName year HH:MM:SS' with no era data", () => {
            const cal = new ForeignCalendar(makeForeignConfig());
            const c = cal.timeToComponents(
                14 * SECONDS_PER_DAY + 14 * 3600 + 30 * 60,
            );
            expect(formatDefault(cal, c)).toBe("15 Jan 0 14:30:00");
        });

        it("Foreign calendar: pulls month label from calendar.months.values[m].name", () => {
            const cal = new ForeignCalendar(makeForeignConfig());
            const c = cal.timeToComponents(31 * SECONDS_PER_DAY);
            expect(formatDefault(cal, c)).toContain("Feb");
        });

        it("Foreign calendar: does not access components.eraYear/eraAbbrev and does not crash", () => {
            const cal = new ForeignCalendar(makeForeignConfig());
            const c = cal.timeToComponents(0);
            expect((c as any).eraYear).toBeUndefined();
            expect(() => formatDefault(cal, c)).not.toThrow();
        });
    });

    describe("formatRelativeTime (static)", () => {
        function setWorldTime(t: number): void {
            vi.spyOn(FoundryHelpers, "fvttWorldTime").mockReturnValue(t);
        }

        const origFormat = (globalThis as any).sohl.i18n.format;
        const TEMPLATES: Record<string, string> = {
            "SOHL.TIME.Until": "FUT[{since}]",
            "TIME.Since": "PAST[{since}]",
        };
        beforeAll(() => {
            (globalThis as any).sohl.i18n.format = (
                key: string,
                data: Record<string, unknown> = {},
            ): string => {
                const template = TEMPLATES[key] ?? key;
                return template.replace(/{(\w+)}/g, (_, k) =>
                    String(data[k] ?? ""),
                );
            };
        });
        afterAll(() => {
            (globalThis as any).sohl.i18n.format = origFormat;
        });

        it("returns 'TIME.Now' when components represent the current world time", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(0);
            expect(formatRelativeTime(cal, c)).toBe("TIME.Now");
        });

        it("formats future times with the 'SOHL.TIME.Until' template", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(3 * SECONDS_PER_DAY);
            const out = formatRelativeTime(cal, c);
            expect(out).toMatch(/^FUT\[/);
        });

        // Regression (#477): the future-tense wrapper key is SoHL-owned (unlike
        // the Foundry-core "TIME.Since" past wrapper), so it must be present in
        // lang/en.json or "… from now" durations render the raw key. The unit
        // tests above stub the key, so only a real-file assertion catches the gap.
        it("ships the SOHL.TIME.Until key in lang/en.json (#477)", () => {
            const en = JSON.parse(
                readFileSync(
                    new URL("../../lang/en.json", import.meta.url),
                    "utf8",
                ),
            ) as Record<string, string>;
            expect(en["SOHL.TIME.Until"]).toBeDefined();
            expect(en["SOHL.TIME.Until"]).toContain("{since}");
        });

        it("formats past times with the 'TIME.Since' template", () => {
            setWorldTime(3 * SECONDS_PER_DAY);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(0);
            const out = formatRelativeTime(cal, c);
            expect(out).toMatch(/^PAST\[/);
        });

        it("filters zero-valued components from the output", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(3 * SECONDS_PER_DAY);
            const out = formatRelativeTime(cal, c);
            expect(out).toContain("3 ");
            expect(out).not.toContain("0 ");
        });

        it("respects maxTerms parameter", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(
                2 * SOHL_YEAR_SECONDS +
                    3 * SECONDS_PER_DAY +
                    4 * 3600 +
                    5 * 60 +
                    6,
            );
            const long = formatRelativeTime(cal, c);
            const short = formatRelativeTime(cal, c, {
                maxTerms: 2,
            });
            expect(short.length).toBeLessThan(long.length);
        });

        it("uses short format when short option is true", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const c = cal.timeToComponents(3 * SECONDS_PER_DAY);
            const short = formatRelativeTime(cal, c, {
                short: true,
            });
            expect(short).toContain("TIME.Day.abbr");
        });

        it("uses fromComponents as the anchor when provided", () => {
            setWorldTime(0);
            const cal = new SohlCalendarData(makeSohlConfig());
            const target = cal.timeToComponents(0);
            const anchor = cal.timeToComponents(3 * SECONDS_PER_DAY);
            const out = formatRelativeTime(cal, target, {
                fromComponents: anchor,
            });
            expect(out).toMatch(/^PAST\[/);
        });

        it("works against a foreign calendar with no era data", () => {
            setWorldTime(0);
            const cal = new ForeignCalendar(makeForeignConfig());
            const c = cal.timeToComponents(2 * SECONDS_PER_DAY);
            expect(() => formatRelativeTime(cal, c)).not.toThrow();
        });
    });
});
