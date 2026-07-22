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
    // Find an OPEN dialog that has the button — not any DOM match: closed dialogs
    // linger in `foundry.applications.instances` (rendered:false) with stale
    // elements still in the DOM, so a raw `cy.get` can match a leaked button from
    // a prior test before this one's dialog renders. Require `rendered`, pick the
    // newest that has the button.
    const findDlg = (win) =>
        Array.from(win.foundry.applications.instances.values())
            .reverse()
            .find(
                (app) =>
                    /dialog/i.test(app.constructor.name) &&
                    app.rendered &&
                    app.element &&
                    app.element.querySelector(
                        `button[data-action="${action}"]`,
                    ),
            );
    // cy.window().should(...) genuinely retries until such a dialog is rendered.
    cy.window({ log: false }).should((win) => {
        expect(findDlg(win), `open dialog with [data-action="${action}"]`).to
            .exist;
    });
    // Activate it through the app instance — reliable across the modal <dialog>.
    return cy.foundry((win) => {
        const dlg = findDlg(win);
        if (!dlg) {
            throw new Error(
                `submitDialog: no open dialog has a [data-action="${action}"] button`,
            );
        }
        dlg.element.querySelector(`button[data-action="${action}"]`).click();
        return action;
    });
});

/**
 * Press a button on the open dialog whose rendered text contains `text` — for
 * when several **identical** dialogs are (or may be) open back-to-back and
 * {@link submitDialog}'s "topmost dialog" heuristic can't tell them apart. The
 * two creation offers a bleeder wound fires (healing-check then blood-loss) share
 * a title and yes/no buttons and differ only in prompt text, so a spec answering
 * a specific one waits for it by content (`"Blood Loss Advance"`), then clicks.
 *
 * @param {string|RegExp} text - Substring/pattern the target dialog's text must match.
 * @param {string} [action] - the button's `data-action` (default `"yes"`).
 */
Cypress.Commands.add("submitDialogMatching", (text, action = "yes") => {
    const matches = (s) =>
        text instanceof RegExp ? text.test(s) : String(s).includes(text);
    const findDlg = (win) =>
        Array.from(win.foundry.applications.instances.values())
            .reverse()
            .find(
                (app) =>
                    /dialog/i.test(app.constructor.name) &&
                    // Ignore closed-but-retained instances whose stale .element
                    // still matches the text (they leak across tests).
                    app.rendered &&
                    app.element &&
                    matches(app.element.textContent),
            );
    // cy.window().should(...) genuinely retries (unlike cy.foundry's .then),
    // so this polls until the matching dialog + its button are rendered.
    cy.window({ log: false }).should((win) => {
        const dlg = findDlg(win);
        expect(dlg, `dialog matching ${text}`).to.exist;
        expect(
            dlg.element.querySelector(`button[data-action="${action}"]`),
            `[data-action="${action}"] on that dialog`,
        ).to.exist;
    });
    // Click through the matching app instance (reliable across the modal <dialog>).
    return cy.foundry((win) => {
        const dlg = findDlg(win);
        if (!dlg)
            throw new Error(`submitDialogMatching: no dialog matching ${text}`);
        const btn = dlg.element.querySelector(
            `button[data-action="${action}"]`,
        );
        if (!btn)
            throw new Error(
                `submitDialogMatching: dialog matching ${text} has no [data-action="${action}"]`,
            );
        btn.click();
        return action;
    });
});
