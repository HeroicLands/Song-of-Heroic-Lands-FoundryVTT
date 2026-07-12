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
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { applySearchFilter } from "@src/document/actor/logic/display-filter";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { fvttCallHook, dialog } from "@src/core/FoundryHelpers";
import { ITEM_KIND, GearKinds } from "@src/utils/constants";
import { toHTMLString } from "@src/utils/helpers";

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
     * Handle an Item dropped onto the actor sheet. The base mixin's `_onDrop`
     * resolves the drag payload and routes `Item` documents here (the mixin's
     * own `_onDropItem` is a no-op; the item sheet overrides it for container
     * drops, and the actor sheet overrides it here).
     *
     * Semantics by source:
     * - **Compendium / world** item → created as an embedded **clone** (all kinds).
     * - **Another actor** → **moved** here (created, then removed from the
     *   source). Non-gear moves the instance; physical **gear** moves with
     *   quantity — a "How Many?" prompt for stacks > 1, skipped for a single item
     *   or a shift-drag (which moves the whole stack). Moving needs source
     *   ownership.
     * - **Already on this actor** → ignored (no self-duplicate).
     *
     * Corpus is a singleton, so a second corpus drop is refused (the hard
     * data-layer guard is #338).
     *
     * @param event - The originating drop event (its `shiftKey` selects move-all).
     * @param droppedItem - The resolved dropped item.
     */
    protected async _onDropItem(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        const actor = this.document;
        if (!actor.isOwner || !droppedItem) return;

        const sourceActor = droppedItem.actor;

        // Already embedded on this actor: don't duplicate it onto itself.
        if (sourceActor?.id === actor.id) return;

        // Corpus singleton: refuse a second one.
        if (
            droppedItem.type === ITEM_KIND.CORPUS &&
            (actor.itemTypes[ITEM_KIND.CORPUS]?.length ?? 0) > 0
        ) {
            (globalThis as any).ui?.notifications?.warn(
                "This being already has a corpus; delete the current one first.",
            );
            return;
        }

        // Source discriminates the semantics: an item embedded on another actor
        // is **moved** (created here, removed there); a compendium/world item is
        // **cloned**. Moving requires owning the source (to delete/decrement it).
        const isMove = !!sourceActor;
        if (isMove && !droppedItem.isOwner) {
            (globalThis as any).ui?.notifications?.warn(
                "You don't own the source item, so it can't be moved.",
            );
            return;
        }

        const data = droppedItem.toObject();
        delete (data as any)._id;

        if (isMove && GearKinds.includes(droppedItem.type as any)) {
            // Physical gear between actors: move with quantity. The "How Many?"
            // dialog fires only when there's more than one and the drag is not
            // shift-held; shift-drag (or a single item) moves the whole stack.
            const qty = Math.max(1, (droppedItem.system as any).quantity ?? 1);
            let moveQty = qty;
            if (qty > 1 && !event.shiftKey) {
                const chosen = await this._promptMoveQuantity(
                    droppedItem.name,
                    qty,
                );
                if (chosen === undefined) return; // cancelled
                moveQty = chosen;
            }
            (data.system as any).quantity = moveQty;
            await actor.createEmbeddedDocuments("Item", [data]);
            if (moveQty >= qty) await droppedItem.delete();
            else
                await droppedItem.update({
                    "system.quantity": qty - moveQty,
                } as any);
            return;
        }

        // Non-gear move between actors: recreate here, remove from the source.
        // Compendium/world (no source actor): plain clone.
        await actor.createEmbeddedDocuments("Item", [data]);
        if (isMove) await droppedItem.delete();
    }

    /**
     * Prompt for how many of a stacked gear item to move (1..max). Yields the
     * chosen count, or `undefined` if the dialog was cancelled or dismissed.
     *
     * @param name - The item's name, shown in the dialog title.
     * @param max - The source stack size (the upper bound and default).
     * @returns The chosen quantity, or `undefined` when cancelled.
     */
    private async _promptMoveQuantity(
        name: string,
        max: number,
    ): Promise<number | undefined> {
        const result = await dialog({
            title: `Move ${name}`,
            content: toHTMLString(
                `<div class="form-group">
                <label>How many to move? (1–${max})</label>
                <input type="number" name="qty" value="${max}" min="1" max="${max}" step="1" autofocus />
            </div>`,
            ),
            buttons: [
                { action: "move", label: "Move", default: true },
                { action: "cancel", label: "Cancel" },
            ],
            callback: (formData: any, action: string) => {
                if (action !== "move") return undefined;
                const n = Math.trunc(Number(formData?.qty));
                return Number.isFinite(n) ?
                        Math.min(max, Math.max(1, n))
                    :   undefined;
            },
        });
        return typeof result === "number" ? result : undefined;
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
