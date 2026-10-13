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

import type { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import type { SohlAction } from "@src/entity/action/SohlAction";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { fvttCallHook } from "@src/core/FoundryHelpers";

/** @internal */
export class StructureSheet extends SohlActorSheetBase {
    /** @inheritDoc */
    static override DEFAULT_OPTIONS: PlainObject = {
        id: "structure-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "actor", "structure"],
        actions: {
            addStructureOccupant: StructureSheet._onAddStructureOccupant,
            removeStructureOccupant: StructureSheet._onRemoveStructureOccupant,
        },
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    };

    static PARTS = {
        ...SohlActorSheetBase.FENCED_BANNER_PART,
        header: {
            template: "systems/sohl/templates/actor/structure/header.hbs",
        },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        facade: { template: "systems/sohl/templates/actor/parts/facade.hbs" },
        profile: {
            template: "systems/sohl/templates/actor/parts/profile.hbs",
            scrollable: [""],
        },
        occupants: {
            template: "systems/sohl/templates/actor/structure/occupants.hbs",
            scrollable: [""],
        },
        mysteries: {
            template: "systems/sohl/templates/actor/parts/mysteries.hbs",
            scrollable: [""],
        },
        gear: {
            template: "systems/sohl/templates/actor/parts/gear.hbs",
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
                    id: "profile",
                    label: "SOHL.Actor.SHEET.tab.profile.label",
                    icon: "fa-solid fa-scroll",
                },
                {
                    id: "occupants",
                    label: "SOHL.Actor.SHEET.tab.occupants.label",
                    icon: "fa-solid fa-users",
                },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                    icon: "fa-solid fa-hat-wizard",
                },
                {
                    id: "gear",
                    label: "SOHL.Actor.SHEET.tab.gear.label",
                    icon: "fa-solid fa-briefcase",
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
     * Supply derived Health and advisory capacity readouts.
     * @param options - The sheet render options.
     * @returns The shared render context.
     */
    protected override async _prepareContext(
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<any>> {
        const context = await super._prepareContext(options);
        const logic = this.document
            .logic as import("@src/document/actor/logic/StructureLogic").StructureLogic;
        return Object.assign(context, {
            isEditable: this.isEditable,
            structureOccupantCount: logic.occupantCount,
            structureOccupantsOverCapacity: logic.occupantsOverCapacity,
            structureHealth: logic.data.health,
            structuralDamage: logic.structuralDamage,
            structureCargoWeight: Math.round(logic.cargoWeight * 10) / 10,
            structureCargoOverCapacity: logic.cargoOverCapacity,
        });
    }

    /**
     * Build the `occupants` part's render context: who is aboard, each row
     * naming the actor its handle resolves to.
     *
     * @param context - The in-progress render context.
     * @param _options - Sheet render options (unused).
     * @returns The occupants part context.
     */
    protected async _prepareOccupantsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<any>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<any>> {
        const logic = this.document.logic as unknown as StructureLogic;
        return Object.assign(context, {
            occupants: logic.occupantRows,
            isEditable: this.isEditable,
        });
    }

    /** @inheritDoc */
    protected override async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<any>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<foundry.applications.api.DocumentSheetV2.RenderContext<any>> {
        if (partId !== "occupants") return super._preparePartContext(partId, context, options);

        // Expose this part's tab descriptor, exactly as the base dispatcher
        // does, so the section resolves its `active` state and tab group.
        (context as any).tab = (context as any).tabs?.[partId];
        context = await this._prepareOccupantsContext(context, options);
        fvttCallHook(`sohl.actor.${this.document.type}.prepareOccupantsContext`, this, context);
        return context;
    }

    /**
     * Run one of the structure's occupant intrinsic actions.
     *
     * @param name - The action shortcode.
     * @param scope - Scope values pre-answering the action's questions.
     */
    private async _runOccupantAction(name: string, scope: PlainObject = {}): Promise<void> {
        const logic = this.document.logic as unknown as StructureLogic | undefined;
        const action = (logic as any)?.actions.get(name) as SohlAction | undefined;
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
     * The occupant handle of the clicked control's row (`data-occupant-ref`).
     *
     * @param target - The clicked control, within a `data-occupant-ref` element.
     * @returns The occupant's handle, or `undefined`.
     */
    private static _occupantRef(target: HTMLElement): string | undefined {
        return target.closest<HTMLElement>("[data-occupant-ref]")?.dataset.occupantRef ?? undefined;
    }

    /**
     * `data-action="addStructureOccupant"`: add someone to this structure via the
     * `addOccupant` intrinsic action, which asks for the handle, role, and
     * optional title.
     *
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked control (unused).
     */
    protected static async _onAddStructureOccupant(
        this: StructureSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await this._runOccupantAction("addOccupant");
    }

    /**
     * `data-action="removeStructureOccupant"`: remove the clicked row's occupant
     * via the `removeOccupant` intrinsic action, which confirms first. The
     * occupant's actor is untouched.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, within a `data-occupant-ref` row.
     */
    protected static async _onRemoveStructureOccupant(
        this: StructureSheet,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const ref = StructureSheet._occupantRef(target);
        if (!ref) return;
        await this._runOccupantAction("removeOccupant", {
            actorCodeOrUuid: ref,
        });
    }
}
