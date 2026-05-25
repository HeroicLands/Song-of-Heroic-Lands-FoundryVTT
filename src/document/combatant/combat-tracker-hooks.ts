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
import { MOVEMENT_MEDIUM, movementMediumLabels } from "@src/utils/constants";

/**
 * Register hooks that enhance the default Foundry combat tracker and
 * combatant config sheet with SoHL's `moveFactor` and `displayedMedium`
 * fields, plus an inline computed-move display per tracker row.
 *
 * Uses DOM-injection hooks rather than overriding Foundry's templates so
 * the system continues to work across Foundry version updates.
 */
export function registerCombatTrackerHooks(): void {
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
