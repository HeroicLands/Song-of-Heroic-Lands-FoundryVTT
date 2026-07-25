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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { StrikeModeConfig } from "@src/apps/foundry/StrikeModeConfig";
import { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import { blankStrikeMode } from "@src/entity/strikemode/blankStrikeMode";
import {
    ImpactAspectChoices,
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    StrikeModeTypeChoices,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

/**
 * The "Strike Modes" tab descriptor, inserted into a sheet's `TABS` after the
 * Properties tab by {@link withStrikeModesTab}.
 */
export const STRIKE_MODES_TAB = {
    id: "strikemodes",
    label: "SOHL.Item.tab.strikemodes",
    icon: "fa-solid fa-hand-fist",
} as const;

/** The sentinel row key used for a combat technique's single strike mode. */
export const SINGLE_STRIKE_MODE_KEY = "single";

/**
 * Whether an item stores many strike modes (a weapon's `system.strikeModes`
 * dict) versus a single one (a combat technique's `system.strikeMode`).
 * @param item - The item to inspect.
 * @returns `true` for weapon gear (multi), `false` for a combat technique.
 */
function isMultiStrikeMode(item: SohlItem): boolean {
    return item.type === ITEM_KIND.WEAPONGEAR;
}

/**
 * The `update()` path a strike-mode row is stored at, resolved per item kind.
 * @param item - The owning item.
 * @param key - The row key (a dict id for a weapon, {@link SINGLE_STRIKE_MODE_KEY} for a technique).
 * @returns The dot-notation `update()` path.
 */
function strikeModePath(item: SohlItem, key: string): string {
    return isMultiStrikeMode(item) ?
            `system.strikeModes.${key}`
        :   "system.strikeMode";
}

/**
 * Insert the Strike Modes tab immediately after the Properties tab in a copy of
 * the given `TABS` configuration, leaving the original untouched. Used by the
 * Weapongear and CombatTechnique sheets to add the tab without duplicating the
 * base tab list.
 * @param baseTabs - The base sheet's `TABS` configuration.
 * @returns A new `TABS` object with the strike-modes tab spliced in.
 */
export function withStrikeModesTab<T extends PlainObject>(baseTabs: T): T {
    const tabs = foundry.utils.deepClone(baseTabs) as any;
    const list = tabs.sheet.tabs as any[];
    const at = list.findIndex((t) => t.id === "properties");
    list.splice(at < 0 ? 0 : at + 1, 0, { ...STRIKE_MODES_TAB });
    return tabs as T;
}

/** A single strike-mode row view model rendered on the Strike Modes tab. */
export interface StrikeModeRowVM {
    /** The row key (dict id for a weapon, {@link SINGLE_STRIKE_MODE_KEY} for a technique). */
    key: string;
    /** The strike mode's display name. */
    name: string;
    /** Localized type label (Melee / Missile). */
    typeLabel: string;
    /** Whether this is a melee mode (drives the headline column). */
    isMelee: boolean;
    /** A one-line headline: reach for melee, base range for missile. */
    headline: string;
    /** Localized impact-aspect label. */
    aspectLabel: string;
}

/**
 * Build the Strike Modes tab render context for an item: one row per strike
 * mode, plus whether the "Add Strike Mode" control should be shown (always for
 * a weapon; only when empty for a single-mode combat technique).
 * @param item - The item whose strike modes are listed.
 * @returns The tab context (`strikeModes`, `canAdd`).
 */
export function prepareStrikeModesContext(item: SohlItem): {
    strikeModes: StrikeModeRowVM[];
    canAdd: boolean;
} {
    const system = item.system as any;
    const entries: [string, StrikeModeBase.Data][] =
        isMultiStrikeMode(item) ?
            (Object.entries(system.strikeModes ?? {}) as [
                string,
                StrikeModeBase.Data,
            ][])
        : system.strikeMode ? [[SINGLE_STRIKE_MODE_KEY, system.strikeMode]]
        : [];

    const strikeModes = entries.map(([key, sm]): StrikeModeRowVM => {
        const isMelee = sm.type === STRIKE_MODE_TYPE.MELEE;
        const feet =
            isMelee ? (sm as any).lengthBase : (sm as any).baseRangeBase;
        return {
            key,
            name: sm.name,
            typeLabel: game.i18n.localize(
                StrikeModeTypeChoices[sm.type] ?? sm.type,
            ),
            isMelee,
            headline: `${feet ?? 0} ft`,
            aspectLabel: game.i18n.localize(
                ImpactAspectChoices[sm.impactBase?.aspect] ?? "",
            ),
        };
    });

    // A weapon can always add another mode; a combat technique holds exactly one
    // so "Add" is only offered when it currently has none.
    const canAdd = isMultiStrikeMode(item) || entries.length === 0;
    return { strikeModes, canAdd };
}

/**
 * Open the `StrikeModeConfig` editor for a strike-mode row on an item.
 * @param item - The owning item.
 * @param key - The row key to edit.
 */
export function openStrikeModeEditor(item: SohlItem, key: string): void {
    void new StrikeModeConfig(item, strikeModePath(item, key)).render(true);
}

/**
 * Add a blank melee strike mode to an item and open the editor on it. Reuses
 * the item logic's payload helpers (`addStrikeModeUpdate` for a weapon,
 * `setStrikeModeUpdate` for a combat technique).
 * @param item - The item to add a strike mode to.
 */
export async function addStrikeMode(item: SohlItem): Promise<void> {
    const blank = blankStrikeMode(STRIKE_MODE_TYPE.MELEE, item.name);
    const logic = item.logic as any;
    let key: string;
    if (isMultiStrikeMode(item)) {
        key = foundry.utils.randomID();
        await item.update(logic.addStrikeModeUpdate(blank, key));
    } else {
        key = SINGLE_STRIKE_MODE_KEY;
        await item.update(logic.setStrikeModeUpdate(blank));
    }
    openStrikeModeEditor(item, key);
}

/**
 * Delete a strike-mode row after a confirmation dialog. Reuses the item logic's
 * removal payload helper (id-keyed for a weapon, argument-less for a technique).
 * @param item - The owning item.
 * @param key - The row key to delete.
 */
export async function deleteStrikeMode(
    item: SohlItem,
    key: string,
): Promise<void> {
    const path = strikeModePath(item, key);
    const sm = foundry.utils.getProperty(item, path) as
        | StrikeModeBase.Data
        | undefined;
    const name = sm?.name ?? "this strike mode";
    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Delete Strike Mode?" },
        content: `<p>Delete strike mode <strong>${foundry.utils.escapeHTML(
            name,
        )}</strong>? This cannot be undone.</p>`,
    } as any);
    if (!confirmed) return;
    const logic = item.logic as any;
    await item.update(
        isMultiStrikeMode(item) ?
            logic.removeStrikeModeUpdate(key)
        :   logic.removeStrikeModeUpdate(),
    );
}

/**
 * Bind the per-row `⋮` context menu (Edit / Delete) to an item sheet's Strike
 * Modes rows. These are plain menu items driving the editor and the delete
 * flow directly — not SohlActions.
 * @param item - The item the sheet edits.
 * @param element - The sheet root element to bind the menu within.
 */
export function bindStrikeModeContextMenu(
    item: SohlItem,
    element: HTMLElement,
): void {
    const keyOf = (target: HTMLElement): string | undefined =>
        (target.closest("[data-strikemode-key]") as HTMLElement | null)?.dataset
            .strikemodeKey;

    const entries = [
        new SohlContextMenu.Entry({
            id: "strikemode-edit",
            name: "Edit",
            iconFAClass: "fa-solid fa-pen-to-square",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const key = keyOf(target);
                if (key) openStrikeModeEditor(item, key);
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
        new SohlContextMenu.Entry({
            id: "strikemode-delete",
            name: "Delete",
            iconFAClass: "fa-solid fa-trash",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const key = keyOf(target);
                if (key) void deleteStrikeMode(item, key);
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
    ];

    new SohlContextMenu(element, ".strikemode-contextmenu", entries, {
        eventName: "click",
        parent: (item as any).logic,
    });
}
