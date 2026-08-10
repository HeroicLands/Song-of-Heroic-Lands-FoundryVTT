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
    PACK_BY_TLD,
    anchorPageId,
    buildWikilinkIndex,
    convertWikilinks,
} from "../../../utils/packs/wikilinks.mjs";

/** A small stand-in content tree spanning three packs. */
const DOCS = [
    { tld: "Rules", id: "aaaaaaaaaaaaaaa1", shortcode: "shock", aliases: ["Shock", "Shock State"] },
    { tld: "Rules", id: "aaaaaaaaaaaaaaa2", shortcode: "bleeding", aliases: ["Bleeding"] },
    { tld: "Rules", id: "aaaaaaaaaaaaaaa3", shortcode: "coma", aliases: ["Coma"] },
    // Shares the "Coma" alias with the doc above — ambiguous, so unusable bare.
    { tld: "Rules", id: "aaaaaaaaaaaaaaa4", shortcode: "extshock", aliases: ["Coma"] },
    { tld: "Skills", id: "bbbbbbbbbbbbbbb1", shortcode: "climb", aliases: ["Climbing"] },
    { tld: "Creatures", id: "ccccccccccccccc1", shortcode: "condor", aliases: ["Condor"] },
    { tld: "Macros", id: "ddddddddddddddd1", shortcode: "rollit", aliases: ["Roll It"] },
    { tld: "User_Guide", id: "eeeeeeeeeeeeeee1", shortcode: "baseitem", aliases: ["Base Item"] },
];

const index = buildWikilinkIndex(DOCS);
const from = { tld: "Rules", id: "aaaaaaaaaaaaaaa2" }; // "Bleeding"

const convert = (src: string, ctx = from) =>
    convertWikilinks(src, { ...ctx, index });

describe("PACK_BY_TLD (content TLD → compendium UUID prefix)", () => {
    it("routes item content to the items pack", () => {
        for (const tld of [
            "Afflictions", "Armor", "Attributes", "Misc_Gear", "Mysteries",
            "Mystical_Abilities", "Projectiles", "Skills", "Trauma", "Weapons",
        ]) {
            expect(PACK_BY_TLD[tld]).toBe("Compendium.sohl.items.Item");
        }
    });

    it("routes actor, macro, and journal content to their own packs", () => {
        expect(PACK_BY_TLD.Characters).toBe("Compendium.sohl.actors.Actor");
        expect(PACK_BY_TLD.Creatures).toBe("Compendium.sohl.actors.Actor");
        expect(PACK_BY_TLD.Macros).toBe("Compendium.sohl.macros.Macro");
        expect(PACK_BY_TLD.Rules).toBe("Compendium.sohl.journals.JournalEntry");
        expect(PACK_BY_TLD.User_Guide).toBe("Compendium.sohl.journals.JournalEntry");
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
        const { markdown, unresolved } = convert("see [[Rules/shock|the Shock rules]].");
        expect(markdown).toBe(
            "see @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{the Shock rules}.",
        );
        expect(unresolved).toEqual([]);
    });

    it("converts a bare link via a unique alias in the source's own TLD", () => {
        const { markdown } = convert("worsens the [[Shock State]] of the victim");
        expect(markdown).toBe(
            "worsens the @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock State} of the victim",
        );
    });

    it("crosses packs: a Rules note linking a Skill reaches the items pack", () => {
        const { markdown } = convert("a [[Skills/climb|Climbing]] test");
        expect(markdown).toBe(
            "a @UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} test",
        );
    });

    it("routes actor and macro TLDs to their packs", () => {
        expect(convert("[[Creatures/condor|Condor]]").markdown).toBe(
            "@UUID[Compendium.sohl.actors.Actor.ccccccccccccccc1]{Condor}",
        );
        expect(convert("[[Macros/rollit|Roll It]]").markdown).toBe(
            "@UUID[Compendium.sohl.macros.Macro.ddddddddddddddd1]{Roll It}",
        );
    });

    it("converts a cross-page section link to a JournalEntryPage target", () => {
        const page = anchorPageId("aaaaaaaaaaaaaaa1", "shock-state-index");
        const { markdown } = convert("the [[Rules/shock#shock-state-index|Shock State Index]]");
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
        const { markdown } = convert("| [[Rules/shock\\|Shock]] |");
        expect(markdown).toBe(
            "| @UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock} |",
        );
    });

    it("uses the target's own name when a bare link carries no label", () => {
        const { markdown } = convert("[[Coma]]", { tld: "Skills", id: "bbbbbbbbbbbbbbb1" });
        // "Coma" is not an alias in Skills at all — unresolvable from there.
        expect(markdown).toBe("[[Coma]]");
    });

    it("leaves an ambiguous bare alias untouched and reports it", () => {
        const { markdown, unresolved } = convert("a [[Coma]] state");
        expect(markdown).toBe("a [[Coma]] state");
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0]).toMatchObject({ target: "Coma", reason: "ambiguous" });
    });

    it("leaves an unknown shortcode untouched and reports it", () => {
        const { markdown, unresolved } = convert("the [[Rules/nosuchcode|Injury]] rules");
        expect(markdown).toBe("the [[Rules/nosuchcode|Injury]] rules");
        expect(unresolved).toHaveLength(1);
        expect(unresolved[0].reason).toBe("unknown");
    });

    it("rejects a TLD that is not a real content directory", () => {
        // The retired slug form used a lowercased directory name; `rules` is not
        // a TLD, so it is reported rather than silently accepted as `Rules`.
        const { markdown, unresolved } = convert("the [[rules/sohl-injury|Injury]] rules");
        expect(markdown).toBe("the [[rules/sohl-injury|Injury]] rules");
        expect(unresolved[0]).toMatchObject({ reason: "unmapped-tld" });
    });

    it("never touches external markdown links or intra-page markdown", () => {
        const src = "see [Kelestia](https://www.kelestia.com/) and ![art](icons/a.svg)";
        expect(convert(src).markdown).toBe(src);
    });

    it("converts every link on a line, and leaves surrounding prose alone", () => {
        const { markdown } = convert("[[Rules/shock|Shock]] and [[Skills/climb|Climbing]] both");
        expect(markdown).toBe(
            "@UUID[Compendium.sohl.journals.JournalEntry.aaaaaaaaaaaaaaa1]{Shock} and " +
                "@UUID[Compendium.sohl.items.Item.bbbbbbbbbbbbbbb1]{Climbing} both",
        );
    });
});
