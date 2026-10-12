/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/** Native editor proof for the normal suite, independent of optional modules. */
describe("native item date editor", () => {
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
                    /dialog/i.test(app.constructor.name) &&
                    (app.element.matches(selector) || app.element.querySelector(selector)),
            );
    const pickerDialog = (selector) => {
        let app;
        cy.window({ log: false }).should((win) => {
            app = findDialog(win, selector);
            expect(app, `owned visible picker dialog ${selector}`).to.exist;
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
    before(() => cy.login());
    afterEach(() =>
        cy.foundry(async (win) => {
            // Close only new date dialogs belonging to this test, including failures before selection.
            const title = win.sohl.i18n.localize("SOHL.DatePicker.title");
            for (const app of win.foundry.applications.instances.values()) {
                if (
                    !existingDialogs ||
                    existingDialogs.has(app.id) ||
                    !/dialog/i.test(app.constructor.name)
                )
                    continue;
                if (
                    ownedDialogs.has(app.id) ||
                    (app.options.window?.title === title && app.rendered)
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
        it(`stores a ${type} calendar date through the basic editor`, () => {
            let itemId, expected;
            cy.createWorldItem(type, { name: `Native date ${type}` }).then((item) => {
                itemId = item.id;
                itemIds.push(item.id);
                cy.openSheet(item);
            });
            cy.get('[data-field-path="system.contractDate"]')
                .filter(":visible")
                .last()
                .should("be.visible")
                .click();
            cy.foundry(
                (win) =>
                    !!(
                        win.game.modules.get("calendaria")?.active &&
                        typeof win.CALENDARIA?.api?.showDatePicker === "function"
                    ),
            ).then((active) => {
                if (active)
                    pickerDialog('button[data-action="pick"]')
                        .find('button[data-action="basic"]')
                        .click();
            });
            pickerDialog(".date-picker-dialog").find('select[name="month"]').select("0");
            pickerDialog(".date-picker-dialog").find('input[name="day"]').clear().type("2");
            pickerDialog(".date-picker-dialog").find('input[name="year"]').clear().type("1");
            pickerDialog(".date-picker-dialog").find('input[name="hour"]').clear().type("0");
            pickerDialog(".date-picker-dialog").find('input[name="minute"]').clear().type("0");
            pickerDialog(".date-picker-dialog").find('input[name="second"]').clear().type("1");
            cy.foundry((win) => {
                expected = win.sohl.core.logic.datePartsToWorldTime(win.sohl.calendar, {
                    year: 1,
                    monthIndex: 0,
                    day: 2,
                    hour: 0,
                    minute: 0,
                    second: 1,
                });
                if (expected === null)
                    throw new Error("Native fixture date is not valid in the active calendar");
                return true;
            });
            pickerDialog(".date-picker-dialog").find('button[data-action="set"]').click();
            cy.window({ log: false }).should((win) =>
                expect(win.game.items.get(itemId).system.contractDate).to.equal(expected),
            );
            cy.get('[data-field-path="system.contractDate"]').filter(":visible").last().click();
            cy.foundry(
                (win) =>
                    !!(
                        win.game.modules.get("calendaria")?.active &&
                        typeof win.CALENDARIA?.api?.showDatePicker === "function"
                    ),
            ).then((active) => {
                if (active)
                    pickerDialog('button[data-action="pick"]')
                        .find('button[data-action="basic"]')
                        .click();
            });
            pickerDialog(".date-picker-dialog").find('button[data-action="cancel"]').click();
            cy.window({ log: false }).should((win) =>
                expect(win.game.items.get(itemId).system.contractDate).to.equal(expected),
            );
        });
    }
});
