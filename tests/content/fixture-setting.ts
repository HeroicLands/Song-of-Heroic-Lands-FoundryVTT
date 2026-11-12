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

/**
 * The test-only setting.
 *
 * Gear (weapons, armour, containers, miscellaneous gear, projectiles,
 * concoctions, afflictions, mystical abilities and trauma) belongs to a
 * setting, not to the system. The specifications that need gear definitions
 * read them from `tests/fixtures/test-setting/`: one small note per behaviour
 * a specification exercises. That directory sits under `tests/`, which no
 * packaging step selects, so none of it reaches a player.
 */
import fs from "node:fs";
import path from "node:path";

/** Absolute path of the test-only setting's note tree. */
export const FIXTURE_SETTING = path.resolve(__dirname, "../fixtures/test-setting");

/** Absolute path of the content tree the system ships. */
export const SYSTEM_CONTENT = path.resolve(__dirname, "../../assets/content");

/** Every `.md` note under a directory, recursively, as absolute paths. */
export function walkNotes(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walkNotes(full);
        return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
    });
}

/** Every note the specifications read: the system's content and the test setting's. */
export function allNotes(): string[] {
    return [...walkNotes(SYSTEM_CONTENT), ...walkNotes(FIXTURE_SETTING)];
}
