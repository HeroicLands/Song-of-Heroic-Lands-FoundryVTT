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

import { SohlItem } from "./SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { fvttCallHook } from "@src/core/FoundryHelpers";
import type { GearLogic } from "../logic/GearLogic";
import {
    localizeSubType,
    keyTransferredEffects,
    findSimilarItem,
    type ItemMatchKey,
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
                { id: "properties", label: "SOHL.Item.tab.properties" },
                { id: "description", label: "SOHL.Item.tab.description" },
                { id: "actions", label: "SOHL.Item.tab.actions" },
                { id: "effects", label: "SOHL.Item.tab.effects" },
            ],
        },
    };

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

    /**
     * Route a dropped item to the gear or non-gear drop handler based on
     * whether it carries the `isCarried` property.
     * @param event - The originating drop event.
     * @param droppedItem - The item that was dropped onto this sheet.
     */
    protected async _onDropItem(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        if (!this.document.isOwner) return;

        // If the item has the "isCarried" property, it is gear
        // otherwise it is not gear
        if (Object.hasOwn(droppedItem.system, "isCarried")) {
            void this._onDropGear(event, droppedItem);
        } else {
            void this._onDropNonGear(event, droppedItem);
        }
    }

    /**
     * Create one or more embedded items on the owning actor from dropped data,
     * prompting to overwrite any pre-existing similar item.
     * @param data - The dropped item data, or an array of item data.
     * @param event - The originating drop event (unused).
     * @returns The created items, or `false` if creation was not performed.
     */
    protected async _onDropItemCreate(
        data: PlainObject,
        event: DragEvent,
    ): Promise<SohlItem[] | undefined | boolean> {
        void event;
        if (!this.actor || !this.item.isOwner) return false;
        const itemList = data instanceof Array ? data : [data];
        const toCreate = [];
        for (let itemData of itemList) {
            // Determine if a similar item exists
            const similarItem = findSimilarItem(
                itemData as ItemMatchKey,
                this.actor.items as any,
            ) as SohlItem | undefined;

            if (similarItem) {
                const confirm = await Dialog.confirm({
                    title: `Confirm Overwrite: ${(similarItem.system as any).label}`,
                    content: `<p>Are You Sure?</p><p>This item will be overwritten and cannot be recovered.</p>`,
                    options: { jQuery: false },
                });
                if (confirm) {
                    delete itemData._id;
                    delete itemData.pack;
                    let result: SohlItem | undefined =
                        await similarItem.delete();
                    if (result) {
                        [result] = (await this.actor.createEmbeddedDocuments(
                            "Item",
                            [itemData],
                        )) as SohlItem[];
                    } else {
                        sohl.log.uiWarn("Overwrite failed");
                        continue;
                    }
                    toCreate.push(itemData);
                }
            } else {
                toCreate.push(itemData);
            }
        }

        const result = (await this.actor.createEmbeddedDocuments(
            "Item",
            toCreate,
        )) as SohlItem[] | undefined;
        return result || false;
    }

    /**
     * Prompt the user for how many units of a stacked item to move into a
     * destination container.
     * @param item - The stacked item being moved.
     * @param destContainer - The container the item is being moved into.
     * @returns The quantity the user chose to move (0 if cancelled or invalid).
     */
    protected async _moveQtyDialog(
        item: SohlItem,
        destContainer: SohlItem,
    ): Promise<number> {
        if (!item?.actor || !destContainer) {
            sohl.log.uiError("Invalid item or destination container");
            return 0;
        }
        // Render modal dialog
        let dlgData = {
            itemName: item.name,
            targetName: destContainer.name || item.actor.name,
            maxItems: (item.system as any).quantity,
            sourceName: "",
        };

        const compiled = Handlebars.compile(
            `<form id="items-to-move">
            <p>Moving {{itemName}} from {{sourceName}} to {{targetName}}</p>
            <div class="form-group">
                <label>How many (0-{{maxItems}})?</label>
                {{numberInput maxItems name="itemstomove" step=1 min=0 max=maxItems}}
            </div>
            </form>`,
        );
        const dlgHtml = compiled(dlgData);

        // Create the dialog window
        const result = await Dialog.prompt({
            title: "Move Items",
            content: dlgHtml,
            label: "OK",
            callback: async (element) => {
                const form = element.querySelector("form");
                if (!form) {
                    sohl.log.uiError("Form not found in dialog");
                    return 0;
                }
                const fd: FormDataExtended = new FormDataExtended(form);
                const formdata: PlainObject = foundry.utils.expandObject(
                    fd.object,
                );
                let formQtyToMove = Number.parseInt(formdata.itemstomove) || 0;

                return formQtyToMove;
            },
            options: { jQuery: false },
            rejectClose: false,
        });

        return result || 0;
    }

    /**
     * Handle dropping a gear item, either sorting it within its current
     * container or moving (and optionally splitting the stack) into a new one.
     * @param event - The originating drop event.
     * @param droppedItem - The gear item that was dropped.
     * @returns The created/moved item, `true` if merely re-sorted, or `false` on a rejected move.
     */
    protected async _onDropGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<SohlItem | boolean> {
        const target: HTMLElement | null = (
            event.target as HTMLElement
        )?.closest("[data-container-id]");
        const destContainerId = target?.dataset.containerId;

        // If no other container is specified, use this item
        let destContainer: SohlItem | null = null;
        if (destContainerId) {
            destContainer = (this.document.actor as any)?.allItems.get(
                destContainerId,
            );
        }

        if (droppedItem.id === destContainer?.id) {
            // Prohibit moving a container into itself
            sohl.log.uiWarn("Can't move a container into itself");
            return false;
        }

        if (
            !destContainer ||
            destContainer.id ===
                (droppedItem.logic as GearLogic).containedIn?.id
        ) {
            // If dropped item source and dest containers are the same,
            // then we are simply rearranging
            await this._onSortItem(event, droppedItem);
            return true;
        }

        const similarItem: SohlItem | undefined = (destContainer as any).find(
            (it: SohlItem) =>
                droppedItem.id === it.id ||
                (droppedItem.name === it.name && droppedItem.type === it.type),
        );

        if (similarItem) {
            sohl.log.uiError(`Similar item exists in ${destContainer.name}`);
            return false;
        }

        let quantity = (droppedItem.system as any).quantity;
        if (quantity > 1 && !droppedItem.parent) {
            // Ask how many to move
            quantity = await this._moveQtyDialog(droppedItem, destContainer);
        }

        const itemData = droppedItem.toObject() as any;
        delete itemData._id; // Remove ID to create a new item
        itemData.system.quantity = quantity;
        return (
            ((await SohlItem.create(itemData, {
                parent: destContainer,
            } as any)) as SohlItem) || false
        );
    }

    /**
     * Handle dropping a non-gear item, sorting it among siblings if it already
     * belongs to this document or creating it on the actor otherwise.
     * @param event - The originating drop event.
     * @param droppedItem - The non-gear item that was dropped.
     * @returns `true` if the item was sorted or created, `false` otherwise.
     */
    protected async _onDropNonGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<boolean> {
        if (droppedItem.parent?.id === this.document.id) {
            // Sort items
            const result = await this._onSortItem(event, droppedItem);
            return !!result?.length;
        } else {
            const result = await this._onDropItemCreate(droppedItem, event);
            return !!result;
        }
    }

    /**
     * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings.
     * @param event - The initiating drop event
     * @param item - The dropped Item document
     * @returns A Promise which resolves to the sorted list of sibling items, or undefined if sorting was not possible.
     */
    protected _onSortItem(
        event: DragEvent,
        item: SohlItem,
    ): Promise<SohlItem[] | undefined> {
        if (!this.actor || !this.actor.isOwner)
            return Promise.resolve(undefined);
        const items = this.actor.items;
        const sourceId = item.id;
        if (!sourceId) return Promise.resolve(undefined);
        const source = items.get(sourceId);
        if (!source) return Promise.resolve(undefined);

        // Find drop target item
        const targetElement = (event.target as HTMLElement)?.closest(
            "[data-item-id]",
        ) as HTMLElement | null;
        if (!targetElement) return Promise.resolve(undefined);

        const targetId = targetElement.dataset.itemId;
        if (!targetId || targetId === sourceId)
            return Promise.resolve(undefined);

        const target: SohlItem | undefined = items.get(targetId);
        if (!target) return Promise.resolve(undefined);

        // Build ordered list of sibling items excluding the source item
        const children: Element[] = Array.from(
            targetElement.parentElement?.children || [],
        );
        const siblings: SohlItem[] = children.reduce((acc: SohlItem[], el) => {
            const ele = el as HTMLElement;
            const itemId = ele.dataset.itemId || "";
            const item = items.get(itemId);
            if (item && item.id !== sourceId) {
                acc.push(item);
            }
            return acc;
        }, []);

        // Sort the item using Foundry's utility
        const sorted: { target: SohlItem; update: PlainObject }[] =
            foundry.utils.performIntegerSort(source, {
                target,
                siblings,
            });

        // Prepare update data
        const updateData = sorted.map(({ target, update }) => {
            return {
                _id: target.id,
                ...update,
            };
        });

        // Apply the sort updates
        return this.actor.updateEmbeddedDocuments(
            "Item",
            updateData as any,
        ) as Promise<SohlItem[] | undefined>;
    }
}
