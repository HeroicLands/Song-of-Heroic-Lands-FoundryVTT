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

import { toFilePath } from "@src/utils/helpers";
import { toHTMLWithTemplate } from "@src/core/FoundryHelpers";
import { CHARACTER_CREATION_TOUR } from "./tours/character-creation-tour";

/** The general welcome chat-card template. */
const WELCOME_TEMPLATE = "systems/sohl/templates/chat/welcome-card.hbs";

/** The per-user flag recording that the welcome card has been shown. */
const SHOWN_FLAG = "welcomeCardShown";

/**
 * Post the general **Welcome to Song of Heroic Lands** chat card to the current
 * user **once** — a whispered, non-blocking card shown the first time a user
 * loads a world where they have not yet seen it (a per-user, per-world `User`
 * flag), and never again. Called from the `ready` hook.
 *
 * The card is the system's front door: it links to the project site, points at
 * the bundled User Guide journals, and recommends the guided tours (with a
 * one-click **Start** button for the flagship Character Creation tour, plus
 * instructions to reach every tour from *Settings → Tour Management*). It
 * replaces the old startup welcome dialog.
 *
 * A whispered chat card (rather than a modal dialog) is deliberate: it follows
 * SoHL's offer-don't-act consent model and never blocks — including the headless
 * e2e client. The Start button only *offers* the tour; the delegated launcher in
 * `register-tours.ts` starts it only when the user clicks (PRIME DIRECTIVE —
 * assist, don't play the game).
 */
export async function postWelcomeCard(): Promise<void> {
    const user = (game as any).user;
    if (!user) return;
    if (user.getFlag?.("sohl", SHOWN_FLAG)) return;

    try {
        const i18n = (game as any).i18n;
        const tourId = `${CHARACTER_CREATION_TOUR.namespace}.${CHARACTER_CREATION_TOUR.id}`;
        const content = await toHTMLWithTemplate(toFilePath(WELCOME_TEMPLATE), {
            title: i18n.localize("SOHL.Welcome.title"),
            intro: i18n.localize("SOHL.Welcome.intro"),
            visitSite: i18n.localize("SOHL.Welcome.visitSite"),
            moreInfo: i18n.localize("SOHL.Welcome.moreInfo"),
            tours: i18n.localize("SOHL.Welcome.tours"),
            startLabel: i18n.localize("SOHL.Welcome.start"),
            tourId,
        });
        await (globalThis as any).ChatMessage.create({
            content,
            whisper: [user.id],
            speaker: {
                alias: i18n.localize("SOHL.Welcome.speaker"),
            },
        });
        // Record the card only after it was actually delivered, so a failed post
        // is retried on the next load rather than silently suppressed.
        await user.setFlag?.("sohl", SHOWN_FLAG, true);
    } catch (err) {
        console.warn("SoHL | Welcome card not posted", err);
    }
}
