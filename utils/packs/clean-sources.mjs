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
 * Pack source cleaner — deletes every pack's committed `_source/` tree
 * under `assets/packs/`. Run before `packs:export` (via `packs:rebuild`)
 * when you want a guaranteed-fresh regeneration, or by itself to drop
 * stale exports.
 */

import fs from "fs";
import path from "path";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

const PACKS_ROOT = path.resolve("./assets/packs");

log.setLevel("info");
prefix.reg(log);
prefix.apply(log, {
    format(level, _name, timestamp) {
        return `[${timestamp}] [${level.toUpperCase()}]:`;
    },
    timestampFormatter(date) {
        return date.toISOString();
    },
});

function main() {
    if (!fs.existsSync(PACKS_ROOT)) {
        log.warn(`No packs root at ${PACKS_ROOT}; nothing to clean.`);
        return;
    }

    let cleaned = 0;
    for (const entry of fs.readdirSync(PACKS_ROOT, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const sourceDir = path.join(PACKS_ROOT, entry.name, "_source");
        if (fs.existsSync(sourceDir)) {
            fs.rmSync(sourceDir, { recursive: true, force: true });
            log.info(`Removed ${sourceDir}`);
            cleaned++;
        }
    }
    log.info(`Cleaned ${cleaned} _source tree(s).`);
}

main();
