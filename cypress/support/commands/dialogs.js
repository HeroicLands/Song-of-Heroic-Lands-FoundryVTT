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
 * DialogV2 commands: drive a logic-level `dialog()` from render through submit.
 *
 * Logic that needs player input (Add Injury, attack/defense, success test) opens
 * a `DialogV2` and resolves once a button is pressed. `submitDialog` waits for the
 * open dialog to render, then activates one of its buttons — so a test can await
 * the flow's own promise for a deterministic result rather than a fixed delay.
 */

/**
 * Wait for an open `DialogV2` to render, then activate the button with the given
 * action (default `"ok"`). Yields the pressed action.
 *
 * @param {string} [action] - the button's `data-action` (e.g. `"ok"`, `"cancel"`).
 */
Cypress.Commands.add("submitDialog", (action = "ok") => {
    // Retry until the dialog's action button is in the DOM.
    cy.get(`button[data-action="${action}"]`, { timeout: 10000 }).should(
        "exist",
    );
    // Activate it through the app instance — reliable across the modal <dialog>.
    return cy.foundry((win) => {
        const dlg = Array.from(win.foundry.applications.instances.values())
            .reverse()
            .find((app) => /dialog/i.test(app.constructor.name));
        if (!dlg) throw new Error("submitDialog: no open DialogV2 found");
        const btn = dlg.element.querySelector(
            `button[data-action="${action}"]`,
        );
        if (!btn) {
            throw new Error(
                `submitDialog: open dialog has no [data-action="${action}"] button`,
            );
        }
        btn.click();
        return action;
    });
});
