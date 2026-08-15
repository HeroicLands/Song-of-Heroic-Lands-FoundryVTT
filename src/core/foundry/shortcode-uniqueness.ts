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

import { resolveShortcodeKey } from "@src/utils/helpers";
import type { ShortcodeRejection } from "@src/utils/helpers";
import { fvttRandomId } from "@src/core/FoundryHelpers";

/**
 * Shared runtime enforcement of the `(type, shortcode)` uniqueness invariant
 * (issue #766). `shortcode` is the system's lookup key; it must be a non-null,
 * non-blank string that is unique within its scope. The pure decision logic lives
 * in {@link resolveShortcodeKey}; this module supplies the Foundry-layer scope
 * resolution and applies the result on create/update for any SoHL document.
 *
 * A document opts into automatic management by passing `shortcodeDedupe: true`
 * to the create/update operation; otherwise a collision (or a name-less create)
 * is rejected.
 *
 * @see https://kb.heroiclands.org/dev/concepts/architecture/
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
 * Notify the user why a `(type, shortcode)` key was refused.
 *
 * A rejection has more than one cause, and they call for different remedies:
 * a duplicate needs a *different* code, an illegal one needs a *rewritten* code
 * (#1397). Reporting the wrong cause sends the user looking for a clash that
 * does not exist.
 *
 * @param doc - The document whose shortcode was refused.
 * @param desired - The offending shortcode value.
 * @param reason - Why {@link resolveShortcodeKey} refused it.
 */
function warnRejected(
    doc: any,
    desired: string,
    reason: ShortcodeRejection["reason"],
): void {
    if (reason === "charset") {
        (globalThis as any).ui?.notifications?.warn(
            sohl.i18n.format("SOHL.Shortcode.notAlphanumeric", {
                shortcode: desired,
            }),
        );
        return;
    }
    const scope =
        doc?.documentName === "Item" && doc.actor ?
            (doc.actor.name ?? "The actor")
        :   "The world";
    (globalThis as any).ui?.notifications?.warn(
        `${scope} already has a ${doc.type} with shortcode "${desired}".`,
    );
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
    const isDuplicate = !!(
        data?._stats?.duplicateSource ?? doc?._stats?.duplicateSource
    );
    const taken = await collectTakenShortcodes(doc);
    const resolved = resolveShortcodeKey(desired, doc.name ?? "", taken, {
        dedupe: !!options?.shortcodeDedupe,
        isDuplicate,
        makeRandomId: () => fvttRandomId(16),
    });
    if ("reject" in resolved) {
        warnRejected(doc, desired, resolved.reason);
        return false;
    }
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
    // A payload that merely restates the stored code changes nothing, so there
    // is nothing to enforce — and enforcing anyway would be actively harmful.
    // A migration rewrites the *whole* `system` object (the update is
    // non-recursive), so its payload restates a shortcode it may not have come
    // to repair yet; vetoing that would make a document carrying a legacy
    // malformed key unwritable, and so unrepairable. Uniqueness is unaffected:
    // `taken` excludes self, so a restated code never collided either.
    if (desired === String(doc.system?.shortcode ?? "")) return undefined;
    const taken = await collectTakenShortcodes(doc); // excludes self by id
    const resolved = resolveShortcodeKey(desired, doc.name ?? "", taken, {
        dedupe: !!options?.shortcodeDedupe,
        makeRandomId: () => fvttRandomId(16),
    });
    if ("reject" in resolved) {
        warnRejected(doc, desired, resolved.reason);
        return false;
    }
    if (resolved.shortcode !== desired) {
        foundry.utils.setProperty(
            changes,
            "system.shortcode",
            resolved.shortcode,
        );
    }
    return undefined;
}
