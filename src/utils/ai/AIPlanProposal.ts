/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AIPlannedAction } from "@utils/ai/AIPlannedAction";
import { defineType } from "@utils/constants";

const {
    kind: AI_PLAN_STATUS,
    values: AIPlanStatuses,
    isValue: isAiPlanStatus,
} = defineType("SOHL.AIPlanStatus", {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    REVISED: "revised",
});
export type AIPlanStatus = (typeof AI_PLAN_STATUS)[keyof typeof AI_PLAN_STATUS];

export interface AIPlanProposal {
    /** A human-readable summary of what the AI intends to do */
    summary: string;

    /** A list of high-level actions the AI proposes */
    actions: AIPlannedAction[];

    /** Optional notes about assumptions or clarification needed */
    assumptions?: string[];

    /** A unique identifier for this proposal (used to track revisions/approvals) */
    planId: string;

    /** Whether this plan is awaiting user approval */
    status: AIPlanStatus;
}
