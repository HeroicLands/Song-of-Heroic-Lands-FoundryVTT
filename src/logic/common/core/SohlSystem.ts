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

import { SohlSpeaker } from "@logic/common/core";
import { SuccessTestResult } from "@logic/common/core/result";

export const SOHL_VARIANT = {
    LEGENDARY: "legendary",
    MISTY_ISLE: "mistyisle",
} as const;
export type SohlVariant = (typeof SOHL_VARIANT)[keyof typeof SOHL_VARIANT];

/**
 * Abstract class representing a system variant for the Song of Heroic Lands (SoHL).
 * This class provides a structure for defining system-specific properties and methods.
 */
export abstract class SohlSystem {
    /**
     * A short string ID for this system variant.
     */
    abstract readonly id: SohlVariant;

    /**
     * The human-readable title of the system variant.
     */
    abstract readonly title: string;

    /**
     * The system initialization message, displayed during loading.
     */
    abstract readonly INIT_MESSAGE: string;

    /**
     *
     * @param parent
     * @param speaker
     * @param rollMode
     * @returns
     */
    static chatSpeakerFactory(
        parent: any,
        speaker: SohlSpeaker,
        rollMode: string,
    ): SohlSpeaker {
        return new SohlSpeaker(parent, { speaker });
    }

    /**
     *
     * @param parent
     * @param param1
     * @returns
     */
    static successTestResultFactory(
        parent: any,
        {
            chat,
            type,
            title,
            mlMod,
        }: { chat?: any; type?: string; title?: string; mlMod?: any } = {},
    ): SuccessTestResult {
        return new SuccessTestResult(parent, { chat, type, title, mlMod });
    }
}
