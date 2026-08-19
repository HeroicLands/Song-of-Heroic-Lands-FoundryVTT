/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Drag-reordering skills on the Being sheet (issue #1528).
 *
 * A skill's group comes from its subType, never from where it was dropped, so a
 * cross-group drag clamps to the near edge of the skill's own group instead of
 * re-parenting. That rule is pure, and is asserted here; the DOM wiring is
 * covered by `cypress/e2e/skill-dragdrop.cy.js`.
 */

import { describe, it, expect } from "vitest";
import {
    resolveSkillReorder,
    type SkillOrderGroup,
} from "@src/apps/logic/skill-reorder";

/** Three groups in render order, mirroring the Skills tab. */
const GROUPS: SkillOrderGroup[] = [
    { subType: "social", ids: ["charm", "command", "guile"] },
    { subType: "nature", ids: ["survival", "tracking"] },
    { subType: "craft", ids: ["carpentry"] },
];

describe("skill reorder — within a group", () => {
    it("moves a skill before the row it was dropped on", () => {
        const next = resolveSkillReorder(GROUPS, "guile", {
            groupIndex: 0,
            beforeId: "charm",
        });
        expect(next).toEqual(["guile", "charm", "command"]);
    });

    it("moves a skill to the end when dropped on no particular row", () => {
        const next = resolveSkillReorder(GROUPS, "charm", { groupIndex: 0 });
        expect(next).toEqual(["command", "guile", "charm"]);
    });

    it("reports no change when the drop would not move the skill", () => {
        // Dropping a skill directly onto itself, or onto the row it already
        // precedes, leaves the order identical — the caller should write nothing.
        expect(
            resolveSkillReorder(GROUPS, "charm", {
                groupIndex: 0,
                beforeId: "charm",
            }),
        ).toBeUndefined();
        expect(
            resolveSkillReorder(GROUPS, "charm", {
                groupIndex: 0,
                beforeId: "command",
            }),
        ).toBeUndefined();
    });
});

describe("skill reorder — across groups, the drag never re-parents", () => {
    it("clamps to the BOTTOM of its own group when dropped on a later group", () => {
        // Charm (social) dragged down into Nature → end of Social.
        const next = resolveSkillReorder(GROUPS, "charm", { groupIndex: 1 });
        expect(next).toEqual(["command", "guile", "charm"]);
    });

    it("clamps to the bottom regardless of which later group, or which row", () => {
        const far = resolveSkillReorder(GROUPS, "charm", {
            groupIndex: 2,
            beforeId: "carpentry",
        });
        expect(far).toEqual(["command", "guile", "charm"]);
    });

    it("clamps to the TOP of its own group when dropped on an earlier group", () => {
        // Tracking (nature) dragged up into Social → top of Nature.
        const next = resolveSkillReorder(GROUPS, "tracking", { groupIndex: 0 });
        expect(next).toEqual(["tracking", "survival"]);
    });

    it("returns only the source group's order — no other group is touched", () => {
        const next = resolveSkillReorder(GROUPS, "charm", { groupIndex: 2 });
        // Every returned id belongs to the source group, and none is lost.
        expect([...(next ?? [])].sort()).toEqual([...GROUPS[0].ids].sort());
    });

    it("reports no change when clamping lands where the skill already is", () => {
        // Guile is already last in Social, so dropping it into a later group
        // asks for a move it has already made.
        expect(
            resolveSkillReorder(GROUPS, "guile", { groupIndex: 1 }),
        ).toBeUndefined();
        // Charm is already first, so an upward clamp is likewise a no-op —
        // and there is no earlier group than Social anyway.
        expect(
            resolveSkillReorder(GROUPS, "survival", { groupIndex: 0 }),
        ).toBeUndefined();
    });
});

describe("skill reorder — defensive", () => {
    it("ignores a source that belongs to no group", () => {
        expect(
            resolveSkillReorder(GROUPS, "nonesuch", { groupIndex: 0 }),
        ).toBeUndefined();
    });

    it("ignores a beforeId from another group rather than splicing across", () => {
        // A stale or hand-crafted payload must not be able to move a Social
        // skill relative to a Nature row; it falls back to the clamp rule.
        const next = resolveSkillReorder(GROUPS, "charm", {
            groupIndex: 1,
            beforeId: "survival",
        });
        expect(next).toEqual(["command", "guile", "charm"]);
    });

    it("handles a single-skill group without producing a change", () => {
        expect(
            resolveSkillReorder(GROUPS, "carpentry", { groupIndex: 0 }),
        ).toBeUndefined();
    });
});
