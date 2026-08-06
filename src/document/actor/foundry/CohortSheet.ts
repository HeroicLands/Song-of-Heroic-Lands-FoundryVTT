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

import { SohlActorSheetBase } from "@src/document/actor/foundry/SohlActorSheetBase";
import type { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { fvttCallHook } from "@src/core/FoundryHelpers";

type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<any>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

/** @internal */
export class CohortSheet extends SohlActorSheetBase {
    /** @inheritDoc */
    static override DEFAULT_OPTIONS: PlainObject = {
        id: "cohort-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "actor", "cohort"],
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    };

    static PARTS = {
        ...SohlActorSheetBase.FENCED_BANNER_PART,
        header: { template: "systems/sohl/templates/actor/cohort/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        facade: { template: "systems/sohl/templates/actor/parts/facade.hbs" },
        members: {
            template: "systems/sohl/templates/actor/cohort/members.hbs",
            scrollable: [""],
        },
        sharedgear: {
            template: "systems/sohl/templates/actor/cohort/shared-gear.hbs",
            scrollable: [""],
        },
        actions: {
            template: "systems/sohl/templates/actor/parts/actions.hbs",
            scrollable: [""],
        },
        effects: {
            template: "systems/sohl/templates/actor/parts/effects.hbs",
            scrollable: [""],
        },
    } as const;

    /** @inheritDoc */
    static override TABS = {
        primary: {
            initial: "facade",
            tabs: [
                {
                    id: "facade",
                    label: "SOHL.Actor.SHEET.tab.facade.label",
                    icon: "fa-solid fa-masks-theater",
                },
                {
                    id: "members",
                    label: "SOHL.Actor.SHEET.tab.members.label",
                    icon: "fa-solid fa-users",
                },
                {
                    id: "sharedgear",
                    label: "SOHL.Actor.SHEET.tab.sharedgear.label",
                    icon: "ginf-knapsack",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    icon: "fa-solid fa-gears",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    icon: "fa-solid fa-plus-minus",
                },
            ],
        },
    };

    /**
     * Route the Cohort-only `sharedgear` part to its context builder; everything
     * else falls through to the shared dispatcher.
     *
     * @param partId - The render part being prepared.
     * @param context - The in-progress render context.
     * @param options - Foundry render options.
     * @returns The render context for the given part.
     */
    protected override async _preparePartContext(
        partId: string,
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        if (partId !== "sharedgear")
            return super._preparePartContext(partId, context, options);

        // Expose this part's tab descriptor, exactly as the base dispatcher
        // does, so the section resolves its `active` state and tab group.
        (context as any).tab = (context as any).tabs?.[partId];
        context = await this._prepareSharedGearContext(context, options);
        fvttCallHook(
            `sohl.actor.${this.document.type}.prepareSharedGearContext`,
            this,
            context,
        );
        return context;
    }

    /**
     * Build the `sharedgear` part's render context: the gear this cohort's
     * members have marked as shared with it, each row naming the member that
     * carries it (issue #76).
     *
     * The view is **read-only**. Gear stays on its custodian and is edited
     * there, so the ledger carries no create/delete controls, no carried or worn
     * toggles, and no drop target. It reports no combined weight either — a sum
     * across separate carriers is nobody's load.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The shared-gear part context.
     */
    protected async _prepareSharedGearContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const logic = this.document.logic as unknown as CohortLogic;
        const sharedGear = logic.sharedGear.map((entry) =>
            Object.assign(CohortSheet._gearRow(entry.gear.item), {
                carrierName: entry.carrierName,
                carrierUuid: entry.carrierUuid,
            }),
        );
        return Object.assign(context, { sharedGear });
    }
}
