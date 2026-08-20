/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    PACK_BY_TYPE,
    packForType,
    anchorPageId,
    buildWikilinkIndex,
    convertWikilinks,
    readQualifier,
} from "../engine/wikilinks.mjs";
import { itemDocEntryId } from "../engine/item-docs.mjs";

/** A small stand-in content tree spanning three packs. */
const DOCS = [
    {
        type: "doc",
        id: "aaaaaaaaaaaaaaa1",
        shortcode: "shock",
        name: "Shock",
        aliases: ["Shock", "Shock State"],
    },
    {
        type: "doc",
        id: "aaaaaaaaaaaaaaa2",
        shortcode: "bleeding",
        name: "Bleeding",
        aliases: ["Bleeding"],
    },
    {
        type: "doc",
        id: "aaaaaaaaaaaaaaa3",
        shortcode: "coma",
        name: "Coma",
        aliases: ["Coma"],
    },
    // Shares the "Coma" alias with the doc above — ambiguous, so unusable bare.
    {
        type: "doc",
        id: "aaaaaaaaaaaaaaa4",
        shortcode: "extshock",
        name: "Extreme Shock",
        aliases: ["Coma"],
    },
    {
        type: "skill",
        id: "bbbbbbbbbbbbbbb1",
        shortcode: "climb",
        name: "Climbing",
        aliases: ["Climbing"],
    },
    {
        type: "creature",
        id: "ccccccccccccccc1",
        shortcode: "condor",
        name: "Condor",
        aliases: ["Condor"],
    },
    {
        type: "macro",
        id: "ddddddddddddddd1",
        shortcode: "rollit",
        name: "Roll It",
        aliases: ["Roll It"],
    },
    {
        type: "containergear",
        id: "eeeeeeeeeeeeeee1",
        shortcode: "backpack",
        name: "Backpack",
        aliases: ["Backpack"],
    },
];

const index = buildWikilinkIndex(DOCS, "sohl");
const from = { type: "doc", id: "aaaaaaaaaaaaaaa2" }; // "Bleeding"

const convert = (src: string, ctx = from) =>
    convertWikilinks(src, { ...ctx, index });

describe("packForType (content type → the pack it compiles into)", () => {
    it("routes the non-item types to their own packs", () => {
        // Pack *names*, not addresses: the package that owns them is supplied
        // by the caller, because it belongs to the repository doing the
        // building and not to the content (#1498).
        expect(packForType("doc")).toEqual({
            pack: "journals",
            docType: "JournalEntry",
        });
        expect(packForType("macro")).toEqual({
            pack: "macros",
            docType: "Macro",
        });
        expect(packForType("character")).toEqual({
            pack: "actors",
            docType: "Actor",
        });
        expect(packForType("creature")).toEqual({
            pack: "actors",
            docType: "Actor",
        });
        // A map note compiles into a Scene, so a link to one addresses the
        // scenes pack rather than falling through to items (#1525).
        for (const type of ["battlemap", "localmap", "regionalmap"]) {
            expect(packForType(type)).toEqual({
                pack: "scenes",
                docType: "Scene",
            });
        }
        expect(Object.keys(PACK_BY_TYPE).sort()).toEqual([
            "battlemap",
            "character",
            "creature",
            "doc",
            "localmap",
            "macro",
            "regionalmap",
        ]);
    });

    it("routes every other type to the items pack, including one it has never seen", () => {
        for (const type of [
            "armorgear",
            "weapongear",
            "containergear",
            "miscgear",
            "skill",
            "attribute",
            "affliction",
            "trauma",
            "mystery",
            "mysticalability",
        ]) {
            expect(packForType(type)).toEqual({
                pack: "items",
                docType: "Item",
            });
        }
        // Item types are the open set, so a type added tomorrow is linkable the
        // day it is authored — no table to forget (#1276).
        expect(packForType("somenewgear")).toEqual({
            pack: "items",
            docType: "Item",
        });
    });
});

describe("anchorPageId (deterministic JournalEntryPage id for an anchor)", () => {
    it("is a valid 16-character Foundry id", () => {
        const id = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        expect(id).toMatch(/^[A-Za-z0-9]{16}$/);
    });

    it("is deterministic for the same note id and anchor slug", () => {
        expect(anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index")).toBe(
            anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index"),
        );
    });

    it("differs by anchor slug and by note id", () => {
        const a = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        expect(a).not.toBe(anchorPageId("aaaaaaaaaaaaaaa1", "shock-states"));
        expect(a).not.toBe(
            anchorPageId("aaaaaaaaaaaaaaa9", "shock-state-index"),
        );
    });
});

describe("convertWikilinks", () => {
    it("converts a qualified link to a same-pack @UUID enricher", () => {
        const { markdown, unresolved } = convert(
            "see [[doc/shock|the Shock rules]].",
        );
        expect(markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{the Shock rules}.",
        );
        expect(unresolved).toEqual([]);
    });

    it("converts a bare link via a unique alias in the source's own type", () => {
        const { markdown } = convert(
            "worsens the [[Shock State]] of the victim",
        );
        expect(markdown).toBe(
            "worsens the @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock State} of the victim",
        );
    });

    it("crosses packs: a doc linking a skill reaches the items pack", () => {
        const { markdown } = convert("a [[skill/climb|Climbing]] test");
        expect(markdown).toBe(
            "a @UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} test",
        );
    });

    it("routes actor and macro types to their packs", () => {
        expect(convert("[[creature/condor|Condor]]").markdown).toBe(
            "@UUID[Compendium.sohl.actors.Actor.ccccccccccccccc1]{Condor}",
        );
        expect(convert("[[macro/rollit|Roll It]]").markdown).toBe(
            "@UUID[Compendium.sohl.macros.Macro.ddddddddddddddd1]{Roll It}",
        );
    });

    it("resolves a type whose directory has no pack mapping of its own (#1276)", () => {
        expect(convert("[[containergear/backpack|a backpack]]").markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.eeeeeeeeeeeeeee1]{a backpack}",
        );
    });

    it("matches the qualifier case-insensitively", () => {
        expect(convert("[[Skill/Climb|Climbing]]").markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
    });

    it("converts a cross-page section link to a JournalEntryPage target", () => {
        const page = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        const { markdown } = convert(
            "the [[doc/shock#shock-state-index|Shock State Index]]",
        );
        expect(markdown).toBe(
            "the @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1.JournalEntryPage." +
                page +
                "]{Shock State Index}",
        );
    });

    it("resolves a same-page anchor against the source note itself", () => {
        const page = anchorPageId(from.id, "blood-loss-advance-test");
        const { markdown } = convert(
            "see [[#blood-loss-advance-test|the advance test]]",
        );
        expect(markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa2.JournalEntryPage." +
                page +
                "]{the advance test}",
        );
    });

    it("accepts a table-escaped pipe (`\\|`) inside the link", () => {
        const { markdown } = convert("| [[doc/shock\\|Shock]] |");
        expect(markdown).toBe(
            "| @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock} |",
        );
    });

    it("cannot resolve a bare alias that belongs to another type", () => {
        const { markdown } = convert("[[Coma]]", {
            type: "skill",
            id: "bbbbbbbbbbbbbbb1",
        });
        // "Coma" is not an alias of any skill — unresolvable from there.
        expect(markdown).toBe(
            '<span class="sohl-unresolved-link" title="Unresolved link: Coma">Coma</span>',
        );
    });

    it("leaves an ambiguous bare alias untouched and reports it", () => {
        const { markdown, unresolved } = convert("a [[Coma]] state");
        expect(markdown).toBe(
            `a ${'<span class="sohl-unresolved-link" title="Unresolved link: Coma">Coma</span>'} state`,
        );
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0]).toMatchObject({
            target: "Coma",
            reason: "ambiguous",
        });
    });

    it("leaves an unknown shortcode untouched and reports it", () => {
        const { markdown, unresolved } = convert(
            "the [[doc/nosuchcode|Injury]] rules",
        );
        expect(markdown).toBe(
            `the ${'<span class="sohl-unresolved-link" title="Unresolved link: doc/nosuchcode">Injury</span>'} rules`,
        );
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0].reason).toBe("unknown");
    });

    it("rejects a qualifier that is not a content type — including the retired directory form", () => {
        const { markdown, unresolved } = convert(
            "the [[Rules/shock|Shock]] rules",
        );
        expect(markdown).toBe(
            `the ${'<span class="sohl-unresolved-link" title="Unresolved link: Rules/shock">Shock</span>'} rules`,
        );
        expect(unresolved[0]).toMatchObject({ reason: "unknown-type" });
    });

    it("never touches external markdown links or intra-page markdown", () => {
        const src =
            "see [Kelestia](https://www.kelestia.com/) and ![art](icons/a.svg)";
        expect(convert(src).markdown).toBe(src);
    });

    it("converts every link on a line, and leaves surrounding prose alone", () => {
        const { markdown } = convert(
            "[[doc/shock|Shock]] and [[skill/climb|Climbing]] both",
        );
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock} and " +
                "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} both",
        );
    });
});

/**
 * An item and its documentation are two different documents in two different
 * packs, so they need two different addresses. `skill/climb` is the item;
 * `docskill/climb` is the JournalEntry that item's prose compiled into (#1362).
 */
describe("convertWikilinks — the `doc<type>` virtual qualifier", () => {
    const climbDoc = itemDocEntryId("bbbbbbbbbbbbbbb1");

    it("addresses the item doc entry, not the item", () => {
        const { markdown, unresolved } = convert(
            "see [[docskill/climb|the Climbing rules]]",
        );
        expect(markdown).toBe(
            `see @UUID[Compendium.sohl.journals.JournalEntry.${climbDoc}]{the Climbing rules}`,
        );
        expect(unresolved).toEqual([]);
        // The two addresses must not collide.
        expect(climbDoc).not.toBe("bbbbbbbbbbbbbbb1");
    });

    it("addresses a page within the item doc via an anchor", () => {
        const page = anchorPageId(climbDoc, "crafting");
        const { markdown } = convert(
            "the [[docskill/climb#crafting|crafting rules]]",
        );
        expect(markdown).toBe(
            "the @UUID[Compendium.sohl.journals.JournalEntry." +
                `${climbDoc}.JournalEntryPage.${page}]{crafting rules}`,
        );
    });

    it("hashes the anchor against the item doc entry id, never the item id", () => {
        const page = anchorPageId(climbDoc, "crafting");
        expect(page).not.toBe(anchorPageId("bbbbbbbbbbbbbbb1", "crafting"));
    });

    it("works for any item type, including one it has never seen", () => {
        const backpackDoc = itemDocEntryId("eeeeeeeeeeeeeee1");
        expect(convert("[[doccontainergear/backpack|Backpack]]").markdown).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${backpackDoc}]{Backpack}`,
        );
    });

    it("matches the virtual qualifier case-insensitively", () => {
        expect(convert("[[DocSkill/Climb|Climbing]]").markdown).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${climbDoc}]{Climbing}`,
        );
    });

    it("leaves the plain item qualifier pointing at the item", () => {
        expect(convert("[[skill/climb|Climbing]]").markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
    });

    it("rejects `doc` applied to a type that has no item doc", () => {
        // `doc` and `creature` compile to the journals and actors packs
        // respectively; neither has an item doc to address.
        for (const [link, text, target] of [
            ["[[docdoc/shock|Shock]]", "Shock", "docdoc/shock"],
            ["[[doccreature/condor|Condor]]", "Condor", "doccreature/condor"],
        ]) {
            const { markdown, unresolved } = convert(link);
            // The author's text survives, marked so the reader can tell a link
            // was meant. Dropping it would silently rewrite the sentence.
            expect(markdown).toBe(
                `<span class="sohl-unresolved-link" title="Unresolved link: ${target}">${text}</span>`,
            );
            expect(unresolved[0]).toMatchObject({ reason: "unknown-type" });
        }
    });

    it("reports an unknown shortcode under a valid virtual qualifier", () => {
        const { markdown, unresolved } = convert(
            "[[docskill/nosuchcode|Nope]]",
        );
        expect(markdown).toBe(
            '<span class="sohl-unresolved-link" title="Unresolved link: docskill/nosuchcode">Nope</span>',
        );
        expect(unresolved[0]).toMatchObject({ reason: "unknown" });
    });

    it("ignores an anchor applied to an Item — an Item has no pages", () => {
        // Only a JournalEntry has pages. Rather than forge a JournalEntryPage id
        // onto a document that can never hold one (the #1362 defect), the anchor
        // is simply dropped and the link addresses the item.
        const { markdown, unresolved } = convert(
            "[[skill/climb#crafting|Climbing]]",
        );
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
        expect(markdown).not.toContain("JournalEntryPage");
        expect(unresolved).toEqual([]);
    });

    it("ignores an anchor on an actor or a macro for the same reason", () => {
        expect(convert("[[creature/condor#wings|Condor]]").markdown).toBe(
            "@UUID[Compendium.sohl.actors.Actor.ccccccccccccccc1]{Condor}",
        );
        expect(convert("[[macro/rollit#step|Roll It]]").markdown).toBe(
            "@UUID[Compendium.sohl.macros.Macro.ddddddddddddddd1]{Roll It}",
        );
    });

    it("still honours the anchor on the item's documentation", () => {
        // The same anchor that is meaningless on the item addresses a real page
        // on its item doc.
        const page = anchorPageId(climbDoc, "crafting");
        expect(convert("[[docskill/climb#crafting|Crafting]]").markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry." +
                `${climbDoc}.JournalEntryPage.${page}]{Crafting}`,
        );
    });

    it("prefers a real content type over the virtual reading of the same name", () => {
        // Were a type literally named `docskill` ever authored, it would own the
        // qualifier — the virtual form is only consulted when no such type exists.
        const withReal = buildWikilinkIndex(
            [
                ...DOCS,
                {
                    type: "docskill",
                    id: "fffffffffffffff1",
                    shortcode: "climb",
                    aliases: [],
                },
            ],
            "sohl",
        );
        const { markdown } = convertWikilinks("[[docskill/climb|X]]", {
            ...from,
            index: withReal,
        });
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.fffffffffffffff1]{X}",
        );
    });
});

describe("convertWikilinks — the `type-shortcode` separator (#1398)", () => {
    it("resolves a hyphen-qualified target exactly as the slash form does", () => {
        const slash = convert("[[doc/shock|the Shock rules]]");
        const hyphen = convert("[[doc-shock|the Shock rules]]");
        expect(hyphen.markdown).toBe(slash.markdown);
        expect(hyphen.unresolved).toEqual([]);
    });

    it("crosses types, which a bare alias cannot", () => {
        // The alias index is scoped to the *source* note's type, so until the
        // separator was understood this resolved only from a `doc` note and
        // silently failed from every other type — 283 links at the time.
        const fromSkill = { type: "skill", id: "bbbbbbbbbbbbbbb1" };
        const { markdown, unresolved } = convert(
            "[[doc-shock|Shock]]",
            fromSkill,
        );
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock}",
        );
        expect(unresolved).toEqual([]);
    });

    it("carries an anchor through to the page target", () => {
        const page = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        expect(convert("[[doc-shock#shock-state-index|Index]]").markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1" +
                `.JournalEntryPage.${page}]{Index}`,
        );
    });

    it("reaches every pack, like the slash form", () => {
        expect(convert("[[skill-climb|Climbing]]").markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
        expect(convert("[[creature-condor|Condor]]").markdown).toBe(
            "@UUID[Compendium.sohl.actors.Actor.ccccccccccccccc1]{Condor}",
        );
    });

    it("supports the `doc<type>` virtual qualifier", () => {
        const climbDoc = itemDocEntryId("bbbbbbbbbbbbbbb1");
        expect(convert("[[docskill-climb|the Climbing rules]]").markdown).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${climbDoc}]{the Climbing rules}`,
        );
    });

    it("matches the qualifier case-insensitively", () => {
        expect(convert("[[Skill-Climb|Climbing]]").markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
    });

    it("splits at the FIRST hyphen, so a hyphenated shortcode survives", () => {
        // Two authored shortcodes contain a hyphen (`self-pro`, `self-suf`), so
        // the shortcode is everything after the first separator — the remainder
        // is never re-read as a second qualifier.
        const withHyphenCode = buildWikilinkIndex(
            [
                ...DOCS,
                {
                    type: "trauma",
                    id: "99999999999999a1",
                    shortcode: "self-pro",
                    aliases: [],
                },
            ],
            "sohl",
        );
        const { markdown, unresolved } = convertWikilinks(
            "[[trauma-self-pro|Self-Protective]]",
            { ...from, index: withHyphenCode },
        );
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.items.Item.99999999999999a1]{Self-Protective}",
        );
        expect(unresolved).toEqual([]);
    });

    it("leaves a hyphenated bare alias alone — it is not a qualified target", () => {
        // `Grukar-ahk` is a note *name*, not `type-shortcode`. A hyphen only
        // qualifies when what precedes it is a known type, which is why the
        // hyphen form cannot be treated as unconditionally qualified the way the
        // slash form is.
        const withDash = buildWikilinkIndex(
            [
                ...DOCS,
                {
                    type: "doc",
                    id: "77777777777777a1",
                    shortcode: "grukarahk",
                    aliases: ["Grukar-ahk"],
                },
            ],
            "sohl",
        );
        const { markdown, unresolved } = convertWikilinks("[[Grukar-ahk]]", {
            ...from,
            index: withDash,
        });
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.77777777777777a1]{Grukar-ahk}",
        );
        expect(unresolved).toEqual([]);
    });

    it("reports an unknown shortcode under a valid type", () => {
        const { markdown, unresolved } = convert("[[doc-nosuchcode|Nope]]");
        expect(markdown).toBe(
            '<span class="sohl-unresolved-link" title="Unresolved link: doc-nosuchcode">Nope</span>',
        );
        expect(unresolved[0]).toMatchObject({ reason: "unknown" });
    });
});

describe("convertWikilinks — an unlabelled link (#1409)", () => {
    it("shows a qualified target's document name, not its shortcode", () => {
        // `doc-shock` is an *address*, not prose: showing it to the reader
        // leaks the shortcode into the sentence.
        expect(convert("see [[doc-shock]]").markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock}",
        );
    });

    it("does the same for the legacy slash form", () => {
        expect(convert("see [[doc/shock]]").markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock}",
        );
    });

    it("shows the name of a target in another pack", () => {
        expect(convert("a [[skill-climb]] test").markdown).toBe(
            "a @UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} test",
        );
    });

    it("keeps the name when the link carries an anchor", () => {
        const page = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        expect(convert("[[doc-shock#shock-state-index]]").markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1" +
                `.JournalEntryPage.${page}]{Shock}`,
        );
    });

    it("names the item behind the `doc<type>` virtual qualifier", () => {
        const climbDoc = itemDocEntryId("bbbbbbbbbbbbbbb1");
        expect(convert("[[docskill-climb]]").markdown).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${climbDoc}]{Climbing}`,
        );
    });

    it("leaves a bare alias as the prose the author wrote", () => {
        // The bare form *is* the sentence: substituting the canonical name
        // would rewrite it ("worsens the Shock State" → "worsens the Shock").
        expect(convert("worsens the [[Shock State]]").markdown).toBe(
            "worsens the @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock State}",
        );
    });

    it("prefers the author's label over the document name", () => {
        expect(convert("[[doc-shock|the Shock rules]]").markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{the Shock rules}",
        );
    });

    it("falls back to the target when the document has no name", () => {
        const nameless = buildWikilinkIndex(
            [
                {
                    type: "doc",
                    id: "88888888888888a1",
                    shortcode: "nameless",
                    aliases: [],
                },
            ],
            "sohl",
        );
        const { markdown } = convertWikilinks("[[doc-nameless]]", {
            ...from,
            index: nameless,
        });
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.88888888888888a1]{doc-nameless}",
        );
    });
});

describe("readQualifier — the optional package segment (#1499)", () => {
    const TYPES = new Set(["skill", "doc", "creature"]);
    const PACKAGES = new Set(["sohl", "thalorna"]);

    it("reads a package-qualified address and reports the package", () => {
        expect(readQualifier("sohl-skill-lang", TYPES, PACKAGES)).toEqual({
            type: "skill",
            shortcode: "lang",
            itemDoc: false,
            package: "sohl",
        });
    });

    it("leaves the package undefined on a bare address, which defaults to local", () => {
        const read = readQualifier("skill-lang", TYPES, PACKAGES);
        expect(read).toMatchObject({ type: "skill", shortcode: "lang" });
        expect(read).not.toHaveProperty("package");
    });

    it("ignores the package reading when no packages are supplied", () => {
        // The pack build passes none, so behaviour there is exactly as before.
        expect(readQualifier("sohl-skill-lang", TYPES)).toBeNull();
    });

    it("does not treat a note name as a package just because it has hyphens", () => {
        // "Grukar-ahk" is an alias, not an address — the segment before the
        // hyphen has to be a package this build knows, and the remainder has to
        // parse as an address in its own right.
        expect(readQualifier("Grukar-ahk", TYPES, PACKAGES)).toBeNull();
        expect(readQualifier("sohl-notatype-x", TYPES, PACKAGES)).toBeNull();
    });

    it("still reads the virtual doc<type> form under a package", () => {
        expect(
            readQualifier("thalorna-docskill-wpnc", TYPES, PACKAGES),
        ).toEqual({
            type: "skill",
            shortcode: "wpnc",
            itemDoc: true,
            package: "thalorna",
        });
    });
});

describe("an unresolved link keeps its text and is marked (#1499)", () => {
    const index = buildWikilinkIndex(DOCS, "sohl");
    const from = { type: "doc", id: "1111111111111111", index };

    it("keeps the label, so the sentence still reads", () => {
        const { markdown } = convertWikilinks(
            "the [[skill-nosuchcode|climbing]] check",
            from,
        );
        expect(markdown).toContain(">climbing</span>");
        expect(markdown).toContain("the ");
        expect(markdown).toContain(" check");
    });

    it("carries the class the stylesheet marks it with", () => {
        const { markdown } = convertWikilinks("[[skill-nosuchcode]]", from);
        expect(markdown).toContain('class="sohl-unresolved-link"');
    });

    it("names the failed address in the tooltip", () => {
        const { markdown } = convertWikilinks("[[skill-nosuchcode]]", from);
        expect(markdown).toContain('title="Unresolved link: skill-nosuchcode"');
    });

    it("escapes the text and the address, so content cannot inject markup", () => {
        const { markdown } = convertWikilinks(
            '[[skill-nosuchcode|<img src=x onerror="alert(1)">]]',
            from,
        );
        expect(markdown).not.toContain("<img");
        expect(markdown).toContain("&lt;img");
    });
});

describe("a code fence is verbatim (#1505)", () => {
    it("leaves a nested array literal in a fence alone", () => {
        // `[[0]]` is not a link, and whether the old regex bit on it depended
        // on the array's shape — `[[1,2],[3,4]]` survived — so the corruption
        // looked arbitrary.
        const src = [
            "See [[doc-shock]] for the rules.",
            "",
            "```js",
            "const first = grid[[0]];",
            "```",
            "",
            "And [[skill-climb]] after.",
        ].join("\n");
        const { markdown, unresolved } = convert(src);
        expect(markdown).toContain("const first = grid[[0]];");
        expect(unresolved).toEqual([]);
        // The prose around it is still converted.
        expect(markdown).toContain(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock}",
        );
        expect(markdown).toContain(
            "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing}",
        );
    });

    it("does not report a would-be link inside a fence as unresolved", () => {
        const { markdown, unresolved } = convert(
            "```\n[[skill-nosuchcode]]\n```",
        );
        expect(markdown).toBe("```\n[[skill-nosuchcode]]\n```");
        expect(unresolved).toEqual([]);
    });

    it("leaves an indented code block and an inline span alone", () => {
        const src = [
            "Example:",
            "",
            "    grid[[0]]",
            "",
            "Write `grid[[0]]` inline, and link [[doc-shock]].",
        ].join("\n");
        const { markdown } = convert(src);
        expect(markdown).toContain("    grid[[0]]");
        expect(markdown).toContain("`grid[[0]]`");
        expect(markdown).toContain("@UUID[");
    });
});
