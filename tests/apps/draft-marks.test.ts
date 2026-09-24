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

import { describe, it, expect } from "vitest";
import {
    DRAFT_MARK_CLASS,
    isDraftSource,
    markDraftDirectoryEntries,
} from "@src/apps/foundry/draft-marks";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

/**
 * The **draft mark** — one class, applied to the document's image everywhere the
 * document is listed, so a single stylesheet rule outlines it.
 *
 * Two seams are tested here. `markDraftDirectoryEntries` is the Foundry-free
 * half of the directory hook: it walks entry rows and toggles the class, given a
 * lookup that answers whether an entry is a draft. The sheet headers render the
 * same class through their own templates.
 */

/** A stub `<img>` recording the classes toggled on it. */
function makeImg() {
    const classes = new Set<string>();
    return {
        classList: {
            toggle(name: string, force?: boolean) {
                if (force) classes.add(name);
                else classes.delete(name);
            },
            contains: (name: string) => classes.has(name),
        },
        classes,
    };
}

/** A stub directory row: an entry id, and optionally an image inside it. */
function makeRow(entryId: string | undefined, img: ReturnType<typeof makeImg> | null) {
    return {
        dataset: entryId === undefined ? {} : { entryId },
        querySelector: (sel: string) => (sel === "img" ? img : null),
    };
}

/** A stub directory root resolving `querySelectorAll` to the given rows. */
function makeRoot(rows: unknown[]): HTMLElement {
    return { querySelectorAll: () => rows } as unknown as HTMLElement;
}

describe("the draft mark on directory entries", () => {
    it("marks the image of an entry the lookup calls a draft", () => {
        const img = makeImg();
        const root = makeRoot([makeRow("abc", img)]);
        markDraftDirectoryEntries(root, (id) => id === "abc");
        expect(img.classList.contains(DRAFT_MARK_CLASS)).toBe(true);
    });

    it("leaves an entry that is not a draft visually unchanged", () => {
        const img = makeImg();
        const root = makeRoot([makeRow("abc", img)]);
        markDraftDirectoryEntries(root, () => false);
        expect(img.classes.size).toBe(0);
    });

    it("clears a mark left on a row that is no longer a draft", () => {
        // A directory row can be re-rendered in place, so the mark is toggled
        // rather than added: a document cleared of the flag loses the outline.
        const img = makeImg();
        img.classList.toggle(DRAFT_MARK_CLASS, true);
        const root = makeRoot([makeRow("abc", img)]);
        markDraftDirectoryEntries(root, () => false);
        expect(img.classList.contains(DRAFT_MARK_CLASS)).toBe(false);
    });

    it("marks each row by its own id", () => {
        const draft = makeImg();
        const settled = makeImg();
        const root = makeRoot([makeRow("draft", draft), makeRow("settled", settled)]);
        markDraftDirectoryEntries(root, (id) => id === "draft");
        expect(draft.classList.contains(DRAFT_MARK_CLASS)).toBe(true);
        expect(settled.classList.contains(DRAFT_MARK_CLASS)).toBe(false);
    });

    it("skips a row with no image and a row with no entry id", () => {
        const orphan = makeImg();
        const root = makeRoot([makeRow("abc", null), makeRow(undefined, orphan)]);
        expect(() => markDraftDirectoryEntries(root, () => true)).not.toThrow();
        expect(orphan.classes.size).toBe(0);
    });
});

describe("reading the flag off a document or an index entry", () => {
    it("reads system.isDraft from a document", () => {
        expect(isDraftSource({ system: { isDraft: true } })).toBe(true);
        expect(isDraftSource({ system: { isDraft: false } })).toBe(false);
    });

    it("reads the same path from a compendium index entry", () => {
        // A pack index carries only the fields the pack was indexed for, so the
        // flag is read from the same path on whichever shape is to hand.
        expect(isDraftSource({ _id: "x", name: "n", system: { isDraft: true } })).toBe(true);
    });

    it("treats an absent flag, an absent system block and an absent source as settled", () => {
        expect(isDraftSource({ system: {} })).toBe(false);
        expect(isDraftSource({})).toBe(false);
        expect(isDraftSource(undefined)).toBe(false);
        expect(isDraftSource(null)).toBe(false);
    });
});

describe("the draft mark on sheet headers", () => {
    const HEADERS = [
        [
            "item",
            "systems/sohl/templates/item/parts/header.hbs",
            { itemName: "Broadsword", itemImg: "icons/svg/sword.svg", logic: { data: {} } },
        ],
        [
            "vehicle",
            "systems/sohl/templates/actor/vehicle/header.hbs",
            { actorName: "Cart", document: { system: {} } },
        ],
        [
            "cohort",
            "systems/sohl/templates/actor/cohort/header.hbs",
            { actorName: "Band", document: { system: {} } },
        ],
        [
            "structure",
            "systems/sohl/templates/actor/structure/header.hbs",
            { actorName: "Keep", document: { system: {} } },
        ],
        [
            "being",
            "systems/sohl/templates/actor/being/header.hbs",
            {
                actorName: "Aldric",
                actorImg: "icons/svg/mystery-man.svg",
                document: { system: {} },
                healthPct: 100,
                statusEffects: [],
                bodyParts: [],
            },
        ],
    ] as const;

    it.each(HEADERS)("marks the %s header image when the document is a draft", (_t, tpl, ctx) => {
        const html = renderTemplateReal(tpl, { ...ctx, isDraft: true });
        const img = /<img[^>]*>/.exec(html);
        expect(img).not.toBeNull();
        expect(img![0]).toContain(DRAFT_MARK_CLASS);
    });

    it.each(HEADERS)("leaves the %s header image unmarked otherwise", (_t, tpl, ctx) => {
        const html = renderTemplateReal(tpl, { ...ctx, isDraft: false });
        expect(html).not.toContain(DRAFT_MARK_CLASS);
    });
});
