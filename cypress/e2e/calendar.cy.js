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
 * Calendar read / advance / format.
 *
 * The SoHL world calendar is a `SohlCalendarData` (a `foundry.data.CalendarData`
 * subclass) exposed at `sohl.calendar` (`SohlSystem.calendar` → `game.time.calendar`).
 * It adds an era model (`eraYear`/`eraAbbrev`/`beforeEra`) on top of Foundry's
 * year/month/day schema and registers three formatters in `CONFIG.time.formatters`:
 * `sohl.timestamp`, `sohl.default`, `sohl.relative` (`src/core/logic/sohl-calendar-logic.ts`).
 *
 * World time is advanced with Foundry core (`game.time.advance(seconds)`); the
 * system only listens via the `updateWorldTime` hook, so there is no
 * system-specific advance mutator. Fully GREEN — the calendar is implemented
 * over Foundry core.
 */

const DAY = 24 * 60 * 60;
const HOUR = 60 * 60;

describe("calendar read / advance / format", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // -------------------------------------------------------------------- read

    it("exposes the SoHL calendar via sohl.calendar", () => {
        cy.foundry((win) => ({
            hasCalendar: !!win.sohl.calendar,
            isSohl: win.sohl.calendar?.isSohlCalendar,
            sameAsGameTime: win.sohl.calendar === win.game.time.calendar,
        })).should((r) => {
            expect(r.hasCalendar, "sohl.calendar present").to.be.true;
            expect(r.isSohl, "isSohlCalendar").to.be.true;
            expect(r.sameAsGameTime, "returns game.time.calendar").to.be.true;
        });
    });

    it("worldDate decomposes the current world time with era components", () => {
        cy.foundry((win) => {
            const wd = win.sohl.calendar.worldDate;
            return {
                keys: Object.keys(wd),
                eraYear: wd.eraYear,
                eraAbbrev: wd.eraAbbrev,
                eraName: wd.eraName,
                beforeEra: wd.beforeEra,
                // Round-trip: components → time should equal the current worldTime.
                roundTrip: win.game.time.calendar.componentsToTime(wd),
                worldTime: win.game.time.worldTime,
            };
        }).should((r) => {
            expect(r.keys, "era component fields present").to.include.members([
                "eraYear",
                "eraAbbrev",
                "eraName",
                "beforeEra",
            ]);
            expect(r.eraYear, "eraYear is a number").to.be.a("number");
            expect(r.eraAbbrev, "eraAbbrev non-empty").to.be.a("string").and.not
                .be.empty;
            expect(r.beforeEra, "beforeEra is boolean").to.be.a("boolean");
            expect(r.roundTrip, "worldDate round-trips to worldTime").to.eq(
                r.worldTime,
            );
        });
    });

    // ----------------------------------------------------------------- advance

    it("advancing world time moves worldTime and worldDate by the delta", () => {
        cy.foundry(async (win) => {
            const cal = win.game.time.calendar;
            const before = win.game.time.worldTime;
            const beforeDate = cal.timeToComponents(before);

            await win.game.time.advance(DAY);

            const after = win.game.time.worldTime;
            const afterDate = cal.timeToComponents(after);
            const result = {
                delta: after - before,
                // The date advanced by exactly one day of seconds.
                dateDelta:
                    cal.componentsToTime(afterDate) -
                    cal.componentsToTime(beforeDate),
                sameDay:
                    afterDate.dayOfMonth === beforeDate.dayOfMonth &&
                    afterDate.month === beforeDate.month,
            };

            // Restore world time so the run leaves no residual advance.
            await win.game.time.advance(-DAY);
            return result;
        }).should((r) => {
            expect(r.delta, "worldTime advanced one day").to.eq(DAY);
            expect(r.dateDelta, "worldDate advanced one day").to.eq(DAY);
            expect(r.sameDay, "calendar day changed").to.be.false;
        });
    });

    // ----------------------------------------------------------------- format

    it("formats the current time as a SoHL timestamp and default string", () => {
        cy.foundry((win) => {
            const cal = win.game.time.calendar;
            const comp = cal.timeToComponents(win.game.time.worldTime);
            return {
                timestamp: cal.format(comp, "sohl.timestamp"),
                def: cal.format(comp, "sohl.default"),
            };
        }).should((r) => {
            // " 0722-04-15 14:30:00" — leading era sign, zero-padded date/time.
            expect(r.timestamp, "sohl.timestamp shape").to.match(
                /^[ -]\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
            );
            // "<day> <month> <eraYear><eraAbbr> HH:MM:SS" — e.g. "15 Highsun 722TR
            // 14:30:00". The month name and era abbreviation are i18n keys here:
            // the headless container has no lang pack loaded, so they render as
            // the raw keys rather than localized text. Assert the structure, which
            // is what the formatter is responsible for, not the localization.
            expect(r.def, "sohl.default shape").to.match(
                /^\d{1,2} \S+ \d+\S+ \d{2}:\d{2}:\d{2}$/,
            );
        });
    });

    it("formats relative time: 'now' for the present, elapsed for the past", () => {
        cy.foundry((win) => {
            const cal = win.game.time.calendar;
            const now = win.game.time.worldTime;
            const nowComp = cal.timeToComponents(now);
            const pastComp = cal.timeToComponents(now - HOUR);
            return {
                relNow: cal.format(nowComp, "sohl.relative"),
                relPast: cal.format(pastComp, "sohl.relative"),
            };
        }).should((r) => {
            expect(r.relNow.toLowerCase(), "present → now").to.contain("now");
            expect(
                r.relPast.toLowerCase(),
                "past → elapsed, not now",
            ).to.contain("hour");
        });
    });
});
