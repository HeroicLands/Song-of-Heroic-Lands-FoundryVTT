/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * These used to test `phaseFields(name)` and `durationFields(name)` — generators
 * that built their keys from a template literal. The generators are gone: a
 * field name assembled from an argument exists only once the argument is
 * applied, so it is not in the source, and `package-build schema` — which reads
 * these models as data rather than running them — could not name any of the
 * fourteen fields they produced. Content authoring `system.onsetDate` would have
 * been told no DataModel declares it.
 *
 * So the assertion moved to the thing that regressed: the **published schema**.
 * That is a stronger claim than the generator's key naming ever was — it is
 * what other repositories actually read — and it needs no Foundry stubs, where
 * importing the DataModel classes pulls in a chain that does (#481, #588).
 *
 * `npm run lint:schema` separately guarantees this file still matches the
 * source, so asserting on it is not asserting on a stale copy.
 */
const artifact = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, "../../schema.json"), "utf8"),
);

/** Every field path a subtype declares, own and inherited. */
function fieldsOf(documentType: string, subtype: string): string[] {
    const entry = artifact.documents?.[documentType]?.[subtype];
    if (!entry) throw new Error(`${documentType}.${subtype} is not published`);
    return [...entry.own, ...entry.inherited];
}

describe("affliction and trauma temporal fields are published (#481)", () => {
    const affliction = fieldsOf("Item", "affliction");
    const trauma = fieldsOf("Item", "trauma");

    it("declares the one-shot {Formula, Base, Date} triplet per phase", () => {
        for (const phase of ["onset", "resolution"]) {
            expect(affliction).toContain(`${phase}DurationFormula`);
            expect(affliction).toContain(`${phase}DurationBase`);
            expect(affliction).toContain(`${phase}Date`);
        }
    });

    it("declares a recurring interval as the {Formula, Base} pair and no anchor", () => {
        // The recurrence anchor is not a bespoke field: it lives in the generic
        // `system.scheduledActions` store, whose entry's `anchor + interval` is
        // the next fire time (#588).
        const cases: [string[], string][] = [
            [affliction, "healingCheck"],
            [trauma, "healingCheck"],
            [trauma, "bloodLossAdvance"],
            [trauma, "course"],
        ];
        for (const [keys, name] of cases) {
            expect(keys).toContain(`${name}DurationFormula`);
            expect(keys).toContain(`${name}DurationBase`);
            expect(keys).not.toContain(`last${name}Date`);
            expect(keys).not.toContain(`${name}Date`);
        }
    });

    it("publishes the shared base fields every SoHL model carries", () => {
        // The other half of the same regression: `defineSohlDataSchema()` is
        // spread by name from the file that exports it, and a reader resolving
        // only same-file functions dropped it whole. Content must be able to
        // author `system.shortcode` — SoHL requires it unique per
        // `(type, shortcode)` on an actor — so its absence made every
        // deliberate one look undeclared.
        for (const subtype of ["affliction", "trauma", "affiliation"]) {
            expect(fieldsOf("Item", subtype)).toContain("shortcode");
            expect(fieldsOf("Item", subtype)).toContain("actionDefs");
        }
    });
});
