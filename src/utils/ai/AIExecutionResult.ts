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

export interface AIExecutionResult {
    /**
     * A human-readable message describing the result of the command.
     * Shown in chat, notifications, or logs.
     */
    message: string;

    /**
     * The actual created or modified object (e.g., Item, ScriptAction, Actor).
     * May be a Document, plain object, or domain-specific structure.
     */
    result?: unknown;

    /**
     * An optional semantic reference ID (e.g., "item:fireball_scroll") used
     * by the AI to refer to this object in later prompts or plans.
     */
    refId?: string;

    /**
     * Optional structured preview or summary (e.g., generated script logic or
     * AI explanation). May be displayed in an expandable log or chat bubble.
     */
    preview?: string;
}
