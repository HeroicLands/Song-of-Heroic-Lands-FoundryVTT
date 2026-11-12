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
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ItemKinds } from "@src/utils/constants";
import { SYSTEM_CONTENT, walkNotes } from "./fixture-setting";

const allowedTypes = new Set(["attribute", "skill"]);
const itemTypes = new Set<string>(ItemKinds);

function isAllowedItem(item: { type?: string; model?: string }): boolean {
    const modelType = item.model?.split("-").at(-2);
    return (
        (!item.type || allowedTypes.has(item.type)) &&
        (!item.model || (!!modelType && allowedTypes.has(modelType))) &&
        (!!item.type || !!item.model)
    );
}
const notes = walkNotes(SYSTEM_CONTENT).map((file) => ({
    file,
    data: matter(readFileSync(file, "utf8")).data,
}));

describe("System content", () => {
    it("contains no setting-owned item notes", () => {
        expect(
            notes
                .filter(({ data }) => itemTypes.has(data.type) && !allowedTypes.has(data.type))
                .map(({ file }) => file),
        ).toEqual([]);
    });

    it("resolves every local homepage documentation link", () => {
        const homepage = notes.find(({ data }) => data.type === "homepage");
        expect(homepage).toBeDefined();
        const body = matter(readFileSync(homepage!.file, "utf8")).content;
        const targets = [...body.matchAll(/\]\(doc-([a-z0-9-]+)\/\)/g)].map((match) => match[1]);
        const docs = new Set(
            notes.filter(({ data }) => data.type === "doc").map(({ data }) => data.shortcode),
        );
        expect(targets.length).toBeGreaterThan(0);
        expect(targets.filter((target) => !docs.has(target))).toEqual([]);
    });

    it("rejects inline and modeled setting items", () => {
        expect(isAllowedItem({ type: "weapongear" })).toBe(false);
        expect(isAllowedItem({ model: "weapongear-clb" })).toBe(false);
        expect(isAllowedItem({ type: "weapongear", model: "skill-melee" })).toBe(false);
        expect(isAllowedItem({ type: "attribute" })).toBe(true);
        expect(isAllowedItem({ model: "skill-melee" })).toBe(true);
    });

    it("allows only attributes and skills in shipped actor items", () => {
        const disallowed = notes.flatMap(({ file, data }) =>
            (data.sohl?.items ?? [])
                .filter((item: { type?: string; model?: string }) => !isAllowedItem(item))
                .map((item: unknown) => `${file}: ${JSON.stringify(item)}`),
        );
        expect(disallowed).toEqual([]);
    });

    it("resolves every shipped actor item model to a system note", () => {
        const models = new Set(notes.map(({ data }) => `${data.type}-${data.shortcode}`));
        const missing = notes.flatMap(({ file, data }) =>
            (data.sohl?.items ?? [])
                .filter((item: { model?: string }) => item.model && !models.has(item.model))
                .map((item: { model: string }) => `${file}: ${item.model}`),
        );
        expect(missing).toEqual([]);
    });
});
