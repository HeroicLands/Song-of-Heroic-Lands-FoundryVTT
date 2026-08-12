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
import { descriptionLinkTarget } from "@src/utils/description-link";

const UUID = "JournalEntry.abc123.JournalEntryPage.def456";

describe("descriptionLinkTarget", () => {
    it("recognizes a bare link", () => {
        expect(descriptionLinkTarget(`@UUID[${UUID}]`)).toBe(UUID);
    });

    it("recognizes a labelled link", () => {
        expect(descriptionLinkTarget(`@UUID[${UUID}]{Weaponcraft}`)).toBe(UUID);
    });

    /**
     * Markup carries no meaning of its own here — a link is a link however the
     * editor happened to wrap it.
     */
    it("sees through wrapping markup and trailing whitespace", () => {
        for (const html of [
            `<p>@UUID[${UUID}]{Weaponcraft}</p>`,
            `<h1>@UUID[${UUID}]</h1>`,
            `<div><p><strong>@UUID[${UUID}]</strong></p><br/>\n<br/>\n    </div>`,
            `\n\n  @UUID[${UUID}]  \n`,
            `<p>&nbsp;</p><p>@UUID[${UUID}]</p><p>&nbsp;</p>`,
        ]) {
            expect(descriptionLinkTarget(html), html).toBe(UUID);
        }
    });

    /** An already-enriched link is the same thing in a different spelling. */
    it("recognizes an enriched content link", () => {
        expect(
            descriptionLinkTarget(
                `<a class="content-link" data-uuid="${UUID}">Weaponcraft</a>`,
            ),
        ).toBe(UUID);
    });

    /**
     * Anything beyond the link is ordinary prose that happens to open with one.
     * A GM's own sentence is never discarded — if they want the target's text
     * inline, they embed it deliberately.
     */
    it("is not a pointer when anything else is present", () => {
        for (const html of [
            `@UUID[${UUID}] This one is Azdar's.`,
            `<p>@UUID[${UUID}]</p><p>The guild mark is filed off.</p>`,
            `<p>See:</p><p>@UUID[${UUID}]</p>`,
            `@UUID[${UUID}] @UUID[${UUID}]`,
        ]) {
            expect(descriptionLinkTarget(html), html).toBeNull();
        }
    });

    it("is not a pointer for ordinary prose, empty, or absent", () => {
        expect(descriptionLinkTarget("A wide flat blade.")).toBeNull();
        expect(descriptionLinkTarget("<p>&nbsp;</p>")).toBeNull();
        expect(descriptionLinkTarget("")).toBeNull();
        expect(descriptionLinkTarget(undefined)).toBeNull();
    });
});
