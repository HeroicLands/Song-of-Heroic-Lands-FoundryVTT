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

import { ACTOR_KIND } from "@src/utils/constants";
import { TourGate, gateValue } from "@src/entity/tour";
import { SohlTour, type SohlTourConfig } from "../SohlTour";

/** The namespaced identity of the framework demo tour. */
export const FRAMEWORK_DEMO_TOUR = Object.freeze({
    namespace: "sohl",
    id: "framework-demo",
});

/**
 * The first Being actor the current user owns — the demo's navigation subject.
 * The tour is only startable ({@link SohlTourConfig.canStart}) when one exists.
 * @returns The first owned Being actor, or `undefined` if the user owns none.
 */
function firstOwnedBeing(): any {
    const actors = (game as any).actors?.contents ?? [];
    return actors.find((a: any) => a.type === ACTOR_KIND.BEING && a.isOwner);
}

/**
 * A small, self-contained tour that exercises the whole {@link SohlTour}
 * framework against a Being sheet: a **free** intro, sheet **navigation**, a
 * **value-gated** step (a non-destructive search field), an **action/state-gated**
 * step (the user clicks a tab themselves), and a free wrap-up. It doubles as the
 * worked example in the authoring guide and as the e2e subject.
 *
 * Every gated step only *coaches and waits*; the framework performs no
 * meaningful choice on the user's behalf (PRIME DIRECTIVE).
 * @returns A ready-to-register {@link SohlTour} instance.
 */
export function buildFrameworkDemoTour(): SohlTour {
    const config: SohlTourConfig = {
        namespace: FRAMEWORK_DEMO_TOUR.namespace,
        id: FRAMEWORK_DEMO_TOUR.id,
        title: "SOHL.Tour.Demo.title",
        description: "SOHL.Tour.Demo.description",
        display: true,
        canStart: () => Boolean(firstOwnedBeing()),
        steps: [
            {
                // Free — centered intro, advances on Next.
                id: "intro",
                title: "SOHL.Tour.Demo.intro.title",
                content: "SOHL.Tour.Demo.intro.content",
            },
            {
                // Navigation — open the Being sheet, highlight its name field.
                id: "sheet",
                title: "SOHL.Tour.Demo.sheet.title",
                content: "SOHL.Tour.Demo.sheet.content",
                selector: 'input[name="name"]',
                resolveDocument: () => firstOwnedBeing(),
            },
            {
                // Value gate — switch to Skills, wait for the (transient) search
                // field to hold text. Next stays disabled until then.
                id: "value-gate",
                title: "SOHL.Tour.Demo.valueGate.title",
                content: "SOHL.Tour.Demo.valueGate.content",
                selector: 'input[name="search-skills"]',
                resolveDocument: () => firstOwnedBeing(),
                nav: { tab: "skills", group: "primary" },
                gate: TourGate.value(gateValue.nonEmpty()),
            },
            {
                // State gate — the user must switch to the Combat tab themselves.
                // Next stays disabled until the sheet's active tab is "combat".
                id: "state-gate",
                title: "SOHL.Tour.Demo.stateGate.title",
                content: "SOHL.Tour.Demo.stateGate.content",
                selector:
                    '[data-action="tab"][data-group="primary"][data-tab="combat"]',
                resolveDocument: () => firstOwnedBeing(),
                gate: TourGate.state((ctx) => ctx.state === "combat"),
                readState: () => firstOwnedBeing()?.sheet?.tabGroups?.primary,
            },
            {
                // Free — centered wrap-up.
                id: "done",
                title: "SOHL.Tour.Demo.done.title",
                content: "SOHL.Tour.Demo.done.content",
            },
        ],
    };
    return new SohlTour(config);
}
