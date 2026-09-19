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

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const TEMPLATE = "systems/sohl/templates/actor/parts/facade.hbs";

/** The Facade part context every actor sheet hands this template. */
function context(overrides: Record<string, unknown> = {}) {
    return {
        tab: { group: "primary", active: true },
        actorName: "Aldric of Kaldor",
        document: { uuid: "Actor.aldric" },
        system: { appearance: "<p>A tall, weather-worn man.</p>" },
        ...overrides,
    };
}

describe("facade.hbs", () => {
    it("binds the appearance editor to system.appearance", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toContain('<prose-mirror name="system.appearance"');
        expect(html).toContain("A tall, weather-worn man.");
        expect(html).toContain('data-document-uuid="Actor.aldric"');
    });

    it("labels the appearance column from the field's own localization key", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        // `localize` resolves against the real lang/en.json.
        expect(html).toContain("Appearance");
    });

    it("carries no image of its own — a being's portrait is the lead image of its appearance prose", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).not.toContain("<img");
        expect(html).not.toContain("facade__image");
        expect(html).not.toContain("facade__portrait");
        expect(html).not.toContain("system.portrait");
    });

    it("carries the tab bindings the sheet's tab group needs", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toContain('data-tab="facade"');
        expect(html).toContain('data-group="primary"');
        expect(html).toContain("tab facade active");

        const inactive = renderTemplateReal(
            TEMPLATE,
            context({ tab: { group: "primary", active: false } }),
        );
        expect(inactive).not.toContain("tab facade active");
    });
});
