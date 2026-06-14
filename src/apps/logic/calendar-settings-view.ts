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

/**
 * Foundry-free view-model builder for the Calendar settings menu
 * ({@link CalendarSettingsMenu}): turn the calendar registry into the dropdown
 * rows and the imported-calendar list. Pure — the app supplies the registry
 * entries, the active id, and a `localize` callback (so no `game.i18n` here).
 */

/** The registry fields the calendar view needs from each calendar. */
export interface CalendarRegEntry {
    /** The calendar's display-label localization key. */
    label: string;
    /** Whether the calendar ships with the system (vs. user-imported). */
    builtin?: boolean;
}

/** A calendar row for the active-calendar dropdown. */
export interface CalendarRow {
    /** The calendar id. */
    id: string;
    /** The localized calendar label. */
    label: string;
    /** Whether this is the active calendar. */
    active: boolean;
}

/** A row in the imported-calendars list. */
export interface ImportedCalendarRow {
    /** The calendar id. */
    id: string;
    /** The localized calendar label. */
    label: string;
}

/**
 * Build the calendar settings view model in a single pass: every calendar as a
 * dropdown row (with the active one flagged), and the non-builtin calendars as
 * the deletable imported list.
 *
 * @param calendars - The registry entries as `[id, registration]` pairs.
 * @param activeId - The id of the active calendar.
 * @param localize - Resolves a label localization key to its display string.
 * @returns The dropdown rows and the imported-calendar rows.
 */
export function buildCalendarViewModel(
    calendars: Iterable<[string, CalendarRegEntry]>,
    activeId: string,
    localize: (key: string) => string,
): { calendars: CalendarRow[]; imported: ImportedCalendarRow[] } {
    const rows: CalendarRow[] = [];
    const imported: ImportedCalendarRow[] = [];
    for (const [id, reg] of calendars) {
        const label = localize(reg.label);
        rows.push({ id, label, active: id === activeId });
        if (!reg.builtin) imported.push({ id, label });
    }
    return { calendars: rows, imported };
}
