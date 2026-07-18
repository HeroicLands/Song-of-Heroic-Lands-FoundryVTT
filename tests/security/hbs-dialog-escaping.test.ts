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
 * Security regression tests for issues #159 and #164:
 * Handlebars SSTI/XSS in dialog builders.
 *
 * Verifies that the data-context approach ({{name}} double-stash) auto-escapes
 * attacker-controlled values and that no user data is compiled into template source.
 */
import { describe, it, expect } from "vitest";
import Handlebars from "handlebars";

// XSS payload — an HTML tag that should be escaped to inert text
const XSS_HTML = "<img src=x onerror=alert(1)>";
// SSTI payload — a Handlebars expression that would execute if compiled as template source
const SSTI_HBS = "{{constructor.constructor 'return 1'}}";

describe("Handlebars data-context escaping (#159/#164)", () => {
    describe("double-stash {{}} auto-escapes HTML in data values", () => {
        it("escapes XSS payload in itemName", () => {
            const template = Handlebars.compile(
                "<p>Moving {{itemName}} from {{sourceName}} to {{targetName}}</p>",
            );
            const html = template({
                itemName: XSS_HTML,
                sourceName: "Bag",
                targetName: "Chest",
            });
            expect(html).not.toContain("<img");
            expect(html).toContain("&lt;img");
        });

        it("SSTI payload in data context is not evaluated — rendered as inert text", () => {
            const template = Handlebars.compile(
                "<p>Moving {{itemName}} from {{sourceName}} to {{targetName}}</p>",
            );
            const html = template({
                itemName: SSTI_HBS,
                sourceName: "Bag",
                targetName: "Chest",
            });
            // If SSTI executed, the template would return the constructor call's result
            // (e.g. the function reference or "1"). Instead we get the raw text, proving
            // the value was treated as data, not compiled as template source.
            expect(html).toContain("{{constructor");
            // The text is present but as escaped literal — not as an executed expression
            expect(html).not.toBe("<p>Moving 1 from Bag to Chest</p>");
        });

        it("escapes XSS payload in sourceName", () => {
            const template = Handlebars.compile(
                "<p>Moving {{itemName}} from {{sourceName}} to {{targetName}}</p>",
            );
            const html = template({
                itemName: "Sword",
                sourceName: XSS_HTML,
                targetName: "Chest",
            });
            expect(html).not.toContain("<img");
            expect(html).toContain("&lt;img");
        });

        it("escapes XSS payload in targetName", () => {
            const template = Handlebars.compile(
                "<p>Moving {{itemName}} from {{sourceName}} to {{targetName}}</p>",
            );
            const html = template({
                itemName: "Sword",
                sourceName: "Bag",
                targetName: XSS_HTML,
            });
            expect(html).not.toContain("<img");
            expect(html).toContain("&lt;img");
        });
    });

    describe("_addChoiceArrayItem: Handlebars.escapeExpression escapes option values", () => {
        it("escapes XSS payload in option label", () => {
            const label = XSS_HTML;
            const escaped = Handlebars.escapeExpression(label);
            expect(escaped).not.toContain("<img");
            expect(escaped).toContain("&lt;img");
        });

        it("escapes XSS payload in option value attribute", () => {
            const val = '"><img src=x onerror=alert(1)>';
            const escaped = Handlebars.escapeExpression(val);
            expect(escaped).not.toContain("<img");
            expect(escaped).toContain("&lt;img");
            expect(escaped).not.toContain('"');
        });
    });

    describe("selectArray helper: option.value is escaped", () => {
        it("Handlebars.escapeExpression escapes XSS in value attribute", () => {
            const dangerous = '"><script>alert(1)</script>';
            const escaped = Handlebars.escapeExpression(dangerous);
            expect(escaped).not.toContain("<script");
            expect(escaped).not.toContain('"');
        });
    });
});
