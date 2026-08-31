/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The branded "Game System" section injected into the Game Settings sidebar
 * tab (issue #915). The context builder is pure and the section template
 * renders in Node, so both are asserted here; the DOM injection into the live
 * sidebar — and removal of Foundry's native system row — is an e2e concern.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { CREDITS_ACTION } from "@src/apps/foundry/credits";
import {
    SETTINGS_LINK_ORDER,
    SETTINGS_LINKS_TEMPLATE,
    SOHL_EMBLEM_PATH,
    buildSettingsLinksContext,
    type SohlSystemInfo,
} from "@src/apps/foundry/settings-sidebar-links";

/** Identity localizer — returns the key so assertions can match on keys. */
const idLocalize = (key: string) => key;

/** A representative `game.system` read (as the shim would return it). */
const SYSTEM: SohlSystemInfo = {
    title: "Song of Heroic Lands",
    version: "0.7.0",
    links: {
        mainSiteUrl: "https://www.heroiclands.org/",
        knowledgeBaseUrl: "https://www.heroiclands.org/sohl/kb/",
        apiDocsUrl: "https://www.heroiclands.org/sohl/api/",
        issuesUrl: "https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues",
        discordInviteUrl: "https://discord.gg/EwMfkNd3az/",
        creditsUuid: "Compendium.sohl.journals.JournalEntry.VCCHelr5qIC5ydop",
    },
};

describe("settings sidebar — link order", () => {
    it("lists the entries in display order, credits last", () => {
        expect(SETTINGS_LINK_ORDER.map((l) => l.key)).toEqual([
            "mainSiteUrl",
            "knowledgeBaseUrl",
            "apiDocsUrl",
            "issuesUrl",
            "discordInviteUrl",
            "creditsUuid",
        ]);
    });

    it("marks credits as an in-app action, and nothing else", () => {
        // Credits opens a sheet in the client; the other five open a browser
        // tab. The distinction is what decides button vs anchor in the template.
        const actions = SETTINGS_LINK_ORDER.filter((l) => l.action);
        expect(actions).toHaveLength(1);
        expect(actions[0]).toMatchObject({
            key: "creditsUuid",
            action: CREDITS_ACTION,
        });
    });

    it("every link carries a HeroicLands label key", () => {
        for (const link of SETTINGS_LINK_ORDER) {
            expect(link.labelKey).toMatch(/^SOHL\.Settings\.HeroicLands\./);
        }
    });
});

describe("settings sidebar — context builder", () => {
    it("carries the system title, version, and emblem path", () => {
        const ctx = buildSettingsLinksContext(SYSTEM, idLocalize);
        expect(ctx.title).toBe("Song of Heroic Lands");
        expect(ctx.version).toBe("0.7.0");
        expect(ctx.emblem).toBe(SOHL_EMBLEM_PATH);
    });

    it("localizes each link label and preserves the source URLs in order", () => {
        const ctx = buildSettingsLinksContext(SYSTEM, idLocalize);
        expect(ctx.links).toEqual([
            {
                label: "SOHL.Settings.HeroicLands.mainSite",
                url: SYSTEM.links.mainSiteUrl,
            },
            {
                label: "SOHL.Settings.HeroicLands.knowledgebase",
                url: SYSTEM.links.knowledgeBaseUrl,
            },
            {
                label: "SOHL.Settings.HeroicLands.apiDocs",
                url: SYSTEM.links.apiDocsUrl,
            },
            {
                label: "SOHL.Settings.HeroicLands.issues",
                url: SYSTEM.links.issuesUrl,
            },
            {
                label: "SOHL.Settings.HeroicLands.discord",
                url: SYSTEM.links.discordInviteUrl,
            },
            {
                label: "SOHL.Settings.HeroicLands.credits",
                action: CREDITS_ACTION,
            },
        ]);
    });

    it("gives the credits entry an action and no URL", () => {
        const ctx = buildSettingsLinksContext(SYSTEM, idLocalize);
        const credits = ctx.links.at(-1);
        expect(credits?.action).toBe(CREDITS_ACTION);
        expect(credits?.url).toBeUndefined();
    });

    it("omits credits when the manifest carries no UUID", () => {
        // A build that failed to stamp `flags.sohl.creditsUuid` must render no
        // entry rather than a button that quietly does nothing.
        const noCredits: SohlSystemInfo = {
            ...SYSTEM,
            links: { ...SYSTEM.links, creditsUuid: "" },
        };
        const ctx = buildSettingsLinksContext(noCredits, idLocalize);
        expect(ctx.links).toHaveLength(5);
        expect(ctx.links.some((l) => l.action)).toBe(false);
    });

    it("surfaces the API docs URL as given, composing nothing", () => {
        // One unversioned tree is published, for the newest release (#1452), so
        // there is no per-version address to build — the manifest's value is
        // the link. The assertion is that nothing is appended to it.
        const ctx = buildSettingsLinksContext(SYSTEM, idLocalize);
        const api = ctx.links.find((l) => l.label === "SOHL.Settings.HeroicLands.apiDocs");
        expect(api?.url).toBe("https://www.heroiclands.org/sohl/api/");
        expect(api?.url).not.toMatch(/\/(latest|main|v\d)/);
    });

    it("omits a link whose URL is absent rather than rendering an empty href", () => {
        const noDiscord: SohlSystemInfo = {
            ...SYSTEM,
            links: { ...SYSTEM.links, discordInviteUrl: "" },
        };
        const ctx = buildSettingsLinksContext(noDiscord, idLocalize);
        expect(ctx.links).toHaveLength(5);
        expect(ctx.links.some((l) => l.label === "SOHL.Settings.HeroicLands.discord")).toBe(false);
    });

    it("falls back to the localized title when system.title is empty", () => {
        const noTitle: SohlSystemInfo = { ...SYSTEM, title: "" };
        const ctx = buildSettingsLinksContext(noTitle, idLocalize);
        expect(ctx.title).toBe("SOHL.Settings.HeroicLands.title");
    });
});

describe("settings sidebar — rendered branded section", () => {
    const html = renderTemplateReal(SETTINGS_LINKS_TEMPLATE, {
        ...buildSettingsLinksContext(SYSTEM, idLocalize),
    });

    it("is a branded 'game system' section carrying the idempotency marker", () => {
        expect(html).toContain("sohl-game-system");
        expect(html).toContain("data-sohl-links");
    });

    it("renders the title in a native divider header", () => {
        expect(html).toContain('<h4 class="divider">');
        expect(html).toContain("Song of Heroic Lands");
    });

    it("shows the coiled-dragon emblem and the version", () => {
        expect(html).toContain(`src="${SOHL_EMBLEM_PATH}"`);
        expect(html).toContain("0.7.0");
    });

    it("renders each external destination as a new-tab anchor", () => {
        for (const url of [
            SYSTEM.links.mainSiteUrl,
            SYSTEM.links.apiDocsUrl,
            SYSTEM.links.discordInviteUrl,
        ]) {
            expect(html).toContain(`href="${url}"`);
        }
        // Five inline anchors, every one a safe new-tab link.
        const anchors = html.match(/<a\b/g) ?? [];
        expect(anchors).toHaveLength(5);
        expect(html.match(/target="_blank"/g) ?? []).toHaveLength(5);
        expect(html.match(/rel="noopener/g) ?? []).toHaveLength(5);
        // The old full-width button treatment is still gone — the credits
        // button below is an inline sibling of these anchors, not a revival
        // of it.
        expect(html).not.toContain('class="button"');
    });

    it("renders credits as a button, since it opens a sheet rather than a tab", () => {
        const buttons = html.match(/<button\b/g) ?? [];
        expect(buttons).toHaveLength(1);
        expect(html).toContain(`data-action="${CREDITS_ACTION}"`);
        expect(html).toContain('type="button"');
        // It carries no href — it is not a navigation.
        expect(html).not.toMatch(/<button[^>]*href=/);
    });
});
