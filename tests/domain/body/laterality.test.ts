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

import { describe, it, expect } from "vitest";
import {
    makeBody,
    zoneData,
    partData,
    locationData,
} from "@tests/mocks/bodyFixture";
import {
    bodyPartSide,
    mirrorShortcode,
    dominantSideFrom,
    isOffHandGrip,
} from "@src/entity/body/laterality";
import { BODY_SIDE } from "@src/utils/constants";

/** A two-armed body, optionally with extra parts. */
function body(extraParts: any[] = []) {
    return makeBody({
        zones: [zoneData("armszone", 4)],
        parts: [
            partData("larmpart", "armszone", 20, { canHoldItem: true }),
            partData("rarmpart", "armszone", 20, { canHoldItem: true }),
            ...extraParts,
        ],
        locations: [
            locationData("lhand", "larmpart", 5),
            locationData("rhand", "rarmpart", 5),
        ],
    });
}

describe("mirrorShortcode", () => {
    it("swaps a left prefix for a right one and back", () => {
        expect(mirrorShortcode("larmpart")).toBe("rarmpart");
        expect(mirrorShortcode("rarmpart")).toBe("larmpart");
        expect(mirrorShortcode("lhindlegpart")).toBe("rhindlegpart");
    });

    it("has no mirror for a shortcode that starts with neither", () => {
        expect(mirrorShortcode("headpart")).toBeUndefined();
    });
});

describe("bodyPartSide", () => {
    it("reads a part's side from its shortcode prefix", () => {
        const b = body();
        expect(bodyPartSide(b.getPartByCode("larmpart")!)).toBe(BODY_SIDE.LEFT);
        expect(bodyPartSide(b.getPartByCode("rarmpart")!)).toBe(
            BODY_SIDE.RIGHT,
        );
    });

    it("requires a mirror twin — a lone l-word part is not lateral", () => {
        // "Liver", not "left iver": no `riverpart` exists, so it has no side.
        // This is what keeps the prefix rule from misreading central organs.
        const b = body([partData("liverpart", "armszone", 5)]);
        expect(bodyPartSide(b.getPartByCode("liverpart")!)).toBeUndefined();
    });

    it("gives a central part no side", () => {
        const b = body([partData("headpart", "armszone", 5)]);
        expect(bodyPartSide(b.getPartByCode("headpart")!)).toBeUndefined();
    });
});

describe("dominantSideFrom", () => {
    it("favors the left when only Left Dominance is present", () => {
        expect(dominantSideFrom(true, false)).toBe(BODY_SIDE.LEFT);
    });

    it("favors the right when only Right Dominance is present", () => {
        expect(dominantSideFrom(false, true)).toBe(BODY_SIDE.RIGHT);
    });

    it("has no dominant side with neither", () => {
        expect(dominantSideFrom(false, false)).toBeUndefined();
    });

    it("has no dominant side with both — ambidextrous", () => {
        expect(dominantSideFrom(true, true)).toBeUndefined();
    });
});

describe("isOffHandGrip", () => {
    const b = body();
    const left = b.getPartByCode("larmpart")!;
    const right = b.getPartByCode("rarmpart")!;

    it("is off-hand when the only gripping limb is the non-dominant one", () => {
        expect(isOffHandGrip([left], BODY_SIDE.RIGHT)).toBe(true);
        expect(isOffHandGrip([right], BODY_SIDE.LEFT)).toBe(true);
    });

    it("is not off-hand when the dominant limb grips", () => {
        expect(isOffHandGrip([right], BODY_SIDE.RIGHT)).toBe(false);
    });

    it("is not off-hand for a two-handed grip including the dominant side", () => {
        expect(isOffHandGrip([left, right], BODY_SIDE.RIGHT)).toBe(false);
    });

    it("is never off-hand without a dominant side", () => {
        // Ambidextrous, or a creature with no laterality at all: neither limb
        // is the "off" one, so there is nothing to penalize.
        expect(isOffHandGrip([left], undefined)).toBe(false);
        expect(isOffHandGrip([right], undefined)).toBe(false);
    });

    it("is not off-hand when nothing grips it", () => {
        // An unheld weapon, or an intrinsic combat technique with no limb.
        expect(isOffHandGrip([], BODY_SIDE.RIGHT)).toBe(false);
    });

    it("is not off-hand when gripped by a part with no side", () => {
        const withMouth = body([partData("headpart", "armszone", 5)]);
        const head = withMouth.getPartByCode("headpart")!;
        expect(isOffHandGrip([head], BODY_SIDE.RIGHT)).toBe(false);
    });
});
