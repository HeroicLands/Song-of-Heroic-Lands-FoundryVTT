import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const TEMPLATE = "systems/sohl/templates/actor/structure/occupants.hbs";

/** Representative Structure occupant row, including a stale actor reference. */
function row(isResolved: boolean) {
    return {
        ref: "visitor",
        name: isResolved ? "Visitor" : "visitor",
        img: "",
        uuid: isResolved ? "Actor.visitor" : null,
        role: "passenger",
        roleLabel: "SOHL.Vehicle.Occupant.Role.passenger",
        title: "Guest",
        isResolved,
    };
}

describe("Structure occupant sheet", () => {
    it("renders unresolved references and a remove control instead of dropping their rows", () => {
        const html = renderTemplateReal(TEMPLATE, { occupants: [row(false)], isEditable: true });
        expect(html).toContain('data-occupant-ref="visitor"');
        expect(html).toContain("ledger__row--disabled");
        expect(html).toContain('data-action="removeStructureOccupant"');
        expect(html).toContain('data-action="addStructureOccupant"');
    });
    it("shows occupants without exposing edits to a read-only viewer", () => {
        const html = renderTemplateReal(TEMPLATE, { occupants: [row(true)], isEditable: false });
        expect(html).toContain("Visitor");
        expect(html).toContain("Guest");
        expect(html).not.toContain('data-action="removeStructureOccupant"');
        expect(html).not.toContain('data-action="addStructureOccupant"');
    });
});
