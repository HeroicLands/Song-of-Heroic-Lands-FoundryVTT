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
import { validateShortcode } from "@src/entity/strikemode/planShortcodeSave";
import {
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    StrikeModeTypeChoices,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    isStrikeModeType,
    type StrikeModeType,
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
 * array) versus a single one (a combat technique's `system.strikeMode`).
 * @param item - The item to inspect.
 * @returns `true` for weapon gear (multi), `false` for a combat technique.
 */
function isMultiStrikeMode(item: SohlItem): boolean {
    return item.type === ITEM_KIND.WEAPONGEAR;
}

/**
 * Look up a strike mode on an item by its row key: a shortcode for a weapon's
 * `strikeModes` array, or the sole `strikeMode` for a combat technique.
 * @param item - The owning item.
 * @param key - The row key ({@link StrikeModeBase.Data.shortcode | shortcode} for a
 *   weapon, {@link SINGLE_STRIKE_MODE_KEY} for a technique).
 * @returns The strike-mode data, or `undefined` if not found.
 */
function findStrikeMode(
    item: SohlItem,
    key: string,
): StrikeModeBase.Data | undefined {
    const system = item.system as any;
    if (isMultiStrikeMode(item)) {
        return (system.strikeModes as StrikeModeBase.Data[] | undefined)?.find(
            (m) => m.shortcode === key,
        );
    }
    return (system.strikeMode as StrikeModeBase.Data | undefined) ?? undefined;
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
    /** The row key (shortcode for a weapon, {@link SINGLE_STRIKE_MODE_KEY} for a technique). */
    key: string;
    /** The strike mode's display name. */
    name: string;
    /** The strike mode's shortcode (blank for a combat technique's single mode). */
    shortcode: string;
    /** Localized type label (Melee / Missile). */
    typeLabel: string;
    /** The impact damage formula, e.g. `"1d6+2 Edged"`. */
    impactFormula: string;
}

/**
 * Format a strike mode's base impact as a compact formula with the aspect as a
 * trailing lowercase letter, e.g. `"1d10+3e"`, `"1d6b"`, `"3p"`, or `"—"` when it
 * contributes no base impact.
 * @param imp - The strike mode's base impact fields.
 * @returns The formula string.
 */
function formatImpactFormula(imp: StrikeModeBase.Data["impactBase"]): string {
    const dice = imp?.numDice && imp?.die ? `${imp.numDice}d${imp.die}` : "";
    const mod = imp?.modifier;
    let formula = dice;
    if (mod != null && mod !== 0) {
        formula +=
            dice ?
                mod > 0 ?
                    `+${mod}`
                :   `${mod}`
            :   `${mod}`;
    }
    if (!formula) return "—";
    // Aspect abbreviated to its initial letter (b/e/p/f), appended directly.
    const letter = (imp?.aspect ?? "").charAt(0).toLowerCase();
    return `${formula}${letter}`;
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
            ((system.strikeModes ?? []) as StrikeModeBase.Data[]).map(
                (sm): [string, StrikeModeBase.Data] => [sm.shortcode, sm],
            )
        : system.strikeMode ? [[SINGLE_STRIKE_MODE_KEY, system.strikeMode]]
        : [];

    const strikeModes = entries.map(([key, sm]): StrikeModeRowVM => {
        return {
            key,
            name: sm.name,
            shortcode: sm.shortcode ?? "",
            typeLabel: game.i18n.localize(
                StrikeModeTypeChoices[sm.type] ?? sm.type,
            ),
            impactFormula: formatImpactFormula(sm.impactBase),
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
 * @param key - The row key to edit ({@link StrikeModeBase.Data.shortcode | shortcode}
 *   for a weapon, {@link SINGLE_STRIKE_MODE_KEY} for a technique).
 */
export function openStrikeModeEditor(item: SohlItem, key: string): void {
    void new StrikeModeConfig(item, key).render(true);
}

/** The type/name/shortcode collected by the "Create Strike Mode" dialog. */
interface NewStrikeModeSpec {
    /** The chosen strike-mode type. */
    type: StrikeModeType;
    /** The new mode's display name. */
    name: string;
    /** The new mode's shortcode (weapon only; blank for a combat technique). */
    shortcode: string;
}

/**
 * Prompt for a new strike mode's Type, Name, and — for a weapon — Shortcode.
 * Returns the entered values, or `undefined` if the dialog was dismissed (in
 * which case nothing should be created).
 *
 * The content is static markup with only trusted, localized labels interpolated
 * (never user data), so it does not build HTML from persisted values.
 * @param isMulti - Whether the owner is a weapon (shows the Shortcode field).
 * @returns The entered spec, or `undefined` on dismissal.
 */
async function promptNewStrikeMode(
    isMulti: boolean,
): Promise<NewStrikeModeSpec | undefined> {
    const typeOptions = `
        <option value="${STRIKE_MODE_TYPE.MELEE}">${game.i18n.localize("SOHL.StrikeMode.Type.melee")}</option>
        <option value="${STRIKE_MODE_TYPE.MISSILE}">${game.i18n.localize("SOHL.StrikeMode.Type.missile")}</option>`;
    const content = `
        <form class="strike-mode-create standard-form">
            <div class="form-group">
                <label>Type</label>
                <select name="type">${typeOptions}</select>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" placeholder="e.g. Cut" autofocus />
            </div>
            ${
                isMulti ?
                    `<div class="form-group">
                <label>Shortcode</label>
                <input type="text" name="shortcode" placeholder="e.g. cut" />
            </div>`
                :   ""
            }
        </form>`;

    let fd: PlainObject | undefined;
    try {
        fd = (await foundry.applications.api.DialogV2.prompt({
            window: {
                title: "Create Strike Mode",
                icon: "fa-solid fa-hand-fist",
            },
            content,
            ok: {
                label: "Create Strike Mode",
                icon: "fa-solid fa-plus",
                callback: (_event: Event, button: any) =>
                    new foundry.applications.ux.FormDataExtended(button.form)
                        .object,
            },
        } as any)) as PlainObject | undefined;
    } catch {
        // DialogV2.prompt rejects on dismissal (X / Escape) → treat as no-add.
        return undefined;
    }
    if (!fd) return undefined;
    return {
        type: isStrikeModeType(fd.type) ? fd.type : STRIKE_MODE_TYPE.MELEE,
        name: String(fd.name ?? ""),
        shortcode: String(fd.shortcode ?? ""),
    };
}

/**
 * Prompt for a new strike mode (Type / Name / Shortcode) and, once confirmed,
 * add it to the item and open the editor on it. Dismissing the dialog adds
 * nothing. A weapon's shortcode is validated for uniqueness before the add; a
 * combat technique's single mode has no shortcode.
 * @param item - The item to add a strike mode to.
 */
export async function addStrikeMode(item: SohlItem): Promise<void> {
    const isMulti = isMultiStrikeMode(item);
    const spec = await promptNewStrikeMode(isMulti);
    if (!spec) return;

    const logic = item.logic as any;
    const blank = blankStrikeMode(spec.type, spec.name || item.name);
    let key: string;
    if (isMulti) {
        const existing =
            (
                (item.system as any).strikeModes as
                    | StrikeModeBase.Data[]
                    | undefined
            )?.map((m) => m.shortcode) ?? [];
        const error = validateShortcode(spec.shortcode, existing);
        if (error) {
            sohl.log.uiWarn(error);
            return;
        }
        key = spec.shortcode.trim();
        blank.shortcode = key;
        await item.update(logic.addStrikeModeUpdate(blank));
    } else {
        key = SINGLE_STRIKE_MODE_KEY;
        await item.update(logic.setStrikeModeUpdate(blank));
    }
    openStrikeModeEditor(item, key);
}

/**
 * Delete a strike-mode row after a confirmation dialog. Reuses the item logic's
 * removal payload helper (shortcode-keyed for a weapon, argument-less for a technique).
 * @param item - The owning item.
 * @param key - The row key to delete.
 */
export async function deleteStrikeMode(
    item: SohlItem,
    key: string,
): Promise<void> {
    const sm = findStrikeMode(item, key);
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
