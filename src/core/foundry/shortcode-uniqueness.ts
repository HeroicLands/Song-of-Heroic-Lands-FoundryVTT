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

import { resolveShortcodeKey, type ShortcodeRejectReason } from "@src/utils/helpers";
import { fvttRandomId } from "@src/core/FoundryHelpers";

/**
 * Shared runtime enforcement of the `(type, shortcode)` key invariants (issues
 * #766, #1397). `shortcode` is the system's lookup key; it must be a non-null,
 * non-blank, strictly alphanumeric string that is unique within its scope —
 * anything else is refused here. The pure decision logic lives
 * in {@link resolveShortcodeKey}; this module supplies the Foundry-layer scope
 * resolution and applies the result on create/update for any SoHL document.
 *
 * A document opts into automatic management by passing `shortcodeDedupe: true`
 * to the create/update operation; otherwise a collision (or a name-less create)
 * is rejected.
 *
 * @see https://www.heroiclands.org/sohl/kb/dev-docs/concepts/architecture/
 */

/** The four uniqueness scopes a `(type, shortcode)` key is unique within. */
type ShortcodeScope = "embedded" | "pack" | "world";

/**
 * Classify a document's uniqueness scope: an actor-embedded item, a compendium-pack
 * entry, or a world-directory document.
 * @param doc - The document to classify.
 * @returns The scope its `(type, shortcode)` key is unique within.
 */
function scopeOf(doc: any): ShortcodeScope {
    if (doc?.documentName === "Item" && doc.actor) return "embedded";
    if (doc?.pack) return "pack";
    return "world";
}

/**
 * Collect the shortcodes already used by same-type documents in `doc`'s
 * uniqueness scope, excluding `doc` itself.
 *
 * - **embedded** — the owning actor's items of the same type.
 * - **pack** — the compendium pack's entries of the same type (read from its
 *   index; a build-time `lint:packs` is the authoritative pack guard).
 * - **world** — the world collection (`game.items` / `game.actors`) of the same
 *   type.
 *
 * @param doc - The document whose scope is resolved.
 * @returns The set of taken shortcodes (never includes `doc`).
 */
export async function collectTakenShortcodes(doc: any): Promise<Set<string>> {
    const type = doc.type;
    const selfId = doc.id;
    const taken = new Set<string>();
    const add = (sc: unknown) => {
        if (typeof sc === "string" && sc) taken.add(sc);
    };

    switch (scopeOf(doc)) {
        case "embedded": {
            for (const other of doc.actor.items) {
                if (other.id !== selfId && other.type === type) {
                    add(other.system?.shortcode);
                }
            }
            return taken;
        }
        case "pack": {
            try {
                const pack = (globalThis as any).game?.packs?.get(doc.pack);
                if (pack) {
                    const index = await pack.getIndex({
                        fields: ["system.shortcode"],
                    });
                    for (const entry of index) {
                        if (entry._id !== selfId && entry.type === type) {
                            add(entry.system?.shortcode);
                        }
                    }
                }
            } catch {
                // Pack index unavailable at this moment — the build-time
                // `lint:packs` is the authoritative pack-uniqueness guard.
            }
            return taken;
        }
        default: {
            const world =
                doc.documentName === "Actor" ?
                    (globalThis as any).game?.actors
                :   (globalThis as any).game?.items;
            for (const other of world ?? []) {
                if (other.id !== selfId && other.type === type) {
                    add(other.system?.shortcode);
                }
            }
            return taken;
        }
    }
}

/**
 * Notify the user that a `(type, shortcode)` key already exists in scope.
 * @param doc - The document whose shortcode collided.
 * @param desired - The colliding shortcode value.
 */
function warnDuplicate(doc: any, desired: string): void {
    const scope =
        doc?.documentName === "Item" && doc.actor ? (doc.actor.name ?? "The actor") : "The world";
    (globalThis as any).ui?.notifications?.warn(
        `${scope} already has a ${doc.type} with shortcode "${desired}".`,
    );
}

/**
 * Notify the user why a shortcode was refused, and veto the operation.
 *
 * A collision and a malformed key are different mistakes with different fixes
 * ("pick another code" vs. "drop the punctuation"), so each gets its own
 * message rather than one that guesses.
 *
 * @param doc - The document whose shortcode was refused.
 * @param desired - The refused shortcode value.
 * @param reason - Why {@link resolveShortcodeKey} refused it.
 * @returns `false`, the veto value the `_pre*` hooks return.
 */
function warnRejected(doc: any, desired: string, reason: ShortcodeRejectReason): false {
    if (reason === "invalid") {
        sohl.log.uiWarn("SOHL.Shortcode.invalidCharacters", {
            shortcode: desired,
        });
    } else {
        warnDuplicate(doc, desired);
    }
    return false;
}

/**
 * Enforce shortcode uniqueness when a document is created. Resolves the
 * `(type, shortcode)` key (deriving from the name / generating a random id per
 * the {@link resolveShortcodeKey} matrix) and writes it back via `updateSource`,
 * or vetoes the create on an un-deduped collision.
 *
 * @param doc - The document being created.
 * @param data - The creation source data (carries `_stats.duplicateSource`).
 * @param options - The create options; `shortcodeDedupe` opts into auto-dedup.
 * @returns `false` to veto the creation, otherwise `undefined`.
 */
export async function enforceShortcodeOnCreate(
    doc: any,
    data: any,
    options: any,
): Promise<boolean | void> {
    const desired = String(doc.system?.shortcode ?? "");
    const isDuplicate = !!(data?._stats?.duplicateSource ?? doc?._stats?.duplicateSource);
    const taken = await collectTakenShortcodes(doc);
    const resolved = resolveShortcodeKey(desired, doc.name ?? "", taken, {
        dedupe: !!options?.shortcodeDedupe,
        isDuplicate,
        makeRandomId: () => fvttRandomId(16),
    });
    if ("reject" in resolved) return warnRejected(doc, desired, resolved.reason);
    if (resolved.shortcode !== desired) {
        doc.updateSource({ "system.shortcode": resolved.shortcode });
    }
    return undefined;
}

/**
 * Enforce shortcode uniqueness when a document's `system.shortcode` is changed.
 * A no-op when the change does not touch `shortcode`. On a collision, rewrites
 * the change to the deduped code (with `shortcodeDedupe`) or vetoes the update.
 *
 * @param doc - The document being updated.
 * @param changes - The pending update delta (mutated in place when deduped).
 * @param options - The update options; `shortcodeDedupe` opts into auto-dedup.
 * @returns `false` to veto the update, otherwise `undefined`.
 */
export async function enforceShortcodeOnUpdate(
    doc: any,
    changes: any,
    options: any,
): Promise<boolean | void> {
    const next = changes?.system?.shortcode;
    if (next === undefined) return undefined; // shortcode not being changed
    const desired = String(next ?? "");
    const taken = await collectTakenShortcodes(doc); // excludes self by id
    const resolved = resolveShortcodeKey(desired, doc.name ?? "", taken, {
        dedupe: !!options?.shortcodeDedupe,
        makeRandomId: () => fvttRandomId(16),
    });
    if ("reject" in resolved) return warnRejected(doc, desired, resolved.reason);
    if (resolved.shortcode !== desired) {
        foundry.utils.setProperty(changes, "system.shortcode", resolved.shortcode);
    }
    return undefined;
}
