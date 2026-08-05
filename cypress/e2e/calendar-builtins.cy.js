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
 * Built-in calendars loaded from JSON data files (#1038) — in a live world, both
 * shipped calendars register into the calendar registry under their shortcodes,
 * the Vylarian Reckoning (`vylrec`) is the default, and applying each yields the
 * expected calendar. Companion to the Astrokýklos birthsign astrology: the
 * Vylarian months (Floralis … Janar) are what the sign windows read as.
 */
describe("built-in calendars from JSON (#1038)", () => {
    before(() => cy.login());

    const System = (win) => win.sohl.core.logic.SohlSystem;

    it("registers both shipped built-ins under their shortcodes", () => {
        cy.foundry((win) => {
            const S = System(win);
            const vyl = S.getCalendar("vylrec");
            const tw = S.getCalendar("twheel");
            return {
                vylName: vyl?.config?.name,
                vylBuiltin: vyl?.builtin,
                twName: tw?.config?.name,
                twBuiltin: tw?.builtin,
            };
        }).then((r) => {
            expect(r.vylName).to.eq("Vylarian Reckoning");
            expect(r.vylBuiltin, "vylrec is built-in").to.be.true;
            expect(r.twName).to.eq("Turning Wheel");
            expect(r.twBuiltin, "twheel is built-in").to.be.true;
        });
    });

    it("defaults new worlds to the Vylarian Reckoning", () => {
        cy.foundry((win) => {
            const setting = win.game.settings.settings.get(
                "sohl.activeCalendar",
            );
            return { default: setting?.default };
        }).then((r) => {
            expect(r.default, "activeCalendar setting default").to.eq("vylrec");
        });
    });

    it("both built-ins are applicable (applyCalendar swaps the SoHL calendar config)", () => {
        cy.foundry((win) => {
            const S = System(win);
            // applyCalendar writes sohl.CONFIG.time.worldCalendarConfig
            // synchronously; it accepts either registered built-in.
            S.applyCalendar("twheel");
            const twName = win.sohl.CONFIG.time.worldCalendarConfig.name;
            S.applyCalendar("vylrec");
            const vylName = win.sohl.CONFIG.time.worldCalendarConfig.name;
            return { twName, vylName };
        }).then((r) => {
            expect(r.twName).to.eq("Turning Wheel");
            expect(r.vylName).to.eq("Vylarian Reckoning");
        });
    });

    it("the Vylarian Reckoning is 12 × 30 months on a 10-day week, year 720, no year zero", () => {
        cy.foundry((win) => {
            const c = System(win).getCalendar("vylrec").config;
            return {
                months: c.months.values.length,
                allThirty: c.months.values.every((m) => m.days === 30),
                weekdays: c.days.values.length,
                yearZero: c.years.yearZero,
                hasYearZero: c.era.hasYearZero,
            };
        }).then((r) => {
            expect(r.months).to.eq(12);
            expect(r.allThirty).to.be.true;
            expect(r.weekdays).to.eq(10);
            expect(r.yearZero).to.eq(720);
            expect(r.hasYearZero).to.be.false;
        });
    });
});
