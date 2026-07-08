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

// Loaded before every spec. Registers custom commands (e.g. cy.login()).
import "./commands.js";
import "./commands/documents.js";
import "./commands/import.js";
import "./logic.js";
import "./commands/sheets.js";
import "./commands/scene.js";
import "./commands/combat.js";
import "./commands/dialogs.js";

/**
 * Ignore known-benign async exceptions thrown by Foundry CORE (foundry.mjs) that
 * originate from UI rendering in the headless test browser (no canvas/viewport),
 * not from system behavior under test. Kept to an explicit allowlist of exact
 * messages so any other uncaught error still fails the spec.
 *
 * - CombatTracker._onRender: "Cannot use 'in' operator to search for 'turn' in
 *   undefined" — the sidebar combat tracker re-renders on combat changes but has
 *   no active viewport in headless runs. Unrelated to combat data/logic.
 */
const IGNORED_APP_ERRORS = [
    /Cannot use 'in' operator to search for 'turn' in undefined/,
];

Cypress.on("uncaught:exception", (err) => {
    if (IGNORED_APP_ERRORS.some((re) => re.test(err?.message ?? ""))) {
        return false; // do not fail the test
    }
    return true;
});
