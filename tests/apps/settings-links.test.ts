/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The "Song of Heroic Lands" links section injected into the Game Settings
 * sidebar tab. The link table and its localized context builder are pure, and
 * the section template renders in Node — so both are asserted here (the DOM
 * injection into the live sidebar is an e2e concern).
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import {
    SETTINGS_SIDEBAR_LINKS,
    SETTINGS_LINKS_TEMPLATE,
    buildSettingsLinksContext,
} from "@src/apps/foundry/settings-sidebar-links";

/** Identity localizer — returns the key so assertions can match on keys. */
const idLocalize = (key: string) => key;

describe("settings sidebar links — link table", () => {
    it("defines exactly the three project links, in order", () => {
        expect(SETTINGS_SIDEBAR_LINKS.map((l) => l.url)).toEqual([
            "https://www.heroiclands.org/",
            "https://kb.heroiclands.org/",
            "https://api.heroiclands.org/latest",
        ]);
    });

    it("every link carries a label key and a Font Awesome icon", () => {
        for (const link of SETTINGS_SIDEBAR_LINKS) {
            expect(link.labelKey).toMatch(/^SOHL\.Settings\.HeroicLands\./);
            expect(link.icon).toMatch(/^fa-/);
        }
    });
});

describe("settings sidebar links — context builder", () => {
    it("localizes the title and every link label", () => {
        const ctx = buildSettingsLinksContext(idLocalize);
        expect(ctx.title).toBe("SOHL.Settings.HeroicLands.title");
        expect(ctx.links).toHaveLength(3);
        expect(ctx.links[0]).toMatchObject({
            label: "SOHL.Settings.HeroicLands.mainSite",
            url: "https://www.heroiclands.org/",
        });
        expect(ctx.links[2].url).toBe("https://api.heroiclands.org/latest");
    });

    it("resolves real labels through a localizer", () => {
        const ctx = buildSettingsLinksContext((k) =>
            k === "SOHL.Settings.HeroicLands.title" ?
                "Song of Heroic Lands"
            :   k,
        );
        expect(ctx.title).toBe("Song of Heroic Lands");
    });
});

describe("settings sidebar links — rendered section", () => {
    const html = renderTemplateReal(SETTINGS_LINKS_TEMPLATE, {
        ...buildSettingsLinksContext(idLocalize),
    });

    it("uses Foundry's native sidebar section markup", () => {
        // Same classes core's own Documentation block uses, so it inherits the
        // native styling rather than looking bolted on.
        expect(html).toContain('class="documentation flexcol"');
        expect(html).toContain('<h4 class="divider">');
    });

    it("carries an idempotency marker for double-injection guarding", () => {
        expect(html).toContain("data-sohl-links");
    });

    it("renders each link as a native anchor button opening a new tab", () => {
        for (const link of SETTINGS_SIDEBAR_LINKS) {
            expect(html).toContain(`href="${link.url}"`);
            expect(html).toContain(link.icon);
        }
        // three anchor buttons, all new-tab + no-opener
        const anchors = html.match(/<a class="button"/g) ?? [];
        expect(anchors).toHaveLength(3);
        expect(html).not.toContain('target="_self"');
        expect(html.match(/target="_blank"/g) ?? []).toHaveLength(3);
        expect(html.match(/rel="noopener/g) ?? []).toHaveLength(3);
    });
});
