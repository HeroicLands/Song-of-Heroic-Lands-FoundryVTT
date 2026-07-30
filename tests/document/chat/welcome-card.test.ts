/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real welcome chat card in Node (no Foundry) and assert its HTML —
 * the general first-run card `postWelcomeCard` whispers to a user on their first
 * load of a world. It points at the project site, the bundled User Guide, and
 * recommends the guided tours. The Start button carries the stable
 * `data-sohl-tour-start` handle keyed to a tour id, which the delegated click
 * handler reads to launch the tour.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const CHAT = "systems/sohl/templates/chat";

describe("welcome-card", () => {
    it("renders the prominent site link, the tour recommendation, and a Start button", () => {
        const html = renderTemplateReal(`${CHAT}/welcome-card.hbs`, {
            title: "Welcome to Song of Heroic Lands",
            intro: "SoHL assists players and GMs.",
            visitSite: "Visit heroiclands.org",
            moreInfo:
                "Go there for rules and guides — or read the <strong>User Guide</strong> journals.",
            tours: "New here? We highly recommend the guided tours — open <em>Settings → Tour Management</em>.",
            startLabel: "Start the Character Creation tour",
            tourId: "sohl.character-creation",
        });
        expect(html).toContain("Welcome to Song of Heroic Lands");
        // The prominent external link to the project site.
        expect(html).toContain('href="https://www.heroiclands.org/"');
        expect(html).toContain("Visit heroiclands.org");
        // Points readers at the bundled User Guide and the tours.
        expect(html).toContain("User Guide");
        expect(html).toContain("Tour Management");
        expect(html).toContain("Start the Character Creation tour");
        // The stable handle the delegated launcher reads, inside card-buttons.
        expect(html).toContain(
            'data-sohl-tour-start="sohl.character-creation"',
        );
        expect(html).toContain("card-buttons");
    });

    it("renders inline markup in the localized fields as HTML, not escaped text", () => {
        const html = renderTemplateReal(`${CHAT}/welcome-card.hbs`, {
            title: "Welcome to Song of Heroic Lands",
            intro: "SoHL assists players and GMs.",
            visitSite: "Visit heroiclands.org",
            moreInfo:
                "Read the <strong>User Guide</strong> journals in the <em>Journals</em> compendium.",
            tours: "Open any tour from <em>Settings → Tour Management</em>.",
            startLabel: "Start the Character Creation tour",
            tourId: "sohl.character-creation",
        });
        // The localized fields carry <strong>/<em> markup; it must reach the DOM
        // as real tags, not HTML-escaped literals shown to the reader.
        expect(html).toContain("<strong>User Guide</strong>");
        expect(html).toContain("<em>Journals</em>");
        expect(html).toContain("<em>Settings → Tour Management</em>");
        expect(html).not.toContain("&lt;strong&gt;");
        expect(html).not.toContain("&lt;em&gt;");
    });
});
