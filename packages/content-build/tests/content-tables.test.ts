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
    parseDataviewQuery,
    expandContentTables,
} from "../engine/content-tables.mjs";

/**
 * A content note as the build hands it to the expander. `path` is the note's
 * location under `assets/content/`, which the `file.*` fields read.
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
    return { fm, path: `${tld}/${folder}/${leaf}` };
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
            tags: ["cloth", "torso"],
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
            tags: ["cloth"],
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
            tags: ["metal"],
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

/** Wraps a query in the ```dataview fence an author writes in Obsidian. */
const block = (query: string) => "```dataview\n" + query + "\n```";

function expand(markdown: string, opts: Record<string, unknown> = {}) {
    return expandContentTables(markdown, {
        docs: armourDocs(),
        linkable,
        source: "Rules/Armour.md",
        ...opts,
    });
}

/** Expand a bare query (no surrounding prose) and return its markdown. */
function table(query: string, opts: Record<string, unknown> = {}) {
    const { markdown, errors } = expand(block(query), opts);
    expect(errors).toEqual([]);
    return markdown.trim();
}

/** The first-column cell text of every row, in order. */
function rowNames(markdown: string) {
    return markdown
        .trim()
        .split("\n")
        .slice(2)
        .map((r) => r.split("|")[1].trim());
}

describe("parseDataviewQuery", () => {
    it("parses the canonical TABLE WITHOUT ID query", () => {
        const spec = parseDataviewQuery(
            'TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.weight AS "Weight"\n' +
                'WHERE type = "armorgear"\n' +
                "SORT name.full ASC",
        );
        expect(spec.columns.map((c: any) => c.header)).toEqual([
            "Name",
            "Weight",
        ]);
        expect(spec.sort).toHaveLength(1);
        expect(spec.sort[0].descending).toBe(false);
        expect(spec.where).not.toBeNull();
    });

    it("accepts lowercase clause keywords and a lowercase 'as'", () => {
        const spec = parseDataviewQuery(
            'table without id link(file.path, name.full) as "Name"\n' +
                'where type = "armorgear"\n' +
                "sort name.full asc",
        );
        expect(spec.columns.map((c: any) => c.header)).toEqual(["Name"]);
    });

    it("adds the implicit File column when WITHOUT ID is absent", () => {
        const spec = parseDataviewQuery(
            'TABLE sohl.weight AS "Weight"\nWHERE type = "armorgear"',
        );
        expect(spec.columns.map((c: any) => c.header)).toEqual([
            "File",
            "Weight",
        ]);
    });

    it("headers a column with its expression text when AS is omitted", () => {
        const spec = parseDataviewQuery(
            'TABLE WITHOUT ID name.full, sohl.weight\nWHERE type = "armorgear"',
        );
        expect(spec.columns.map((c: any) => c.header)).toEqual([
            "name.full",
            "sohl.weight",
        ]);
    });

    it("reads a per-key sort direction, defaulting to ascending", () => {
        const spec = parseDataviewQuery(
            'TABLE WITHOUT ID name.full\nWHERE type = "armorgear"\n' +
                "SORT sohl.value DESC, name.full",
        );
        expect(spec.sort.map((s: any) => s.descending)).toEqual([true, false]);
    });

    it("does not mistake a field named like a clause keyword for a clause", () => {
        // The vault sorts traits on a frontmatter field literally named `sort`.
        const spec = parseDataviewQuery(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "trait"\n' +
                "SORT sort ASC",
        );
        expect(spec.sort).toHaveLength(1);
    });

    it("rejects a query that is not a TABLE", () => {
        expect(() =>
            parseDataviewQuery('LIST\nWHERE type = "armorgear"'),
        ).toThrow(/only TABLE queries/i);
    });

    it("rejects an unsupported clause by name", () => {
        expect(() =>
            parseDataviewQuery(
                'TABLE WITHOUT ID name.full\nWHERE type = "armorgear"\nGROUP BY type',
            ),
        ).toThrow(/GROUP BY/i);
    });

    it("rejects a malformed expression", () => {
        expect(() =>
            parseDataviewQuery(
                'TABLE WITHOUT ID name.full\nWHERE type = = "armorgear"',
            ),
        ).toThrow();
        expect(() =>
            parseDataviewQuery("TABLE WITHOUT ID link(file.path\nWHERE type"),
        ).toThrow();
    });

    it("rejects an unknown function", () => {
        expect(() =>
            parseDataviewQuery(
                'TABLE WITHOUT ID name.full\nWHERE bogus(type, "x")',
            ),
        ).toThrow(/bogus/);
    });
});

describe("expandContentTables — selection", () => {
    it("ANDs the WHERE predicates together", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear" and sohl.material = "Cloth"',
        );
        expect(md).toContain("Russet Robe");
        expect(md).toContain("Linen Tunic");
        expect(md).not.toContain("Mail Hauberk");
        expect(md).not.toContain("Dagger");
    });

    it("supports OR, NOT, and parentheses", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear" and (sohl.material = "Cloth" or sohl.material = "Mail")',
        );
        expect(rowNames(md)).toHaveLength(3);

        const negated = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear" and not (sohl.material = "Cloth")',
        );
        expect(rowNames(negated)).toEqual(["Mail Hauberk"]);
    });

    it("supports != and the ordering comparisons", () => {
        const ne = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear" and sohl.material != "Cloth"',
        );
        expect(rowNames(ne)).toEqual(["Mail Hauberk"]);

        const gt = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.value > 90',
        );
        expect(rowNames(gt).sort()).toEqual(["Mail Hauberk", "Russet Robe"]);

        const le = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.weight <= 1',
        );
        expect(rowNames(le).sort()).toEqual(["Dagger", "Linen Tunic"]);
    });

    it("compares strings case-sensitively, as Dataview does", () => {
        expect(
            rowNames(
                table(
                    'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material = "cloth"',
                ),
            ),
        ).toEqual([]);
    });

    it("treats a bare field as a presence test and ! as absence", () => {
        const present = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material',
        );
        expect(present).toContain("Russet Robe");
        expect(present).not.toContain("Dagger");

        const absent = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE !sohl.material',
        );
        expect(rowNames(absent)).toEqual(["Dagger"]);
    });

    it("reads file.path, file.name, and file.folder", () => {
        const byFolder = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE file.folder = "Armor/Clothing"',
        );
        expect(rowNames(byFolder).sort()).toEqual([
            "Linen Tunic",
            "Russet Robe",
        ]);

        const byName = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE file.name = "Dagger"',
        );
        expect(rowNames(byName)).toEqual(["Dagger"]);

        const byPath = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE startswith(file.path, "Armor/Clothing/")',
        );
        expect(rowNames(byPath)).toHaveLength(2);
    });

    it("matches tags through file.tags, which carries the '#' prefix", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE contains(file.tags, "cloth")',
        );
        expect(rowNames(md).sort()).toEqual(["Linen Tunic", "Russet Robe"]);
        expect(
            table(
                'TABLE WITHOUT ID name.full AS "Name"\n' +
                    'WHERE econtains(file.tags, "#metal")',
            ),
        ).toContain("Mail Hauberk");
    });

    it("contains() substring-matches a string and any element of a list", () => {
        expect(
            rowNames(
                table(
                    'TABLE WITHOUT ID name.full AS "Name"\n' +
                        'WHERE contains(name.full, "Tunic")',
                ),
            ),
        ).toEqual(["Linen Tunic"]);

        // Case-sensitive, per Dataview; icontains() is the forgiving variant.
        expect(
            rowNames(
                table(
                    'TABLE WITHOUT ID name.full AS "Name"\nWHERE contains(name.full, "tunic")',
                ),
            ),
        ).toEqual([]);
        expect(
            rowNames(
                table(
                    'TABLE WITHOUT ID name.full AS "Name"\n' +
                        'WHERE icontains(name.full, "tunic")',
                ),
            ),
        ).toEqual(["Linen Tunic"]);
    });

    it("scopes rows to a folder with FROM", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\nFROM "Armor"\nWHERE type',
        );
        expect(rowNames(md)).toHaveLength(3);
        expect(md).not.toContain("Dagger");
    });

    it("scopes rows to a tag with FROM #tag", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\nFROM #cloth\nWHERE type',
        );
        expect(rowNames(md).sort()).toEqual(["Linen Tunic", "Russet Robe"]);
    });

    it("reads a bracket-indexed field, folding it into the path", () => {
        const md = table(
            'TABLE WITHOUT ID name["full"] AS "Name"\n' +
                'WHERE sohl["material"] = "Mail"',
        );
        expect(rowNames(md)).toEqual(["Mail Hauberk"]);
    });

    it("reads `this` as the note containing the query, not the row", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", this["name.full"] AS "Source"\n' +
                'WHERE type = "armorgear" and sohl.material = "Mail"',
            {
                self: {
                    fm: { name: { full: "Armour" } },
                    path: "Rules/Armour.md",
                },
            },
        );
        expect(md).toContain("| Mail Hauberk | Armour |");
    });

    it("filters on `this`, so a note can tabulate its own children", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                "WHERE sohl.material = this.material",
            { self: { fm: { material: "Mail" }, path: "Rules/Armour.md" } },
        );
        expect(rowNames(md)).toEqual(["Mail Hauberk"]);
    });

    it("applies LIMIT after sorting", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear"\nSORT sohl.value DESC\nLIMIT 2',
        );
        expect(rowNames(md)).toEqual(["Mail Hauberk", "Russet Robe"]);
    });
});

describe("expandContentTables — rendering", () => {
    it("renders a header row, a separator, and one row per match", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", sohl.weight AS "Weight"\n' +
                'WHERE type = "armorgear" and sohl.material = "Cloth"\n' +
                "SORT name.full ASC",
        );
        const rows = md.split("\n");
        expect(rows[0]).toBe("| Name | Weight |");
        expect(rows[1]).toBe("| --- | ---: |");
        expect(rows[2]).toBe("| Linen Tunic | 1 |");
        expect(rows[3]).toBe("| Russet Robe | 2 |");
        expect(rows).toHaveLength(4);
    });

    it("sorts on several keys, honouring each direction", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\n' +
                'WHERE type = "armorgear"\nSORT sohl.value DESC',
        );
        expect(rowNames(md)).toEqual([
            "Mail Hauberk",
            "Russet Robe",
            "Linen Tunic",
        ]);
    });

    it("orders by file path when no SORT clause is given", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name"\nWHERE type = "armorgear"',
        );
        // Armor/Armor/… sorts before Armor/Clothing/…
        expect(rowNames(md)).toEqual([
            "Mail Hauberk",
            "Linen Tunic",
            "Russet Robe",
        ]);
    });

    it("renders link(file.path, …) as a wikilink to the row's own note", () => {
        const md = table(
            'TABLE WITHOUT ID link(file.path, name.full) AS "Name", sohl.weight AS "Weight"\n' +
                'WHERE sohl.material = "Mail"',
        );
        expect(md).toContain("| [[armorgear/MHaub\\|Mail Hauberk]] | 20 |");
    });

    it("renders the implicit File column as a wikilink too", () => {
        const md = table(
            'TABLE sohl.weight AS "Weight"\nWHERE sohl.material = "Mail"',
        );
        expect(md).toContain("| [[armorgear/MHaub\\|Mail_Hauberk]] | 20 |");
    });

    it("leaves a link cell as plain text when the note is not linkable", () => {
        const md = table(
            'TABLE WITHOUT ID link(file.path, name.full) AS "Name"\n' +
                'WHERE sohl.material = "Mail"',
            { linkable: () => false },
        );
        expect(md).toContain("| Mail Hauberk |");
        expect(md).not.toContain("[[");
    });

    it("links whichever column the query wraps in link()", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", link(file.path, shortcode) AS "Code"\n' +
                'WHERE sohl.material = "Mail"',
        );
        expect(md).toContain("| Mail Hauberk | [[armorgear/MHaub\\|MHaub]] |");
    });

    it("renders an absent value as an em dash and keeps the column left-aligned", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", sohl.protection.blunt AS "Blunt"\n' +
                'WHERE type = "weapongear"',
        );
        expect(md).toContain("| Dagger | — |");
        expect(md.split("\n")[1]).toBe("| --- | --- |");
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
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", tags AS "Tags", sohl.ranged AS "Ranged", sohl.thrown AS "Thrown"\n' +
                'WHERE type = "doc"',
            { docs },
        );
        expect(md).toContain("| Odd \\| Name | a, b | yes | no |");
    });

    it("right-aligns a column whose values are all numeric", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", sohl.protection.blunt AS "B", sohl.protection.edged AS "E"\n' +
                'WHERE type = "armorgear"',
        );
        expect(md.split("\n")[1]).toBe("| --- | ---: | ---: |");
    });

    it("renders a computed column expression", () => {
        const md = table(
            'TABLE WITHOUT ID name.full AS "Name", lower(sohl.material) AS "Material"\n' +
                'WHERE sohl.material = "Mail"',
        );
        expect(md).toContain("| Mail Hauberk | mail |");
    });

    it("separates the table from surrounding prose and keeps that prose intact", () => {
        const { markdown } = expand(
            "Cloth armour:\n\n" +
                block(
                    'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material = "Cloth"',
                ) +
                "\n\nMail is heavier.",
        );
        expect(markdown).toMatch(/Cloth armour:\n\n\| Name \|/);
        expect(markdown).toMatch(/\|\n\nMail is heavier\./);
    });

    it("expands every dataview block in a body", () => {
        const { markdown, errors } = expand(
            block(
                'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material = "Cloth"',
            ) +
                "\n\n" +
                block(
                    'TABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material = "Mail"',
                ),
        );
        expect(errors).toEqual([]);
        expect(markdown).toContain("Russet Robe");
        expect(markdown).toContain("Mail Hauberk");
    });

    it("leaves a non-dataview code fence and a code span alone", () => {
        const body =
            "```text\nTABLE WITHOUT ID name.full\nWHERE type\n```\n\n" +
            "Use `dataview` blocks to tabulate.";
        const { markdown, errors } = expand(body);
        expect(markdown).toBe(body);
        expect(errors).toEqual([]);
    });

    it("expands a fence carrying extra info-string words", () => {
        const { markdown, errors } = expand(
            '```dataview\nTABLE WITHOUT ID name.full AS "Name"\nWHERE sohl.material = "Mail"\n```',
        );
        expect(errors).toEqual([]);
        expect(markdown).toContain("Mail Hauberk");
    });
});

describe("expandContentTables — errors", () => {
    it("renders an empty table, not an error, when nothing matches", () => {
        // A category with no content yet is a normal state of the corpus, and
        // it is what the author already sees in Obsidian.
        const { markdown, errors } = expand(
            block(
                'TABLE WITHOUT ID name.full AS "Name", shortcode AS "Code"\n' +
                    'WHERE sohl.material = "Adamant"',
            ),
        );
        expect(errors).toEqual([]);
        expect(markdown.trim()).toBe("| Name | Code |\n| --- | --- |");
    });

    it("reports a malformed query and leaves the block in place", () => {
        const body = block("TABLE WITHOUT ID\nWHERE type");
        const { markdown, errors } = expand(body);
        expect(markdown).toBe(body);
        expect(errors[0].reason).toMatch(/at least one column/i);
    });

    it("reports a column expression that resolves to an object", () => {
        const { errors } = expand(
            block(
                'TABLE WITHOUT ID sohl.protection AS "Prot"\nWHERE sohl.material = "Mail"',
            ),
        );
        expect(errors).toHaveLength(1);
        expect(errors[0].reason).toMatch(/resolves to an object/);
    });

    it("names the offending query in the error", () => {
        const { errors } = expand(block("LIST\nWHERE type"));
        expect(errors[0].reason).toMatch(/only TABLE queries/i);
        expect(errors[0].directive).toContain("LIST");
    });
});
