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

import {
    expressionHelpers,
    STANDARD_HELPERS,
} from "@src/entity/expr/ExpressionHelperRegistry";
import { buildExpressionLibraryViewModel } from "@src/apps/logic/expression-library-view";

const ExpressionLibraryMenu_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * Settings menu for managing the world's custom expression-helper library.
 *
 * A GM chooses a JSON file mapping helper names to
 * `{ args?: string[], body: string }` entries. The file's contents are
 * validated, compiled, installed into the global {@link expressionHelpers}
 * registry, and persisted to a world setting so they reload on world start.
 *
 * The compiled bodies run through {@link textToFunction}, whose screening is a
 * sandbox, not a hard security boundary — hence the file is GM-chosen (trusted).
 *
 * @internal Foundry settings-menu UI binding; not part of the public API.
 */
export class ExpressionLibraryMenu extends (ExpressionLibraryMenu_Base as typeof foundry.applications.api.ApplicationV2) {
    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        id: "sohl-expression-library",
        classes: ["sohl", "expression-library"],
        window: {
            title: "SOHL.ExpressionLibrary.title",
            icon: "sohl-scroll",
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
            importLibrary: ExpressionLibraryMenu._onImportLibrary,
            clearLibrary: ExpressionLibraryMenu._onClearLibrary,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/expression-library.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    /**
     * Build the render context: the chosen file path, the loaded custom
     * helpers, and the built-in helper count.
     * @param _options - The render options (unused).
     * @returns The template render context.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const library = game.settings.get(
            "sohl",
            "expressionHelpers",
        ) as Record<string, { args?: string[]; body: string }>;
        const path = game.settings.get(
            "sohl",
            "expressionHelpersPath",
        ) as string;
        const vm = buildExpressionLibraryViewModel(
            library,
            path,
            Object.keys(STANDARD_HELPERS),
        );
        return {
            ...vm,
            buttons: [{ type: "submit", icon: "sohl-save", label: "Close" }],
        };
    }

    /**
     * Open a FilePicker for a JSON helper library, validate and compile it,
     * install it into the registry, and persist it to the world setting.
     * @param _event - The triggering event (unused).
     * @param _target - The element the action was invoked on (unused).
     */
    protected static async _onImportLibrary(
        this: ExpressionLibraryMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        void new FilePicker({
            type: "any" as any,
            callback: async (path: string) => {
                if (!path.endsWith(".json")) {
                    ui.notifications.error(
                        game.i18n.format(
                            "SOHL.ExpressionLibrary.import.error",
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
                    const library = await response.json();
                    if (!library || typeof library !== "object") {
                        throw new Error(
                            "JSON must be an object mapping helper names to definitions",
                        );
                    }

                    // Compile + install into the live registry.
                    const result = expressionHelpers.loadLibrary(library);

                    // Persist the parsed library and the chosen path.
                    await game.settings.set(
                        "sohl",
                        "expressionHelpers",
                        library,
                    );
                    await game.settings.set(
                        "sohl",
                        "expressionHelpersPath",
                        path,
                    );

                    if (result.skipped.length) {
                        ui.notifications.warn(
                            game.i18n.format(
                                "SOHL.ExpressionLibrary.import.partial",
                                {
                                    installed: String(result.installed.length),
                                    skipped: String(result.skipped.length),
                                },
                            ),
                        );
                        for (const s of result.skipped) {
                            sohl.log.warn(
                                `Expression helper "${s.name}" skipped: ${s.reason}`,
                            );
                        }
                    } else {
                        ui.notifications.info(
                            game.i18n.format(
                                "SOHL.ExpressionLibrary.import.success",
                                { count: String(result.installed.length) },
                            ),
                        );
                    }
                    void this.render();
                } catch (err: any) {
                    ui.notifications.error(
                        game.i18n.format(
                            "SOHL.ExpressionLibrary.import.error",
                            {
                                error: err.message ?? String(err),
                            },
                        ),
                    );
                }
            },
        } as any).render(true);
    }

    /**
     * Clear all custom helpers: reset the registry to built-ins and empty the
     * persisted library and path.
     * @param _event - The triggering event (unused).
     * @param _target - The element the action was invoked on (unused).
     */
    protected static async _onClearLibrary(
        this: ExpressionLibraryMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "SOHL.ExpressionLibrary.clear.label" },
            content: `<p>${game.i18n.localize(
                "SOHL.ExpressionLibrary.clear.confirm",
            )}</p>`,
        });
        if (!confirmed) return;

        expressionHelpers.clearCustom();
        await game.settings.set("sohl", "expressionHelpers", {});
        await game.settings.set("sohl", "expressionHelpersPath", "");
        void this.render();
    }
}
