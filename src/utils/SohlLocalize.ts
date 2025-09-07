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

export const TemporalDirection = {
    PAST: "past",
    FUTURE: "future",
    NOW: "now",
} as const;

export type TemporalDirection =
    (typeof TemporalDirection)[keyof typeof TemporalDirection];

/**
 * A partial duration object compatible with Intl.DurationFormat.
 */
export interface DurationValue {
    direction?: TemporalDirection;
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

/**
 * A utility class for localization and internationalization (i18n).
 * Provides methods for locale-aware string comparison, sorting, formatting of durations,
 * relative times, numbers, lists, and message templates.
 */
export class SohlLocalize {
    private static instance: SohlLocalize;

    static getInstance(): SohlLocalize {
        if (!SohlLocalize.instance) {
            SohlLocalize.instance = new SohlLocalize();
        }
        return SohlLocalize.instance;
    }

    private constructor() {}

    /**
     * Get the current language.
     * @returns {string} The current language code.
     */
    get lang(): string {
        return (game as any).i18n?.lang || "en";
    }

    normalizeText(
        str: string,
        options: { caseInsensitive: boolean; ascii: boolean } = {
            caseInsensitive: true,
            ascii: true,
        },
    ): string {
        if (!str) return "";
        if (options.ascii) {
            str = str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[%\x20-\x7E]/g, " ");
        }
        if (options.caseInsensitive) {
            str = str.toLowerCase();
        }
        return str;
    }
    /**
     * Locale-aware string comparison.
     * @param {string} first - The first string to compare.
     * @param {string} second - The second string to compare.
     * @returns {number} A negative number if first < second, 0 if equal, positive if first > second.
     */
    compare(
        first: string,
        second: string,
        options: { caseInsensitive: boolean; ascii: boolean } = {
            caseInsensitive: false,
            ascii: false,
        },
    ): number {
        if (typeof first !== "string") {
            throw new Error("First argument is not a string");
        }
        if (typeof second !== "string") {
            throw new Error("Second argument is not a string");
        }
        first = this.normalizeText(first, options);
        second = this.normalizeText(second, options);
        if (first === second) {
            return 0;
        }
        return new Intl.Collator(this.lang).compare(first, second);
    }

    /**
     * Sort an array of objects by a property using locale-aware string comparison.
     * @param {Record<string, any>[]} objects - The array of objects to sort.
     * @param {string} key - The key to sort by (dot-separated path).
     * @returns The sorted array.
     */
    sortObjects(objects: PlainObject[], key: string): PlainObject[] {
        objects.sort((a, b) => {
            return this.compare(
                foundry.utils.getProperty(a, key),
                foundry.utils.getProperty(b, key),
            );
        });
        return objects;
    }

    /**
     * Sort an array of strings using locale-aware string comparison.
     * @param ary - The array of strings to sort.
     * @returns The sorted array.
     */
    sortStrings(...ary: string[]): string[] {
        ary.sort((a, b) => this.compare(a, b));
        return ary;
    }

    /**
     * Format a duration object into a compact string (e.g., "2y 3m 5d").
     * Fallback to English formatting for unsupported languages.
     * @param {DurationValue} value - An object with time fields to format.
     * @returns {string} A formatted string.
     */
    formatDuration(value: DurationValue): string {
        switch (this.lang) {
            case "fi":
                return SohlLocalize._formatDurationFi(value);
            case "de":
                return SohlLocalize._formatDurationDe(value);
            case "sv":
                return SohlLocalize._formatDurationSv(value);
            case "fr":
                return SohlLocalize._formatDurationFr(value);
            case "es":
                return SohlLocalize._formatDurationEs(value);
            case "en":
            default:
                return SohlLocalize._formatDurationEn(value);
        }
    }

    /**
     * Internal formatter for English duration strings.
     * Outputs a space-separated string of abbreviated time parts.
     * @param {DurationValue} value - Duration components.
     * @returns Formatted string like "2y 3m 4d"
     */
    static _formatDurationEn(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}y`);
            if (value.months) parts.push(`${value.months}mo`);
            if (value.weeks) parts.push(`${value.weeks}w`);
            if (value.days) parts.push(`${value.days}d`);
            if (value.hours) parts.push(`${value.hours}h`);
            if (value.minutes) parts.push(`${value.minutes}m`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            let result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `${result} ago`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `in ${result}`;
            }
        }
        return "Now";
    }

    /**
     * @summary Format a duration object into a combat string in Finnish.
     * @param {DurationValue} value - Duration components.
     * @returns {string} Formatted string like "2v 3kk 4pv"
     */
    static _formatDurationFi(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}v`);
            if (value.months) parts.push(`${value.months}kk`);
            if (value.weeks) parts.push(`${value.weeks}vk`);
            if (value.days) parts.push(`${value.days}pv`);
            if (value.hours) parts.push(`${value.hours}t`);
            if (value.minutes) parts.push(`${value.minutes}min`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            const result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `${result} sitten`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `${result} päästä`;
            }
        }
        return "Nyt";
    }

    /**
     * @summary Format a duration object into a combat string in German.
     * @param {DurationValue} value - Duration components.
     * @returns {string} Formatted string like "2J 3M 4T"
     */
    static _formatDurationDe(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}J`);
            if (value.months) parts.push(`${value.months}M`);
            if (value.weeks) parts.push(`${value.weeks}W`);
            if (value.days) parts.push(`${value.days}T`);
            if (value.hours) parts.push(`${value.hours}h`);
            if (value.minutes) parts.push(`${value.minutes}min`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            const result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `vor ${result}`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `in ${result}`;
            }
        }
        return "Jetzt";
    }

    /**
     * @summary Format a duration object into a combat string in Swedish.
     * @param {DurationValue} value - Duration components.
     * @returns {string} Formatted string like "2år 3mån 4v"
     */
    static _formatDurationSv(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}å`);
            if (value.months) parts.push(`${value.months}mån`);
            if (value.weeks) parts.push(`${value.weeks}v`);
            if (value.days) parts.push(`${value.days}d`);
            if (value.hours) parts.push(`${value.hours}h`);
            if (value.minutes) parts.push(`${value.minutes}min`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            const result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `för ${result} sedan`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `om ${result}`;
            }
        }
        return "Nu";
    }

    /**
     * @summary Format a duration object into a combat string in French.
     * @param {DurationValue} value - Duration components.
     * @returns {string} Formatted string like "2a 3mo 4j"
     */
    static _formatDurationFr(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}a`);
            if (value.months) parts.push(`${value.months}mo`);
            if (value.weeks) parts.push(`${value.weeks}s`);
            if (value.days) parts.push(`${value.days}j`);
            if (value.hours) parts.push(`${value.hours}h`);
            if (value.minutes) parts.push(`${value.minutes}min`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            const result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `il y a ${result}`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `dans ${result}`;
            }
        }
        return "Maintenant";
    }

    /**
     * @summary Format a duration object into a combat string in Spanish.
     * @param {DurationValue} value - Duration components.
     * @returns {string} Formatted string like "2a 3m 4s"
     */
    static _formatDurationEs(value: DurationValue): string {
        if (value?.direction !== TemporalDirection.NOW) {
            const parts = [];
            if (value.years) parts.push(`${value.years}a`);
            if (value.months) parts.push(`${value.months}m`);
            if (value.weeks) parts.push(`${value.weeks}s`);
            if (value.days) parts.push(`${value.days}d`);
            if (value.hours) parts.push(`${value.hours}h`);
            if (value.minutes) parts.push(`${value.minutes}min`);
            if (value.seconds) parts.push(`${value.seconds}s`);
            const result = parts.join(" ");
            if (value.direction === TemporalDirection.PAST) {
                return `hace ${result}`;
            } else if (value.direction === TemporalDirection.FUTURE) {
                return `en ${result}`;
            }
        }
        return "Ahora";
    }

    /**
     * Format a value relative to now.
     * @param value - Numeric value.
     * @param unit - A time unit for Intl.RelativeTimeFormat.
     * @returns A formatted string.
     */
    formatRelativeTime(
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
    ): string {
        return new Intl.RelativeTimeFormat(this.lang).format(value, unit);
    }

    /**
     * Format a number in the current locale.
     * @param value - The number to format.
     * @returns A formatted string.
     */
    formatNumber(value: number): string {
        return new Intl.NumberFormat(this.lang).format(value);
    }

    /**
     * Format a list with "+and" conjunction.
     * @param value - Array of string items.
     * @returns A human-readable, localized list.
     */
    formatListAnd(value: string[]): string {
        return new Intl.ListFormat(this.lang, {
            style: "long",
            type: "conjunction",
        }).format(value);
    }

    /**
     * Format a list with "or" disjunction.
     * @param value - Array of string items.
     * @returns A human-readable, localized list.
     */
    formatListOr(value: string[]): string {
        return new Intl.ListFormat(this.lang, {
            style: "long",
            type: "disjunction",
        }).format(value);
    }

    /**
     * Format an internationalized message string, optionally pluralized.
     * @param messageKey - The base key to use for i18n.
     * @param values - An object containing interpolation values.
     * @param values.count - If present, plural form will be chosen.
     * @param values.ordinal - If true, uses ordinal plural rules.
     * @param values.useFallback - If true, uses fallback localization ("en" by default).
     * @returns A formatted message string.
     */
    format(
        messageKey: string,
        values: PlainObject & {
            count?: number;
            ordinal?: boolean;
            useFallback?: boolean;
        } = {},
    ): string {
        if (values.count != null) {
            const rule = new Intl.PluralRules(this.lang, {
                type: values.ordinal ? "ordinal" : "cardinal",
            });
            const form = rule.select(values.count);
            messageKey = `${messageKey}.${form}`;
        }
        let str = this.localize(messageKey, !!values.useFallback);
        const fmt = /{[^}]+}/g;
        str = str.replace(fmt, (k) => values[k.slice(1, -1)] as string);
        return str || "";
    }

    /**
     * Localizes a string based on the provided string ID using the game's internationalization system.
     * If the string ID is not found or is invalid, it returns the string ID itself as a fallback.
     *
     * @param stringId - The ID of the string to localize. This should correspond to a key in the localization files.
     * @param useFallback - If true, attempts to use a fallback localization if the string ID is not found.
     *                      Defaults to false.
     * @returns The localized string if found, or the string ID itself if not found or invalid.
     */
    localize(stringId: string, useFallback: boolean = false): string {
        if (!useFallback) {
            return (game as any).i18n?.localize(stringId) || "<missing>";
        } else {
            const v = foundry.utils.getProperty(
                ((game as any).i18n as any)?._fallback,
                stringId,
            );
            return typeof v === "string" ? v : stringId;
        }
    }

    /**
     * Convert seconds to a DurationValue object
     * @param seconds - The number of seconds to convert
     * @returns A DurationValue object
     */
    secondsToDuration(seconds: number): DurationValue {
        let duration: DurationValue = {};
        if (seconds < 0) {
            duration.direction = TemporalDirection.PAST;
        } else if (seconds > 0) {
            duration.direction = TemporalDirection.FUTURE;
        } else {
            duration.direction = TemporalDirection.NOW;
        }
        duration.days = Math.floor(seconds / 86400);
        seconds %= 86400;
        duration.hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        duration.minutes = Math.floor(seconds / 60);
        duration.seconds = seconds % 60;
        return duration;
    }
}

export const i18n = SohlLocalize.getInstance();
