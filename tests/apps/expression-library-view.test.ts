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

import { describe, it, expect } from "vitest";
import { buildExpressionLibraryViewModel } from "@src/apps/logic/expression-library-view";

describe("buildExpressionLibraryViewModel", () => {
    it("renders sorted helper rows with argument signatures", () => {
        const vm = buildExpressionLibraryViewModel(
            {
                greet: { args: ["who"], body: "'hi ' + who" },
                addOne: { args: ["n"], body: "return n + 1" },
                now: { body: "return 0" },
            },
            "worlds/test/helpers.json",
            ["has", "len", "min"],
        );
        expect(vm.customHelpers).toEqual([
            { name: "addOne", signature: "addOne(n)" },
            { name: "greet", signature: "greet(who)" },
            { name: "now", signature: "now()" },
        ]);
        expect(vm.hasCustom).toBe(true);
        expect(vm.path).toBe("worlds/test/helpers.json");
        expect(vm.hasPath).toBe(true);
        expect(vm.builtinCount).toBe(3);
    });

    it("handles an empty library and no path", () => {
        const vm = buildExpressionLibraryViewModel({}, "", ["has"]);
        expect(vm.customHelpers).toEqual([]);
        expect(vm.hasCustom).toBe(false);
        expect(vm.hasPath).toBe(false);
        expect(vm.path).toBe("");
        expect(vm.builtinCount).toBe(1);
    });
});
