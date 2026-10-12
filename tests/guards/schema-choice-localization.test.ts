/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute this file under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const localizedChoiceFields = [
    ["templates/item/affliction-properties.hbs", "transmission"],
    ["templates/item/affliction-properties.hbs", "outcome"],
    ["templates/item/concoctiongear-properties.hbs", "potency"],
] as const;

describe("schema choice labels in item property forms", () => {
    it.each(localizedChoiceFields)("localizes %s field %s", (templatePath, field) => {
        const template = readFileSync(templatePath, "utf8");
        const formGroup = template.match(
            new RegExp(String.raw`\{\{formGroup fields\.${field}\b[^}]*\}\}`),
        )?.[0];

        expect(formGroup, `formGroup for ${field} should exist in ${templatePath}`).toBeDefined();
        expect(formGroup).toMatch(/\blocalize=true\b/);
    });
});
