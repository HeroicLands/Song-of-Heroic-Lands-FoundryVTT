/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { HTMLString } from "@utils/helpers";
import { SohlDataModel } from "@common/SohlDataModel";
import { GearMixin } from "@common/item/GearMixin";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import { SohlLogic } from "@common/SohlLogic";
import type { SohlEventContext } from "@common/event/SohlEventContext";
const { StringField } = foundry.data.fields;

const kSohlItem = Symbol("SohlItem");
const kData = Symbol("SohlItem.Data");

export class SohlItem<
    TLogic extends SohlItem.Logic = SohlItem.Logic,
    TDataModel extends SohlItem.DataModel = any,
    SubType extends Item.SubType = Item.SubType,
> extends Item<SubType> {
    readonly [kSohlItem] = true;

    static isA(obj: unknown): obj is SohlItem {
        return typeof obj === "object" && obj !== null && kSohlItem in obj;
    }

    get logic(): TLogic {
        return (this.system as any).logic as TLogic;
    }

    static _getContextOptions(doc: SohlItem): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic._getContextOptions();
    }

    /**
     * @param {HTMLElement} btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card button clicks here
        console.log("Button clicked:", btn);
    }

    /**
     * @param {HTMLElement} btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card edit actions here
        console.log("Edit action clicked:", btn);
    }

    get actor(): SohlActor | null {
        return this.parent;
    }

    get nestedIn(): SohlItem | null {
        const system = this.system as any;
        return system?.nestedIn ?
                ((this.actor as any)?.allItems.get(system.nestedIn) as SohlItem)
            :   null;
    }

    get isNested(): boolean {
        return !!this.nestedIn;
    }

    nestedItems(types: string[] = []): SohlItem[] {
        return (this.actor as any)?.allItems.filter(
            (i: SohlItem) =>
                i.nestedIn === this.id &&
                (!types?.length || types.includes(i.type)),
        );
    }
}

export namespace SohlItem {
    export interface Data extends SohlLogic.Data {
        readonly [kData]: true;
        get item(): SohlItem;
        label(options?: { withName: boolean; withSubType: boolean }): string;
        notes: HTMLString;
        description: HTMLString;
        textReference: HTMLString;
        transfer: boolean;
        nestedInUuid: string | null;
    }

    export interface Logic extends SohlLogic<Data> {}

    export class BaseLogic extends SohlLogic<Data> implements Logic {
        declare _getContextOptions: () => SohlContextMenu.Entry[];
        override initialize(context?: SohlEventContext): void {
            void context;
        }
        override evaluate(context?: SohlEventContext): void {
            void context;
        }
        override finalize(context?: SohlEventContext): void {
            void context;
        }
    }

    /**
     * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
     * a structured data model for items in the "Song of Heroic Lands" module. It
     * encapsulates logic and behavior associated with items, offering a schema
     * definition and initialization logic.
     */
    export abstract class DataModel
        extends SohlDataModel<SohlItem>
        implements Data
    {
        declare notes: HTMLString;
        declare description: HTMLString;
        declare textReference: HTMLString;
        declare transfer: boolean;
        declare nestedInUuid: string | null;
        readonly [kData] = true;

        constructor(data: PlainObject = {}, options: PlainObject = {}) {
            if (!(options.parent instanceof SohlItem)) {
                throw new Error("Parent must be of type SohlItem");
            }
            super(data, options);
        }

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get item(): SohlItem {
            return this.parent;
        }

        get actor(): SohlActor | null {
            return (this.item as any).actor;
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
            if (options.withSubType && SubTypeMixin.Data.isA(this)) {
                typeText = `SOHL.${this.kind}.typelabel.${this.subType}`;
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
            return {
                ...super.defineSchema(),
                nestedInUuid: new StringField({
                    nullable: true,
                    initial: null,
                }),
            };
        }
    }

    export namespace DataModel {
        export interface Statics extends SohlDataModel.DataModel.Statics {
            readonly kind: string;
            isA(obj: unknown): obj is unknown;
        }

        export const Shape: WithStatics<typeof SohlItem.DataModel, Statics> =
            SohlItem.DataModel;
    }

    type HandlebarsTemplatePart =
        foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;

    export class Sheet extends SohlDataModel.Sheet<SohlItem> {
        override get document(): SohlItem {
            return super.document as unknown as SohlItem;
        }

        static PARTS: StrictObject<HandlebarsTemplatePart> = {
            header: {
                template: "system/sohl/templates/item/parts/header.hbs",
                id: "header",
            },
            tabs: {
                template: "system/sohl/templates/item/parts/tabs.hbs",
            },
            // Each subclass should override this entry to provide its own template
            properties: {
                template: "",
            },
            description: {
                template: "system/sohl/templates/item/parts/description.hbs",
            },
            nestedItems: {
                template: "system/sohl/templates/item/parts/nested-items.hbs",
            },
            actions: {
                template: "system/sohl/templates/item/parts/actions.hbs",
            },
            events: {
                template: "system/sohl/templates/item/parts/events.hbs",
            },
            effects: {
                template: "system/sohl/templates/item/parts/effects.hbs",
            },
        };

        get item(): SohlItem {
            return this.document as SohlItem;
        }

        get actor(): SohlActor | null {
            return (this.item as any).actor;
        }

        override _configureRenderOptions(
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
                "events",
                "nestedItems",
                "effects",
            );
        }

        override async _prepareContext(
            options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
        ): Promise<PlainObject> {
            return await super._prepareContext(options);
        }

        override async _onDropItem(
            event: DragEvent,
            droppedItem: SohlItem,
        ): Promise<void> {
            if (!this.document.isOwner) return;

            if (GearMixin.Data.isA(droppedItem.system)) {
                this._onDropGear(event, droppedItem);
            } else {
                this._onDropNonGear(event, droppedItem);
            }
        }

        async _onDropItemCreate(
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
                            result = (await SohlItem.create(itemData, {
                                parent: this.actor as any,
                            })) as SohlItem;
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

        async _moveQtyDialog(
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
                    let formQtyToMove =
                        Number.parseInt(formdata.itemstomove) || 0;

                    return formQtyToMove;
                },
                options: { jQuery: false },
                rejectClose: false,
            });

            return result || 0;
        }

        async _onDropGear(
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

            if (
                !destContainer ||
                destContainer.id === droppedItem.nestedIn?.id
            ) {
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
                sohl.log.uiError(
                    `Similar item exists in ${destContainer.name}`,
                );
                return false;
            }

            let quantity = (droppedItem.system as any).quantity;
            if (quantity > 1 && !droppedItem.parent) {
                // Ask how many to move
                quantity = await this._moveQtyDialog(
                    droppedItem,
                    destContainer,
                );
            }

            const itemData = droppedItem.toObject();
            delete (itemData as any)._id; // Remove ID to create a new item
            (itemData.system as any).quantity = quantity;
            return (
                ((await SohlItem.create(itemData, {
                    parent: destContainer,
                })) as SohlItem) || false
            );
        }

        async _onDropNonGear(
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
            const siblings: SohlItem[] = Array.from(
                targetElement.parentElement?.children || [],
            )
                .map((el) =>
                    items.get((el as HTMLElement).dataset.itemId || ""),
                )
                .filter((i): i is SohlItem => !!i && i.id !== sourceId);

            // Sort the item using Foundry's utility
            const sorted: { target: SohlItem; update: Partial<SohlItem> }[] =
                foundry.utils.performIntegerSort(source, {
                    target,
                    siblings,
                });

            // Prepare update data
            const updateData = sorted.map(({ target, update }) => ({
                _id: target.id,
                ...update,
            }));

            // Apply the sort updates
            return this.actor.updateEmbeddedDocuments(
                "Item",
                updateData,
            ) as Promise<SohlItem[] | undefined>;
        }

        // static get defaultOptions() {
        //     return foundryHelpers.mergeObject(super.defaultOptions, {
        //         classes: ["sohl", "sheet", "item"],
        //         width: 560,
        //         height: 550,
        //         filters: [
        //             {
        //                 inputSelector: 'input[name="search-actions"]',
        //                 contentSelector: ".action-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-nested"]',
        //                 contentSelector: ".nested-item-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-effects"]',
        //                 contentSelector: ".effects-list",
        //             },
        //         ],
        //     });
        // }
    }
}

declare global {
    interface DocumentClassConfig {
        Item: typeof SohlItem;
    }
}
