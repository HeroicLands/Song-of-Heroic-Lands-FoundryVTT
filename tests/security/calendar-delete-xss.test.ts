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
 * Security regression tests for issue #163:
 * XSS in CalendarSettingsMenu delete-confirm dialog via imported calendar name.
 *
 * `cal.label` comes verbatim from an imported JSON file; `game.i18n.format`
 * does no HTML escaping. The fix wraps the label with `foundry.utils.escapeHTML`
 * before substitution.
 */
import { describe, it, expect } from "vitest";

const XSS_NAME = "<img src=x onerror=alert(1)>";
const XSS_CLOSE_P = "</p><img src=x onerror=alert(1)><p>";

/**
 * Simulate the key expression from _onDeleteCalendar:
 *   foundry.utils.escapeHTML(game.i18n.localize(cal.label))
 *
 * `sohl.i18n.localize` stands in for `game.i18n.localize` — both return the
 * key unchanged in tests when no translation entry exists, which mirrors the
 * real behaviour for imported calendar names (they are arbitrary strings, not
 * i18n keys).
 */
function escapedLabel(calLabel: string): string {
    return foundry.utils.escapeHTML(sohl.i18n.localize(calLabel));
}

describe("CalendarSettingsMenu _onDeleteCalendar escaping (#163)", () => {
    it("escapes XSS tag in calendar label before it reaches i18n.format", () => {
        const safe = escapedLabel(XSS_NAME);
        expect(safe).not.toContain("<img");
        expect(safe).toContain("&lt;img");
        // Verify the escaped value is safe when interpolated into any HTML context
        const content = `<p>Delete ${safe}?</p>`;
        expect(content).not.toContain("<img");
    });

    it("escapes paragraph-break injection in calendar label", () => {
        const safe = escapedLabel(XSS_CLOSE_P);
        expect(safe).not.toContain("</p>");
        expect(safe).toContain("&lt;/p&gt;");
        expect(safe).not.toContain("<img");
    });

    it("plain calendar name is preserved unchanged by escapeHTML", () => {
        const safe = escapedLabel("Harnworld Standard");
        expect(safe).toBe("Harnworld Standard");
    });

    it("localize returns the label unchanged for non-key strings; escapeHTML still applies", () => {
        // `sohl.i18n.localize` returns the key unchanged when no translation exists.
        // Imported calendar names are arbitrary strings (not i18n keys), so this
        // verifies that the escape wraps the full localized value.
        const safe = escapedLabel("<b>Bold</b>");
        expect(safe).not.toContain("<b>");
        expect(safe).toContain("&lt;b&gt;");
    });
});
