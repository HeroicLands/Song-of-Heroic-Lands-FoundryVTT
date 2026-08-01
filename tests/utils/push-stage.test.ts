/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
// Build-time deploy helper (plain ESM, no Foundry). Imported by relative path
// because the deploy script lives outside the `@src` alias tree.
import { deployLocal } from "../../utils/push-stage.mjs";

/** Create a throwaway workspace with a staged `src` and a target `dest`. */
async function makeWorkspace() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "sohl-push-"));
    const src = path.join(root, "src");
    const dest = path.join(root, "data", "systems", "sohl");
    await fs.mkdir(src, { recursive: true });
    return { root, src, dest };
}

async function readMaybe(p: string): Promise<string | null> {
    try {
        return await fs.readFile(p, "utf8");
    } catch {
        return null;
    }
}

async function listSiblings(dest: string): Promise<string[]> {
    const parent = path.dirname(dest);
    const base = path.basename(dest);
    const entries = await fs.readdir(parent);
    return entries.filter((e) => e !== base && e.startsWith(base));
}

describe("deployLocal — atomic staged swap (safe with a live server)", () => {
    let ws: { root: string; src: string; dest: string };

    beforeEach(async () => {
        ws = await makeWorkspace();
    });

    afterEach(async () => {
        await fs.rm(ws.root, { recursive: true, force: true });
    });

    it("creates the destination on a fresh deploy", async () => {
        await fs.writeFile(path.join(ws.src, "system.json"), "v1");
        await fs.mkdir(path.join(ws.src, "packs", "actors"), {
            recursive: true,
        });
        await fs.writeFile(
            path.join(ws.src, "packs", "actors", "CURRENT"),
            "MANIFEST-1",
        );

        await deployLocal(ws.src, ws.dest);

        expect(await readMaybe(path.join(ws.dest, "system.json"))).toBe("v1");
        expect(
            await readMaybe(path.join(ws.dest, "packs", "actors", "CURRENT")),
        ).toBe("MANIFEST-1");
    });

    it("replaces existing content and removes stale files", async () => {
        // Pre-existing deployed content, including a stale file not in src.
        await fs.mkdir(ws.dest, { recursive: true });
        await fs.writeFile(path.join(ws.dest, "system.json"), "old");
        await fs.writeFile(path.join(ws.dest, "stale.txt"), "remove me");

        await fs.writeFile(path.join(ws.src, "system.json"), "new");

        await deployLocal(ws.src, ws.dest);

        expect(await readMaybe(path.join(ws.dest, "system.json"))).toBe("new");
        // Stale file gone — the swap is a full replace, not a merge.
        expect(await readMaybe(path.join(ws.dest, "stale.txt"))).toBeNull();
    });

    it("never mutates the live directory in place — a file held open by a running server keeps its original bytes", async () => {
        // Simulate a running Foundry holding a LevelDB pack file open.
        await fs.mkdir(path.join(ws.dest, "packs", "actors"), {
            recursive: true,
        });
        const livePack = path.join(ws.dest, "packs", "actors", "000001.ldb");
        await fs.writeFile(livePack, "LIVE-DATA");
        const held = await fs.open(livePack, "r");
        try {
            // New build carries different pack bytes at the same path.
            await fs.mkdir(path.join(ws.src, "packs", "actors"), {
                recursive: true,
            });
            await fs.writeFile(
                path.join(ws.src, "packs", "actors", "000001.ldb"),
                "NEW-DATA",
            );

            await deployLocal(ws.src, ws.dest);

            // The open handle (the "server") still sees the original bytes:
            // the old inode was swapped aside, not overwritten underneath it.
            const buf = Buffer.alloc(9);
            await held.read(buf, 0, 9, 0);
            expect(buf.toString("utf8")).toBe("LIVE-DATA");
            // Meanwhile the on-disk deploy is the new build.
            expect(await readMaybe(livePack)).toBe("NEW-DATA");
        } finally {
            await held.close();
        }
    });

    it("leaves no staging/old temp directories behind on success", async () => {
        await fs.writeFile(path.join(ws.src, "system.json"), "v1");
        await fs.mkdir(ws.dest, { recursive: true });
        await fs.writeFile(path.join(ws.dest, "system.json"), "v0");

        await deployLocal(ws.src, ws.dest);

        expect(await listSiblings(ws.dest)).toEqual([]);
    });
});
