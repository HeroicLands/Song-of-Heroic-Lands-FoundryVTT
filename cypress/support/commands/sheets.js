/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Sheet (ApplicationV2) commands: render a document's sheet and wait for its
 * root element, switch tabs, and close all open windows between tests. Used for
 * structural DOM verification (a tab activates, a row renders) — not appearance.
 */

import { resolveDoc } from "../resolve.js";

/**
 * Render a document's sheet and yield its root element (waited visible).
 * Yields the live AUT-window element, so `.find(...)` scopes to this sheet.
 */
Cypress.Commands.add("openSheet", (doc) =>
    cy
        .foundry(async (win) => {
            const d = resolveDoc(win, doc);
            await d.sheet.render(true);
            return d.sheet.element;
        })
        .then((el) => cy.wrap(el, { log: false }).should("be.visible")),
);

/**
 * Click a tab in an open sheet and assert its content section activates.
 *
 * @param {string} tabId - the tab's `data-tab` id.
 * @param {string} [group] - the tab group (`"primary"` for actors, `"sheet"`
 *   for items).
 */
Cypress.Commands.add("switchTab", (tabId, group = "primary") => {
    // A tab id can appear on more than one nav control (e.g. a duplicated
    // nav); `.first()` clicks the primary one. The content section is unique.
    cy.get(`[data-action="tab"][data-group="${group}"][data-tab="${tabId}"]`)
        .first()
        .click({ force: true });
    return cy
        .get(`section.tab[data-group="${group}"][data-tab="${tabId}"]`)
        .should("have.class", "active");
});

/**
 * Edit a field on a document's (open) sheet and persist it via the sheet's
 * `submitOnChange` handler — exactly the "edit → blur → save, no button" flow.
 *
 * Queries the field WITHIN the document's own sheet element and dispatches a
 * native bubbling `change`; this is far more reliable than a document-level
 * `cy.get` + synthetic typing, which can target a detached/duplicate element.
 * Resolves after the update settles, so a following read sees the new value.
 *
 * @param {object|string} doc - the document (or id) whose sheet is edited.
 * @param {string} name - the field's `name` attribute (e.g. `system.quantity`).
 * @param {string|number|boolean} value - the value to set.
 */
Cypress.Commands.add("editSheetField", (doc, name, value) =>
    cy.foundry(async (win) => {
        const d = resolveDoc(win, doc);
        if (!d.sheet.rendered) await d.sheet.render(true);
        await new Promise((r) => setTimeout(r, 150));
        const el = d.sheet.element.querySelector(`[name="${name}"]`);
        if (!el) throw new Error(`No field '${name}' on ${d.name}'s sheet`);
        const w = el.ownerDocument.defaultView;
        if (el.type === "checkbox") el.checked = Boolean(value);
        else el.value = String(value);
        el.dispatchEvent(new w.Event("change", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 250));
        return true;
    }),
);

/** Close every open ApplicationV2 (and legacy) window (resets DOM between tests). */
Cypress.Commands.add("closeAllSheets", () =>
    cy.foundry(async (win) => {
        const inst = win.foundry?.applications?.instances;
        // `inst` is an AUT-realm Map; `instanceof Map` (support realm) is false
        // cross-realm, so duck-type on `.values` instead of Object.values (which
        // returns [] for a Map).
        const apps =
            inst && typeof inst.values === "function" ?
                Array.from(inst.values())
            :   Object.values(inst ?? {});
        // Sheets are the closeable windows; skip the persistent UI (sidebar,
        // hotbar, nav) so we don't tear down the client chrome.
        for (const app of apps) {
            if (app?.document || app?.object?.documentName) {
                try {
                    await app.close({ animate: false });
                } catch {
                    /* already closing */
                }
            }
        }
        // Legacy ApplicationV1 windows (if any).
        for (const w of Object.values(win.ui?.windows ?? {})) {
            try {
                await w.close();
            } catch {
                /* ignore */
            }
        }
        return true;
    }),
);
