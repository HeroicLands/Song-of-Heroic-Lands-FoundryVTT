/* SPDX-License-Identifier: GPL-3.0-or-later */
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

function note(path: string): any {
    return matter(readFileSync(`assets/content/${path}`, "utf8")).data;
}

describe("Automated Combat tutorial fixture readiness", () => {
    it.each(["Tutorial_Human", "Tutorial_Grukar_Uk"])(
        "%s can use Club Crush against the adjacent tutorial token",
        (character) => {
            const actor = note(`Characters/${character}.md`);
            const scene = note("Maps/Automated_Combat_Tutorial_Path.md").data.scene;
            const club = note("Weapons/Melee/Club.md").sohl.system;
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
            expect(actor.sohl.items.some((item: any) => item.model === "weapongear-clb")).toBe(
                true,
            );
        },
    );
});
