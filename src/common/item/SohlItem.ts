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

import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlActionContext } from "@common/SohlActionContext";
import { HTMLString } from "@utils/helpers";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlLogic } from "@common/SohlLogic";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
const { HTMLField, DocumentIdField, StringField } = foundry.data.fields;

export class SohlItem extends Item {
    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlItemLogic<any> {
        return (this.system as any).logic as SohlItemLogic<any>;
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    static _getContextOptions(doc: SohlItem): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    /**
     * Get the context menu options for this item.
     * @returns The context menu options for this item.
     */
    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic._getContextOptions();
    }

    /**
     * Helper method to handle chat card button clicks.
     * @param btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card button clicks here
        console.log("Button clicked:", btn);
    }

    /**
     * Helper method to handle chat card edit actions.
     * @param btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card edit actions here
        console.log("Edit action clicked:", btn);
    }

    /**
     * The SohlActor that owns this item, or null if it is unowned.
     */
    get actor(): SohlActor | null {
        return this.parent;
    }

    /**
     * The SohlItem that this item is nested within, or null if it is not nested.
     */
    get nestedIn(): SohlItem | null {
        const item: SohlItem | undefined = this.actor?.allItems.get(
            (this.system as any).nestedIn,
        );
        return item ?? null;
    }

    /**
     * Whether this item is nested within another item.
     */
    get isNested(): boolean {
        return !!this.nestedIn;
    }

    /**
     * Get all nested items of this item.
     * @param types An optional array of item types to filter by.
     * @returns An array of nested SohlItem documents.
     */
    nestedItems(types: string[] = []): SohlItem[] {
        return (
            this.actor?.allItems.filter(
                (i: SohlItem) =>
                    i.nestedIn === this.id &&
                    (!types?.length || types.includes(i.type)),
            ) || []
        );
    }

    /**
     * Helper method to create a new item nested within this item.
     * @param data  The data for the new item to create.
     * @returns The created nested item or null if creation failed.
     */
    async createNestedItem(
        data: foundry.abstract.Document.CreateDataForName<"Item">,
    ): Promise<SohlItem | null> {
        if (!this.actor) return null;
        foundry.utils.setProperty(data, "system.nestedIn", this.id);
        return await this.actor.createItem(data);
    }

    /**
     * Helper method to create a new Active Effect for this item.
     * @param data The data for the new Active Effect to create.
     * @returns The created Active Effect or null if creation failed.
     */
    async createActiveEffect(
        data: foundry.abstract.Document.CreateDataForName<"ActiveEffect">,
    ): Promise<SohlActiveEffect> {
        const [created] = (await this.createEmbeddedDocuments("ActiveEffect", [
            data,
        ])) as SohlActiveEffect[];
        return created;
    }
}

export interface SohlItemLogic<TData extends SohlDataModel.Data<SohlItem>>
    extends SohlLogic<TData> {}

export interface SohlItemData<TLogic extends SohlLogic<any> = SohlLogic<any>>
    extends SohlDataModel.Data<SohlItem, TLogic> {
    get item(): SohlItem;
    label(options?: { withName: boolean; withSubType: boolean }): string;
    notes: HTMLString;
    description: HTMLString;
    textReference: HTMLString;
    shortcode: string;
    nestedIn: string | null;
}

export class SohlItemBaseLogic<
    TData extends SohlItemData = SohlItemData,
> extends SohlLogic<TData> {
    override initialize(context?: SohlActionContext): void {}
    override evaluate(context?: SohlActionContext): void {}
    override finalize(context?: SohlActionContext): void {}
}

const SHORTCODE_RE = /^[A-Za-z0-9]{1,12}$/;

function defineSohlItemDataSchema(): foundry.data.fields.DataSchema {
    return {
        notes: new HTMLField(),
        description: new HTMLField(),
        textReference: new HTMLField(),
        shortcode: new StringField({
            required: true,
            blank: false,
            validate: (value: string) => {
                return (
                    SHORTCODE_RE.test(value) ||
                    `shortcode must be 1-12 alphanumeric characters`
                );
            },
            hint: "a short, stable, human-typeable symbolic identifier, unique within an Item type; used for programmatic reference and occasionally displayed to users",
        }),
        nestedIn: new DocumentIdField({
            nullable: true,
            initial: null,
            hint: "The item on the actor that this item is nested within, if any.",
        }),
    };
}

type SohlItemDataSchema = ReturnType<typeof defineSohlItemDataSchema>;

/**
 * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" system. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 */
export abstract class SohlItemDataModel<
        TSchema extends foundry.data.fields.DataSchema = SohlItemDataSchema,
        TLogic extends
            SohlItemLogic<SohlItemData> = SohlItemLogic<SohlItemData>,
    >
    extends SohlDataModel<TSchema, SohlItem, TLogic>
    implements SohlItemData<TLogic>
{
    notes!: HTMLString;
    description!: HTMLString;
    textReference!: HTMLString;
    shortcode!: string;
    transfer!: boolean;
    nestedIn!: string | null;

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent instanceof SohlItem)) {
            throw new Error("Parent must be of type SohlItem");
        }
        super(data, options);
    }

    get item(): SohlItem {
        return this.parent;
    }

    get i18nPrefix(): string {
        return `SOHL.Item.${this.kind}`;
    }

    /**
     * @description Get the full label for this item, optionally including name and subtype.
     * @remarks
     * The item name and item subtype are both optional, although shown by default.
     * In English, the format will be:
     *    `[<item name>] [<item subtype>] <item type>`
     *
     * @example
     * EN: `Melee Combat Skill`
     * ES: `Habilidad de Combate Cuerpo a Cuerpo`
     * RU: `Навык боя Ближний бой`
     * DE: `Nahkampf Kampffertigkeit`
     *
     * @param options
     * @returns The fully localized string in the appropriate language based on the
     * user's settings.
     */
    label(
        options: { withName: boolean; withSubType: boolean } = {
            withName: true,
            withSubType: true,
        },
    ): string {
        let typeText: string;
        if (options.withSubType && (this as any).subType) {
            typeText = `SOHL.${this.kind}.typelabel.${(this as any).subType}`;
        } else {
            typeText = `SOHL.${this.kind}.typelabel`;
        }

        let result = sohl.i18n.localize(typeText);
        if (options.withName) {
            result = sohl.i18n.localize("SOHL.SohlItem.labelWithName", {
                name: this.parent.name,
                type: result,
            });
        }
        return result;
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlItemDataSchema();
    }
}

// Define the base type for the sheet
const SohlItemSheetBase_Base = SohlDataModel.SheetMixin<
    SohlItem,
    typeof foundry.applications.api.DocumentSheetV2<SohlItem>
>(foundry.applications.api.DocumentSheetV2<SohlItem>);

export abstract class SohlItemSheetBase extends SohlItemSheetBase_Base {
    static PARTS = {
        header: {
            template: "systems/sohl/templates/item/parts/header.hbs",
            id: "header",
        },
        tabs: {
            id: "tabs",
            classes: ["tabs"],
            template: "systems/sohl/templates/item/parts/tabs.hbs",
        },
        description: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/description.hbs",
            scrollable: [""],
        },
        nestedItems: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/parts/nested-items.hbs",
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

    static TABS = {
        sheet: {
            navSelector: ".tabs[data-group='sheet']",
            contentSelector: ".content[data-group='sheet']",
            initial: "properties",
            tabs: [
                {
                    id: "properties",
                    // icon: "fas fa-user",
                    label: "SOHL.Item.tab.properties",
                },
                { id: "description", label: "SOHL.Item.tab.description" },
                { id: "nestedItems", label: "SOHL.Item.tab.nestedItems" },
                { id: "actions", label: "SOHL.Item.tab.actions" },
                { id: "effectsTab", label: "SOHL.Item.tab.effects" },
            ],
        },
    };

    get document(): SohlItem {
        return super.document as SohlItem;
    }

    get item(): SohlItem {
        return this.document;
    }

    get actor(): SohlActor | null {
        return this.item.actor;
    }

    _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);
        // By default, we only show the header and tabs
        // This is the default behavior for all data model sheets
        options.parts = ["header", "tabs"];
        // Don't show the other tabs if only limited view
        if ((this.document as any).limited) return;
        // If the document is not limited, we show all parts
        options.parts.push(
            "properties",
            "description",
            "actions",
            "nestedItems",
            "effectsTab",
        );
    }

    async _prepareContext(
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        const context = await super._prepareContext(options);

        // Add any shared data needed across all parts here
        // options.parts contains array of partIds being rendered
        // e.g., ["header", "tabs", "properties", "description", ...]

        return context;
    }

    async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        // _preparePartContext is called for each part with the specific partId
        // This is where you prepare part-specific data
        switch (partId) {
            case "properties":
                return this._preparePropertiesContext(context, options);
            case "description":
                return await this._prepareDescriptionContext(context, options);
            case "nestedItems":
                return await this._prepareNestedItemsContext(context, options);
            case "actions":
                return await this._prepareActionsContext(context, options);
            case "effectsTab":
                return await this._prepareEffectsTabContext(context, options);
            case "header":
                return await this._prepareHeaderContext(context, options);
            case "tabs":
                return await this._prepareTabsContext(context, options);
            default:
                return context;
        }
    }

    protected async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareHeaderContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareDescriptionContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareNestedItemsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareActionsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareEventsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _prepareEffectsTabContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }

    protected async _onDropItem(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<void> {
        if (!this.document.isOwner) return;

        // If the item has the "isCarried" property, it is gear
        // otherwise it is not gear
        if (Object.hasOwn(droppedItem.system, "isCarried")) {
            this._onDropGear(event, droppedItem);
        } else {
            this._onDropNonGear(event, droppedItem);
        }
    }

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
            let similarItem = this.actor.allItems.find(
                (it: SohlItem) =>
                    it.name === itemData.name &&
                    it.type === itemData.type &&
                    (it.system as any).subType === itemData.system.subType,
            );

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

        if (item.nestedIn) {
            dlgData.sourceName = `${(item.nestedIn.system as any).label}`;
        } else {
            dlgData.sourceName = item.actor.name || "Unknown";
        }

        const compiled = Handlebars.compile(`<form id="items-to-move">
            <p>Moving ${dlgData.itemName} from ${dlgData.sourceName} to ${dlgData.targetName}</p>
            <div class="form-group">
                <label>How many (0-${dlgData.maxItems})?</label>
                {{numberInput ${dlgData.maxItems} name="itemstomove" step=1 min=0 max=${dlgData.maxItems}}}
            </div>
            </form>`);
        const dlgHtml = compiled(dlgData, {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true,
        });

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

    protected async _onDropGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<SohlItem | boolean> {
        const target: HTMLElement | null = (
            event.target as HTMLElement
        )?.closest("[data-container-id]");
        const destContainerId = target?.dataset.containerId;

        // If no other container is specified, use this item
        let destContainer: SohlDocument | null = null;
        if (destContainerId) {
            destContainer = (this.document.actor as any)?.allItems.get(
                destContainerId,
            );
        }
        destContainer ||= this.document.nestedIn;

        if (droppedItem.id === destContainer?.id) {
            // Prohibit moving a container into itself
            sohl.log.uiWarn("Can't move a container into itself");
            return false;
        }

        if (!destContainer || destContainer.id === droppedItem.nestedIn?.id) {
            // If dropped item source and dest containers are the same,
            // then we are simply rearranging
            await this._onSortItem(event, droppedItem);
            return true;
        }

        const similarItem: SohlItem | undefined = destContainer
            .nestedItems()
            .find(
                (it: SohlItem) =>
                    droppedItem.id === it.id ||
                    (droppedItem.name === it.name &&
                        droppedItem.type === it.type),
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

        const itemData = droppedItem.toObject();
        delete (itemData as any)._id; // Remove ID to create a new item
        (itemData.system as any).quantity = quantity;
        return (
            ((await SohlItem.create(itemData, {
                parent: destContainer,
            } as any)) as SohlItem) || false
        );
    }

    protected async _onDropNonGear(
        event: DragEvent,
        droppedItem: SohlItem,
    ): Promise<boolean> {
        if (
            droppedItem.nestedIn?.id === this.document.id ||
            droppedItem.parent?.id === this.document.id
        ) {
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
     * @return A Promise which resolves to the sorted list of sibling items, or undefined if sorting was not possible.
     */
    protected _onSortItem(
        event: DragEvent,
        item: SohlItem,
    ): Promise<SohlItem[] | undefined> {
        if (!this.actor || !this.actor.isOwner)
            return Promise.resolve(undefined);
        const items = this.actor.allItems;
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
