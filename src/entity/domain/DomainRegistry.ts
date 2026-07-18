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

import { DOMAIN_FAMILY, type DomainFamily } from "@src/utils/constants";
import { fvttGetSetting, fvttSetSetting } from "@src/core/FoundryHelpers";

const SETTING_MODULE = "sohl";
const SETTING_KEY = "domains";

/**
 * A single entry in the world-scoped Domain registry.
 *
 * Domains represent thematic groupings such as schools of magic, deities,
 * totems, birthsigns, or natural lore traditions. They are reference data,
 * not Items — they live in a Foundry world setting and are accessed
 * exclusively through {@link DomainRegistry}.
 *
 * Shortcodes are dotted, three-segment strings of the form
 * `<source>.<group>.<name>` (e.g. `sohl.hexhodai.pyrethos`,
 * `sohl.totem.Bear`, `sohl.asguardian.thorr`). The first segment matches
 * the {@link source} field. System defaults preserve human-readable casing
 * in the third segment.
 */
export interface DomainEntry {
    /** Stable, fully-qualified shortcode that uniquely identifies the entry. */
    shortcode: string;
    /** Display name. Can be an i18n key or a plain literal string. */
    label: string;
    /** The family this entry belongs to. */
    family: DomainFamily;
    /** CSS class for the icon, e.g. `"fa-solid fa-fire"`. */
    iconFAClass: string;
    /** Path to a PNG/WEBP image for the entry, or an empty string. */
    img: string;
    /** Rich-text description (HTML). Edited via ProseMirror in the manager. */
    description: string;
    /** Display order within the family. Lower values come first. */
    sort: number;
    /**
     * Optional shortcode of another DomainEntry this one derives from.
     * Used to express hierarchical relationships such as a religion
     * pointing at the deity it worships, or a sub-school of magic
     * pointing at its parent school. Resolution is by string match
     * against the registry; the parent does not need to exist (and
     * dangling parents are intentionally allowed for the
     * non-existent-deity case).
     */
    ancestorShortcode?: string;
    /**
     * Origin of the entry. `"sohl"` for system defaults, the module ID for
     * module-registered entries, `"world"` for GM-created entries. Only
     * `"world"` entries can be removed; system and module entries can be
     * overridden by re-registering with the same shortcode but cannot be
     * deleted.
     */
    source: string;
}

type DomainStore = Record<string, DomainEntry>;

/**
 * Read the stored domain registry, returning a defensive shallow copy.
 * @returns The current domain store, or an empty object if none is stored.
 */
function readStore(): DomainStore {
    const raw = fvttGetSetting(SETTING_MODULE, SETTING_KEY);
    if (!raw || typeof raw !== "object") return {};
    // Defensive shallow copy so callers cannot mutate the stored object
    // through any reference they happen to hold onto.
    return { ...(raw as DomainStore) };
}

/**
 * Persist the domain registry to the world setting.
 * @param store - The domain store to write.
 */
async function writeStore(store: DomainStore): Promise<void> {
    await fvttSetSetting(SETTING_MODULE, SETTING_KEY, store);
}

/**
 * The default `source` tag for entries that omit one: `"sohl"` during system
 * seeding (before ready) and `"world"` for GM-driven writes (after ready).
 * @returns `"sohl"` if the system is not yet ready, otherwise `"world"`.
 */
function defaultSource(): string {
    // During the system `init` hook, sohl.ready is false; after `ready`
    // it flips to true. We use that to distinguish system seeding from
    // GM-driven UI writes.
    const ready = (globalThis as any).sohl?.ready === true;
    return ready ? "world" : "sohl";
}

/**
 * Central registry for the world-scoped Domain settings.
 *
 * All access to domain data — reads and writes — should go through this
 * class. Logic-layer code must never call `game.settings.get/set` directly
 * for the `"sohl.domains"` setting.
 */
export class DomainRegistry {
    /**
     * Return all registered entries keyed by shortcode. The returned
     * object is frozen; callers cannot mutate the registry by writing to
     * it.
     * @returns A frozen copy of the domain store keyed by shortcode.
     */
    static getAll(): Readonly<DomainStore> {
        return Object.freeze({ ...readStore() });
    }

    /**
     * Return a single entry by shortcode, or `undefined` if it is not
     * registered.
     * @param shortcode - The shortcode of the entry to look up.
     * @returns A copy of the matching entry, or `undefined` if not registered.
     */
    static get(shortcode: string): DomainEntry | undefined {
        const store = readStore();
        const entry = store[shortcode];
        return entry ? { ...entry } : undefined;
    }

    /**
     * Return all entries belonging to the given family, sorted by
     * {@link DomainEntry.sort} and then alphabetically by label.
     * @param family - The domain family to filter by.
     * @returns The matching entries, sorted by sort order then label.
     */
    static getByFamily(family: DomainFamily): DomainEntry[] {
        const store = readStore();
        return Object.values(store)
            .filter((e) => e.family === family)
            .sort((a, b) => {
                if (a.sort !== b.sort) return a.sort - b.sort;
                return a.label.localeCompare(b.label);
            })
            .map((e) => ({ ...e }));
    }

    /**
     * Return entries shaped as `{ shortcode, label }` pairs suitable for
     * populating a `<select>` dropdown. Optionally filter by family.
     * @param family - Optional domain family to filter the choices by.
     * @returns The `{ shortcode, label }` pairs, sorted by sort order then label.
     */
    static getChoices(family?: DomainFamily): Array<{
        /** The domain entry's shortcode. */
        shortcode: string;
        /** The domain entry's display label. */
        label: string;
    }> {
        const store = readStore();
        const entries =
            family ?
                DomainRegistry.getByFamily(family)
            :   Object.values(store).sort((a, b) => {
                    if (a.sort !== b.sort) return a.sort - b.sort;
                    return a.label.localeCompare(b.label);
                });
        return entries.map((e) => ({
            shortcode: e.shortcode,
            label: e.label,
        }));
    }

    /**
     * Register one or more entries. Merges into the existing store; if a
     * shortcode already exists, the new entry overwrites it
     * (last-write-wins).
     *
     * Entries with no `source` field are tagged with the explicit
     * `source` argument if given, otherwise with `"sohl"` during the
     * `init` hook or `"world"` after `ready`.
     * @param entries - A single entry or array of entries to register.
     * @param source - Optional source tag applied to entries lacking one.
     */
    static async register(
        entries: DomainEntry | DomainEntry[],
        source?: string,
    ): Promise<void> {
        const list = Array.isArray(entries) ? entries : [entries];
        const store = readStore();
        const fallback = source ?? defaultSource();
        for (const raw of list) {
            const entry: DomainEntry = {
                ...raw,
                source: raw.source ?? fallback,
            };
            store[entry.shortcode] = entry;
        }
        await writeStore(store);
    }

    /**
     * Remove an entry by shortcode. Only entries with `source === "world"`
     * may be removed; attempts to remove a system or module entry throw.
     * Removing a missing shortcode is a no-op.
     * @param shortcode - The shortcode of the entry to remove.
     * @throws {Error} If the entry exists but its source is not `"world"`.
     */
    static async remove(shortcode: string): Promise<void> {
        const store = readStore();
        const existing = store[shortcode];
        if (!existing) return;
        if (existing.source !== "world") {
            throw new Error(
                `SohlDomains.remove: refusing to delete non-world entry "${shortcode}" (source="${existing.source}")`,
            );
        }
        delete store[shortcode];
        await writeStore(store);
    }
}

// Re-export DOMAIN_FAMILY here as a convenience so callers that use the
// registry don't have to know it lives in the constants module.
export { DOMAIN_FAMILY };
