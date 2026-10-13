/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { describe, expect, it, vi } from "vitest";
import Handlebars from "handlebars";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
vi.mock("@src/document/actor/foundry/SohlActorDataModel", () => ({
    SohlActorDataModel: class {
        static defineSchema() {
            return {};
        }
    },
}));
import { StructureDataModel } from "@src/document/actor/foundry/StructureDataModel";

describe("authored Structure workshop rating", () => {
    it("publishes an integer 0–5 field initialized as not a workshop", () => {
        const field = StructureDataModel.defineSchema().workshopRating as any;
        expect(field).toBeDefined();
        expect(field.options).toMatchObject({
            initial: 0,
            min: 0,
            max: 5,
            integer: true,
            nullable: false,
        });
    });
    it.each([true, false])("renders the actual rating control with editing=%s", (editable) => {
        Handlebars.registerPartial("archetypeField", "");
        Handlebars.registerPartial("draftField", "");
        const html = renderTemplateReal("systems/sohl/templates/actor/structure/header.hbs", {
            document: { system: { workshopRating: 4 } },
            isEditable: editable,
        });
        const input = html.match(/<input[^>]+name="system.workshopRating"[^>]*>/)?.[0];
        expect(input).toBeDefined();
        expect(input).toContain('value="4"');
        expect(input).toContain('min="0"');
        expect(input).toContain('max="5"');
        expect(input?.includes("disabled")).toBe(!editable);
    });
});
