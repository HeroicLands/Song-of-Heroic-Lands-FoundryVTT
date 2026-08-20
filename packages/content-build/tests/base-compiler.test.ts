/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Build-time pack compilers (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { BasePackCompiler } from "../engine/base-compiler.mjs";
import { Items } from "../sohl/items.mjs";
import { Journals } from "../engine/journals.mjs";
import { Actors } from "../sohl/actors.mjs";
import { Macros } from "../engine/macros.mjs";
import { Scenes } from "../engine/scenes.mjs";
import { CONTENT_PACKAGE } from "../engine/content-package.mjs";

/** A note of this build's own content package, in the tree's shape. */
function note(
    body: string,
    fm: Record<string, unknown>,
    pkg: string = CONTENT_PACKAGE,
): string {
    const lines = Object.entries({ package: pkg, ...fm }).map(
        ([k, v]) => `${k}: ${JSON.stringify(v)}`,
    );
    return `---\n${lines.join("\n")}\n---\n\n${body}\n`;
}

/**
 * A minimal consumer-style compiler: it declares which notes it claims and how
 * one becomes a document, and inherits the whole walk → filter → expand →
 * convert → build → write → count loop.
 *
 * This is the contract #1509 exists to establish — a consumer adds a pack by
 * writing this much, not by copying the loop.
 */
class Probe extends BasePackCompiler {
    static override id = "probes";
    static override label = "probe";

    /** Every body this pass was handed, so a test can assert the conversion. */
    seen: string[] = [];

    override selects(fm: any): boolean {
        return fm.type === "probe";
    }

    override buildEntry(fm: any, markdown: string): any {
        this.seen.push(markdown);
        if (fm.shortcode === "boom") throw new Error("deliberate failure");
        return {
            name: fm.name.full,
            _id: fm.id,
            body: markdown,
            folder: this.folderResolver(null),
            _key: `!probes!${fm.id}`,
        };
    }
}

/** A pass that wants the note exactly as authored — the macros arrangement. */
class RawProbe extends Probe {
    static override convertsWikilinks = false;
}

/** A pass that tolerates a note with no id — the journals arrangement. */
class LenientProbe extends Probe {
    static override requiresId = false;
}

const TREE: Record<string, string> = {
    "Target.md": note("The target.", {
        name: { full: "Probe Target" },
        id: "TARGETTARGET0001",
        shortcode: "probetarget",
        type: "doc",
    }),
    "One.md": note("Links to [[doc-probetarget|Target]].", {
        name: { full: "Probe One" },
        id: "PROBEPROBE000001",
        shortcode: "one",
        type: "probe",
    }),
    "Two.md": note("Plain prose.", {
        name: { full: "Probe Two" },
        id: "PROBEPROBE000002",
        shortcode: "two",
        type: "probe",
    }),
    "Draft.md": note("A draft.", {
        name: { full: "Probe Draft" },
        id: "PROBEPROBE000003",
        shortcode: "draft",
        type: "probe",
        draft: true,
    }),
    "Foreign.md": note(
        "Another package's note.",
        {
            name: { full: "Probe Foreign" },
            id: "PROBEPROBE000004",
            shortcode: "foreign",
            type: "probe",
        },
        "not-this-package",
    ),
    "Boom.md": note("Explodes.", {
        name: { full: "Probe Boom" },
        id: "PROBEPROBE000005",
        shortcode: "boom",
        type: "probe",
    }),
};

let tmp: string;
let content: string;

/** A fresh destination directory. */
function dest(name: string): string {
    const dir = path.join(tmp, name);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

/** Every emitted document in a directory, by name. */
function read(dir: string): Record<string, any> {
    const out: Record<string, any> = {};
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith(".json")) continue;
        const doc = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
        out[doc.name] = doc;
    }
    return out;
}

beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-base-compiler-"));
    content = path.join(tmp, "content");
    fs.mkdirSync(content, { recursive: true });
    for (const [file, text] of Object.entries(TREE)) {
        fs.writeFileSync(path.join(content, file), text);
    }
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("every shipped pack compiler is a BasePackCompiler", () => {
    // The point of the base class is that the loop exists once. A compiler
    // that is not a subclass has its own copy of it.
    it.each([
        ["Items", Items],
        ["Journals", Journals],
        ["Actors", Actors],
        ["Macros", Macros],
        ["Scenes", Scenes],
    ])("%s subclasses it", (_name, cls) => {
        expect(Object.create(cls.prototype)).toBeInstanceOf(BasePackCompiler);
    });
});

describe("BasePackCompiler's shared compile loop", () => {
    let pack: Probe;
    let out: string;

    beforeAll(async () => {
        out = dest("probes");
        pack = new Probe({ contentBase: content, dest: out });
        await pack.compile();
    });

    it("compiles the notes its subclass selects, and no others", () => {
        const docs = read(out);
        expect(Object.keys(docs).sort()).toEqual(["Probe One", "Probe Two"]);
    });

    it("skips a note belonging to another content package", () => {
        expect(read(out)["Probe Foreign"]).toBeUndefined();
    });

    it("skips a draft", () => {
        expect(read(out)["Probe Draft"]).toBeUndefined();
    });

    it("counts a failed entry rather than aborting the pass", () => {
        expect(pack.errorCount).toBe(1);
        expect(read(out)["Probe Boom"]).toBeUndefined();
    });

    it("reports how many entries it wrote", () => {
        expect(pack.compiledCount).toBe(Object.keys(read(out)).length);
        expect(pack.compiledCount).toBe(2);
    });

    it("expands tables and converts wikilinks before building the entry", () => {
        const doc = read(out)["Probe One"];
        expect(doc.body).toContain("@UUID[");
        expect(doc.body).not.toContain("[[doc-probetarget");
    });

    it("names each file from the document's name and id", () => {
        const files = fs.readdirSync(out).filter((f) => f.endsWith(".json"));
        expect(files).toContain("Probe_One_PROBEPROBE000001.json");
    });
});

describe("BasePackCompiler's per-pass switches", () => {
    it("hands the raw body over when a pass does not convert wikilinks", async () => {
        const out = dest("raw");
        const pack = new RawProbe({ contentBase: content, dest: out });
        await pack.compile();
        expect(read(out)["Probe One"].body).toContain(
            "[[doc-probetarget|Target]]",
        );
    });

    it("fails the build on a note with no id", async () => {
        const noId = path.join(tmp, "noid");
        fs.mkdirSync(noId, { recursive: true });
        fs.writeFileSync(
            path.join(noId, "NoId.md"),
            note("No id at all.", {
                name: { full: "Probe No Id" },
                shortcode: "noid",
                type: "probe",
            }),
        );
        const pack = new Probe({ contentBase: noId, dest: dest("noid-out") });
        await expect(pack.compile()).rejects.toThrow(/Probe missing id/);
    });

    it("skips a note with no id when the pass tolerates one", async () => {
        const noId = path.join(tmp, "noid");
        const out = dest("lenient");
        const pack = new LenientProbe({ contentBase: noId, dest: out });
        await pack.compile();
        expect(pack.errorCount).toBe(0);
        expect(pack.compiledCount).toBe(0);
    });
});

describe("BasePackCompiler's constructor contract", () => {
    it("requires a content root", () => {
        expect(() => new Probe({ dest: tmp } as any)).toThrow(
            /Probe compiler requires `contentBase`/,
        );
    });

    it("rejects a content root that does not exist", () => {
        expect(
            () => new Probe({ contentBase: path.join(tmp, "nope"), dest: tmp }),
        ).toThrow(/Content tree not found/);
    });
});
