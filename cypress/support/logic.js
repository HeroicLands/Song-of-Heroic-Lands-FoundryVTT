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
 * Logic-layer assertion helpers. Every SoHL document carries a Foundry-free
 * `.logic` object with computed state and an `.actions` map. These commands
 * centralize reaching that layer so specs read declaratively. Computed values
 * are only valid after the `initialize → evaluate → finalize` lifecycle; use
 * `cy.prepare` to force a re-derive after mutating embedded items.
 */

import { resolveDoc } from "./resolve.js";

/** Re-derive a document's data (re-runs the logic lifecycle); yields `.logic`. */
Cypress.Commands.add("prepare", (doc) =>
    cy.foundry((win) => {
        const d = resolveDoc(win, doc);
        d.reset?.();
        d.prepareData?.();
        return d.logic;
    }),
);

/** Yield an actor's `.logic`. */
Cypress.Commands.add("actorLogic", (actor) =>
    cy.foundry((win) => resolveDoc(win, actor)?.logic),
);

/** Yield an item's `.logic`. */
Cypress.Commands.add("itemLogic", (item) =>
    cy.foundry((win) => resolveDoc(win, item)?.logic),
);

/** Yield whether a named action exists on the document's logic. */
Cypress.Commands.add("hasAction", (doc, name) =>
    cy.foundry((win) => !!resolveDoc(win, doc)?.logic?.actions?.get(name)),
);

/**
 * Run a named action (`execute`) and yield its result. Actions are always
 * asynchronous — intrinsics may return a promise, and Script actions run a
 * Foundry Macro. Context defaults to the logic's own `_getContext()`.
 */
Cypress.Commands.add("runAction", (doc, name, ctx) =>
    cy.foundry(async (win) => {
        const d = resolveDoc(win, doc);
        const action = d?.logic?.actions?.get(name);
        if (!action) throw new Error(`No action '${name}' on ${d?.name}`);
        return action.execute(ctx ?? d.logic._getContext());
    }),
);
