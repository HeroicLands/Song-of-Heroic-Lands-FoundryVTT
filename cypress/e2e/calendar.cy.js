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
 * World time read / advance / format.
 *
 * The world calendar is whichever `foundry.data.CalendarData` the world has
 * installed, exposed at `sohl.calendar` (`SohlSystem.calendar` →
 * `game.time.calendar`). SoHL contributes three formatters to
 * `CONFIG.time.formatters` — `sohl.timestamp`, `sohl.default` and
 * `sohl.relative` (`src/core/logic/sohl-calendar-logic.ts`) — which read only
 * the base `CalendarData` API and so work against any calendar.
 *
 * World time is advanced with Foundry core (`game.time.advance(seconds)`); the
 * system only listens via the `updateWorldTime` hook, so there is no
 * system-specific advance mutator. Fully GREEN.
 */

const DAY = 24 * 60 * 60;
const HOUR = 60 * 60;

describe("world time read / advance / format", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // -------------------------------------------------------------------- read

    it("exposes the world calendar via sohl.calendar", () => {
        cy.foundry((win) => ({
            hasCalendar: !!win.sohl.calendar,
            sameAsGameTime: win.sohl.calendar === win.game.time.calendar,
            hasMonths: (win.sohl.calendar?.months?.values?.length ?? 0) > 0,
        })).should((r) => {
            expect(r.hasCalendar, "sohl.calendar present").to.be.true;
            expect(r.sameAsGameTime, "returns game.time.calendar").to.be.true;
            expect(r.hasMonths, "calendar carries months").to.be.true;
        });
    });

    it("registers only the three sohl formatters on CONFIG.time", () => {
        cy.foundry((win) => ({
            formatters: Object.keys(win.CONFIG.time.formatters ?? {}).filter((k) =>
                k.startsWith("sohl."),
            ),
        })).should((r) => {
            expect(r.formatters.sort(), "sohl formatters").to.deep.eq([
                "sohl.default",
                "sohl.relative",
                "sohl.timestamp",
            ]);
        });
    });

    // ----------------------------------------------------------------- advance

    it("advancing world time moves worldTime and the calendar date by the delta", () => {
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
                dateDelta: cal.componentsToTime(afterDate) - cal.componentsToTime(beforeDate),
                sameDay:
                    afterDate.dayOfMonth === beforeDate.dayOfMonth &&
                    afterDate.month === beforeDate.month,
            };

            // Restore world time so the run leaves no residual advance.
            await win.game.time.advance(-DAY);
            return result;
        }).should((r) => {
            expect(r.delta, "worldTime advanced one day").to.eq(DAY);
            expect(r.dateDelta, "calendar date advanced one day").to.eq(DAY);
            expect(r.sameDay, "calendar day changed").to.be.false;
        });
    });

    // ----------------------------------------------------------------- format

    it("formats the current time as a timestamp and a default string", () => {
        cy.foundry((win) => {
            const cal = win.game.time.calendar;
            const comp = cal.timeToComponents(win.game.time.worldTime);
            return {
                timestamp: cal.format(comp, "sohl.timestamp"),
                def: cal.format(comp, "sohl.default"),
            };
        }).should((r) => {
            // "0722-04-15 14:30:00" — zero-padded date and time.
            expect(r.timestamp, "sohl.timestamp shape").to.match(
                /^-?\d{4,}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
            );
            // "<day> <month> <year> HH:MM:SS" — e.g. "15 January 2024 14:30:00".
            // The month name may be an i18n key: the headless container has no
            // lang pack loaded, so a key renders as itself rather than localized
            // text. Assert the structure, which is what the formatter is
            // responsible for, not the localization.
            expect(r.def, "sohl.default shape").to.match(/^\d{1,2} \S+ -?\d+ \d{2}:\d{2}:\d{2}$/);
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
            expect(r.relPast.toLowerCase(), "past → elapsed, not now").to.contain("hour");
        });
    });
});
