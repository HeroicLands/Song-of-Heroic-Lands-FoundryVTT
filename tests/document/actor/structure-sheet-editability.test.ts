/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("@src/document/actor/foundry/SohlActorSheetBase", () => ({
    SohlActorSheetBase: class {
        static FENCED_BANNER_PART = {};
        isEditable = true;
        document = {
            logic: {
                occupantCount: 0,
                occupantsOverCapacity: false,
                data: { health: { value: 0, max: 0 } },
                structuralDamage: 0,
                cargoWeight: 0,
                cargoOverCapacity: false,
            },
        };
        async _prepareContext() {
            return {};
        }
    },
}));
import { StructureSheet } from "@src/document/actor/foundry/StructureSheet";

describe("Structure sheet authored header controls", () => {
    it.each([true, false])("propagates actual sheet editability=%s", async (editable) => {
        const sheet = Object.create(StructureSheet.prototype);
        sheet.isEditable = editable;
        sheet.document = {
            logic: {
                occupantCount: 0,
                occupantsOverCapacity: false,
                data: { health: { value: 0, max: 0 } },
                structuralDamage: 0,
                cargoWeight: 0,
                cargoOverCapacity: false,
            },
        };
        const context = await sheet._prepareContext({});
        expect(context.isEditable).toBe(editable);
    });
});
