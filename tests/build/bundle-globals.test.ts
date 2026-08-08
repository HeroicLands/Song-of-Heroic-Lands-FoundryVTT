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

import { describe, it, expect } from "vitest";
import { parse, type Statement } from "acorn";
import { declaredGlobals } from "../../utils/check-bundle-globals.mjs";

/**
 * Parse `code` as a classic script and return every name it declares at global
 * scope — the same reduction `utils/check-bundle-globals.mjs` performs when
 * `system.json` loads the bundle under `"scripts"` instead of `"esmodules"`.
 */
function globalsOf(code: string): string[] {
    const program = parse(code, {
        ecmaVersion: "latest",
        sourceType: "script",
    });
    // `Program.body` is `Statement | ModuleDeclaration`; parsed as a script it
    // only ever yields statements.
    return program.body.flatMap((n) => declaredGlobals(n as Statement));
}

describe("check-bundle-globals / declaredGlobals", () => {
    it("reports top-level const/let/var/class/function declarations", () => {
        expect(globalsOf("const a = 1;")).toEqual(["a"]);
        expect(globalsOf("let b = 1;")).toEqual(["b"]);
        expect(globalsOf("var c = 1;")).toEqual(["c"]);
        expect(globalsOf("class D {}")).toEqual(["D"]);
        expect(globalsOf("function e() {}")).toEqual(["e"]);
    });

    it("reports every binding of a multi-declarator statement", () => {
        expect(globalsOf("const a = 1, b = 2, c = 3;")).toEqual([
            "a",
            "b",
            "c",
        ]);
    });

    it("walks destructuring patterns, including nesting, rest and defaults", () => {
        expect(globalsOf("const { a, b: c } = o;")).toEqual(["a", "c"]);
        expect(globalsOf("const [d, , e] = arr;")).toEqual(["d", "e"]);
        expect(globalsOf("const { f = 1 } = o;")).toEqual(["f"]);
        expect(globalsOf("const { ...g } = o;")).toEqual(["g"]);
        expect(globalsOf("const [...h] = arr;")).toEqual(["h"]);
        expect(globalsOf("const { i: { j } } = o;")).toEqual(["j"]);
    });

    it("reports the browser globals that broke the released bundle", () => {
        // The two real-world regressions this guard exists to prevent, both from
        // bundled dependencies: `style-mod`'s `const top` and
        // `@codemirror/view`'s `const chrome`. Declared at global scope — which
        // is what happens when system.json loads the ESM bundle under
        // "scripts" — each throws "Identifier 'x' has already been declared" at
        // parse time. `window.chrome` is configurable:false and `window.top` is
        // [Unforgeable], so neither name can be redeclared globally.
        expect(globalsOf("const top = globalThis;")).toEqual(["top"]);
        expect(
            globalsOf("const chrome = /Chrome/.exec(nav.userAgent);"),
        ).toEqual(["chrome"]);
    });

    it("ignores declarations nested in any function scope", () => {
        const wrapped = `(function() {
            "use strict";
            const chrome = 1;
            const top = 2;
            class Foo {}
            function bar() {}
            var baz = 3;
        })();`;
        expect(globalsOf(wrapped)).toEqual([]);
    });

    it("ignores non-declaration top-level statements", () => {
        expect(globalsOf("globalThis.sohl = system;")).toEqual([]);
        expect(globalsOf("console.log(1);")).toEqual([]);
        expect(globalsOf("if (a) { const scoped = 1; }")).toEqual([]);
    });
});
