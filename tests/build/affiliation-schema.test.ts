/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import path from "node:path";
import { fieldsForClass, pathAliases } from "@heroiclands/package-build/engine/schema-extract";
const rootDir = path.resolve(__dirname, "../..");
describe("published affiliation field contract", () => {
    it("extracts supported affiliation fields without a stored territory list", () => {
        const fields = fieldsForClass({
            file: path.join(rootDir, "src/document/item/foundry/AffiliationDataModel.ts"),
            className: "AffiliationDataModel",
            aliases: pathAliases(rootDir),
            cache: new Map(),
            rootDir,
        });
        expect(fields.own).not.toContain("domain");
        expect(fields.inherited).not.toContain("domain");
        expect(fields.own).toEqual(
            expect.arrayContaining([
                "subType",
                "society",
                "office",
                "title",
                "level",
                "relations",
                "parents",
                "seat",
                "commonSkills",
            ]),
        );
        expect(fields.inherited).toEqual(expect.arrayContaining(["shortcode", "notes", "docHtml"]));
    });
});
