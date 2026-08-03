/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real fenced-banner partial in Node (no Foundry) and assert its
 * emitted HTML — the dismissible "Experimental — schema not final" notice shown
 * on fenced actor sheets (issue #959). Uses the shared render harness
 * ({@link renderTemplateReal}), which registers the same helpers production does.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const BANNER = "systems/sohl/templates/actor/parts/fenced-banner.hbs";

describe("fenced-banner partial", () => {
    it("renders the experimental notice + dismiss control when isFenced", () => {
        const html = renderTemplateReal(BANNER, { isFenced: true });
        // Localized title + body (from lang/en.json, via the harness localizer).
        expect(html).toContain("Experimental — schema not final");
        expect(html).toContain("not final");
        // The dismiss control carries the stable sheet-action handle.
        expect(html).toContain('data-action="dismissFenceNotice"');
        expect(html).toContain('class="fence-banner"');
    });

    it("renders nothing when the type is not fenced", () => {
        const html = renderTemplateReal(BANNER, { isFenced: false });
        expect(html.trim()).toBe("");
        expect(html).not.toContain("fence-banner");
    });
});
