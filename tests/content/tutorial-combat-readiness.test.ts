/* SPDX-License-Identifier: GPL-3.0-or-later */
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { readFixtureItems } from "../../cypress/support/fixture-setting.mjs";
import { FIXTURE_SETTING } from "./fixture-setting";

function note(path: string): any {
    return matter(readFileSync(`assets/content/${path}`, "utf8")).data;
}

/** The weapons the end-to-end specs put on the tutorial actors. */
const TUTORIAL_WEAPONS = ["clb", "dgr"];

describe("Automated Combat tutorial fixture readiness", () => {
    it("the test setting defines every weapon the tutorial actors are armed with", () => {
        const weapons = readFixtureItems({ type: "weapongear", shortcodes: TUTORIAL_WEAPONS });
        expect(weapons.map((weapon: any) => weapon.system.shortcode)).toEqual(TUTORIAL_WEAPONS);
        for (const weapon of weapons as any[]) {
            expect(
                weapon.system.strikeModes.some((mode: any) => mode.type === "melee"),
                `${weapon.name} has a melee strike mode`,
            ).toBe(true);
        }
    });

    it("an unresolved weapon is an error", () => {
        expect(() =>
            readFixtureItems({ type: "weapongear", shortcodes: ["nosuchweapon"] }),
        ).toThrow(/nosuchweapon/);
    });

    it.each(["Tutorial_Human", "Tutorial_Grukar_Uk"])(
        "%s reaches the adjacent tutorial token with the setting's Club Crush",
        (character) => {
            const actor = note(`Characters/${character}.md`);
            const scene = note("Maps/Automated_Combat_Tutorial_Path.md").data.scene;
            const club = matter(readFileSync(`${FIXTURE_SETTING}/Weapons/Club.md`, "utf8")).data
                .sohl.system;
            const crush = club.strikeModes.find((mode: any) => mode.shortcode === "crush");
            const [first, second] = scene.tokens;
            // Same-row centers one authored grid cell apart: five feet. The
            // actor's body reach and the weapon's length must cover that cell.
            expect(first.y).toBe(second.y);
            const separation =
                (Math.abs(second.x - first.x) / scene.grid.size) * scene.grid.distance;
            expect(separation).toBe(5);
            expect(actor.sohl.system.body.reachBase + crush.lengthBase).toBeGreaterThanOrEqual(
                separation,
            );
        },
    );
});
