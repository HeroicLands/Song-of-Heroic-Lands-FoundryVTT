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
import { CREDITS_ACTION, openCreditsJournal } from "./credits";

/**
 * The project's external web destinations, surfaced to the client from
 * `system.json` `flags.sohl` (which the build copies from `package.json` — the
 * single source of truth; see `utils/build-system-json.mjs`).
 */
export interface SystemLinks {
    /** The main site — `package.json` `homepage`. */
    mainSiteUrl: string;
    /** The knowledgebase — `heroicLands.knowledgeBaseUrl`. */
    knowledgeBaseUrl: string;
    /** The generated API docs for *this* version — `…/v<version>`. */
    apiDocsUrl: string;
    /** The GitHub issue tracker — `package.json` `bugs`. */
    issuesUrl: string;
    /** The community Discord invite — `heroicLands.discordInviteUrl`. */
    discordInviteUrl: string;
    /**
     * The Credits & Attributions JournalEntry — a compendium UUID rather than a
     * URL, stamped at build time from the content note (see
     * `utils/build-system-json.mjs`). It shares this block because it is read
     * from the same `flags.sohl` manifest key.
     */
    creditsUuid: string;
}

/**
 * The system identity and links read from `game.system` at render time (via
 * `fvttSystemLinks`). Kept Foundry-free so the context builder below can
 * be exercised in Node.
 */
export interface SohlSystemInfo {
    /** The system title (`game.system.title`). */
    title: string;
    /** The running system version (`game.system.version`). */
    version: string;
    /** The external destinations, from `game.system.flags.sohl`. */
    links: SystemLinks;
}

/** The section template rendered into the settings sidebar. */
export const SETTINGS_LINKS_TEMPLATE = "systems/sohl/templates/apps/settings-links.hbs";

/** Marker attribute used to guard against injecting the section twice. */
export const SETTINGS_LINKS_MARKER = "data-sohl-links";

/**
 * The coiled-dragon emblem. Ships as a solid black SVG under `assets/icons/`,
 * which the build (`package-build assets` → `svg-theme.mjs`) recolors to adapt to
 * light/dark mode, so the same mark reads as ink on the light settings sidebar
 * and cream on the dark one.
 *
 * Note: this emblem is the Heroic Lands **service mark** — © Tom Rodriguez, All
 * Rights Reserved, and excepted from the CC-BY-SA-4.0 asset license. See the
 * Trademarks & Service Marks section of LICENSE.md (and
 * assets/icons/brand/NOTICE.md). Do not relicense or repurpose it.
 */
export const SOHL_EMBLEM_PATH = "systems/sohl/assets/icons/brand/sohl-dragon.svg";

/**
 * The inline entries, in display order, each paired with its `lang/en.json`
 * label key and the {@link SystemLinks} field it depends on.
 *
 * An entry with an `action` is an **in-app** command rendered as a button; one
 * without is an external destination rendered as a new-tab anchor. Either way
 * the entry is dropped when its `key` resolves to an empty string, so a missing
 * manifest value never renders a dead control.
 */
export const SETTINGS_LINK_ORDER: ReadonlyArray<{
    labelKey: string;
    key: keyof SystemLinks;
    action?: string;
}> = [
    { labelKey: "SOHL.Settings.HeroicLands.mainSite", key: "mainSiteUrl" },
    {
        labelKey: "SOHL.Settings.HeroicLands.knowledgebase",
        key: "knowledgeBaseUrl",
    },
    { labelKey: "SOHL.Settings.HeroicLands.apiDocs", key: "apiDocsUrl" },
    { labelKey: "SOHL.Settings.HeroicLands.issues", key: "issuesUrl" },
    { labelKey: "SOHL.Settings.HeroicLands.discord", key: "discordInviteUrl" },
    {
        labelKey: "SOHL.Settings.HeroicLands.credits",
        key: "creditsUuid",
        action: CREDITS_ACTION,
    },
] as const;

/** The render context for {@link SETTINGS_LINKS_TEMPLATE}. */
export interface SettingsLinksContext {
    /** The section heading — the system title. */
    title: string;
    /** The running version, shown beneath the emblem. */
    version: string;
    /** The emblem image path. */
    emblem: string;
    /**
     * Each inline entry's resolved label and either its destination URL (an
     * external link) or its `data-action` (an in-app command).
     */
    links: Array<{ label: string; url?: string; action?: string }>;
}

/**
 * Build the localized render context for the branded "Game System" section.
 *
 * Pure — the caller supplies the system read (`fvttSystemLinks` in
 * production) and the localizer (`game.i18n.localize`), so this has no Foundry
 * dependency. A link whose URL is absent is dropped rather than rendered as an
 * empty anchor.
 *
 * @param system - The system identity and links (from `game.system`).
 * @param localize - Resolves a `lang/en.json` key to display text.
 * @returns The section title, version, emblem path, and resolved links.
 */
export function buildSettingsLinksContext(
    system: SohlSystemInfo,
    localize: (key: string) => string,
): SettingsLinksContext {
    return {
        title: system.title || localize("SOHL.Settings.HeroicLands.title"),
        version: system.version,
        emblem: SOHL_EMBLEM_PATH,
        links: SETTINGS_LINK_ORDER.filter(({ key }) => !!system.links[key]).map(
            ({ labelKey, key, action }) =>
                action ?
                    { label: localize(labelKey), action }
                :   { label: localize(labelKey), url: system.links[key] },
        ),
    };
}

/**
 * Render the branded "Game System" section and inject it into the Game
 * Settings sidebar tab, mirroring how other systems (dnd5e, SWADE) present
 * themselves there: a native `section` + `h4.divider` header, the SoHL emblem,
 * the version, and a compact row of external links.
 *
 * Placed immediately after Foundry's own info block (`section.info`) and before
 * the Settings block, matching dnd5e's placement. Foundry's native system-info
 * row (`section.info .system`, which repeats the title + version) is removed
 * **only after** our section successfully injects, so the version never
 * disappears if rendering fails.
 *
 * Idempotent: a second render of the same sidebar is ignored via the
 * {@link SETTINGS_LINKS_MARKER} guard.
 *
 * @param element - The rendered settings-tab root element.
 * @param system - The system identity and links (from `fvttSystemLinks`).
 * @param localize - Resolves `lang/en.json` keys (`game.i18n.localize`).
 */
export async function injectSettingsLinks(
    element: HTMLElement,
    system: SohlSystemInfo,
    localize: (key: string) => string,
): Promise<void> {
    if (element.querySelector(`[${SETTINGS_LINKS_MARKER}]`)) return;

    const html = await toHTMLWithTemplate(
        toFilePath(SETTINGS_LINKS_TEMPLATE),
        buildSettingsLinksContext(system, localize),
    );

    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const section = template.content.firstElementChild;
    if (!section) return;

    // Guard again in case a concurrent render slipped in while awaiting.
    if (element.querySelector(`[${SETTINGS_LINKS_MARKER}]`)) return;

    // Place after core's info block (title / build / system / modules) — before
    // the Settings block — so the branding sits at the top of the tab. Fall back
    // to appending if the expected structure is absent.
    const info = element.querySelector("section.info");
    if (info) info.after(section);
    else element.appendChild(section);

    // The credits entry is a command, not a navigation, so it needs a handler.
    // Delegated from the injected section rather than bound per button, and
    // scoped to that section so it cannot intercept a core sidebar click.
    section.addEventListener("click", (ev) => {
        const button = (ev.target as HTMLElement | null)?.closest?.(
            `[data-action="${CREDITS_ACTION}"]`,
        );
        if (!button) return;
        ev.preventDefault();
        void openCreditsJournal(system.links.creditsUuid);
    });

    // Our section now shows the title + version, so retire core's redundant
    // system row. Done last, so a failed inject above leaves it in place.
    element.querySelector("section.info .system")?.remove();
}
