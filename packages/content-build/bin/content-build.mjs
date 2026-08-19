#!/usr/bin/env node
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
 * The `content-build` command line.
 *
 * The toolchain's commands (`compile`, `unpack`, `clean`) arrive with the
 * compiler itself, which is still `utils/packs/compendiums.mjs` in the SoHL
 * repository — importable now that #1507 split it from its own CLI, but moved
 * here only by #1510/#1512. Until then this entry point implements exactly what
 * it can implement completely — `--help` and `--version` — and refuses anything
 * else with a non-zero exit rather than pretending to have built something.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const manifest = JSON.parse(
    readFileSync(
        fileURLToPath(new URL("../package.json", import.meta.url)),
        "utf8",
    ),
);

const USAGE = `content-build ${manifest.version}

  Compiles a HeroicLands content tree into Foundry VTT compendium packs,
  configured by a \`content-build.config.mjs\` at the consuming repository root.

Usage:
  content-build --help
  content-build --version

No build commands are available yet: the compiler has not been moved into this
package. Consuming repositories still run their own pack build script.
See https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1501
`;

const [arg] = process.argv.slice(2);

if (arg === "--version" || arg === "-v") {
    process.stdout.write(`${manifest.version}\n`);
} else if (arg === undefined || arg === "--help" || arg === "-h") {
    process.stdout.write(USAGE);
} else {
    process.stderr.write(
        `content-build: unknown argument \`${arg}\`.\n\n${USAGE}`,
    );
    process.exitCode = 2;
}
