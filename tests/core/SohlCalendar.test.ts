import { describe, it } from "vitest";

describe("SohlCalendarData", () => {
    describe("defineSchema", () => {
        it.todo("extends parent CalendarData schema");
        it.todo("defines era.hasYearZero as BooleanField");
        it.todo("defines era.name as required StringField");
        it.todo("defines era.abbrev as required StringField");
        it.todo("defines era.beforeName as required StringField");
        it.todo("defines era.beforeAbbrev as required StringField");
        it.todo("defines era.description as optional StringField");
    });

    describe("getMonthName", () => {
        it.todo("returns the name of the month at the given index");
        it.todo("throws for invalid month index");
    });

    describe("getWeekdayName", () => {
        it.todo("returns the name of the weekday at the given index");
        it.todo("throws for invalid weekday index");
    });

    describe("worldDate", () => {
        it.todo("returns time components for current world time");
    });

    describe("timeToComponents", () => {
        it.todo("calls super.timeToComponents and extends with era data");
        it.todo("sets beforeEra era name and abbreviation for negative years");
        it.todo("sets era name and abbreviation for positive years");
        it.todo("calculates eraYear as absolute value for negative years");
        it.todo("adjusts eraYear based on hasYearZero setting");
    });

    describe("formatTimestamp (static)", () => {
        it.todo("formats as YYYY-MM-DD HH:MM:SS");
        it.todo("prepends dash for beforeEra dates");
        it.todo("prepends space for CE dates");
        it.todo("pads year to 4 digits, month/day/time to 2 digits");
    });

    describe("formatDefault (static)", () => {
        it.todo("formats as 'day monthName eraYear+eraAbbrev HH:MM:SS'");
    });

    describe("formatRelativeTime (static)", () => {
        it.todo("returns 'now' localization when time matches");
        it.todo("formats future times with 'until' localization");
        it.todo("formats past times with 'since' localization");
        it.todo("respects maxTerms parameter to limit output components");
        it.todo("uses short format when short option is true");
        it.todo("uses fromComponents as reference time when provided");
    });
});
