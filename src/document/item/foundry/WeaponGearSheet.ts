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

import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlItemSheetBase } from "@src/document/item/foundry/SohlItemSheetBase";
import {
    addStrikeMode,
    bindStrikeModeContextMenu,
    prepareStrikeModesContext,
    withStrikeModesTab,
} from "@src/document/item/foundry/strike-mode-sheet";

/** @internal */
export class WeaponGearSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/weapongear-properties.hbs",
            scrollable: [""],
        },
        strikemodes: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/strikemodes.hbs",
            scrollable: [""],
        },
    };

    /**
     * A weapon carries many strike modes, so it gets the Strike Modes tab
     * (inserted after Properties) and an `addStrikeMode` action for the tab's
     * "Add" control.
     */
    static override TABS = withStrikeModesTab(SohlItemSheetBase.TABS);

    /** @inheritDoc */
    static override DEFAULT_OPTIONS: PlainObject = {
        actions: {
            addStrikeMode: WeaponGearSheet._onAddStrikeMode,
        },
    };

    /**
     * `data-action="addStrikeMode"`: append a blank strike mode to this weapon
     * and open the editor on it.
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked add control (unused).
     */
    protected static async _onAddStrikeMode(
        this: WeaponGearSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await addStrikeMode(this.document);
    }

    /**
     * Render the strike-modes tab and add its `⋮`-row context menus after the
     * base render (which wires the item/effect menus).
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
        context: PlainObject,
        options: PlainObject,
    ): Promise<void> {
        await super._onRender(context, options);
        const el = (this as any).element as HTMLElement | undefined;
        if (el && this.isEditable) {
            bindStrikeModeContextMenu(this.document, el);
        }
    }

    /** @inheritDoc */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);
        if (!(this.document as any).limited) options.parts?.push("strikemodes");
    }

    /**
     * Populates the properties tab context with weapon gear data.
     *
     * @param context - The sheet render context to augment.
     * @param options - The sheet render options.
     * @returns The augmented render context.
     */
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            quantity: system.quantity,
            weightBase: system.weightBase,
            valueBase: system.valueBase,
            isCarried: system.isCarried,
            qualityBase: system.qualityBase,
            durabilityBase: system.durabilityBase,
            sharedWithCohortIds: system.sharedWithCohortIds,
            lengthBase: system.lengthBase,
        });
    }

    /** @inheritDoc */
    protected override async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        context = await super._preparePartContext(partId, context, options);
        if (partId === "strikemodes") {
            Object.assign(context, prepareStrikeModesContext(this.document));
        }
        return context;
    }
}
