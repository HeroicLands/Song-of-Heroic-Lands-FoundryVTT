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
    builtinTraditions,
    validateTraditions,
    type AstrologyTraditions,
} from "@src/entity/astrology";
import { buildAstrologyTraditionsViewModel } from "@src/apps/logic/astrology-traditions-view";

const AstrologyTraditionsMenu_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * Settings menu for the world's **astrology traditions** registry (#1018).
 *
 * Lists every tradition available to birthsign
 * {@link sohl.document.item.logic.AffiliationLogic | Affiliations} — the shipped
 * built-ins plus any the world has authored — and lets a GM **import/replace**
 * the world's traditions from a JSON file (validated, malformed entries skipped)
 * or **clear** them back to the built-ins. The persisted `sohl.astrologyTraditions`
 * world setting is read at derivation time by the
 * {@link sohl.core.FoundryHelpers.fvttAstrologyTraditions} boundary, which layers
 * the world entries over the built-ins.
 *
 * @internal Foundry settings-menu UI binding; not part of the public API.
 */
export class AstrologyTraditionsMenu extends (AstrologyTraditionsMenu_Base as typeof foundry.applications.api.ApplicationV2) {
    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        id: "sohl-astrology-traditions",
        classes: ["sohl", "astrology-traditions"],
        window: {
            title: "SOHL.Astrology.Settings.title",
            icon: "fa-solid fa-star-and-crescent",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 520,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            closeOnSubmit: true,
        },
        actions: {
            importTraditions: AstrologyTraditionsMenu._onImportTraditions,
            clearTraditions: AstrologyTraditionsMenu._onClearTraditions,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/astrology-traditions.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    /** The persisted world traditions setting (map of tradition key → tradition). */
    private static worldTraditions(): AstrologyTraditions {
        return (
            (game.settings.get(
                "sohl",
                "astrologyTraditions",
            ) as AstrologyTraditions) ?? {}
        );
    }

    /**
     * Build the render context: the merged registry (built-ins + world) and the
     * world-defined keys (so each row is flagged built-in vs. world).
     * @param _options - The render options (unused).
     * @returns The template render context.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const world = AstrologyTraditionsMenu.worldTraditions();
        const registry: AstrologyTraditions = {
            ...builtinTraditions(),
            ...world,
        };
        const vm = buildAstrologyTraditionsViewModel(
            registry,
            Object.keys(world),
        );
        return {
            ...vm,
            buttons: [
                { type: "submit", icon: "fa-solid fa-save", label: "Close" },
            ],
        };
    }

    /**
     * Open a FilePicker for a JSON traditions file, validate it, and persist the
     * valid traditions to the world setting (replacing any prior world entries).
     * @param _event - The triggering event (unused).
     * @param _target - The element the action was invoked on (unused).
     */
    protected static async _onImportTraditions(
        this: AstrologyTraditionsMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        void new FilePicker({
            type: "any" as any,
            callback: async (path: string) => {
                if (!path.endsWith(".json")) {
                    ui.notifications.error(
                        game.i18n.format(
                            "SOHL.Astrology.Settings.import.error",
                            {
                                error: "File must be a .json file",
                            },
                        ),
                    );
                    return;
                }
                try {
                    const response = await fetch(path);
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    const raw = await response.json();
                    const { traditions, skipped } = validateTraditions(raw);
                    if (!Object.keys(traditions).length) {
                        throw new Error(
                            "No valid traditions found in the file",
                        );
                    }
                    await game.settings.set(
                        "sohl",
                        "astrologyTraditions",
                        traditions,
                    );
                    if (skipped.length) {
                        ui.notifications.warn(
                            game.i18n.format(
                                "SOHL.Astrology.Settings.import.partial",
                                {
                                    installed: String(
                                        Object.keys(traditions).length,
                                    ),
                                    skipped: String(skipped.length),
                                },
                            ),
                        );
                        for (const s of skipped) {
                            sohl.log.warn(
                                `Astrology tradition entry "${s.key}" skipped: ${s.reason}`,
                            );
                        }
                    } else {
                        ui.notifications.info(
                            game.i18n.format(
                                "SOHL.Astrology.Settings.import.success",
                                {
                                    count: String(
                                        Object.keys(traditions).length,
                                    ),
                                },
                            ),
                        );
                    }
                    void this.render();
                } catch (err: any) {
                    ui.notifications.error(
                        game.i18n.format(
                            "SOHL.Astrology.Settings.import.error",
                            {
                                error: err.message ?? String(err),
                            },
                        ),
                    );
                }
            },
        } as any).render({ force: true });
    }

    /**
     * Clear the world's traditions, restoring the shipped built-ins only.
     * @param _event - The triggering event (unused).
     * @param _target - The element the action was invoked on (unused).
     */
    protected static async _onClearTraditions(
        this: AstrologyTraditionsMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "SOHL.Astrology.Settings.clear.label" },
            content: `<p>${game.i18n.localize(
                "SOHL.Astrology.Settings.clear.confirm",
            )}</p>`,
        });
        if (!confirmed) return;
        await game.settings.set("sohl", "astrologyTraditions", {});
        void this.render();
    }
}
