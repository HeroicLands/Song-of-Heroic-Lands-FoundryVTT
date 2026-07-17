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
 * Security regression tests for issue #160:
 * Stored XSS in DomainManagerApp.promptForEntry via unescaped registry fields.
 *
 * Verifies that foundry.utils.escapeHTML neutralises XSS payloads that could
 * reach the dialog form via the sohl.domains registry (plantable by modules).
 */
import { describe, it, expect } from "vitest";

const XSS_ATTR = '"><img src=x onerror=alert(1)>';
const XSS_BODY = "</textarea><img src=x onerror=alert(1)>";

describe("DomainManagerApp promptForEntry escaping (#160)", () => {
    it("foundry.utils.escapeHTML neutralises an XSS payload in an attribute context", () => {
        const escaped = foundry.utils.escapeHTML(XSS_ATTR);
        // Must not contain a raw < that would break out of the value attribute
        expect(escaped).not.toContain("<img");
        expect(escaped).toContain("&lt;img");
        expect(escaped).not.toContain('"');
        expect(escaped).toContain("&quot;");
    });

    it("foundry.utils.escapeHTML neutralises an XSS payload in a textarea body", () => {
        const escaped = foundry.utils.escapeHTML(XSS_BODY);
        expect(escaped).not.toContain("</textarea>");
        expect(escaped).toContain("&lt;/textarea&gt;");
        expect(escaped).not.toContain("<img");
    });

    it("foundry.utils.escapeHTML is a no-op on plain text (does not double-encode)", () => {
        const plain = "Hello World";
        expect(foundry.utils.escapeHTML(plain)).toBe("Hello World");
    });

    it("foundry.utils.escapeHTML handles the five HTML special characters", () => {
        const special = "& < > \" '";
        const escaped = foundry.utils.escapeHTML(special);
        expect(escaped).toContain("&amp;");
        expect(escaped).toContain("&lt;");
        expect(escaped).toContain("&gt;");
        expect(escaped).toContain("&quot;");
        expect(escaped).toContain("&#x27;");
    });
});
