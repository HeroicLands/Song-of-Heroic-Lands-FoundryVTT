import { AIPlannedAction } from "@utils/ai";
import { defineType } from "@utils";

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
