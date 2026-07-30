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
    FRAMEWORK_DEMO_TOUR,
    buildFrameworkDemoTour,
} from "./framework-demo-tour";
import {
    CHARACTER_CREATION_TOUR,
    buildCharacterCreationTour,
} from "./character-creation-tour";

/** Guards {@link bindTourStartButtons} so the render hook is installed only once. */
let startHookBound = false;

/**
 * Register SoHL's guided tours with Foundry's `game.tours` collection so they
 * appear in **Tour Management** and can be launched from there. Called once from
 * the `ready` hook (after Foundry core has registered its own tours). Also wires
 * the delegated **Start** button used by the welcome card to launch a tour.
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
    bindTourStartButtons();
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
 * Install the delegated click handler that launches a tour from a chat card's
 * **Start** button (`[data-sohl-tour-start="<namespace.id>"]`). A chat button is
 * the consent-respecting offer surface: the tour is *offered* (e.g. on the
 * welcome card), never auto-started (PRIME DIRECTIVE — assist, don't play the
 * game). Idempotent across re-entry.
 */
function bindTourStartButtons(): void {
    if (startHookBound) return;
    startHookBound = true;
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
