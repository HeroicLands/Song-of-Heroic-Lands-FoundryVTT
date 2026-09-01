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

import {
    fvttPackageCreditsUuid,
    fvttRenderSheet,
    fvttResolveUuidAsync,
} from "@src/core/FoundryHelpers";

/**
 * The sidebar button's `data-action`, namespaced so it cannot collide with one
 * of core's own settings-tab actions.
 */
export const CREDITS_ACTION = "sohlOpenCredits";

/**
 * The settings-menu key each package registers its credits button under.
 *
 * Stable by contract: a registered menu key is persisted in the world, so
 * renaming it would orphan the existing registration.
 */
export const CREDITS_MENU_KEY = "creditsMenu";

/** Default icon for the credits button — an award ribbon. */
export const CREDITS_ICON = "fa-solid fa-award";

/**
 * Display overrides for a package's credits button. Every field is a
 * `lang/*.json` key, not literal text; a module supplies its own so the button
 * reads in its own voice.
 */
export interface CreditsMenuOptions {
    /** Label key for the settings row (`name` in Foundry's menu config). */
    name?: string;
    /** Label key for the button itself. */
    label?: string;
    /** Label key for the hint beneath the row. */
    hint?: string;
    /** Font Awesome classes for the button icon. */
    icon?: string;
    /**
     * Whether the button is GM-only. Defaults to `false`: credits exist to be
     * read, and `true` would hide them from every player in the world.
     */
    restricted?: boolean;
}

/** The localized, Foundry-shaped menu payload, minus the app `type`. */
export interface CreditsMenuData {
    /** The settings row label. */
    name: string;
    /** The button text. */
    label: string;
    /** The hint shown beneath the row. */
    hint: string;
    /** Font Awesome classes for the button icon. */
    icon: string;
    /** Whether the button is GM-only. */
    restricted: boolean;
}

/**
 * Build the localized payload for a credits settings menu.
 *
 * Pure — the caller supplies the localizer — so the defaults and the override
 * behavior are exercised in Node.
 *
 * @param options - Per-package display overrides.
 * @param localize - Resolves a `lang/*.json` key to display text.
 * @returns The menu payload, ready to hand to `game.settings.registerMenu`.
 */
export function buildCreditsMenuData(
    options: CreditsMenuOptions,
    localize: (key: string) => string,
): CreditsMenuData {
    return {
        name: localize(options.name ?? "SOHL.Credits.menuName"),
        label: localize(options.label ?? "SOHL.Credits.menuLabel"),
        hint: localize(options.hint ?? "SOHL.Credits.menuHint"),
        icon: options.icon ?? CREDITS_ICON,
        restricted: options.restricted ?? false,
    };
}

/**
 * Open a credits JournalEntry by UUID.
 *
 * Resolves asynchronously because the entry lives in a compendium and is
 * therefore not guaranteed to be in memory. Never rejects: this runs from click
 * handlers, where a rejected promise would surface only as an unhandled
 * rejection in the console. A UUID that does not resolve — a missing pack, a
 * disabled module — warns the user instead.
 *
 * @param uuid - The entry's compendium UUID, from the package's
 *   `flags.sohl.creditsUuid`.
 */
export async function openCreditsJournal(uuid: string): Promise<void> {
    if (!uuid) {
        sohl.log.uiWarn("SOHL.Credits.notFound");
        return;
    }
    const entry = await fvttResolveUuidAsync(uuid);
    if (!entry) {
        sohl.log.uiWarn("SOHL.Credits.notFound");
        return;
    }
    await fvttRenderSheet(entry);
}

/**
 * Build a settings-menu app class that opens a credits journal instead of
 * rendering a window of its own.
 *
 * Core constructs a settings menu's `type` with **no arguments** and then calls
 * `render(true)` on it (`applications/settings/config.mjs`), so the UUID cannot
 * be passed in at construction — hence a factory that closes over it. `render`
 * is overridden to open the journal and return without ever displaying this
 * application.
 *
 * @param uuid - The credits entry's compendium UUID.
 * @returns A zero-argument-constructible `ApplicationV2` subclass.
 */
export function makeCreditsMenuApp(uuid: string): new () => object {
    // Referenced lazily, inside the factory, so importing this module never
    // touches the Foundry globals at load time.
    const Base = foundry.applications.api.ApplicationV2 as any;
    return class CreditsMenu extends Base {
        /** @inheritDoc */
        static DEFAULT_OPTIONS = {
            id: "sohl-credits-menu",
        };

        /**
         * Open the credits journal rather than rendering this application.
         * @returns This instance, so the caller's `await app.render(true)`
         *   resolves normally.
         */
        async render(): Promise<unknown> {
            await openCreditsJournal(uuid);
            return this;
        }
    } as unknown as new () => object;
}

/**
 * Register a package's "Credits" button at the top of its Game Settings tab.
 *
 * This is the seam SoHL modules reuse. A module declares its credits entry's
 * UUID in its own manifest — `flags.sohl.creditsUuid` in `module.json` — ships
 * the JournalEntry in its own compendium, and calls this once during `init`:
 *
 * ```js
 * Hooks.once("init", () => {
 *     sohl.apps.foundry.registerCreditsMenu("my-module");
 * });
 * ```
 *
 * **Registration order is load-bearing.** Core renders a package's menus in
 * `game.settings.menus` insertion order, ahead of its plain settings, so this
 * must be called before the package's other `registerMenu` calls for the button
 * to sit at the top of the tab.
 *
 * No-ops with a warning when the package declares no UUID, so a module that
 * forgets the manifest flag fails visibly rather than registering a button that
 * quietly does nothing.
 *
 * @param packageId - The system or module id that ships the credits entry.
 * @param options - Per-package display overrides.
 */
export function registerCreditsMenu(packageId: string, options: CreditsMenuOptions = {}): void {
    const uuid = fvttPackageCreditsUuid(packageId);
    if (!uuid) {
        sohl.log.warn(
            `registerCreditsMenu("${packageId}"): no flags.sohl.creditsUuid in ` +
                `that package's manifest — no credits button registered.`,
        );
        return;
    }
    const data = buildCreditsMenuData(options, (key) => game.i18n.localize(key));
    game.settings.registerMenu(
        packageId as never,
        CREDITS_MENU_KEY as never,
        {
            ...data,
            type: makeCreditsMenuApp(uuid),
        } as never,
    );
}
