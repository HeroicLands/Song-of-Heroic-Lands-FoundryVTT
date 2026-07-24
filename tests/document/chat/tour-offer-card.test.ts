/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real tour-offer chat card in Node (no Foundry) and assert its HTML —
 * the card `registerSystemTours` whispers to a user on first run. The Start button
 * must carry the stable `data-sohl-tour-start` handle keyed to the tour id, which
 * the delegated click handler reads to launch the tour.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const CHAT = "systems/sohl/templates/chat";

describe("tour-offer-card", () => {
    it("renders the offer text and a Start button keyed to the tour id", () => {
        const html = renderTemplateReal(`${CHAT}/tour-offer-card.hbs`, {
            title: "Welcome to Song of Heroic Lands",
            content: "Take the Create a Character guided tour.",
            startLabel: "Start the tour",
            tourId: "sohl.character-creation",
        });
        expect(html).toContain("Welcome to Song of Heroic Lands");
        expect(html).toContain("Take the Create a Character guided tour.");
        expect(html).toContain("Start the tour");
        // The stable handle the delegated launcher reads.
        expect(html).toContain(
            'data-sohl-tour-start="sohl.character-creation"',
        );
        // Inside the card-buttons region so client gating/dispatch can find it.
        expect(html).toContain("card-buttons");
    });

    it("renders inline markup in the content as HTML, not escaped text", () => {
        const html = renderTemplateReal(`${CHAT}/tour-offer-card.hbs`, {
            title: "Welcome to Song of Heroic Lands",
            content:
                "New here? Take the <strong>Create a Character</strong> guided tour — start it any time from <em>Settings → Tour Management</em>.",
            startLabel: "Start the tour",
            tourId: "sohl.character-creation",
        });
        // The localized content carries <strong>/<em> markup; it must reach the
        // DOM as real tags, not HTML-escaped literals shown to the reader.
        expect(html).toContain("<strong>Create a Character</strong>");
        expect(html).toContain("<em>Settings → Tour Management</em>");
        expect(html).not.toContain("&lt;strong&gt;");
        expect(html).not.toContain("&lt;em&gt;");
    });
});
