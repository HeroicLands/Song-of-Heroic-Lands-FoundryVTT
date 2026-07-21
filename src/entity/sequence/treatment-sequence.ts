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
 * model: a patient *requests* treatment, a physician *performs* the Treatment
 * Test, and the patient *accepts* the result, which is then recorded. Every step
 * is a human-triggered, ownership-gated, chat-posted action; no step mutates a
 * character without that character's controlling player acting.
 *
 * ```
 * request (patient) ── requestTreatment ──▶ perform (physician)
 * perform (physician) ── performTreatment ──▶ accept (patient)
 * accept  (patient)  ── acceptTreatment  ──▶ ✔ recorded
 * ```
 *
 * This module defines the sequence as data (referencing action shortcodes); the
 * Foundry runtime and the `requestTreatment` / `performTreatment` /
 * `acceptTreatment` executors are wired separately (milestone 2b).
 */

import {
    defineSequence,
    type SequenceDefinition,
    type SequenceState,
} from "@src/entity/sequence/SohlSequence";

/** The id of the treatment sequence. */
export const TREATMENT_SEQUENCE_ID = "treatment";

/**
 * Read the injured trauma item's uuid from the ledger (blank when absent).
 * @param state - The sequence ledger.
 * @returns The injury uuid, or an empty string.
 */
function injuryUuid(state: SequenceState): string {
    return typeof state.injuryUuid === "string" ? state.injuryUuid : "";
}

/**
 * The treatment sequence definition, registered under
 * {@link TREATMENT_SEQUENCE_ID}. The **ledger** threads `injuryUuid` (the wound),
 * then `request`, then `result` as the steps produce them.
 */
export const TREATMENT_SEQUENCE: SequenceDefinition = defineSequence({
    id: TREATMENT_SEQUENCE_ID,
    roles: ["patient", "physician"],
    initial: "request",
    steps: {
        request: {
            by: "patient",
            card: () => ({
                title: "Treatment Requested",
                body: "The patient asks a physician to treat this wound.",
            }),
            choices: [
                {
                    key: "request",
                    label: "Request Treatment",
                    iconFAClass: "fa-solid fa-hand",
                    action: "requestTreatment",
                    scope: (s) => ({ injuryUuid: injuryUuid(s) }),
                    reduce: (s, r) => ({ ...s, request: r }),
                    next: "perform",
                },
            ],
        },
        perform: {
            by: "physician",
            card: () => ({
                title: "Perform Treatment Test",
                body: "A physician performs the Treatment Test on the wound.",
            }),
            choices: [
                {
                    key: "perform",
                    label: "Perform Treatment Test",
                    iconFAClass: "fa-solid fa-staff-snake",
                    action: "performTreatment",
                    scope: (s) => ({ injuryUuid: injuryUuid(s) }),
                    reduce: (s, r) => ({ ...s, result: r }),
                    next: "accept",
                },
            ],
        },
        accept: {
            by: "patient",
            card: () => ({
                title: "Accept Treatment",
                body: "The patient accepts the treatment; its Healing Rate is recorded.",
            }),
            choices: [
                {
                    key: "accept",
                    label: "Accept",
                    iconFAClass: "fa-solid fa-check",
                    action: "acceptTreatment",
                    scope: (s) => ({
                        injuryUuid: injuryUuid(s),
                        result: s.result,
                    }),
                    next: null,
                },
            ],
        },
    },
});
