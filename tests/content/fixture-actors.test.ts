/* SPDX-License-Identifier: GPL-3.0-or-later */
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { readFixtureActor } from "../../cypress/support/fixture-setting.mjs";
import { FIXTURE_SETTING, walkNotes } from "./fixture-setting";

/** Item types the system itself defines; every other model an actor names is the setting's. */
const SYSTEM_TYPES = new Set(["attribute", "skill"]);

const fixtureBeings = walkNotes(FIXTURE_SETTING)
    .map((file) => matter(readFileSync(file, "utf8")).data)
    .filter((data) => data.type === "being");

describe("Test-setting actors", () => {
    it("the setting carries a Basic Folk being", () => {
        expect(fixtureBeings.map((being) => being.shortcode)).toContain("basicfolk");
    });

    it.each(fixtureBeings.map((being) => [being.shortcode, being]))(
        "%s resolves every model it names, and names gear only from the setting",
        (shortcode, being) => {
            const entries = being.sohl.items as { model?: string }[];
            // Throws when a model resolves to no note in the setting, or in the
            // system's attributes and skills.
            const actor = readFixtureActor({ shortcode });
            expect(actor.items).toHaveLength(entries.length);
            const gear = entries
                .map((entry) => entry.model!.split("-").slice(-2))
                .filter(([type]) => !SYSTEM_TYPES.has(type));
            const setting = walkNotes(FIXTURE_SETTING).map(
                (file) => matter(readFileSync(file, "utf8")).data,
            );
            for (const [type, code] of gear) {
                expect(
                    setting.some((data) => data.type === type && data.shortcode === code),
                    `${type}-${code} is defined by the test setting`,
                ).toBe(true);
            }
        },
    );
});
