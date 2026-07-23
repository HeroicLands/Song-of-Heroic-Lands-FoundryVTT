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
import {
    FRAMEWORK_DEMO_TOUR,
    buildFrameworkDemoTour,
} from "./framework-demo-tour";
import {
    CHARACTER_CREATION_TOUR,
    buildCharacterCreationTour,
} from "./character-creation-tour";

/** The per-user flag recording that the Character Creation tour has been offered. */
const OFFERED_FLAG = "characterCreationTourOffered";

/** The offer chat-card template. */
const OFFER_TEMPLATE = "systems/sohl/templates/chat/tour-offer-card.hbs";

/** Guards {@link bindTourOfferButtons} so the render hook is installed only once. */
let offerHookBound = false;

/**
 * Register SoHL's guided tours with Foundry's `game.tours` collection so they
 * appear in **Tour Management** and can be launched from there. Called once from
 * the `ready` hook (after Foundry core has registered its own tours). Also wires
 * the tour-offer chat button and — once per user — posts the first-run offer for
 * the flagship Character Creation tour.
 *
 * Registration is best-effort per tour: a duplicate key (e.g. a re-run in the
 * same session) is logged and skipped rather than aborting the rest.
 */
export function registerSystemTours(): void {
    const tours = (game as any).tours;
    if (!tours) return;
    registerTour(
        tours,
        FRAMEWORK_DEMO_TOUR.namespace,
        FRAMEWORK_DEMO_TOUR.id,
        buildFrameworkDemoTour,
    );
    registerTour(
        tours,
        CHARACTER_CREATION_TOUR.namespace,
        CHARACTER_CREATION_TOUR.id,
        buildCharacterCreationTour,
    );
    bindTourOfferButtons();
    void offerCharacterCreationTour();
}

/**
 * Register one tour, logging and skipping a duplicate-key failure.
 * @param tours - The `game.tours` collection.
 * @param namespace - The tour's package namespace.
 * @param id - The tour's machine id.
 * @param build - Factory that constructs the tour instance.
 */
function registerTour(
    tours: any,
    namespace: string,
    id: string,
    build: () => unknown,
): void {
    try {
        tours.register(namespace, id, build());
    } catch (err) {
        console.warn(`SoHL | Tour "${namespace}.${id}" not registered`, err);
    }
}

/**
 * Install the delegated click handler that launches a tour from an offer card's
 * **Start** button (`[data-sohl-tour-start="<namespace.id>"]`). A chat button is
 * the consent-respecting offer surface: the tour is *offered*, never auto-started
 * (PRIME DIRECTIVE — assist, don't play the game). Idempotent across re-entry.
 */
function bindTourOfferButtons(): void {
    if (offerHookBound) return;
    offerHookBound = true;
    (Hooks as any).on(
        "renderChatMessageHTML",
        (_msg: unknown, element: HTMLElement) => {
            const btn = element.querySelector<HTMLElement>(
                "[data-sohl-tour-start]",
            );
            if (!btn) return;
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-sohl-tour-start");
                const tour = key ? (game as any).tours?.get(key) : undefined;
                if (tour) void tour.start();
            });
        },
    );
}

/**
 * Offer the Character Creation tour to the current user **once** — a whispered,
 * non-blocking chat card with a **Start** button. The offer fires the first time
 * a user loads a world where they have not yet been offered (a per-user, per-world
 * `User` flag), and never again; the tour stays launchable on demand from Tour
 * Management. A whisper card (rather than a modal dialog) is deliberate: it
 * follows SoHL's offer-don't-act consent model and never blocks — including the
 * headless e2e client.
 */
async function offerCharacterCreationTour(): Promise<void> {
    const user = (game as any).user;
    const key = `${CHARACTER_CREATION_TOUR.namespace}.${CHARACTER_CREATION_TOUR.id}`;
    const tour = (game as any).tours?.get(key);
    if (!user || !tour) return;
    if (user.getFlag?.("sohl", OFFERED_FLAG)) return;

    try {
        const i18n = (game as any).i18n;
        const content = await toHTMLWithTemplate(toFilePath(OFFER_TEMPLATE), {
            title: i18n.localize("SOHL.Tour.CharCreation.offer.title"),
            content: i18n.localize("SOHL.Tour.CharCreation.offer.content"),
            startLabel: i18n.localize("SOHL.Tour.CharCreation.offer.start"),
            tourId: key,
        });
        await (globalThis as any).ChatMessage.create({
            content,
            whisper: [user.id],
            speaker: {
                alias: i18n.localize("SOHL.Tour.CharCreation.offer.speaker"),
            },
        });
        // Record the offer only after it was actually delivered, so a failed
        // post is retried on the next load rather than silently suppressed.
        await user.setFlag?.("sohl", OFFERED_FLAG, true);
    } catch (err) {
        console.warn("SoHL | Character Creation tour offer not posted", err);
    }
}
