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
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlAction } from "@src/entity/action/SohlAction";

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
        // The Members-tab controls. Each dispatches the matching intrinsic
        // action on the cohort's logic rather than writing `system.members`
        // here, so the tab and the Actions tab share one implementation
        // (issue #1151) — the seam gear's `toggleCarried` control uses.
        actions: {
            addCohortMember: CohortSheet._onAddCohortMember,
            removeCohortMember: CohortSheet._onRemoveCohortMember,
            setCohortLeader: CohortSheet._onSetCohortLeader,
        },
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
        if (partId !== "sharedgear" && partId !== "members")
            return super._preparePartContext(partId, context, options);

        // Expose this part's tab descriptor, exactly as the base dispatcher
        // does, so the section resolves its `active` state and tab group.
        (context as any).tab = (context as any).tabs?.[partId];
        if (partId === "members") {
            context = await this._prepareMembersContext(context, options);
            fvttCallHook(
                `sohl.actor.${this.document.type}.prepareMembersContext`,
                this,
                context,
            );
            return context;
        }
        context = await this._prepareSharedGearContext(context, options);
        fvttCallHook(
            `sohl.actor.${this.document.type}.prepareSharedGearContext`,
            this,
            context,
        );
        return context;
    }

    /**
     * Build the `members` part's render context: one row per `system.members`
     * entry, resolved through the cohort logic's {@link CohortLogic.memberRows}
     * seam, plus the leader's name for the section legend.
     *
     * Without this the tab had no context of its own at all, which — together
     * with a template binding fields the schema never carried — is why it
     * listed nothing (issue #1151).
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The members part context.
     */
    protected async _prepareMembersContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const logic = this.document.logic as unknown as CohortLogic;
        const members = logic.memberRows;
        return Object.assign(context, {
            members,
            leaderName: logic.leader?.name ?? "",
        });
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

    /* -------------------------------------------- */
    /*  Members tab controls (#1151)                */
    /* -------------------------------------------- */

    /**
     * Run one of the cohort's membership intrinsic actions with the given
     * scope. The control never writes `system.members` itself — the executor
     * owns the rules (what resolves, what may be added, what a removal does to
     * the leader) and the dialogs.
     *
     * @param name - The intrinsic action's shortcode.
     * @param scope - The action scope (e.g. the row's member handle).
     * @returns Resolves once the action completes.
     */
    private async _runMemberAction(
        name: string,
        scope: PlainObject = {},
    ): Promise<void> {
        const logic = this.document.logic as unknown as CohortLogic | undefined;
        const action = logic?.actions.get(name) as SohlAction | undefined;
        if (!logic || !action) return;
        await action.execute(
            new SohlActionContext({
                speaker: (this.document as any).getSpeaker(),
                type: name,
                title: (action.data as any).title,
                scope,
            }),
        );
    }

    /**
     * The member handle of the clicked control's row (`data-member-ref`).
     *
     * @param target - The clicked control, within a `data-member-ref` element.
     * @returns The member's `shortcodeOrUuid`, or `undefined`.
     */
    private static _memberRef(target: HTMLElement): string | undefined {
        return (
            target
                .closest<HTMLElement>("[data-member-ref]")
                ?.getAttribute("data-member-ref") ?? undefined
        );
    }

    /**
     * `data-action="addCohortMember"`: add a member to this cohort, via the
     * `addMember` intrinsic action — which asks for the actor's shortcode or
     * UUID and the role it takes.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked add control (unused).
     */
    protected static async _onAddCohortMember(
        this: CohortSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await this._runMemberAction("addMember");
    }

    /**
     * `data-action="removeCohortMember"`: remove the clicked row's member from
     * this cohort, via the `removeMember` intrinsic action — which confirms
     * first. The member's actor is untouched.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-member-ref` row.
     */
    protected static async _onRemoveCohortMember(
        this: CohortSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const ref = CohortSheet._memberRef(target);
        if (!ref) return;
        await this._runMemberAction("removeMember", { shortcodeOrUuid: ref });
    }

    /**
     * `data-action="setCohortLeader"`: make the clicked row's member the
     * cohort's leader — or, if that member already leads it, stand them down so
     * the cohort has none — via the `toggleLeader` intrinsic action.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked king, within a `data-member-ref` row.
     */
    protected static async _onSetCohortLeader(
        this: CohortSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const ref = CohortSheet._memberRef(target);
        if (!ref) return;
        await this._runMemberAction("toggleLeader", { shortcodeOrUuid: ref });
    }
}
