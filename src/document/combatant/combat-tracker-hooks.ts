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

import { SohlCombatant } from "@src/document/combatant/SohlCombatant";
import { CombatantLogic } from "@src/document/combatant/CombatantLogic";
import {
    MOVEMENT_MEDIUM,
    movementMediumLabels,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";

/**
 * The non-HIDDEN combatant intrinsic actions — the skeleton (label/icon) for the
 * combat-tracker context-menu entries. Uniform across combatants, so it is
 * computed once; per-row gating and dispatch route through the specific
 * combatant's {@link SohlCombatant.getContextOptions}.
 */
const COMBATANT_MENU_ACTION_DEFS = CombatantLogic.defineIntrinsicActions().filter(
    (d) => d.group !== SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
);

/**
 * Register hooks that enhance the default Foundry combat tracker and the
 * combatant config sheet:
 *
 * - The combat-tracker row context menu, populated from each combatant's
 *   {@link SohlCombatant.getContextOptions} (Automated Attack, Move to Group…).
 * - The `moveFactor` / `displayedMedium` fields on the combatant config and a
 *   per-row computed-move chip in the tracker.
 *
 * (The actor's default combat group — read by {@link SohlCombat} to auto-group
 * combatants — is a typed field on the actor data model, edited on the actor
 * sheet, not a token flag.)
 *
 * Uses DOM-injection / context hooks rather than overriding Foundry classes so
 * the system keeps working across Foundry version updates.
 */
export function registerCombatTrackerHooks(): void {
    // The combatant tracker context menu is documented as
    // `getCombatantContextOptions`, but core's default `get{ClassName}ContextOptions`
    // dispatch can resolve to `getCombatTrackerContextOptions`. Register both
    // (with a dedupe guard) so the entries appear regardless of which fires.
    (Hooks as any).on("getCombatantContextOptions", addCombatantActionEntries);
    (Hooks as any).on(
        "getCombatTrackerContextOptions",
        addCombatantActionEntries,
    );

    (Hooks as any).on(
        "renderCombatantConfig",
        (app: any, html: HTMLElement) => {
            const combatant = app.document as SohlCombatant | undefined;
            if (!combatant) return;
            const sys = combatant.system as any;

            const form = html.querySelector("form");
            if (!form) return;
            if (form.querySelector(".sohl-move-fields")) return;

            const moveFactor = sys.moveFactor ?? 1;
            const displayedMedium = sys.displayedMedium ?? "terrestrial";

            const i18n = (game as any).i18n;
            const factorLabel = i18n?.localize?.(
                "SOHL.Combatant.FIELDS.moveFactor.label",
            ) ?? "Move Factor";
            const mediumLabel = i18n?.localize?.(
                "SOHL.Combatant.FIELDS.displayedMedium.label",
            ) ?? "Tracker Medium";

            const options = (
                Object.entries(MOVEMENT_MEDIUM) as [string, string][]
            )
                .map(([key, value]) => {
                    const localized =
                        i18n?.localize?.(
                            movementMediumLabels[
                                key as keyof typeof movementMediumLabels
                            ],
                        ) ?? value;
                    const sel = value === displayedMedium ? " selected" : "";
                    return `<option value="${value}"${sel}>${localized}</option>`;
                })
                .join("");

            const fieldset = document.createElement("fieldset");
            fieldset.classList.add("sohl-move-fields");
            fieldset.innerHTML = `
                <div class="form-group">
                    <label>${factorLabel}</label>
                    <input type="number" min="0" step="0.05"
                        name="system.moveFactor" value="${moveFactor}">
                </div>
                <div class="form-group">
                    <label>${mediumLabel}</label>
                    <select name="system.displayedMedium">${options}</select>
                </div>
            `;

            const footer = form.querySelector("footer");
            if (footer) {
                form.insertBefore(fieldset, footer);
            } else {
                form.appendChild(fieldset);
            }
        },
    );

    (Hooks as any).on(
        "renderCombatTracker",
        (_app: any, html: HTMLElement) => {
            const combat = (game as any).combat;
            if (!combat) return;
            const rows = Array.from(
                html.querySelectorAll<HTMLElement>("[data-combatant-id]"),
            );
            for (const row of rows) {
                const id = row.dataset.combatantId;
                if (!id) continue;
                const combatant = combat.combatants?.get?.(id) as
                    | SohlCombatant
                    | undefined;
                if (!combatant) continue;

                // Group-name label (display only — no row grouping).
                if (!row.querySelector(".sohl-group-chip")) {
                    const groupName = combatant.groupId
                        ? combat.groups?.get?.(combatant.groupId)?.name
                        : undefined;
                    if (groupName) {
                        const groupChip = document.createElement("span");
                        groupChip.classList.add("sohl-group-chip");
                        groupChip.title = "Combat group";
                        groupChip.textContent = groupName;
                        const nameEl = row.querySelector(".token-name");
                        if (nameEl) {
                            nameEl.appendChild(groupChip);
                        } else {
                            row.appendChild(groupChip);
                        }
                    }
                }

                const move = combatant.displayedMove;
                if (move === null || move === undefined) continue;
                if (row.querySelector(".sohl-move-chip")) continue;

                const chip = document.createElement("span");
                chip.classList.add("sohl-move-chip");
                chip.title = "Computed move (ft/round)";
                chip.textContent = `${move} ft`;

                const initiative = row.querySelector(".token-initiative");
                if (initiative) {
                    initiative.appendChild(chip);
                } else {
                    row.appendChild(chip);
                }
            }
        },
    );
}

/**
 * Resolve the `SohlCombatant` for a context-menu target element.
 * @param li - The context-menu target element (or a descendant of the row).
 * @returns The matching combatant, or `null` if none can be resolved.
 */
function getCombatant(li: HTMLElement): SohlCombatant | null {
    const row = li?.closest?.("[data-combatant-id]") as HTMLElement | null;
    const id = (row ?? li)?.dataset?.combatantId;
    if (!id) return null;
    const combat = (game as any).combat;
    return (combat?.combatants?.get?.(id) as SohlCombatant | undefined) ?? null;
}

/**
 * Build the combat-tracker row context-menu entries for the combatant's
 * available actions. Each entry is keyed by a non-HIDDEN combatant intrinsic
 * action; its visibility and dispatch route through the row's combatant
 * {@link SohlCombatant.getContextOptions} entry of the same id — so the action
 * system (and the action's own `visible` predicate, e.g. GM-only Move to Group)
 * drives behavior. Entries are gated on `combatant.isOwner` because the
 * combatant is not part of the action `visible` predicate's scope.
 *
 * Exported (and parameterized on `resolveCombatant`) so the mapping is unit
 * testable without a live combat tracker.
 * @param resolveCombatant - Resolves the combatant for a menu target element.
 * @returns The Foundry context-menu entries.
 */
export function buildCombatantActionMenuEntries(
    resolveCombatant: (li: HTMLElement) => SohlCombatant | null,
): any[] {
    return COMBATANT_MENU_ACTION_DEFS.filter((def) => !!def.title).map(
        (def) => {
            const title = def.title!;
            return {
                __sohlActionTitle: title,
                label: title,
                icon: def.iconFAClass,
                visible: (li: HTMLElement): boolean => {
                    const combatant = resolveCombatant(li);
                    if (!combatant?.isOwner) return false;
                    const entry = combatant
                        .getContextOptions()
                        .find((e) => e.id === title);
                    if (!entry) return false;
                    return typeof entry.condition === "function" ?
                            entry.condition(li)
                        :   true;
                },
                onClick: (_event: Event, li: HTMLElement): void => {
                    const combatant = resolveCombatant(li);
                    const entry = combatant
                        ?.getContextOptions()
                        .find((e) => e.id === title);
                    entry?.callback?.(li);
                },
            };
        },
    );
}

/**
 * Append the combatant's available-action entries to a combat-tracker row
 * context menu (deduped by action title).
 * @param _app - The combat tracker application (unused).
 * @param menuItems - The context-menu entry list to append to.
 */
function addCombatantActionEntries(_app: any, menuItems: any[]): void {
    if (!Array.isArray(menuItems)) return;
    for (const entry of buildCombatantActionMenuEntries(getCombatant)) {
        if (
            menuItems.some(
                (i) => i?.__sohlActionTitle === entry.__sohlActionTitle,
            )
        ) {
            continue;
        }
        menuItems.push(entry);
    }
}
