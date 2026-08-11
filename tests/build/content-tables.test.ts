/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time content helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    parseTableDirective,
    expandContentTables,
} from "../../utils/content-tables.mjs";

/**
 * A content note as the build hands it to the expander. `path` is the note's
 * location under `assets/content/`, which the `path:` search term globs.
 */
function doc(
    tld: string,
    folder: string,
    fm: Record<string, unknown>,
    file?: string,
) {
    const leaf =
        file ??
        `${String((fm.name as { full?: string })?.full ?? "note").replace(/\s+/g, "_")}.md`;
    return { tld, folder, fm, path: `${tld}/${folder}/${leaf}` };
}

/** Three cloth armour notes plus one mail note and one unrelated weapon. */
function armourDocs() {
    return [
        doc("Armor", "Clothing", {
            id: "aaaa000000000001",
            type: "armorgear",
            package: "sohl",
            shortcode: "RRobe",
            name: { full: "Russet Robe" },
            sohl: {
                material: "Cloth",
                weight: 2,
                value: 95,
                protection: { blunt: 4, edged: 8, piercing: 5, fire: 5 },
            },
        }),
        doc("Armor", "Clothing", {
            id: "aaaa000000000002",
            type: "armorgear",
            package: "sohl",
            shortcode: "LTunic",
            name: { full: "Linen Tunic" },
            sohl: {
                material: "Cloth",
                weight: 1,
                value: 30,
                protection: { blunt: 1, edged: 2, piercing: 1, fire: 2 },
            },
        }),
        doc("Armor", "Armor", {
            id: "aaaa000000000003",
            type: "armorgear",
            package: "sohl",
            shortcode: "MHaub",
            name: { full: "Mail Hauberk" },
            sohl: {
                material: "Mail",
                weight: 20,
                value: 900,
                protection: { blunt: 6, edged: 12, piercing: 9, fire: 1 },
            },
        }),
        doc("Weapons", "Swords", {
            id: "aaaa000000000004",
            type: "weapongear",
            package: "sohl",
            shortcode: "Dagger",
            name: { full: "Dagger" },
            sohl: { weight: 1, value: 20 },
        }),
    ];
}

/** Every note in these fixtures is linkable unless a test says otherwise. */
const linkable = (d: { fm: Record<string, unknown> }) =>
    Boolean(d.fm.shortcode);

function expand(markdown: string, opts: Record<string, unknown> = {}) {
    return expandContentTables(markdown, {
        docs: armourDocs(),
        linkable,
        source: "Rules/Armour.md",
        ...opts,
    });
}

describe("parseTableDirective", () => {
    it("parses the canonical search + columns form", () => {
        const spec = parseTableDirective(
            "(@Table search=[type:armorgear, sohl.material:Cloth] columns=[Name:name.full, Weight:sohl.weight])",
        );
        expect(spec.search).toEqual([
            { path: "type", negate: false, values: ["armorgear"] },
            { path: "sohl.material", negate: false, values: ["cloth"] },
        ]);
        expect(spec.columns).toEqual([
            { header: "Name", path: "name.full" },
            { header: "Weight", path: "sohl.weight" },
        ]);
    });

    it("defaults sorting and linking to the first column", () => {
        const spec = parseTableDirective(
            "(@Table search=[type:armorgear] columns=[Name:name.full, Weight:sohl.weight])",
        );
        expect(spec.sort).toEqual([{ path: "name.full", descending: false }]);
        expect(spec.link).toBe("Name");
    });

    it("reads explicit sort keys, honouring a leading '-' for descending", () => {
        const spec = parseTableDirective(
            "(@Table search=[type:armorgear] columns=[Name:name.full] sort=[-sohl.value, name.full])",
        );
        expect(spec.sort).toEqual([
            { path: "sohl.value", descending: true },
            { path: "name.full", descending: false },
        ]);
    });

    it("accepts link=none to suppress the row link", () => {
        const spec = parseTableDirective(
            "(@Table search=[type:armorgear] columns=[Name:name.full] link=none)",
        );
        expect(spec.link).toBeNull();
    });

    it("parses a directive split across several lines", () => {
        const spec = parseTableDirective(
            "(@Table\n  search=[type:armorgear]\n  columns=[Name:name.full, Weight:sohl.weight]\n)",
        );
        expect(spec.columns).toHaveLength(2);
    });

    it("rejects an unknown option", () => {
        expect(() =>
            parseTableDirective(
                "(@Table search=[type:armorgear] columns=[Name:name.full] limit=5)",
            ),
        ).toThrow(/unknown option "limit"/);
    });

    it("rejects a missing or empty columns list", () => {
        expect(() =>
            parseTableDirective("(@Table search=[type:armorgear])"),
        ).toThrow(/requires a "columns"/);
        expect(() =>
            parseTableDirective("(@Table search=[type:armorgear] columns=[])"),
        ).toThrow(/requires a "columns"/);
    });

    it("rejects a missing search list", () => {
        expect(() =>
            parseTableDirective("(@Table columns=[Name:name.full])"),
        ).toThrow(/requires a "search"/);
    });

    it("rejects a column with no path and a predicate with no value", () => {
        expect(() =>
            parseTableDirective(
                "(@Table search=[type:armorgear] columns=[Name])",
            ),
        ).toThrow(/column "Name"/);
        expect(() =>
            parseTableDirective(
                "(@Table search=[armorgear] columns=[Name:name.full])",
            ),
        ).toThrow(/search term "armorgear"/);
    });

    it("rejects a link naming a column that is not in the table", () => {
        expect(() =>
            parseTableDirective(
                "(@Table search=[type:armorgear] columns=[Name:name.full] link=Shortcode)",
            ),
        ).toThrow(/link="Shortcode"/);
    });
});

describe("expandContentTables — selection", () => {
    it("ANDs the search terms together", () => {
        const { markdown, errors } = expand(
            "(@Table search=[type:armorgear, sohl.material:Cloth] columns=[Name:name.full] link=none)",
        );
        expect(errors).toEqual([]);
        expect(markdown).toContain("Russet Robe");
        expect(markdown).toContain("Linen Tunic");
        expect(markdown).not.toContain("Mail Hauberk");
        expect(markdown).not.toContain("Dagger");
    });

    it("matches any of a '|'-separated value list", () => {
        const { markdown } = expand(
            "(@Table search=[sohl.material:Cloth|Mail] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Mail Hauberk");
        expect(markdown).toContain("Russet Robe");
        expect(markdown).not.toContain("Dagger");
    });

    it("negates a term with a leading '!'", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear, sohl.material:!Cloth] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Mail Hauberk");
        expect(markdown).not.toContain("Russet Robe");
    });

    it("matches on presence with '*' and absence with '!*'", () => {
        const present = expand(
            "(@Table search=[sohl.material:*] columns=[Name:name.full] link=none)",
        );
        expect(present.markdown).toContain("Russet Robe");
        expect(present.markdown).not.toContain("Dagger");

        const absent = expand(
            "(@Table search=[sohl.material:!*] columns=[Name:name.full] link=none)",
        );
        expect(absent.markdown).toContain("Dagger");
        expect(absent.markdown).not.toContain("Russet Robe");
    });

    it("compares values case-insensitively", () => {
        const { markdown } = expand(
            "(@Table search=[sohl.material:cloth] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Russet Robe");
    });

    it("parses a path term written with either separator", () => {
        for (const raw of [
            "(@Table search=[path:Creatures/Animal/*.md] columns=[Name:name.full])",
            "(@Table search=[path=Creatures/Animal/*.md] columns=[Name:name.full])",
        ]) {
            expect(parseTableDirective(raw).search).toEqual([
                {
                    path: "path",
                    negate: false,
                    values: ["creatures/animal/*.md"],
                },
            ]);
        }
    });

    it("searches on the synthetic tld and folder paths", () => {
        const { markdown } = expand(
            "(@Table search=[tld:Armor, folder:Clothing] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Russet Robe");
        expect(markdown).not.toContain("Mail Hauberk");
    });

    it("globs the content path with '*' (one segment) and '**' (any depth)", () => {
        const oneSegment = expand(
            "(@Table search=[path:Armor/Clothing/*.md] columns=[Name:name.full] link=none)",
        );
        expect(oneSegment.markdown).toContain("Russet Robe");
        expect(oneSegment.markdown).toContain("Linen Tunic");
        expect(oneSegment.markdown).not.toContain("Mail Hauberk");

        // A single `*` does not cross a directory separator; `**` does.
        const shallow = expand(
            "(@Table search=[path:Armor/*.md] columns=[Name:name.full] link=none)",
        );
        expect(shallow.errors[0].reason).toMatch(/matched no content notes/);

        const deep = expand(
            "(@Table search=[path:Armor/**] columns=[Name:name.full] link=none)",
        );
        expect(deep.markdown).toContain("Russet Robe");
        expect(deep.markdown).toContain("Mail Hauberk");
        expect(deep.markdown).not.toContain("Dagger");
    });

    it("accepts '=' as the search-term separator, as in path=…", () => {
        const { markdown, errors } = expand(
            "(@Table search=[path=Armor/Clothing/**] columns=[Name:name.full] link=none)",
        );
        expect(errors).toEqual([]);
        expect(markdown).toContain("Russet Robe");
        expect(markdown).not.toContain("Mail Hauberk");
    });

    it("reads a trailing '/' as everything below that directory", () => {
        const { markdown } = expand(
            "(@Table search=[path:Armor/Clothing/] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Linen Tunic");
        expect(markdown).not.toContain("Mail Hauberk");
    });

    it("negates a path glob", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear, path:!Armor/Clothing/**] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Mail Hauberk");
        expect(markdown).not.toContain("Russet Robe");
    });

    it("globs an ordinary frontmatter value too", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear, sohl.material:Cl*h] columns=[Name:name.full] link=none)",
        );
        expect(markdown).toContain("Russet Robe");
        expect(markdown).not.toContain("Mail Hauberk");
    });

    it("matches any element of an array-valued field", () => {
        const docs = [
            doc("Rules", "Rules", {
                id: "bbbb000000000001",
                type: "doc",
                name: { full: "Bleeding" },
                tags: ["injury", "combat"],
            }),
            doc("Rules", "Rules", {
                id: "bbbb000000000002",
                type: "doc",
                name: { full: "Shock" },
                tags: ["injury"],
            }),
        ];
        const { markdown } = expand(
            "(@Table search=[tags:combat] columns=[Name:name.full] link=none)",
            { docs },
        );
        expect(markdown).toContain("Bleeding");
        expect(markdown).not.toContain("Shock");
    });
});

describe("expandContentTables — rendering", () => {
    it("renders a header row, a separator, and one row per match", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear, sohl.material:Cloth] columns=[Name:name.full, Weight:sohl.weight] link=none)",
        );
        const rows = markdown.trim().split("\n");
        expect(rows[0]).toBe("| Name | Weight |");
        expect(rows[1]).toBe("| --- | ---: |");
        expect(rows[2]).toBe("| Linen Tunic | 1 |");
        expect(rows[3]).toBe("| Russet Robe | 2 |");
        expect(rows).toHaveLength(4);
    });

    it("sorts by the first column by default and by explicit keys when given", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear] columns=[Name:name.full, Value:sohl.value] sort=[-sohl.value] link=none)",
        );
        const names = markdown
            .trim()
            .split("\n")
            .slice(2)
            .map((r) => r.split("|")[1].trim());
        expect(names).toEqual(["Mail Hauberk", "Russet Robe", "Linen Tunic"]);
    });

    it("links the first column to the row's document by default", () => {
        const { markdown } = expand(
            "(@Table search=[sohl.material:Mail] columns=[Name:name.full, Weight:sohl.weight])",
        );
        expect(markdown).toContain(
            "| [[armorgear/MHaub\\|Mail Hauberk]] | 20 |",
        );
    });

    it("leaves the cell as plain text when the row's document is not linkable", () => {
        const { markdown } = expand(
            "(@Table search=[sohl.material:Mail] columns=[Name:name.full])",
            { linkable: () => false },
        );
        expect(markdown).toContain("| Mail Hauberk |");
        expect(markdown).not.toContain("[[");
    });

    it("links whichever column link= names", () => {
        const { markdown } = expand(
            "(@Table search=[sohl.material:Mail] columns=[Name:name.full, Code:shortcode] link=Code)",
        );
        expect(markdown).toContain(
            "| Mail Hauberk | [[armorgear/MHaub\\|MHaub]] |",
        );
    });

    it("renders an absent value as an em dash and keeps the column left-aligned", () => {
        const { markdown } = expand(
            "(@Table search=[type:weapongear] columns=[Name:name.full, Blunt:sohl.protection.blunt] link=none)",
        );
        expect(markdown).toContain("| Dagger | — |");
        expect(markdown.trim().split("\n")[1]).toBe("| --- | --- |");
    });

    it("joins array values, renders booleans as yes/no, and escapes pipes", () => {
        const docs = [
            doc("Rules", "Rules", {
                id: "cccc000000000001",
                type: "doc",
                name: { full: "Odd | Name" },
                tags: ["a", "b"],
                sohl: { ranged: true, thrown: false },
            }),
        ];
        const { markdown } = expand(
            "(@Table search=[type:doc] columns=[Name:name.full, Tags:tags, Ranged:sohl.ranged, Thrown:sohl.thrown] link=none)",
            { docs },
        );
        expect(markdown).toContain("| Odd \\| Name | a, b | yes | no |");
    });

    it("right-aligns a column whose values are all numeric", () => {
        const { markdown } = expand(
            "(@Table search=[type:armorgear] columns=[Name:name.full, B:sohl.protection.blunt, E:sohl.protection.edged] link=none)",
        );
        expect(markdown.trim().split("\n")[1]).toBe("| --- | ---: | ---: |");
    });

    it("separates the table from surrounding prose and keeps that prose intact", () => {
        const { markdown } = expand(
            "Cloth armour:\n\n(@Table search=[sohl.material:Cloth] columns=[Name:name.full] link=none)\n\nMail is heavier.",
        );
        expect(markdown).toMatch(/Cloth armour:\n\n\| Name \|/);
        expect(markdown).toMatch(/\|\n\nMail is heavier\./);
    });

    it("expands every directive in a body", () => {
        const { markdown, errors } = expand(
            "(@Table search=[sohl.material:Cloth] columns=[Name:name.full] link=none)\n\n(@Table search=[sohl.material:Mail] columns=[Name:name.full] link=none)",
        );
        expect(errors).toEqual([]);
        expect(markdown).toContain("Russet Robe");
        expect(markdown).toContain("Mail Hauberk");
    });

    it("leaves a directive inside a code fence or a code span alone", () => {
        const body =
            "```\n(@Table search=[type:armorgear] columns=[Name:name.full])\n```\n\nUse `(@Table search=[type:armorgear] columns=[Name:name.full])` to tabulate.";
        const { markdown, errors } = expand(body);
        expect(markdown).toBe(body);
        expect(errors).toEqual([]);
    });
});

describe("expandContentTables — errors", () => {
    it("reports a search that matches nothing and leaves the directive in place", () => {
        const directive =
            "(@Table search=[type:armorgear, sohl.material:Adamant] columns=[Name:name.full])";
        const { markdown, errors } = expand(directive);
        expect(markdown).toBe(directive);
        expect(errors).toHaveLength(1);
        expect(errors[0].source).toBe("Rules/Armour.md");
        expect(errors[0].reason).toMatch(/matched no content notes/);
    });

    it("reports a malformed directive and leaves it in place", () => {
        const directive = "(@Table search=[type:armorgear])";
        const { markdown, errors } = expand(directive);
        expect(markdown).toBe(directive);
        expect(errors[0].reason).toMatch(/requires a "columns"/);
    });

    it("reports a column path that resolves to an object", () => {
        const { errors } = expand(
            "(@Table search=[sohl.material:Mail] columns=[Prot:sohl.protection])",
        );
        expect(errors).toHaveLength(1);
        expect(errors[0].reason).toMatch(/resolves to an object/);
    });
});
