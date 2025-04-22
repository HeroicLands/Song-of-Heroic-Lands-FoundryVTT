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

import { gameTimeNow, DurationValue } from "@foundry/core";
import { SohlBase, SohlBaseParent } from "@logic/common/core";
import { DataField, RegisterClass } from "@utils/decorators";

/**
 * SohlTemporal
 * Represents a point in game time, typically tied to worldTime.
 * Stores the time as a number for JSON serialization and provides
 * utility methods for formatted and localized display.
 */
@RegisterClass("SohlTemporal", "0.6.0")
export class SohlTemporal extends SohlBase {
    /** The world time, stored as a numeric timestamp */
    @DataField("gameTime", { type: Number, initial: () => gameTimeNow() })
    public gameTime!: number;

    formatWorldDate(time?: number): string {
        let worldDateLabel = "No Calendar";
        if (sohl.simpleCalendar) {
            time ??= this.gameTime;
            const ct = sohl.simpleCalendar.api.secondsToDate(time);
            worldDateLabel = `${ct.display.day} ${ct.display.monthName} ${ct.display.yearPrefix}${ct.display.year}${ct.display.yearPostfix} ${ct.display.time}`;
        }
        return worldDateLabel;
    }

    /**
     * Format the duration between the stored time and the provided time.
     * @param duration - The duration to format, or the current duration if not provided
     * @returns A human-readable string of the duration
     */
    formatDuration(duration?: DurationValue): string {
        duration ??= this.currentDuration();
        return sohl.i18n.formatDuration(duration);
    }

    /**
     * Advance time by a given amount
     * @param amount - The amount of time to advance
     */
    advanceTime(amount: number): void {
        this.gameTime += amount;
    }

    /**
     * Compare this time to another time
     * @param other - The other SohlTemporal to compare
     * @returns Positive if this is later, negative if earlier, 0 if equal
     */
    compare(other: SohlTemporal): number {
        return this.gameTime - other.gameTime;
    }

    /**
     * @summary Return the numeric representation of this SohlTemporal
     * @returns The stored time as a number
     */
    valueOf(): number {
        return this.gameTime;
    }

    /**
     * Check if the current time is in the past
     * @returns True if the time is in the past, false otherwise
     */
    past(): boolean {
        return this.gameTime < gameTimeNow();
    }

    /**
     * Check if the current time is in the future
     * @returns True if the time is in the future, false otherwise
     */
    future(): boolean {
        return this.gameTime > gameTimeNow();
    }

    /**
     * Compare the stored time to the current world time and return a DurationValue object
     * @returns A DurationValue representing the difference in time
     */
    currentDuration(): DurationValue {
        const diffInSeconds = Math.abs(gameTimeNow() - this.gameTime);
        return sohl.i18n.secondsToDuration(diffInSeconds);
    }

    /**
     * Create a new instance from a numeric time value
     * @param time - The world time value to create from
     */
    static from(parent: SohlBaseParent, time: number): SohlTemporal {
        return new SohlTemporal(parent, { gameTime: time });
    }
}
