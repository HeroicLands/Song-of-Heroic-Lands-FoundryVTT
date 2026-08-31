/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright (C) 2024 Song of Heroic Lands contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Field-hygiene assertions for the Foundry-free `StrikeModeBase` entity (the
// purity zone loads in vitest). The Foundry-layer DataModel schemas cannot be
// imported here (circular Foundry-layer load — the modules value-import the app
// graph; see the repo's `it.todo` schema blocks), so those field conversions are
// asserted at runtime in `cypress/e2e/field-hygiene.cy.js`.

import { describe, it, expect } from "vitest";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { durationFormulaField } from "@src/document/item/foundry/temporal-fields";

function expectUnsetIsNull(field: any) {
    expect(field.options.nullable).toBe(true);
    expect(field.options.blank).toBe(false);
    expect(field.options.initial).toBe(null);
}

describe('Field hygiene — unset StringFields are null, not ""', () => {
    it("StrikeModeBase.assocSkillCode", () => {
        expectUnsetIsNull((StrikeModeBase.baseSchemaFields() as any).assocSkillCode);
    });

    // The shared duration-formula helper backs every `*DurationFormula` field
    // (Affliction onset/healingCheck/resolution, Trauma course/bloodLoss/…).
    it("durationFormulaField() helper", () => {
        expectUnsetIsNull(durationFormulaField() as any);
    });
});
