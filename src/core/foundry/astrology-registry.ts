/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    validateTraditions,
    type AstrologyTradition,
    type AstrologyTraditions,
    type SkippedEntry,
} from "@src/entity/astrology";

/**
 * The runtime **astrology traditions registry** — the live store of birthsign
 * traditions, exposed on the `sohl` global as `sohl.astrologyRegistry`.
 *
 * Three layers resolve into the set a birthsign expression sees (later wins):
 *
 * 1. **Built-in** — the shipped default (Astrokýklos), seeded from its data file
 *    at system init.
 * 2. **Module** — traditions a module registers, typically in its `init` hook
 *    (`sohl.astrologyRegistry.register(json, "module")`). Loaded synchronously
 *    into this in-memory map, so a module that fetches its own JSON should
 *    `await` the fetch and register before its actors prepare.
 * 3. **World** — the GM's per-world overrides, persisted in the
 *    `sohl.astrologyTraditions` world setting and edited through the Astrology
 *    Traditions settings menu.
 *
 * The Foundry boundary {@link sohl.core.FoundryHelpers.fvttAstrologyTraditions}
 * reads {@link all} and injects the result into the birthsign SafeExpression
 * context, keeping the logic layer Foundry-free.
 */

/** Built-in + module traditions, keyed by tradition key (the world layer is read live). */
const registered = new Map<string, AstrologyTradition>();

/**
 * Supplier of the persisted **world-layer** traditions (the GM's per-world
 * overrides). Injected at system init via {@link setAstrologyWorldProvider} so
 * the registry never touches `game` directly — keeping it importable and
 * testable without a running Foundry. Defaults to none.
 * @returns The world-authored traditions (key → tradition); empty by default.
 */
let worldProvider: () => AstrologyTraditions = () => ({});

/**
 * Install the world-layer supplier (wired in `sohl.ts` to read the
 * `sohl.astrologyTraditions` world setting). Called once at system init.
 * @param provider - Returns the world-authored traditions (key → tradition).
 */
export function setAstrologyWorldProvider(
    provider: () => AstrologyTraditions,
): void {
    worldProvider = provider;
}

/** Outcome of a {@link AstrologyRegistry.register} call. */
export interface RegisterTraditionsResult {
    /** Keys of the traditions installed. */
    installed: string[];
    /** Entries skipped as invalid, each with a reason. */
    skipped: SkippedEntry[];
}

/**
 * The live astrology traditions registry surface (`sohl.astrologyRegistry`).
 * @see {@link astrologyRegistry}
 */
export interface AstrologyRegistry {
    /**
     * Validate and install a tradition set into the registry (built-in + module
     * layer). Invalid traditions/signs are skipped with reasons, never thrown; a
     * registered key replaces any earlier registration of the same key.
     * @param raw - The parsed traditions object (key → tradition), e.g. a module's JSON.
     * @param source - Provenance stamped on each tradition (default `"module"`).
     * @returns Which traditions installed and which were skipped.
     */
    register(
        raw: unknown,
        source?: NonNullable<AstrologyTradition["source"]>,
    ): RegisterTraditionsResult;
    /**
     * Remove a registered (built-in/module) tradition by key. Does not touch the
     * world-setting layer.
     * @param key - The tradition key to remove.
     * @returns `true` if a registration was removed.
     */
    unregister(key: string): boolean;
    /**
     * A single tradition from the resolved set (registered + world), or `undefined`.
     * @param key - The tradition key.
     * @returns The tradition, or `undefined` when absent.
     */
    get(key: string): AstrologyTradition | undefined;
    /**
     * The **resolved** traditions: built-in + module, with the world-setting
     * overrides layered on top (world wins). A fresh object per call.
     * @returns The resolved tradition key → tradition map.
     */
    all(): AstrologyTraditions;
    /**
     * Only the **registered** (built-in + module) traditions, excluding the world
     * layer. A fresh object per call.
     * @returns The registered tradition key → tradition map.
     */
    registered(): AstrologyTraditions;
    /** Clear all registered (built-in + module) traditions. For testing / re-seed. */
    reset(): void;
}

/** The live astrology traditions registry (`sohl.astrologyRegistry`). */
export const astrologyRegistry: AstrologyRegistry = {
    register(raw, source = "module") {
        const { traditions, skipped } = validateTraditions(raw, source);
        for (const [key, tradition] of Object.entries(traditions)) {
            registered.set(key, tradition);
        }
        return { installed: Object.keys(traditions), skipped };
    },

    unregister(key) {
        return registered.delete(key);
    },

    get(key) {
        return this.all()[key];
    },

    all() {
        return { ...Object.fromEntries(registered), ...worldProvider() };
    },

    registered() {
        return Object.fromEntries(registered);
    },

    reset() {
        registered.clear();
    },
};
