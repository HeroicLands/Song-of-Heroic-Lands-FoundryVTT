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

import { SohlSystem } from "@src/common/SohlSystem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CalendarSettingsMenu_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

/**
 * Settings menu for managing the calendar registry.
 *
 * Provides:
 * - A dropdown to select the active calendar from all registered calendars
 * - A FilePicker to import a new calendar from a JSON file
 * - A list of imported (non-builtin) calendars with delete buttons
 */
export class CalendarSettingsMenu extends (CalendarSettingsMenu_Base as typeof foundry.applications.api.ApplicationV2) {
    static override DEFAULT_OPTIONS = {
        id: "sohl-calendar-settings",
        classes: ["sohl", "calendar-settings"],
        window: {
            title: "SOHL.CalendarSettings.title",
            icon: "fa-solid fa-calendar",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 480,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            closeOnSubmit: true,
        },
        actions: {
            importCalendar: CalendarSettingsMenu._onImportCalendar,
            deleteCalendar: CalendarSettingsMenu._onDeleteCalendar,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/calendar-settings.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    override async _prepareContext(options: any): Promise<any> {
        const activeId = game.settings.get("sohl", "activeCalendar") as string;
        const calendars: { id: string; label: string; active: boolean }[] = [];
        for (const [id, reg] of SohlSystem.calendars.entries()) {
            calendars.push({
                id,
                label: game.i18n.localize(reg.label),
                active: id === activeId,
            });
        }

        const imported: { id: string; label: string }[] = [];
        for (const [id, reg] of SohlSystem.calendars.entries()) {
            if (!reg.builtin) {
                imported.push({
                    id,
                    label: game.i18n.localize(reg.label),
                });
            }
        }

        return {
            calendars,
            activeId,
            imported,
            hasImported: imported.length > 0,
            buttons: [
                {
                    type: "submit",
                    icon: "fa-solid fa-floppy-disk",
                    label: "Save Changes",
                },
            ],
        };
    }

    /**
     * Handle the import calendar action. Opens a FilePicker for JSON files,
     * validates the selected file, and registers it as a new calendar.
     */
    static async _onImportCalendar(
        this: CalendarSettingsMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        new FilePicker({
            type: "any" as any,
            callback: async (path: string) => {
                if (!path.endsWith(".json")) {
                    ui.notifications.error(
                        game.i18n.format("SOHL.CalendarSettings.import.error", {
                            error: "File must be a .json file",
                        }),
                    );
                    return;
                }
                try {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const calendarConfig = await response.json();

                    // Validate required fields
                    if (!calendarConfig.name || !calendarConfig.days) {
                        throw new Error(
                            "JSON must contain at least 'name' and 'days' fields",
                        );
                    }

                    // Generate ID from name
                    const id = calendarConfig.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");

                    // Register the calendar
                    SohlSystem.registerCalendar(id, {
                        label: calendarConfig.name,
                        config: calendarConfig,
                        builtin: false,
                    });

                    // Persist to world setting
                    const imported = foundry.utils.deepClone(
                        game.settings.get(
                            "sohl",
                            "importedCalendars",
                        ) as Record<string, any>,
                    );
                    imported[id] = {
                        label: calendarConfig.name,
                        config: calendarConfig,
                    };
                    await game.settings.set(
                        "sohl",
                        "importedCalendars",
                        imported,
                    );

                    ui.notifications.info(
                        game.i18n.format(
                            "SOHL.CalendarSettings.import.success",
                            { name: calendarConfig.name },
                        ),
                    );

                    // Re-render to show the new calendar
                    this.render();
                } catch (err: any) {
                    ui.notifications.error(
                        game.i18n.format("SOHL.CalendarSettings.import.error", {
                            error: err.message ?? String(err),
                        }),
                    );
                }
            },
        } as any).render(true);
    }

    /**
     * Handle deleting an imported calendar.
     */
    static async _onDeleteCalendar(
        this: CalendarSettingsMenu,
        _event: Event,
        target: HTMLElement,
    ): Promise<void> {
        const calendarId = target
            .closest("[data-calendar-id]")
            ?.getAttribute("data-calendar-id");
        if (!calendarId) return;

        const cal = SohlSystem.getCalendar(calendarId);
        if (!cal || cal.builtin) return;

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "SOHL.CalendarSettings.delete.label" },
            content: `<p>${game.i18n.format(
                "SOHL.CalendarSettings.delete.confirm",
                { name: game.i18n.localize(cal.label) },
            )}</p>`,
        });
        if (!confirmed) return;

        // Unregister
        SohlSystem.unregisterCalendar(calendarId);

        // Remove from persisted setting
        const imported = foundry.utils.deepClone(
            game.settings.get("sohl", "importedCalendars") as Record<
                string,
                any
            >,
        );
        delete imported[calendarId];
        await game.settings.set("sohl", "importedCalendars", imported);

        // If the deleted calendar was active, switch to default
        const activeId = game.settings.get("sohl", "activeCalendar");
        if (activeId === calendarId) {
            await game.settings.set("sohl", "activeCalendar", "sohl-default");
            ui.notifications.warn(
                game.i18n.localize(
                    "SOHL.CalendarSettings.delete.activeWarning",
                ),
            );
        }

        // Re-render
        this.render();
    }

    /**
     * Handle form submission — save the active calendar selection.
     */
    override async _onSubmitForm(
        _formConfig: any,
        event: Event,
    ): Promise<void> {
        event.preventDefault();
        const form = this.element as HTMLFormElement;
        const formData = new FormDataExtended(form);
        const data = formData.object as { activeCalendar?: string };
        const newActiveId = data.activeCalendar ?? "sohl-default";

        const currentId = game.settings.get("sohl", "activeCalendar");
        if (newActiveId !== currentId) {
            await game.settings.set("sohl", "activeCalendar", newActiveId);
            // requiresReload on the setting triggers Foundry's reload prompt
        }
    }
}
