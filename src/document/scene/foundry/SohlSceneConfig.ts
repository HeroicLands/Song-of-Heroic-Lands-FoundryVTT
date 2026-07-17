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

const FoundrySceneConfig: any = (foundry as any).applications.sheets
    .SceneConfig;

/**
 * Build a PARTS map that injects the SoHL tab between `misc` and `footer`.
 * Static field initializers can't easily do conditional placement, so it
 * happens here once at class definition time.
 * @returns The PARTS map with the SoHL tab inserted before the footer.
 */
function buildParts(): Record<string, any> {
    const parent: Record<string, any> = { ...FoundrySceneConfig.PARTS };
    const footer = parent.footer;
    delete parent.footer;
    parent.sohl = {
        template: "systems/sohl/templates/scene/sohl-tab.hbs",
        scrollable: [""],
    };
    if (footer) parent.footer = footer;
    return parent;
}

/**
 * Builds the TABS map that appends the SoHL tab to the Scene config's sheet
 * tab group.
 * @returns The TABS map with the SoHL tab added.
 */
function buildTabs(): Record<string, any> {
    const parentTabs: Record<string, any> = FoundrySceneConfig.TABS ?? {};
    const sheet = parentTabs.sheet ?? { tabs: [], initial: "basics" };
    return {
        ...parentTabs,
        sheet: {
            ...sheet,
            tabs: [
                ...(sheet.tabs ?? []),
                {
                    id: "sohl",
                    icon: "fa-solid fa-masks-theater",
                    label: "SOHL.Scene.SHEET.tab.sohl.label",
                },
            ],
        },
    };
}

/**
 * Sohl-owned Scene configuration sheet. Extends Foundry's default
 * {@link foundry.applications.sheets.SceneConfig} with a single extra tab
 * that exposes scene-scoped Sohl settings (currently just the Theatre of
 * the Mind toggle).
 *
 * The TotM checkbox writes directly to `system.isTotm` via the normal
 * ApplicationV2 form-submit path; no custom submit handling is needed.
 *
 * @internal
 */
export class SohlSceneConfig extends FoundrySceneConfig {
    static PARTS = buildParts();

    static TABS = buildTabs();
}
