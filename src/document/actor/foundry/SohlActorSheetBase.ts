/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActor } from "./SohlActor";
import { applySearchFilter } from "@src/document/actor/logic/display-filter";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { fvttCallHook } from "@src/core/FoundryHelpers";

// Define the base type for the sheet
const SohlActorSheetBase_Base = SohlDataModel.SheetMixin<
    SohlActor,
    typeof foundry.applications.api.DocumentSheetV2<SohlActor>
>(foundry.applications.api.DocumentSheetV2<SohlActor>);

/**
 * Base application sheet for all actor types. Provides the shared render parts
 * (header, tabs, facade), the per-part context hooks, and list filtering.
 * Concrete actor sheets extend this and override the `_prepare*Context` hooks.
 * @internal
 */
export abstract class SohlActorSheetBase extends SohlActorSheetBase_Base {
    /** The {@link SohlActor} this sheet renders (narrowed from the base type). */
    override get document(): SohlActor {
        return super.document as SohlActor;
    }

    /** The {@link SohlActor} this sheet renders, or `null`. */
    get actor(): SohlActor | null {
        return (this.document as any).actor;
    }

    /**
     * Register the actor sheet's render parts: `header`, `tabs`, and `facade`.
     *
     * @param options - The render options to populate with the sheet parts.
     * @param options.parts - Populated in place with the registered part ids.
     */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        // All actor sheets have these parts
        options.parts = ["header", "tabs", "facade"];
    }

    /**
     * Build the render context shared across all sheet parts.
     * @param options - Sheet render options.
     * @returns The shared render context.
     */
    protected override async _prepareContext(
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const context = await super._prepareContext(options);

        // Add any shared data needed across all parts here
        // options.parts contains array of partIds being rendered
        // e.g., ["header", "tabs", "facade"]

        return context;
    }

    /**
     * Dispatch to the per-part context builder (`header` / `tabs` / `facade`)
     * and fire the matching `sohl.actor.<type>.prepare*Context` hooks.
     *
     * @param partId - The render part being prepared.
     * @param context - The in-progress render context.
     * @param options - Foundry render options.
     * @returns The render context for the given part.
     */
    protected async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const type = this.document.type;
        // Expose the prepared tab descriptor for this part so content
        // sections can resolve their `active` state and tab group. The
        // navigation part itself iterates the full `tabs` record instead.
        (context as any).tab = (context as any).tabs?.[partId];
        switch (partId) {
            case "header":
                context = await this._prepareHeaderContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareHeaderContext`,
                    this,
                    context,
                );
                return context;
            case "tabs":
                context = await this._prepareTabsContext(context, options);
                return context;
            case "facade":
                context = await this._prepareFacadeContext(context, options);
                fvttCallHook(
                    `sohl.actor.${type}.prepareFacadeContext`,
                    this,
                    context,
                );
                return context;
            default:
                return context;
        }
    }

    /**
     * Build the `header` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The header part context.
     */
    protected async _prepareHeaderContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Build the `tabs` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The tabs part context.
     */
    protected async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Build the `facade` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The facade part context.
     */
    protected async _prepareFacadeContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Show or hide item rows in the sheet content based on a search query,
     * matching each row's normalized item name against the query or regex.
     * @param _event - The triggering keyboard event, if any.
     * @param query - The raw search query text.
     * @param rgx - The regular expression to match item names against.
     * @param content - The container element holding the item rows.
     */
    protected _displayFilteredResults(
        _event: KeyboardEvent | null,
        query: string,
        rgx: RegExp,
        content: HTMLElement | null,
    ): void {
        applySearchFilter(query, rgx, content);
    }
}
