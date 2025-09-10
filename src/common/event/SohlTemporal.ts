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

import { SohlBase } from "@common/SohlBase";
import type { DurationValue } from "@utils/SohlLocalize";

/**
 * SohlTemporal
 * Represents a point in game time, typically tied to worldTime.
 * Stores the time as a number for JSON serialization and provides
 * utility methods for formatted and localized display.
 */
export class SohlTemporal extends SohlBase {
    /** The world time, stored as a numeric timestamp */
    private _time!: number;

    constructor(data: PlainObject, options: PlainObject = {}) {
        super(data, options);
        this._time = data.time ?? (game as any).time.worldTime;
    }

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
    }

    formatWorldDate(time?: number): string {
        let worldDateLabel = "No Calendar";
        if (sohl.simpleCalendar) {
            time ??= this.time;
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
     * Advance time by a given number of seconds
     * @param seconds - The number of seconds to add
     */
    add(seconds: number): this {
        this._time += seconds;
        return this;
    }

    /**
     * Retrograde time by a given number of seconds
     * @param seconds - The number of seconds to subtract
     */
    subtract(seconds: number): this {
        this._time -= seconds;
        return this;
    }

    /**
     * Compare this time to another time
     * @param other - The other SohlTemporal to compare
     * @returns Positive if this is later, negative if earlier, 0 if equal
     */
    compare(other: SohlTemporal): number {
        return this.time - other.time;
    }

    /**
     * Check if the current time is in the past
     * @returns True if the time is in the past, false otherwise
     */
    past(): boolean {
        const nowTime = (game as any).time.worldTime;
        return this._time < nowTime;
    }

    /**
     * Check if the current time is in the past or present
     * @returns True if the time is in the past or present, false otherwise
     */
    pastOrPresent(): boolean {
        const nowTime = (game as any).time.worldTime;
        return this._time <= nowTime;
    }

    /**
     * Check if the current time is in the future
     * @returns True if the time is in the future, false otherwise
     */
    future(): boolean {
        const nowTime = (game as any).time.worldTime;
        return this._time > nowTime;
    }

    /**
     * Check if the current time is in the future or present
     * @returns True if the time is in the future or present, false otherwise
     */
    futureOrPresent(): boolean {
        const nowTime = (game as any).time.worldTime;
        return this._time >= nowTime;
    }

    /**
     * Compare the stored time to the current world time and return a DurationValue object
     * @returns A DurationValue representing the difference in time
     */
    currentDuration(): DurationValue {
        const diffInSeconds = Math.abs(
            (game as any).time.worldTime - this._time,
        );
        return sohl.i18n.secondsToDuration(diffInSeconds);
    }

    /**
     * Create a new instance from a numeric time value
     * @param time - The world time value to create from
     */
    static from(time: number): SohlTemporal {
        return new SohlTemporal({ time });
    }

    /**
     * Get the current world time
     * @returns A new SohlTemporal instance representing the current world time
     */
    static now(): SohlTemporal {
        return new SohlTemporal({ time: (game as any).time.worldTime });
    }
}
