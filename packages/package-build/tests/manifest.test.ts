/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
    artifactFromTemplate,
    normalizeRepoUrl,
    releaseUrls,
    stampManifest,
    writeFoundryManifest,
} from "../manifest.mjs";

describe("artifactFromTemplate", () => {
    it("reads the kind off the template's name", () => {
        expect(
            artifactFromTemplate("assets/templates/system.template.json"),
        ).toBe("system");
        expect(
            artifactFromTemplate("assets/templates/module.template.json"),
        ).toBe("module");
    });

    // Guessing would emit a manifest under a name Foundry never fetches.
    it("refuses a name that identifies neither kind", () => {
        expect(() => artifactFromTemplate("assets/templates/pkg.json")).toThrow(
            /system\.template\.json or module\.template\.json/,
        );
        expect(() => artifactFromTemplate(undefined as never)).toThrow();
    });

    // `systems.template.json` is not `system.` — the dot is part of the test.
    it("does not match a name that merely starts with the word", () => {
        expect(() => artifactFromTemplate("systemic.template.json")).toThrow();
    });
});

describe("normalizeRepoUrl", () => {
    it("passes through the plain form", () => {
        expect(
            normalizeRepoUrl({ url: "https://github.com/HeroicLands/sohl" }),
        ).toBe("https://github.com/HeroicLands/sohl");
    });

    // The form npm itself writes, and the one `sohl-kethira-basic` declares.
    // Left in place it yields a 404 on every Foundry update check.
    it("strips the git+ prefix and the .git suffix", () => {
        expect(
            normalizeRepoUrl({
                url: "git+https://github.com/HeroicLands/sohl-kethira-basic.git",
            }),
        ).toBe("https://github.com/HeroicLands/sohl-kethira-basic");
    });

    it("strips a trailing slash", () => {
        expect(normalizeRepoUrl({ url: "https://github.com/a/b/" })).toBe(
            "https://github.com/a/b",
        );
    });

    it("accepts the shorthand string form", () => {
        expect(normalizeRepoUrl("https://github.com/a/b.git")).toBe(
            "https://github.com/a/b",
        );
    });

    // A manifest with no addresses installs and never offers an update.
    it("refuses an absent or empty repository", () => {
        expect(() => normalizeRepoUrl(undefined as never)).toThrow(
            /no `repository.url`/,
        );
        expect(() => normalizeRepoUrl({})).toThrow();
        expect(() => normalizeRepoUrl({ url: "   " })).toThrow();
    });
});

describe("releaseUrls", () => {
    const urls = releaseUrls({
        repoUrl: "https://github.com/HeroicLands/sohl",
        version: "0.8.2",
        artifact: "system",
    });

    // The URL an *installed* package re-fetches to discover a newer one. Pinned
    // to this version it would freeze every install at this release forever.
    it("points `manifest` at releases/latest, not at this version", () => {
        expect(urls.manifest).toBe(
            "https://github.com/HeroicLands/sohl/releases/latest/download/system.json",
        );
    });

    it("points `download` at this exact version", () => {
        expect(urls.download).toBe(
            "https://github.com/HeroicLands/sohl/releases/download/v0.8.2/system.zip",
        );
    });

    it("derives url and bugs from the same root", () => {
        expect(urls.url).toBe("https://github.com/HeroicLands/sohl");
        expect(urls.bugs).toBe("https://github.com/HeroicLands/sohl/issues");
    });

    it("names the module artifact for a module", () => {
        const m = releaseUrls({
            repoUrl: "https://github.com/HeroicLands/sohl-thalorna",
            version: "0.1.0",
            artifact: "module",
        });
        expect(m.manifest).toContain("/module.json");
        expect(m.download).toContain("/module.zip");
    });
});

describe("stampManifest", () => {
    const template = {
        id: "sohl",
        title: "Song of Heroic Lands",
        version: "0.0.0-template",
        compatibility: { minimum: "14" },
    };

    const stamp = (extra = {}) =>
        stampManifest(template, {
            version: "0.8.2",
            repoUrl: "https://github.com/HeroicLands/sohl",
            artifact: "system",
            ...extra,
        });

    it("overwrites the version and the four addresses", () => {
        const out = stamp();
        expect(out.version).toBe("0.8.2");
        expect(out.manifest).toContain("releases/latest");
        expect(out.download).toContain("v0.8.2");
    });

    it("keeps every field the template owns", () => {
        const out = stamp();
        expect(out.id).toBe("sohl");
        expect(out.title).toBe("Song of Heroic Lands");
        expect(out.compatibility).toEqual({ minimum: "14" });
    });

    it("does not mutate the template", () => {
        stamp();
        expect(template.version).toBe("0.0.0-template");
        expect(template).not.toHaveProperty("manifest");
    });

    it("merges flags per namespace, keeping the template's own keys", () => {
        const withFlags = {
            ...template,
            flags: { sohl: { keep: "me" }, other: { untouched: true } },
        };
        const out = stampManifest(withFlags, {
            version: "1.0.0",
            repoUrl: "https://github.com/a/b",
            artifact: "system",
            flags: { sohl: { creditsUuid: "Compendium.sohl.journals.x" } },
        });
        expect(out.flags.sohl).toEqual({
            keep: "me",
            creditsUuid: "Compendium.sohl.journals.x",
        });
        // A namespace the caller said nothing about survives untouched.
        expect(out.flags.other).toEqual({ untouched: true });
    });

    it("leaves flags alone when none are supplied", () => {
        const withFlags = { ...template, flags: { sohl: { keep: "me" } } };
        expect(
            stampManifest(withFlags, {
                version: "1.0.0",
                repoUrl: "https://github.com/a/b",
                artifact: "system",
            }).flags,
        ).toEqual({ sohl: { keep: "me" } });
    });
});

describe("writeFoundryManifest", () => {
    /** A throwaway template on disk, and a stage to write into. */
    function fixture(name: string, template: object) {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "pkg-manifest-"));
        const templatePath = path.join(root, name);
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 4));
        return { root, templatePath, outDir: path.join(root, "stage") };
    }

    it("writes <artifact>.json into the stage, creating it", async () => {
        const { templatePath, outDir } = fixture("system.template.json", {
            id: "sohl",
        });
        const { path: written, manifest } = await writeFoundryManifest({
            templatePath,
            packageJson: {
                version: "1.2.3",
                repository: { url: "git+https://github.com/a/b.git" },
            },
            outDir,
        });

        expect(path.basename(written)).toBe("system.json");
        expect(JSON.parse(fs.readFileSync(written, "utf8"))).toEqual(manifest);
        expect(manifest.download).toBe(
            "https://github.com/a/b/releases/download/v1.2.3/system.zip",
        );
    });

    it("writes module.json for a module template", async () => {
        const { templatePath, outDir } = fixture("module.template.json", {
            id: "sohl-thalorna",
        });
        const { path: written } = await writeFoundryManifest({
            templatePath,
            packageJson: {
                version: "0.1.0",
                repository: { url: "https://github.com/a/thalorna" },
            },
            outDir,
        });
        expect(path.basename(written)).toBe("module.json");
    });

    it("honours an explicit artifact over the template's name", async () => {
        const { templatePath, outDir } = fixture("anything.json", { id: "x" });
        const { path: written } = await writeFoundryManifest({
            templatePath,
            packageJson: {
                version: "1.0.0",
                repository: { url: "https://github.com/a/b" },
            },
            outDir,
            artifact: "module",
        });
        expect(path.basename(written)).toBe("module.json");
    });

    it("ends the file with a newline", async () => {
        const { templatePath, outDir } = fixture("system.template.json", {
            id: "x",
        });
        const { path: written } = await writeFoundryManifest({
            templatePath,
            packageJson: {
                version: "1.0.0",
                repository: { url: "https://github.com/a/b" },
            },
            outDir,
        });
        expect(fs.readFileSync(written, "utf8").endsWith("}\n")).toBe(true);
    });
});
