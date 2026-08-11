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
} from "../../../utils/packs/wikilinks.mjs";

/** A small stand-in content tree spanning three packs. */
const DOCS = [
    { type: "doc", section: "rules", id: "aaaaaaaaaaaaaaa1", shortcode: "shock", aliases: ["Shock", "Shock State"] },
    { type: "doc", section: "rules", id: "aaaaaaaaaaaaaaa2", shortcode: "bleeding", aliases: ["Bleeding"] },
    { type: "doc", section: "rules", id: "aaaaaaaaaaaaaaa3", shortcode: "coma", aliases: ["Coma"] },
    // Shares the "Coma" alias with the doc above — ambiguous, so unusable bare.
    { type: "doc", section: "rules", id: "aaaaaaaaaaaaaaa4", shortcode: "extshock", aliases: ["Coma"] },
    { type: "skill", section: "skill", id: "bbbbbbbbbbbbbbb1", shortcode: "climb", aliases: ["Climbing"] },
    { type: "creature", section: "creature", id: "ccccccccccccccc1", shortcode: "condor", aliases: ["Condor"] },
    { type: "macro", section: "macro", id: "ddddddddddddddd1", shortcode: "rollit", aliases: ["Roll It"] },
    { type: "containergear", section: "containergear", id: "eeeeeeeeeeeeeee1", shortcode: "backpack", aliases: ["Backpack"] },
];

const index = buildWikilinkIndex(DOCS);
const from = { type: "doc", section: "rules", id: "aaaaaaaaaaaaaaa2" }; // "Bleeding"

const convert = (src: string, ctx = from) =>
    convertWikilinks(src, { ...ctx, index });

describe("packForType (content type → compendium UUID prefix)", () => {
    it("routes the non-item types to their own packs", () => {
        expect(packForType("doc")).toBe("Compendium.sohl.journals.JournalEntry");
        expect(packForType("macro")).toBe("Compendium.sohl.macros.Macro");
        expect(packForType("character")).toBe("Compendium.sohl.actors.Actor");
        expect(packForType("creature")).toBe("Compendium.sohl.actors.Actor");
        expect(Object.keys(PACK_BY_TYPE).sort()).toEqual([
            "character",
            "creature",
            "doc",
            "macro",
        ]);
    });

    it("routes every other type to the items pack, including one it has never seen", () => {
        for (const type of [
            "armorgear", "weapongear", "containergear", "miscgear", "skill",
            "attribute", "affliction", "trauma", "mystery", "mysticalability",
        ]) {
            expect(packForType(type)).toBe("Compendium.sohl.items.Item");
        }
        // Item types are the open set, so a type added tomorrow is linkable the
        // day it is authored — no table to forget (#1276).
        expect(packForType("somenewgear")).toBe("Compendium.sohl.items.Item");
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
        expect(a).not.toBe(anchorPageId("aaaaaaaaaaaaaaa9", "shock-state-index"));
    });
});

describe("convertWikilinks", () => {
    it("converts a qualified link to a same-pack @UUID enricher", () => {
        const { markdown, unresolved } = convert("see [[doc/shock|the Shock rules]].");
        expect(markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{the Shock rules}.",
        );
        expect(unresolved).toEqual([]);
    });

    it("converts a bare link via a unique alias in the source's own section", () => {
        const { markdown } = convert("worsens the [[Shock State]] of the victim");
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
        const { markdown } = convert("the [[doc/shock#shock-state-index|Shock State Index]]");
        expect(markdown).toBe(
            "the @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1.JournalEntryPage." +
                page +
                "]{Shock State Index}",
        );
    });

    it("resolves a same-page anchor against the source note itself", () => {
        const page = anchorPageId(from.id, "blood-loss-advance-test");
        const { markdown } = convert("see [[#blood-loss-advance-test|the advance test]]");
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
        const { markdown } = convert("[[Coma]]", { type: "skill", section: "skill", id: "bbbbbbbbbbbbbbb1" });
        // "Coma" is not an alias of any skill — unresolvable from there.
        expect(markdown).toBe("[[Coma]]");
    });

    it("leaves an ambiguous bare alias untouched and reports it", () => {
        const { markdown, unresolved } = convert("a [[Coma]] state");
        expect(markdown).toBe("a [[Coma]] state");
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0]).toMatchObject({ target: "Coma", reason: "ambiguous" });
    });

    it("leaves an unknown shortcode untouched and reports it", () => {
        const { markdown, unresolved } = convert("the [[doc/nosuchcode|Injury]] rules");
        expect(markdown).toBe("the [[doc/nosuchcode|Injury]] rules");
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0].reason).toBe("unknown");
    });

    it("rejects a qualifier that is not a content type — including the retired directory form", () => {
        const { markdown, unresolved } = convert("the [[Rules/shock|Shock]] rules");
        expect(markdown).toBe("the [[Rules/shock|Shock]] rules");
        expect(unresolved[0]).toMatchObject({ reason: "unknown-type" });
    });

    it("never touches external markdown links or intra-page markdown", () => {
        const src = "see [Kelestia](https://www.kelestia.com/) and ![art](icons/a.svg)";
        expect(convert(src).markdown).toBe(src);
    });

    it("converts every link on a line, and leaves surrounding prose alone", () => {
        const { markdown } = convert("[[doc/shock|Shock]] and [[skill/climb|Climbing]] both");
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock} and " +
                "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} both",
        );
    });
});
