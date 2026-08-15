/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time content helper (plain ESM, no Foundry). Imported by relative path
// because the content build scripts live outside the `@src` alias tree.
import {
    isAddressAlias,
    auditNoteAliases,
} from "../../utils/content-aliases.mjs";

/** The content types a small stand-in tree contains. */
const TYPES = new Set(["doc", "skill", "trauma", "weapongear", "creature"]);

describe("isAddressAlias", () => {
    it("recognises an alias qualified by a known type", () => {
        expect(isAddressAlias("doc-shock", TYPES)).toBe(true);
        expect(isAddressAlias("skill-wpnc", TYPES)).toBe(true);
    });

    it("reads the type case-insensitively", () => {
        expect(isAddressAlias("Doc-shock", TYPES)).toBe(true);
    });

    it("rejects a display name that merely contains a hyphen", () => {
        // The reason the rule keys on a *known type* rather than on the mere
        // presence of a hyphen: note names are hyphenated too, and they must
        // keep resolving as ordinary aliases.
        expect(isAddressAlias("Grukar-ahk", TYPES)).toBe(false);
        expect(isAddressAlias("Ball & Chain Flail", TYPES)).toBe(false);
    });

    it("rejects an unknown qualifier", () => {
        expect(isAddressAlias("nosuchtype-abc", TYPES)).toBe(false);
    });

    it("splits at the first hyphen, so a hyphenated shortcode still counts", () => {
        // `self-pro` is not a legal shortcode (#1397 enforces the charset), but
        // it is still this note's address until that rename lands, and the
        // resolver already splits it this way.
        expect(isAddressAlias("trauma-self-pro", TYPES)).toBe(true);
    });

    it("rejects a bare type with nothing after the separator", () => {
        expect(isAddressAlias("doc-", TYPES)).toBe(false);
        expect(isAddressAlias("doc", TYPES)).toBe(false);
        expect(isAddressAlias("-shock", TYPES)).toBe(false);
    });

    it("ignores the legacy slash form — it is not an Obsidian alias", () => {
        // Obsidian reads `/` as a path, so a slash-qualified string could never
        // serve as the alias that makes the address resolve in the editor.
        expect(isAddressAlias("doc/shock", TYPES)).toBe(false);
    });

    it("does not treat the virtual `doc<type>` form as an address alias", () => {
        // `docskill-wpnc` addresses the item's *write-up*, a different Foundry
        // document compiled from the same note — not the note's own identity.
        expect(isAddressAlias("docskill-wpnc", TYPES)).toBe(false);
    });
});

describe("auditNoteAliases", () => {
    const audit = (aliases: unknown, over: Record<string, unknown> = {}) =>
        auditNoteAliases(
            { type: "doc", shortcode: "shock", aliases, ...over },
            TYPES,
        );

    it("passes a note carrying exactly its own address", () => {
        expect(audit(["Shock State", "doc-shock"])).toEqual({ ok: true });
    });

    it("passes when the address is the only alias", () => {
        expect(audit(["doc-shock"])).toEqual({ ok: true });
    });

    it("fails a note with no address alias", () => {
        expect(audit(["Shock State"])).toMatchObject({
            ok: false,
            reason: "missing",
            expected: "doc-shock",
        });
    });

    it("fails a note with no aliases at all", () => {
        expect(audit(undefined)).toMatchObject({
            ok: false,
            reason: "missing",
        });
        expect(audit([])).toMatchObject({ ok: false, reason: "missing" });
    });

    it("fails a note whose address alias is not its own address", () => {
        expect(audit(["doc-shck"])).toMatchObject({
            ok: false,
            reason: "mismatch",
            found: ["doc-shck"],
            expected: "doc-shock",
        });
    });

    it("fails a stale alias left behind by a shortcode change", () => {
        // The whole point of requiring *exactly one*: `doc-shock` still
        // resolves every old inbound link to the right note, so nothing else
        // would ever notice that `doc-shck` is now the address.
        expect(audit(["doc-shck", "doc-shock"])).toMatchObject({
            ok: false,
            reason: "duplicate",
            found: ["doc-shck", "doc-shock"],
        });
    });

    it("fails two address aliases even when one is correct and the other is another type", () => {
        expect(audit(["doc-shock", "skill-shock"])).toMatchObject({
            ok: false,
            reason: "duplicate",
        });
    });

    it("requires the alias to match the shortcode's case exactly", () => {
        // Obsidian resolves aliases case-insensitively, so a case-drifted alias
        // would keep working while ceasing to be the note's stated address.
        expect(audit(["doc-Shock"])).toMatchObject({
            ok: false,
            reason: "mismatch",
        });
    });

    it("skips a note that has no shortcode to form an address from", () => {
        // A note with no shortcode cannot be a link target at all; `lint:packs`
        // skips it for the same reason.
        expect(audit(["Anything"], { shortcode: "" })).toEqual({
            ok: true,
            skipped: "no-shortcode",
        });
    });

    it("ignores a non-string entry in the alias list", () => {
        expect(audit([null, 42, "doc-shock"])).toEqual({ ok: true });
    });
});
