/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DEFAULT_COMBAT_GROUP } from "@src/document/combat/combat-logic";
import type { SohlCombatant } from "@src/document/combatant/SohlCombatant";

/** Token flag namespace/key for the default combat group name. */
const FLAG_SCOPE = "sohl";
const FLAG_KEY = "defaultCombatGroup";

/** Label for the tracker context-menu entry (also used as a dedupe key). */
const MOVE_TO_GROUP_LABEL = "Move to Group…";

/**
 * Register hooks supporting Foundry-native `CombatantGroup` allegiance:
 *
 * - A "Default Combat Group" text field injected into both the instance
 *   Token configuration and the prototype Token configuration, writing the
 *   `flags.sohl.defaultCombatGroup` flag through the standard form path.
 * - A "Move to Group…" combat-tracker context-menu entry letting the GM
 *   reassign a combatant to an existing group or create a new one.
 *
 * Uses render/DOM-injection hooks rather than subclassing core config
 * classes so the system keeps working across Foundry version updates.
 */
export function registerCombatGroupHooks(): void {
    (Hooks as any).on("renderTokenConfig", injectDefaultCombatGroupField);
    (Hooks as any).on(
        "renderPrototypeTokenConfig",
        injectDefaultCombatGroupField,
    );

    // The combatant tracker context menu is documented as
    // `getCombatantContextOptions`, but core dispatches the default
    // `get{ClassName}ContextOptions` for the `.combatant` menu, which
    // resolves to `getCombatTrackerContextOptions`. Register both (with a
    // dedupe guard) so the entry appears regardless of which name fires.
    (Hooks as any).on("getCombatantContextOptions", addMoveToGroupContextEntry);
    (Hooks as any).on(
        "getCombatTrackerContextOptions",
        addMoveToGroupContextEntry,
    );
}

/**
 * Inject a "Default Combat Group" text input into a Token / Prototype Token
 * config form, reading from and writing to `flags.sohl.defaultCombatGroup`.
 * @param app - The token config application supplying the document and flag.
 * @param html - The rendered form root (or a container holding the form).
 */
function injectDefaultCombatGroupField(app: any, html: HTMLElement): void {
    const form: HTMLElement | null =
        html?.tagName === "FORM" ? html : html?.querySelector?.("form");
    if (!form) return;
    if (form.querySelector(".sohl-default-combat-group")) return;

    const current =
        (app?.document?.getFlag?.(FLAG_SCOPE, FLAG_KEY) as
            | string
            | undefined) ?? "";

    // No localization: the field label is fixed and group names are free text.
    const label = "Default Combat Group";

    const group = document.createElement("div");
    group.classList.add("form-group", "sohl-default-combat-group");
    group.innerHTML = `
        <label>${label}</label>
        <div class="form-fields">
            <input type="text" name="flags.${FLAG_SCOPE}.${FLAG_KEY}"
                value="${escapeAttr(current)}"
                placeholder="${DEFAULT_COMBAT_GROUP}">
        </div>
    `;

    const footer = form.querySelector("footer");
    if (footer) {
        form.insertBefore(group, footer);
    } else {
        form.appendChild(group);
    }
}

/**
 * Push the "Move to Group…" entry onto a combatant context menu (once).
 * @param _app - The combat tracker application (unused).
 * @param menuItems - The context-menu entry list to append to.
 */
function addMoveToGroupContextEntry(_app: any, menuItems: any[]): void {
    if (!Array.isArray(menuItems)) return;
    if (menuItems.some((i) => i?.label === MOVE_TO_GROUP_LABEL)) return;

    menuItems.push({
        label: MOVE_TO_GROUP_LABEL,
        icon: "sohl-person-group",
        visible: () => (game as any).user?.isGM,
        onClick: (_event: Event, li: HTMLElement) => {
            const combatant = resolveCombatant(li);
            if (combatant) void promptMoveToGroup(combatant);
        },
    });
}

/**
 * Resolve the `SohlCombatant` for a context-menu target element.
 * @param li - The context-menu target element (or a descendant of the row).
 * @returns The matching combatant, or `null` if none can be resolved.
 */
function resolveCombatant(li: HTMLElement): SohlCombatant | null {
    const row = li?.closest?.("[data-combatant-id]") as HTMLElement | null;
    const id = (row ?? li)?.dataset?.combatantId;
    if (!id) return null;
    const combat = (game as any).combat;
    return (combat?.combatants?.get?.(id) as SohlCombatant | undefined) ?? null;
}

/**
 * Prompt the GM to move a combatant into an existing group or a new one,
 * then apply the assignment. Selecting the combatant's current group is a
 * no-op.
 * @param combatant - The combatant to reassign to a group.
 */
async function promptMoveToGroup(combatant: SohlCombatant): Promise<void> {
    const combat = combatant.combat as any;
    if (!combat) return;

    const groups = (combat.groups?.contents ?? []) as any[];
    const currentId = combatant.groupId;

    const options = groups
        .map((g) => {
            const sel = g.id === currentId ? " selected" : "";
            return `<option value="${escapeAttr(g.id)}"${sel}>${escapeHtml(
                g.name,
            )}</option>`;
        })
        .join("");

    const content = `
        <div class="form-group">
            <label>Group</label>
            <div class="form-fields">
                <select name="group">
                    ${options}
                    <option value="__new__">➕ New group…</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>New group name</label>
            <div class="form-fields">
                <input type="text" name="newName" placeholder="${DEFAULT_COMBAT_GROUP}">
            </div>
        </div>
    `;

    const result = await (foundry.applications.api.DialogV2 as any).wait({
        window: { title: "Move to Group" },
        content,
        buttons: [
            {
                action: "ok",
                label: "Move",
                icon: "sohl-check",
                default: true,
                callback: (_event: Event, button: any) => {
                    const form = button.form as HTMLFormElement;
                    return {
                        group: (
                            form.elements.namedItem(
                                "group",
                            ) as HTMLSelectElement
                        )?.value,
                        newName: (
                            form.elements.namedItem(
                                "newName",
                            ) as HTMLInputElement
                        )?.value,
                    };
                },
            },
            {
                action: "cancel",
                label: "Cancel",
                icon: "sohl-xmark",
            },
        ],
        close: () => null,
    });

    if (!result || result === "cancel") return;

    let targetGroupId: string | undefined;
    if (result.group === "__new__") {
        const name = result.newName?.trim() || DEFAULT_COMBAT_GROUP;
        const [created] = (await combat.createEmbeddedDocuments(
            "CombatantGroup",
            [{ name }],
        )) as any[];
        targetGroupId = created?.id;
    } else {
        targetGroupId = result.group || undefined;
    }

    if (!targetGroupId || targetGroupId === currentId) return;
    await combatant.update({ group: targetGroupId } as any);
}

/**
 * Escape a string for safe use inside an HTML attribute value.
 * @param value - The raw string to escape.
 * @returns The string with `&` and `"` escaped as HTML entities.
 */
function escapeAttr(value: string): string {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Escape a string for safe use as HTML text content.
 * @param value - The raw string to escape.
 * @returns The string with `&`, `<`, and `>` escaped as HTML entities.
 */
function escapeHtml(value: string): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
