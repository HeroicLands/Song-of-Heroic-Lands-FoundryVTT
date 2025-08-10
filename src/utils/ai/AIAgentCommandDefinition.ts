import { SohlAction } from "@common/event/SohlAction";
import type { JSONSchema7 } from "json-schema";

export interface AIExecutionResult {
    /** Human-readable summary of what happened */
    message: string;

    /** Optional reference to created or modified object */
    result?: unknown;

    /** Optional identifier to reference in later commands */
    refId?: string;

    /** Optional structured preview or metadata (e.g., for UI) */
    preview?: string;
}

export interface AIAgentCommandDefinition {
    type: string;
    description: string;
    inputSchema: JSONSchema7;
    examplePayload?: Record<string, unknown>;
    execute: (
        payload: any,
        context: SohlAction.Context,
    ) => Promise<AIExecutionResult>;
}
