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

import { SohlItem } from "./SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { fvttCallHook } from "@src/core/FoundryHelpers";
import {
    localizeSubType,
    keyTransferredEffects,
} from "@src/document/item/logic/item-sheet-view";
const TextEditor = foundry.applications.ux.TextEditor.implementation;
type RenderContext =
    foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

// Define the base type for the sheet
const SohlItemSheetBase_Base = SohlDataModel.SheetMixin<
    SohlItem,
    typeof foundry.applications.api.DocumentSheetV2<SohlItem>
>(foundry.applications.api.DocumentSheetV2<SohlItem>);

/** @internal */
export abstract class SohlItemSheetBase extends SohlItemSheetBase_Base {
    static PARTS = {
        header: {
            template: "systems/sohl/templates/item/parts/header.hbs",
            id: "header",
        },
        tabs: {
            id: "tabs",
            classes: ["tabs"],
            // Core template renders the <nav> from `context.tabs` (see BeingSheet).
            template: "templates/generic/tab-navigation.hbs",
        },
        description: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/description.hbs",
            scrollable: [""],
        },
        actions: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/actions.hbs",
            scrollable: [""],
        },
        effects: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/effects.hbs",
            scrollable: [""],
        },
    };

    // v13 ApplicationTabsConfiguration (mirrors BeingSheet). The v1-style
    // `navSelector`/`contentSelector` keys are not read by ApplicationV2 and left
    // `context.tabs` unpopulated, so the `tabs` part rendered nothing.
    /** @inheritDoc */
    static override TABS = {
        sheet: {
            initial: "properties",
            tabs: [
                {
                    id: "properties",
                    label: "SOHL.Item.tab.properties",
                    icon: "fa-solid fa-sliders",
                },
                {
                    id: "description",
                    label: "SOHL.Item.tab.description",
                    icon: "fa-solid fa-scroll",
                },
                {
                    id: "actions",
                    label: "SOHL.Item.tab.actions",
                    icon: "fa-solid fa-cogs",
                },
                {
                    id: "effects",
                    label: "SOHL.Item.tab.effects",
                    icon: "fa-solid fa-plus-minus",
                },
            ],
        },
    };

    /**
     * ApplicationV2 auto-merges `DEFAULT_OPTIONS` up the prototype chain, so this
     * level only contributes what it adds (no `...super` spread). Registers the
     * general `clearField` action used by the `clearableNumberInput` helper.
     */
    static override DEFAULT_OPTIONS: PlainObject = {
        // Give item sheets a fixed initial size. Without it the sheet has no
        // definite height, so ApplicationV2 re-fits it to each tab's content and
        // the window jumps size when switching tabs (and grows very wide).
        position: { width: 600, height: 500 },
        actions: {
            clearField: SohlItemSheetBase._onClearField,
        },
    };

    /**
     * `data-action="clearField"`: reset a nullable field to `null`. Reads the
     * update path from the control's `data-field-path` and writes `null`
     * explicitly via `document.update`, sidestepping the unreliable
     * empty-number-input serialization. Paired with the `clearableNumberInput`
     * Handlebars helper.
     *
     * @param _event - The triggering pointer event (unused).
     * @param target - The clicked control, carrying `data-field-path`.
     */
    protected static async _onClearField(
        this: SohlItemSheetBase,
        _event: PointerEvent,
        target: HTMLElement,
    ): Promise<void> {
        const path = target.dataset.fieldPath;
        if (!path) return;
        await this.document.update({ [path]: null });
    }

    /** The {@link SohlItem} document this sheet edits. */
    override get document(): SohlItem {
        return super.document as SohlItem;
    }

    /** The {@link SohlItem} document this sheet edits. */
    get item(): SohlItem {
        return this.document;
    }

    /** The actor owning this item, or null if the item is unowned. */
    get actor(): SohlActor | null {
        return this.item.actor;
    }

    /**
     * After each render, wire the array-field editor controls that some
     * properties templates render (e.g. armor coverage locations). Add/remove
     * of array values is not a form field, so it is driven by these controls
     * rather than `submitOnChange`. Each render replaces the DOM, so binding the
     * freshly-queried controls does not accumulate listeners.
     *
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
        context: PlainObject,
        options: PlainObject,
    ): Promise<void> {
        await super._onRender(context, options);
        if (!this.isEditable) return;

        const el = (this as any).element as HTMLElement | undefined;
        el?.querySelectorAll<HTMLElement>(".add-array-item").forEach(
            (control) =>
                control.addEventListener("click", (event) =>
                    (this as any)._addArrayItem(event as PointerEvent),
                ),
        );
        el?.querySelectorAll<HTMLElement>(".delete-array-item").forEach(
            (control) =>
                control.addEventListener("click", (event) =>
                    (this as any)._deleteArrayItem(event as PointerEvent),
                ),
        );
    }

    /**
     * Selects which sheet parts to render: always the header and tabs, plus
     * the remaining tabs unless the document is in limited-view mode.
     *
     * @param options - Render options whose `parts` array is populated in place.
     * @param options.parts - Populated with the list of sheet part ids to render.
     */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);
        // By default, we only show the header and tabs
        // This is the default behavior for all data model sheets
        options.parts = ["header", "tabs"];
        // Don't show the other tabs if only limited view
        if ((this.document as any).limited) return;
        // If the document is not limited, we show all parts
        options.parts.push("properties", "description", "actions", "effects");
    }

    /**
     * Builds the shared render context delegated to all sheet parts.
     * @param options - Sheet render options.
     * @returns The base render context shared across parts.
     */
    protected override async _prepareContext(
        options: RenderOptions,
    ): Promise<RenderContext> {
        const context = await super._prepareContext(options);

        // Add any shared data needed across all parts here
        // options.parts contains array of partIds being rendered
        // e.g., ["header", "tabs", "properties", "description", ...]

        return context;
    }

    /**
     * Augments the render context for a specific part and fires the matching
     * `sohl.<type>.prepare*Context` hook so subscribers can extend it.
     * @param partId - The identifier of the part being rendered.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context extended with part-specific data.
     */
    protected async _preparePartContext(
        partId: string,
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        // _preparePartContext is called for each part with the specific partId
        // This is where you prepare part-specific data
        const type = this.document.type;
        // Expose the prepared tab descriptor for this part so content sections
        // can resolve their `active` state and tab group (see BeingSheet).
        (context as any).tab = (context as any).tabs?.[partId];
        switch (partId) {
            case "properties":
                context = await this._preparePropertiesContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.preparePropertiesContext`,
                    this,
                    context,
                );
                return context;
            case "description":
                context = await this._prepareDescriptionContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.prepareDescriptionContext`,
                    this,
                    context,
                );
                return context;
            case "actions":
                context = await this._prepareActionsContext(context, options);
                fvttCallHook(
                    `sohl.${type}.prepareActionsContext`,
                    this,
                    context,
                );
                return context;
            case "effects":
                context = await this._prepareEffectsTabContext(
                    context,
                    options,
                );
                fvttCallHook(
                    `sohl.${type}.prepareEffectsContext`,
                    this,
                    context,
                );
                return context;
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(
                    `sohl.${type}.prepareHeaderContext`,
                    this,
                    context,
                );
                return context;
            case "tabs":
                context = await this._prepareTabsContext(context, options);
                return context;
            default:
                return context;
        }
    }

    /**
     * Prepare context for the tabs navigation part.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context, unchanged by the base implementation.
     */
    protected async _prepareTabsContext(
        context: RenderContext,
        options: RenderOptions,
    ): Promise<RenderContext> {
        return context;
    }

    /**
     * Prepare context for the sheet header.
     * Provides the item name, image, and type label.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with header fields.
     */
    protected async _prepareHeaderContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        const subType = system.subType ?? "";
        const kind = system.constructor?.kind ?? this.document.type;
        const subTypeLabel = localizeSubType(subType, kind);
        return Object.assign(context, {
            itemName: this.document.name,
            itemImg: this.document.img,
            typeLabel: this.document.logic?.typeLabel ?? this.document.type,
            subTypeLabel,
        });
    }

    /**
     * Prepare context for the Properties tab.
     *
     * The base implementation provides the common item properties
     * (notes, textReference). Subclasses override
     * this to add type-specific properties.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with common item properties.
     */
    protected async _preparePropertiesContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            notes: system.notes ?? "",
            textReference: system.textReference ?? "",
        });
    }

    /**
     * Prepare context for the Description tab.
     * Provides enriched HTML for the full-page ProseMirror description editor.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the enriched description HTML.
     */
    protected async _prepareDescriptionContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const system = this.document.system as any;
        return Object.assign(context, {
            descriptionHTML: await TextEditor.enrichHTML(
                system.description ?? "",
            ),
        });
    }

    /**
     * Prepare context for the Actions tab.
     * Provides the list of action items associated with this item.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with the item's actions.
     */
    protected async _prepareActionsContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const actions = this.document.logic?.actions ?? [];
        return Object.assign(context, { actions });
    }

    /**
     * Prepare context for the Effects tab.
     * Provides the item's own effects and any transferred effects.
     * @param context - The render context to augment.
     * @param _options - Sheet render options (unused).
     * @returns The context extended with own and transferred effects.
     */
    protected async _prepareEffectsTabContext(
        context: RenderContext,
        _options: RenderOptions,
    ): Promise<RenderContext> {
        const effects = (this.document as any).effects?.contents ?? [];
        const trxEffects = keyTransferredEffects(
            (this.document as any).transferredEffects,
        );
        return Object.assign(context, { effects, trxEffects });
    }
}
