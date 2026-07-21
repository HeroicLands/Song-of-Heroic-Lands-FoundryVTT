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

/**
 * The **treatment** Chat Sequence — the reference implementation of the consent
 * model. Started by the injured character invoking **Request Treatment** on the
 * wound (`TraumaLogic.requestTreatment`), which posts the first (`perform`) card:
 *
 * ```
 * perform (self)   card "Treatment Requested… [Perform Treatment]"   → performTreatmentTest → accept
 * accept  (injury) card "Physician X treated the wound → HR N [Accept]" → treatInjury(hr)    → done
 * ```
 *
 * Two roles are bound when it starts (in `requestTreatment`):
 *
 * - **`self`** — bound to the `@self` sentinel, so the `perform` card is **open**:
 *   *any* player may click it, and their own default character (`game.user.character`)
 *   responds. `performTreatmentTest` self-gates on the Physician skill.
 * - **`injury`** — bound to the wound's uuid (owned by the patient), so the
 *   `accept` card is targeted to the patient, who records the Healing Rate.
 *
 * Nothing mutates until the patient's Accept — and, because all state lives in the
 * posted cards, the interaction can be ignored or overridden at any point.
 */

import {
    defineSequence,
    type SequenceDefinition,
    type SequenceState,
} from "@src/entity/sequence/SohlSequence";

/** The id of the treatment sequence. */
export const TREATMENT_SEQUENCE_ID = "treatment";

/** The proposed treatment outcome recorded in the ledger by `performTreatmentTest`. */
interface TreatmentResult {
    /** The proposed Healing Rate (a number, or the `"HEAL"` sentinel). */
    healingRate?: number | string;
    /** The name of the physician who performed the test. */
    physicianName?: string;
}

/**
 * Read the proposed treatment result from the ledger.
 * @param state - The sequence ledger.
 * @returns The recorded {@link TreatmentResult}, or an empty object.
 */
function result(state: SequenceState): TreatmentResult {
    return (state.result as TreatmentResult | undefined) ?? {};
}

/**
 * Read the patient's name from the ledger (blank when absent).
 * @param state - The sequence ledger.
 * @returns The patient's name, or an empty string.
 */
function patientName(state: SequenceState): string {
    return typeof state.patientName === "string" ? state.patientName : "";
}

/**
 * The treatment sequence definition, registered under
 * {@link TREATMENT_SEQUENCE_ID}. Its **ledger** starts as
 * `{ injuryUuid, patientName }` (from `requestTreatment`) and gains `result`
 * (`{ healingRate, physicianName }`) after the perform step.
 */
export const TREATMENT_SEQUENCE: SequenceDefinition = defineSequence({
    id: TREATMENT_SEQUENCE_ID,
    roles: ["self", "injury"],
    initial: "perform",
    steps: {
        perform: {
            by: "self",
            card: (s) => ({
                title: "Treatment Requested",
                body: `${patientName(s) || "The patient"} asks a physician to treat this wound.`,
            }),
            choices: [
                {
                    key: "perform",
                    label: "Perform Treatment Test",
                    iconFAClass: "fa-solid fa-staff-snake",
                    action: "performTreatmentTest",
                    scope: (s) => ({ injuryUuid: s.injuryUuid }),
                    reduce: (s, r) => ({ ...s, result: r }),
                    next: "accept",
                },
            ],
        },
        accept: {
            by: "injury",
            card: (s) => ({
                title: "Treatment Result",
                body: `${result(s).physicianName || "A physician"} treated the wound — the test resolves to Healing Rate ${result(s).healingRate ?? "?"}.`,
            }),
            choices: [
                {
                    key: "accept",
                    label: "Accept",
                    iconFAClass: "fa-solid fa-check",
                    action: "treatInjury",
                    scope: (s) => ({
                        injuryUuid: s.injuryUuid,
                        healingRate: result(s).healingRate,
                    }),
                    next: null,
                },
            ],
        },
    },
});
