/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { parse } from "acorn";

import {
    checkBundleLoading,
    declaredGlobals,
    entryDeclaration,
    globalDeclarations,
} from "../bundle.mjs";

/** The first top-level statement of `source`, parsed as a classic script. */
function firstStatement(source: string) {
    return (
        parse(source, { ecmaVersion: "latest", sourceType: "script" }) as any
    ).body[0];
}

describe("declaredGlobals", () => {
    it("reports a simple binding", () => {
        expect(declaredGlobals(firstStatement("const a = 1;"))).toEqual(["a"]);
        expect(declaredGlobals(firstStatement("let b;"))).toEqual(["b"]);
        expect(declaredGlobals(firstStatement("var c = 1;"))).toEqual(["c"]);
    });

    it("reports function and class declarations", () => {
        expect(declaredGlobals(firstStatement("function f() {}"))).toEqual([
            "f",
        ]);
        expect(declaredGlobals(firstStatement("class K {}"))).toEqual(["K"]);
    });

    // A bundler emits these routinely; missing them would pass a bundle that
    // does collide.
    it("walks destructuring patterns", () => {
        expect(declaredGlobals(firstStatement("const { a, b } = x;"))).toEqual([
            "a",
            "b",
        ]);
        expect(declaredGlobals(firstStatement("const [c, d] = x;"))).toEqual([
            "c",
            "d",
        ]);
        expect(
            declaredGlobals(firstStatement("const { e: { f } = {} } = x;")),
        ).toEqual(["f"]);
        expect(
            declaredGlobals(firstStatement("const { g, ...rest } = x;")),
        ).toEqual(["g", "rest"]);
        expect(
            declaredGlobals(firstStatement("const [h = 1, ...tail] = x;")),
        ).toEqual(["h", "tail"]);
    });

    it("reports nothing for a statement that declares nothing", () => {
        expect(declaredGlobals(firstStatement("doThing();"))).toEqual([]);
        expect(declaredGlobals(firstStatement("x = 1;"))).toEqual([]);
        expect(
            declaredGlobals(firstStatement("if (a) { const inner = 1; }")),
        ).toEqual([]);
    });
});

describe("globalDeclarations", () => {
    it("finds every top-level declaration, with its line", () => {
        const found = globalDeclarations("const a = 1;\n\nfunction f() {}\n");
        expect(found).toEqual([
            { name: "a", line: 1, kind: "VariableDeclaration" },
            { name: "f", line: 3, kind: "FunctionDeclaration" },
        ]);
    });

    // Only top level matters — a declaration inside a block or a function is
    // not a global binding.
    it("ignores declarations nested inside a scope", () => {
        expect(
            globalDeclarations("function f() { const inner = 1; }").map(
                (d) => d.name,
            ),
        ).toEqual(["f"]);
    });

    it("finds nothing in an IIFE-wrapped bundle", () => {
        expect(globalDeclarations("(function(){ const a = 1; })();")).toEqual(
            [],
        );
    });
});

describe("entryDeclaration", () => {
    it("reads where the entry is declared", () => {
        expect(entryDeclaration({ esmodules: ["x.js"] }, "x.js")).toBe(
            "esmodules",
        );
        expect(entryDeclaration({ scripts: ["x.js"] }, "x.js")).toBe("scripts");
        expect(
            entryDeclaration(
                { esmodules: ["x.js"], scripts: ["x.js"] },
                "x.js",
            ),
        ).toBe("both");
        expect(entryDeclaration({}, "x.js")).toBe("neither");
        expect(entryDeclaration({ esmodules: ["other.js"] }, "x.js")).toBe(
            "neither",
        );
    });
});

describe("checkBundleLoading", () => {
    const check = (manifest: object, source: string) =>
        checkBundleLoading({ manifest, source, entry: "sohl.js" });

    it("passes a module-declared bundle that parses as a module", () => {
        const r = check(
            { esmodules: ["sohl.js"] },
            "import x from 'y';\nconst chrome = 1;\nexport { x };",
        );
        expect(r.findings).toEqual([]);
        expect(r.declaredAs).toBe("esmodules");
    });

    // The v0.8.0 breakage: `const chrome` at top level of a classic script
    // collides with the non-configurable `window.chrome` at parse time.
    it("reports every global a script-declared bundle would declare", () => {
        const r = check(
            { scripts: ["sohl.js"] },
            "const chrome = {};\nconst top = 1;\n",
        );
        expect(r.findings).toHaveLength(2);
        expect(r.findings[0].message).toContain("chrome");
        expect(r.findings[0].line).toBe(1);
        expect(r.findings[1].message).toContain("top");
    });

    // The invariant is list-free: it needs no catalogue of browser globals.
    it("reports a harmless-looking global too", () => {
        const r = check({ scripts: ["sohl.js"] }, "const zzz = 1;");
        expect(r.findings).toHaveLength(1);
    });

    it("passes a script-declared bundle that declares nothing", () => {
        const r = check(
            { scripts: ["sohl.js"] },
            "(function(){ const a = 1; })();",
        );
        expect(r.findings).toEqual([]);
    });

    it("reports an entry declared under both keys", () => {
        const r = check(
            { esmodules: ["sohl.js"], scripts: ["sohl.js"] },
            "const a = 1;",
        );
        expect(r.findings).toHaveLength(1);
        expect(r.findings[0].message).toContain("twice");
    });

    // Foundry would never load it, and nothing else would say so.
    it("reports an entry declared under neither key", () => {
        const r = check({}, "const a = 1;");
        expect(r.findings).toHaveLength(1);
        expect(r.findings[0].message).toContain("never load");
    });

    it("reports a module-declared bundle that is not a module", () => {
        const r = check({ esmodules: ["sohl.js"] }, "const a = 1; return 2;");
        expect(r.findings).toHaveLength(1);
        expect(r.findings[0].message).toContain(
            "does not parse as an ES module",
        );
    });

    it("reports a script-declared bundle that is not a script", () => {
        const r = check({ scripts: ["sohl.js"] }, "import x from 'y';");
        expect(r.findings).toHaveLength(1);
        expect(r.findings[0].message).toContain(
            "does not parse as a classic script",
        );
    });

    it("names the manifest in a message when told what to call it", () => {
        const r = checkBundleLoading({
            manifest: {},
            source: "",
            entry: "m.js",
            manifestName: "module.json",
        });
        expect(r.findings[0].message).toContain("module.json");
    });
});
