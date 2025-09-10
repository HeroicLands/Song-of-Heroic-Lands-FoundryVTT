/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlEventContext } from "@common/event/SohlEventContext";
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
        context: SohlEventContext,
    ) => Promise<AIExecutionResult>;
}
