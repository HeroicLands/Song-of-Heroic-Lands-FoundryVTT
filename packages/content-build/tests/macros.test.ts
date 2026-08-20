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
// Build-time pack helpers (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    buildMacroEntry,
    extractJsFence,
    macroCommand,
    MACRO_SCOPES,
    MACRO_SCRIPT_ANCHOR,
    resolveMacroScope,
    resolveMacroType,
} from "../../../utils/packs/macros.mjs";
import {
    DOC_ENTRY_TYPES,
    hasDocEntry,
    ITEM_TYPES,
    itemDocEntryId,
} from "../../../utils/packs/item-docs.mjs";
import { splitPages, buildPages } from "../../../utils/packs/journals.mjs";
import {
    buildWikilinkIndex,
    convertWikilinks,
} from "../../../utils/packs/wikilinks.mjs";
import { MAP_TYPES } from "../../../utils/packs/ids.mjs";

const NOTE_ID = "HSNwLca3kMYLN3Ag";

/* -------------------------------------------------------------------- */
/*  The fence a macro's command is read from                            */
/* -------------------------------------------------------------------- */

describe("extractJsFence (the first language-tagged JS fence, verbatim)", () => {
    it("returns the body of a ```js fence", () => {
        expect(extractJsFence("```js\nconst x = 1;\n```")).toBe("const x = 1;");
    });

    it("accepts the `javascript` tag too", () => {
        expect(extractJsFence("```javascript\nfoo();\n```")).toBe("foo();");
    });

    it("keeps the script verbatim — indentation, blank lines and all", () => {
        const body = "```js\nif (a) {\n\n    b();\n}\n```";
        expect(extractJsFence(body)).toBe("if (a) {\n\n    b();\n}");
    });

    it("ignores the prose around the fence", () => {
        const body = [
            "This is ignored",
            "Who cares about this stuff",
            "```js",
            "const x = 1",
            "console.log(x)",
            "```",
            "trailing prose",
        ].join("\n");
        expect(extractJsFence(body)).toBe("const x = 1\nconsole.log(x)");
    });

    it("takes the first JS fence and ignores any later one", () => {
        const body = "```js\nfirst();\n```\n\ntext\n\n```js\nsecond();\n```";
        expect(extractJsFence(body)).toBe("first();");
    });

    it("does not count an untagged fence", () => {
        expect(extractJsFence("```\nconst x = 1;\n```")).toBeNull();
    });

    it("does not count a fence tagged for another language", () => {
        expect(extractJsFence("```json\n{}\n```")).toBeNull();
    });

    it("skips an untagged fence and finds the tagged one after it", () => {
        expect(extractJsFence("```\nplain\n```\n\n```js\nreal();\n```")).toBe(
            "real();",
        );
    });

    it("reads a longer fence delimiter, so a script may embed ```", () => {
        const body = "````js\nconst md = '```';\n````";
        expect(extractJsFence(body)).toBe("const md = '```';");
    });

    it("returns null when there is no fence at all", () => {
        expect(extractJsFence("just prose")).toBeNull();
    });

    it("treats an unterminated fence as no fence", () => {
        expect(extractJsFence("```js\nconst x = 1;")).toBeNull();
    });
});

/* -------------------------------------------------------------------- */
/*  The {#script} page                                                  */
/* -------------------------------------------------------------------- */

describe("macroCommand (the script page's first JS fence)", () => {
    it("reads the command from the page anchored {#script}", () => {
        const body = [
            "Intro prose.",
            "",
            "# Notes",
            "",
            "```js",
            "notThis();",
            "```",
            "",
            "# Script {#script}",
            "",
            "```js",
            "await thisOne();",
            "```",
        ].join("\n");
        expect(macroCommand(body, "Macro")).toBe("await thisOne();");
    });

    it("names its anchor `script`", () => {
        expect(MACRO_SCRIPT_ANCHOR).toBe("script");
    });

    it("ignores prose and any later fence on the script page", () => {
        const body = [
            "# Script {#script}",
            "This is ignored",
            "Who cares about this stuff",
            "```js",
            "const x = 1",
            "console.log(x)",
            "```",
            "```js",
            "notThis();",
            "```",
        ].join("\n");
        expect(macroCommand(body, "Macro")).toBe("const x = 1\nconsole.log(x)");
    });

    it("works whatever heading depth carries the anchor", () => {
        const body =
            "# Doc\n\ntext\n\n### Script {#script}\n\n```js\nx();\n```";
        expect(macroCommand(body, "Macro")).toBe("x();");
    });

    it("fails the build when no page declares {#script}", () => {
        expect(() => macroCommand("# Doc\n\n```js\nx();\n```", "Aut")).toThrow(
            /\{#script\}/,
        );
    });

    it("fails the build when the script page has no tagged JS fence", () => {
        expect(() =>
            macroCommand("# Script {#script}\n\n```\nx();\n```", "Aut"),
        ).toThrow(/language-tagged/);
    });

    it("names the macro in either error, so the build says which note", () => {
        expect(() => macroCommand("nothing", "Automated Attack")).toThrow(
            /Automated Attack/,
        );
    });
});

/* -------------------------------------------------------------------- */
/*  Frontmatter: the Foundry macro type and scope                       */
/* -------------------------------------------------------------------- */

describe("resolveMacroType", () => {
    it("defaults to `script` — the note's `type:` stays `macro`", () => {
        expect(resolveMacroType({ type: "macro" }, "m")).toBe("script");
    });

    it("accepts an explicit `script`", () => {
        expect(resolveMacroType({ sohl: { macroType: "script" } }, "m")).toBe(
            "script",
        );
    });

    it("rejects `chat` rather than half-implementing it", () => {
        expect(() =>
            resolveMacroType({ sohl: { macroType: "chat" } }, "m"),
        ).toThrow(/chat/);
    });

    it("rejects an unknown macro type", () => {
        expect(() =>
            resolveMacroType({ sohl: { macroType: "wobble" } }, "m"),
        ).toThrow(/wobble/);
    });
});

describe("resolveMacroScope", () => {
    it("defaults to `global`", () => {
        expect(resolveMacroScope({}, "m")).toBe("global");
    });

    it("accepts every Foundry macro scope", () => {
        for (const scope of MACRO_SCOPES) {
            expect(
                resolveMacroScope({ sohl: { macroScope: scope } }, "m"),
            ).toBe(scope);
        }
    });

    it("rejects a scope Foundry does not define", () => {
        expect(() =>
            resolveMacroScope({ sohl: { macroScope: "party" } }, "m"),
        ).toThrow(/party/);
    });
});

/* -------------------------------------------------------------------- */
/*  The compiled Macro document                                         */
/* -------------------------------------------------------------------- */

const FM = {
    type: "macro",
    id: NOTE_ID,
    shortcode: "autoattack",
    name: { full: "Automated Attack" },
    img: "icons/game-icons/lorc/crossed-swords.svg",
    package: "sohl",
};

describe("buildMacroEntry", () => {
    it("keys into the macros collection", () => {
        const doc = buildMacroEntry(FM, { command: "x();" });
        expect(doc._id).toBe(NOTE_ID);
        expect(doc._key).toBe(`!macros!${NOTE_ID}`);
    });

    it("names the macro from its frontmatter", () => {
        expect(buildMacroEntry(FM, { command: "x();" }).name).toBe(
            "Automated Attack",
        );
    });

    it("states `script` explicitly — Foundry's initial type is CHAT", () => {
        expect(buildMacroEntry(FM, { command: "x();" }).type).toBe("script");
    });

    it("carries the command verbatim", () => {
        const doc = buildMacroEntry(FM, { command: "const x = 1\nfoo(x)" });
        expect(doc.command).toBe("const x = 1\nfoo(x)");
    });

    it("rewrites a content-relative image into its Foundry path", () => {
        expect(buildMacroEntry(FM, { command: "x();" }).img).toBe(
            "systems/sohl/assets/icons/game-icons/lorc/crossed-swords.svg",
        );
    });

    it("falls back to a core icon when the note authors none", () => {
        const doc = buildMacroEntry({ ...FM, img: "" }, { command: "x();" });
        expect(doc.img).toBe("icons/svg/dice-target.svg");
    });

    it("defaults scope to global and author to null", () => {
        const doc = buildMacroEntry(FM, { command: "x();" });
        expect(doc.scope).toBe("global");
        expect(doc.author).toBeNull();
    });

    it("files the macro in the folder the caller resolved", () => {
        const doc = buildMacroEntry(FM, { command: "x();", folder: "abc" });
        expect(doc.folder).toBe("abc");
        expect(buildMacroEntry(FM, { command: "x();" }).folder).toBeNull();
    });
});

/* -------------------------------------------------------------------- */
/*  The journal a macro note also compiles into                         */
/* -------------------------------------------------------------------- */

describe("a macro note carries documentation like an item does", () => {
    it("is a doc-carrying type", () => {
        expect(hasDocEntry("macro")).toBe(true);
    });

    it("keeps every item type doc-carrying", () => {
        for (const t of ITEM_TYPES) expect(hasDocEntry(t)).toBe(true);
        // Every item type, plus `macro`, plus the three map types — a map
        // note's prose is a JournalEntry of its own too (#1525).
        expect(DOC_ENTRY_TYPES.size).toBe(ITEM_TYPES.size + 1 + MAP_TYPES.size);
    });

    it("leaves `doc` notes and actors alone — they are one document each", () => {
        expect(hasDocEntry("doc")).toBe(false);
        expect(hasDocEntry("character")).toBe(false);
        expect(hasDocEntry("creature")).toBe(false);
    });

    it("compiles the {#script} page into the journal, withholding nothing", () => {
        const body = [
            "How to use it.",
            "",
            "# Script {#script}",
            "",
            "```js",
            "await go();",
            "```",
        ].join("\n");
        const entryId = itemDocEntryId(NOTE_ID);
        const pages = buildPages(
            splitPages(body, "Automated Attack"),
            entryId,
            "Automated Attack",
        );
        expect(pages.map((p) => p.name)).toEqual([
            "Automated Attack",
            "Script",
        ]);
        expect(pages[1].text.content).toContain("await go();");
    });
});

/* -------------------------------------------------------------------- */
/*  Addressing a macro and its documentation                            */
/* -------------------------------------------------------------------- */

const DOCS = [
    {
        type: "macro",
        id: NOTE_ID,
        shortcode: "autoattack",
        name: "Automated Attack",
        aliases: ["Automated Attack"],
    },
    { type: "doc", id: "docdocdocdocdoc1", shortcode: "usage", name: "Usage" },
];

const index = () => buildWikilinkIndex(DOCS, "sohl", undefined, "sohl");

const convert = (md: string) =>
    convertWikilinks(md, {
        type: "doc",
        id: "src0000000000000",
        index: index(),
    }).markdown;

describe("wikilinks to a macro and to its documentation", () => {
    it("addresses the Macro itself through the macros pack", () => {
        expect(convert("[[macro-autoattack]]")).toBe(
            `@UUID[Compendium.sohl.macros.Macro.${NOTE_ID}]{Automated Attack}`,
        );
    });

    it("addresses its documentation through the virtual `docmacro`", () => {
        expect(convert("[[docmacro-autoattack|the docs]]")).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${itemDocEntryId(
                NOTE_ID,
            )}]{the docs}`,
        );
    });

    it("reaches the script page by anchor", () => {
        const out = convert("[[docmacro-autoattack#script|source]]");
        expect(out).toContain(
            `Compendium.sohl.journals.JournalEntry.${itemDocEntryId(
                NOTE_ID,
            )}.JournalEntryPage.`,
        );
    });

    it("drops an anchor on the Macro — a sheet has no sections", () => {
        expect(convert("[[macro-autoattack#script|x]]")).toBe(
            `@UUID[Compendium.sohl.macros.Macro.${NOTE_ID}]{x}`,
        );
    });
});

describe("`docmacro` is synthesized, never a real type", () => {
    /** A foreign manifest publishing a macro and its documentation. */
    const foreign = new Map([
        [
            "thalorna-macro-summon",
            {
                name: "Summon",
                type: "macro",
                package: "thalorna",
                uuid: "Compendium.thalorna.macros.Macro.aaaaaaaaaaaaaaaa",
            },
        ],
        [
            "thalorna-docmacro-summon",
            {
                name: "Summon",
                type: "docmacro",
                package: "thalorna",
                uuid: "Compendium.thalorna.journals.JournalEntry.bbbbbbbbbbbbbbbb",
            },
        ],
    ]);

    const localOnlyDocs = [
        { type: "doc", id: "docdocdocdocdoc1", shortcode: "usage" },
    ];

    it("does not admit a foreign `docmacro` key to the known-type set", () => {
        // No local macro notes at all: `macro` is known only from the manifest,
        // so admitting `docmacro` alongside it would depend on iteration order.
        const idx = buildWikilinkIndex(localOnlyDocs, "sohl", foreign, "sohl");
        expect(idx.types.has("macro")).toBe(true);
        expect(idx.types.has("docmacro")).toBe(false);
    });

    it("still resolves a foreign macro's documentation through the prefix", () => {
        const idx = buildWikilinkIndex(localOnlyDocs, "sohl", foreign, "sohl");
        const out = convertWikilinks("[[thalorna-docmacro-summon|S]]", {
            type: "doc",
            id: "src0000000000000",
            index: idx,
        });
        expect(out.markdown).toBe(
            "@UUID[Compendium.thalorna.journals.JournalEntry.bbbbbbbbbbbbbbbb]{S}",
        );
    });
});
