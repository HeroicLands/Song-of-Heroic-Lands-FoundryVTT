/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { blankBodyPart } from "@src/entity/body/blankBodyPart";
import { blankBodyZone } from "@src/entity/body/blankBodyZone";
import { blankBodyLocation } from "@src/entity/body/blankBodyLocation";
import { AMPUTABILITY, BLEEDING_SUSCEPTIBILITY } from "@src/utils/constants";

describe("blankBodyPart", () => {
    it("seeds schema defaults", () => {
        const p = blankBodyPart("Left Arm", "larm", "armszone");
        expect(p.shortcode).toBe("larm");
        expect(p.name).toBe("Left Arm");
        expect(p.roles).toEqual([]);
        expect(p.canHoldItem).toBe(false);
        expect(p.heldItemId).toBeNull();
        expect(p.permanentImpairment).toBe(0);
        expect(p.permanentlyUnusable).toBe(false);
        expect(p.combatArea).toBe(0);
        expect(p.bodyZoneCode).toBe("armszone");
    });

    it("defaults name, blank shortcode, and blank zone code when omitted", () => {
        const p = blankBodyPart();
        expect(p.name).toBe("Body Part");
        expect(p.shortcode).toBe("");
        expect(p.bodyZoneCode).toBe("");
    });
});

describe("blankBodyZone", () => {
    it("seeds a zone with no weight, so it is unrollable until edited", () => {
        const z = blankBodyZone("Arms", "armszone");
        expect(z.shortcode).toBe("armszone");
        expect(z.name).toBe("Arms");
        expect(z.probWeight).toBe(0);
    });

    it("defaults name and blank shortcode when omitted", () => {
        const z = blankBodyZone();
        expect(z.name).toBe("Body Zone");
        expect(z.shortcode).toBe("");
    });
});

describe("blankBodyLocation", () => {
    it("seeds schema defaults with zeroed protection", () => {
        const l = blankBodyLocation("Skull", "skull", "head");
        expect(l.shortcode).toBe("skull");
        expect(l.name).toBe("Skull");
        expect(l.bleedingSusceptibility).toBe(BLEEDING_SUSCEPTIBILITY.NONE);
        expect(l.amputability).toBe(AMPUTABILITY.NONE);
        expect(l.bodyPartCode).toBe("head");
        expect(l.isStumble).toBe(false);
        expect(l.isFumble).toBe(false);
        expect(l.shockValue).toBe(0);
        expect(l.probWeight).toBe(0);
        expect(l.protectionBase).toEqual({
            blunt: 0,
            edged: 0,
            piercing: 0,
            fire: 0,
        });
    });

    it("defaults name and blank shortcode when omitted", () => {
        const l = blankBodyLocation();
        expect(l.bodyPartCode).toBe("");
        expect(l.name).toBe("Location");
        expect(l.shortcode).toBe("");
    });
});
