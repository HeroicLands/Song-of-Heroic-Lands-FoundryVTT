/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The Gear tab's capacity readout (#200 / #201). A section shows one only when
 * it has a fact worth acting on: a being's carried weight and encumbrance, or a
 * container's used-against-max. A vehicle's cargo and a structure's stores have
 * neither — capacity is deliberately not modeled for either — so their section
 * legend carries no readout at all rather than a bare total (which previously
 * rendered as a dangling `Capacity: 12.5/`).
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const GEAR = "systems/sohl/templates/actor/parts/gear.hbs";

/** The gear-tab context, with one un-contained item. */
function ctx(capacity: unknown) {
    return {
        onBody: {
            items: [
                {
                    id: "g1",
                    uuid: "Item.g1",
                    name: "Rope",
                    quantity: 1,
                    weight: 12.5,
                },
            ],
            capacity,
        },
        containers: [],
    };
}

describe("gear tab capacity readout", () => {
    it("shows a being's carried weight and encumbrance", () => {
        const html = renderTemplateReal(
            GEAR,
            ctx({ isEncumbrance: true, used: 12, encumbrance: 1 }),
        );

        expect(html).toContain("Carried:");
        expect(html).toContain("Enc");
    });

    it("shows a container's used against its maximum", () => {
        const html = renderTemplateReal(GEAR, ctx({ used: 3, max: 40 }));

        expect(html).toContain("Capacity:");
        expect(html).toContain("3/40");
    });

    it("shows no readout at all when the section has no capacity", () => {
        const html = renderTemplateReal(GEAR, ctx(undefined));

        expect(html).not.toContain("Capacity:");
        expect(html).not.toContain("Carried:");
        // In particular, never a maximum-less total with a dangling slash.
        expect(html).not.toMatch(/Capacity:\s*[\d.]+\/\s*</);
    });
});
