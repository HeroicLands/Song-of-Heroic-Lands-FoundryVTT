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

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    validateTraditions,
    type AstrologyTraditions,
} from "@src/entity/astrology";

/**
 * Test-only access to the shipped built-in astrology tradition. At runtime the
 * system fetches this data file over HTTP (`sohl.fetchJson` →
 * {@link sohl.core.FoundryHelpers.fvttFetchJson}) and hands it to the registry;
 * there is no HTTP server in unit tests, so read the same shipped file from
 * disk instead. The parsed JSON is identical to what `fvttFetchJson` returns.
 */
const ASTROKYKLOS_PATH = resolve(
    fileURLToPath(import.meta.url),
    "../../../assets/astrology/astrokyklos.json",
);

/** The raw, unvalidated built-in tradition JSON (the shape a module supplies). */
export function builtinTraditionsData(): unknown {
    return JSON.parse(readFileSync(ASTROKYKLOS_PATH, "utf8"));
}

/**
 * The validated built-in traditions, tagged `source: "builtin"` — the default
 * set a birthsign expression sees before module/world layers.
 * @returns A fresh map of built-in tradition key → tradition.
 */
export function builtinTraditions(): AstrologyTraditions {
    return validateTraditions(builtinTraditionsData(), "builtin").traditions;
}
