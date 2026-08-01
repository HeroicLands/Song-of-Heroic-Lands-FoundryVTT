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

import { toFilePath } from "@src/utils/helpers";
import { toHTMLWithTemplate } from "@src/core/FoundryHelpers";

/**
 * A single external project link shown in the settings-sidebar section.
 */
export interface SettingsSidebarLink {
    /** `lang/en.json` key for the button label. */
    labelKey: string;
    /** Absolute destination URL, opened in a new browser tab. */
    url: string;
    /** Font Awesome class (without the `fa-solid` style prefix). */
    icon: string;
}

/** The section template rendered into the settings sidebar. */
export const SETTINGS_LINKS_TEMPLATE =
    "systems/sohl/templates/apps/settings-links.hbs";

/** Marker attribute used to guard against injecting the section twice. */
export const SETTINGS_LINKS_MARKER = "data-sohl-links";

/**
 * The project's always-available web destinations, in display order: the main
 * site, the knowledgebase, and the generated API documentation.
 */
export const SETTINGS_SIDEBAR_LINKS: readonly SettingsSidebarLink[] = [
    {
        labelKey: "SOHL.Settings.HeroicLands.mainSite",
        url: "https://www.heroiclands.org/",
        icon: "fa-house",
    },
    {
        labelKey: "SOHL.Settings.HeroicLands.knowledgebase",
        url: "https://kb.heroiclands.org/",
        icon: "fa-book",
    },
    {
        labelKey: "SOHL.Settings.HeroicLands.apiDocs",
        url: "https://api.heroiclands.org/latest",
        icon: "fa-code",
    },
] as const;

/** The render context for {@link SETTINGS_LINKS_TEMPLATE}. */
export interface SettingsLinksContext {
    title: string;
    links: Array<{ label: string; url: string; icon: string }>;
}

/**
 * Build the localized render context for the settings-sidebar links section.
 *
 * Pure — the caller supplies the localizer (Foundry's `game.i18n.localize` in
 * production, an identity function in tests), so this has no Foundry dependency.
 *
 * @param localize - Resolves a `lang/en.json` key to display text.
 * @returns The section title and each link's resolved label, URL, and icon.
 */
export function buildSettingsLinksContext(
    localize: (key: string) => string,
): SettingsLinksContext {
    return {
        title: localize("SOHL.Settings.HeroicLands.title"),
        links: SETTINGS_SIDEBAR_LINKS.map((link) => ({
            label: localize(link.labelKey),
            url: link.url,
            icon: link.icon,
        })),
    };
}

/**
 * Render the "Song of Heroic Lands" links section and inject it into the Game
 * Settings sidebar tab, mirroring Foundry's own Documentation block so it reads
 * as a native part of the tab.
 *
 * Idempotent: a second render of the same sidebar (Foundry re-renders it on
 * various events) is ignored via the {@link SETTINGS_LINKS_MARKER} guard. The
 * section is placed immediately after core's Documentation block when present,
 * otherwise appended to the sidebar root.
 *
 * @param element - The rendered settings-tab root element.
 * @param localize - Resolves `lang/en.json` keys (`game.i18n.localize`).
 */
export async function injectSettingsLinks(
    element: HTMLElement,
    localize: (key: string) => string,
): Promise<void> {
    if (element.querySelector(`[${SETTINGS_LINKS_MARKER}]`)) return;

    const html = await toHTMLWithTemplate(
        toFilePath(SETTINGS_LINKS_TEMPLATE),
        buildSettingsLinksContext(localize),
    );

    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const section = template.content.firstElementChild;
    if (!section) return;

    // Guard again in case a concurrent render slipped in while awaiting.
    if (element.querySelector(`[${SETTINGS_LINKS_MARKER}]`)) return;

    const coreDocs = element.querySelector(
        "section.documentation:not([" + SETTINGS_LINKS_MARKER + "])",
    );
    if (coreDocs) coreDocs.after(section);
    else element.appendChild(section);
}
