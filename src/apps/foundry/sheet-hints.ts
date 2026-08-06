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

/**
 * Replace each rendered form-group's always-on `.hint` paragraph with a small
 * circled "?" icon appended to the group's label, carrying the hint text as the
 * icon's tooltip. The guidance stays one hover away without the hint competing
 * visually with the field value. Shared by the item and actor sheet bases so the
 * behaviour is identical on every SoHL sheet.
 *
 * Idempotent: on a re-render, a group already bearing a `.hint-help` icon simply
 * has any freshly re-emitted `.hint` dropped.
 *
 * @param root - The rendered sheet element to transform in place.
 */
export function hintsToLabelTooltips(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>(".form-group").forEach((group) => {
        const label = group.querySelector(
            ":scope > label",
        ) as HTMLElement | null;
        const hint = group.querySelector(
            ":scope > .hint",
        ) as HTMLElement | null;
        if (!label) return;
        // Already converted on a prior render: drop any re-emitted hint.
        if (label.querySelector(".hint-help")) {
            hint?.remove();
            return;
        }
        const text = hint?.textContent?.trim();
        if (!text || !hint) return;
        const icon = document.createElement("i");
        // FA6+ canonical name. The v5 alias `fa-question-circle` is still an
        // equivalent alias in the bundled Font Awesome Pro 7.x and renders the
        // same glyph, but canonical names are what this codebase standardizes on.
        icon.className = "fa-solid fa-circle-question hint-help";
        icon.setAttribute("data-tooltip", text);
        icon.setAttribute("aria-label", text);
        label.append(" ", icon);
        hint.remove();
    });
}
