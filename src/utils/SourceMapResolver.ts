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

import { SourceMapConsumer, RawSourceMap } from "source-map";

/** Cache parsed maps so we don’t reload */
const sourceMapCache = new Map<string, SourceMapConsumer>();

/**
 * Loads a source map and returns its consumer.
 */
async function getSourceMapConsumer(
    mapUrl: string,
): Promise<SourceMapConsumer | null> {
    if (sourceMapCache.has(mapUrl)) return sourceMapCache.get(mapUrl)!;

    try {
        const res = await fetch(mapUrl);
        const rawMap: RawSourceMap = await res.json();
        const consumer = await new SourceMapConsumer(rawMap);
        sourceMapCache.set(mapUrl, consumer);
        return consumer;
    } catch (err) {
        console.warn("Failed to load source map:", mapUrl, err);
        return null;
    }
}

/**
 * Resolves a position in a minified file back to original source.
 */
export async function mapToOriginalPosition(
    sourceFile: string,
    line: number,
    column: number,
): Promise<{
    source: string;
    line: number;
    column: number;
    name?: string;
} | null> {
    const mapUrl = `${sourceFile}.map`; // assumes maps are next to built files

    const consumer = await getSourceMapConsumer(mapUrl);
    if (!consumer) return null;

    const pos = consumer.originalPositionFor({ line, column });
    return pos.source ? pos : null;
}
