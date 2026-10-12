/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/** Run explicitly in a test world with the supported Calendaria module active. */
describe("optional Calendaria item dates", () => {
    const itemIds = [];
    let existingDialogs;
    const ownedDialogs = new Set();
    const findDialog = (win, selector) =>
        Array.from(win.foundry.applications.instances.values())
            .reverse()
            .find(
                (app) =>
                    !existingDialogs.has(app.id) &&
                    app.rendered &&
                    app.element &&
                    (app.element.matches(selector) || app.element.querySelector(selector)),
            );
    // The public picker is a DialogV2 prompt; identify its form rather than a
    // bundled constructor name or Calendaria's unrelated MiniCal application.
    const calendariaPickerSelector = '.calendaria select[name="month"]';
    const isCalendarPicker = (app) =>
        app.element?.matches(".calendaria") &&
        app.element.querySelector('select[name="month"]') &&
        app.element.querySelector('select[name="day"]') &&
        app.element.querySelector('input[name="year"]') &&
        app.element.querySelector('button[data-action="ok"]');
    const pickerDialog = (selector) => {
        let app;
        cy.window({ log: false }).should((win) => {
            app = findDialog(win, selector);
            const inventory = Array.from(win.foundry.applications.instances.values()).map(
                (entry) => ({
                    id: entry.id,
                    baseline: existingDialogs.has(entry.id),
                    rendered: entry.rendered,
                    title: entry.options.window?.title,
                    classes: entry.element?.className,
                }),
            );
            expect(
                app,
                `owned picker ${selector}; activeCalendar=${Boolean(win.CALENDARIA.api.getActiveCalendar())}; apps=${JSON.stringify(inventory)}`,
            ).to.exist;
        });
        return cy.then(() => {
            ownedDialogs.add(app.id);
            return cy.wrap(app.element, { log: false }).should("be.visible");
        });
    };
    beforeEach(() =>
        cy.foundry((win) => {
            existingDialogs = new Set(
                Array.from(win.foundry.applications.instances.values()).map((app) => app.id),
            );
            ownedDialogs.clear();
            return true;
        }),
    );
    before(() => {
        cy.login();
        cy.foundry((win) => {
            if (
                !win.game.modules.get("calendaria")?.active ||
                typeof win.CALENDARIA?.api?.showDatePicker !== "function"
            ) {
                throw new Error(
                    "This focused spec requires Calendaria active with its public date picker API",
                );
            }
            if (win.sohl.calendar.months.values.length < 2)
                throw new Error("Date round-trip fixture requires two calendar months");
            return true;
        });
        // Public API publication precedes asynchronous bundled-calendar loading.
        // showDatePicker returns null until this active-calendar prerequisite exists.
        cy.window({ log: false, timeout: 20000 }).should((win) => {
            const calendar = win.CALENDARIA.api.getActiveCalendar();
            expect(calendar, "Calendaria public active calendar ready").to.exist;
            expect(
                calendar.monthsArray.length,
                "active calendar has selectable months",
            ).to.be.greaterThan(1);
            expect(
                win.sohl.calendar.months.values.length,
                "SoHL active calendar ready",
            ).to.be.greaterThan(1);
        });
    });
    afterEach(() =>
        cy.foundry(async (win) => {
            // Close only new date dialogs belonging to this test, including failures before selection.
            const title = win.sohl.i18n.localize("SOHL.DatePicker.title");
            for (const app of win.foundry.applications.instances.values()) {
                if (!existingDialogs || existingDialogs.has(app.id)) continue;
                if (
                    ownedDialogs.has(app.id) ||
                    (app.rendered &&
                        (isCalendarPicker(app) ||
                            (app.options.window?.title === title &&
                                (app.element?.querySelector('button[data-action="pick"]') ||
                                    app.element?.querySelector(".date-picker-dialog") ||
                                    app.element?.matches(".date-picker-dialog")))))
                ) {
                    await app.close();
                }
            }
            for (const id of itemIds.splice(0)) {
                const item = win.game.items.get(id);
                if (item) {
                    await item.sheet.close();
                    await item.delete();
                }
            }
            return true;
        }),
    );
    for (const type of ["affliction", "trauma"]) {
        it(`round-trips a ${type} date through the actual picker without losing seconds`, () => {
            let itemId, expected;
            cy.createWorldItem(type, {
                name: `Calendar date ${type}`,
                system: { contractDate: 29 },
            }).then((item) => {
                itemId = item.id;
                itemIds.push(item.id);
                cy.foundry((win) =>
                    win.game.items
                        .get(itemId)
                        .update(win.structuredClone({ "system.contractDate": 29 })),
                );
                cy.openSheet(item);
            });
            cy.then(() => {
                cy.get(`[data-field-path="system.contractDate"]`)
                    .filter(":visible")
                    .last()
                    .should("be.visible")
                    .click();
            });
            pickerDialog('button[data-action="pick"]')
                .find('button[data-action="pick"]')
                .should("be.visible")
                .click();
            pickerDialog(calendariaPickerSelector)
                .find('select[name="month"]')
                .should("be.visible")
                .select("1");
            pickerDialog(calendariaPickerSelector).find('select[name="day"]').select("2");
            pickerDialog(calendariaPickerSelector).find('input[name="hour"]').clear().type("5");
            pickerDialog(calendariaPickerSelector).find('input[name="minute"]').clear().type("17");
            cy.foundry((win) => {
                expected = win.sohl.core.logic.datePartsToWorldTime(win.sohl.calendar, {
                    year: 0,
                    monthIndex: 1,
                    day: 2,
                    hour: 5,
                    minute: 17,
                    second: 29,
                });
                if (expected === null)
                    throw new Error("Fixture selection invalid for the active calendar");
                return true;
            });
            pickerDialog(calendariaPickerSelector).find('button[data-action="ok"]').click();
            cy.window({ log: false }).should((win) =>
                expect(win.game.items.get(itemId).system.contractDate).to.equal(expected),
            );
            cy.foundry((win) => {
                const value = win.game.items.get(itemId).system.contractDate;
                const parts = win.sohl.core.logic.worldTimeToDateParts(win.sohl.calendar, value);
                expect(parts).to.include({
                    monthIndex: 1,
                    day: 2,
                    hour: 5,
                    minute: 17,
                    second: 29,
                });
                const helpers = win.Handlebars.helpers;
                const formatted = helpers.displayWorldTime(value, { hash: {} });
                expect(formatted).to.equal(win.sohl.calendar.format(value, "sohl.default"));
                for (const format of ["sohl.default", "sohl.timestamp", "sohl.relative"]) {
                    expect(win.sohl.calendar.format(value, format)).to.be.a("string");
                }
                return true;
            });
            cy.get('[data-field-path="system.contractDate"]').filter(":visible").last().click();
            pickerDialog('button[data-action="pick"]').find('button[data-action="clear"]').click();
            cy.window({ log: false }).should((win) =>
                expect(win.game.items.get(itemId).system.contractDate).to.equal(null),
            );
            cy.get('[data-field-path="system.contractDate"]').filter(":visible").last().click();
            pickerDialog('button[data-action="pick"]').find('button[data-action="basic"]').click();
            pickerDialog(".date-picker-dialog").find('input[name="second"]').should("be.visible");
            pickerDialog(".date-picker-dialog").find('button[data-action="cancel"]').click();
            cy.window({ log: false }).should((win) =>
                expect(win.game.items.get(itemId).system.contractDate).to.equal(null),
            );
        });
    }
});
