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

import { SohlActor } from "@common/actor";
import {
    ClientDocumentExtendedMixin,
    DocumentId,
    FilePath,
    HTMLString,
    SohlContextMenu,
} from "@utils";
import { InternalClientDocument, SohlDataModel, SohlLogic } from "@common";
import { GearMixin } from "./GearMixin";
import { SubTypeMixin } from "./SubTypeMixin";
const { StringField } = foundry.data.fields;

const kSohlItem = Symbol("SohlItem");
const kDataModel = Symbol("SohlItem.DataModel");

export class SohlItem<
        TLogic extends SohlLogic = SohlLogic,
        TDataModel extends SohlItem.DataModel = any,
    >
    extends ClientDocumentExtendedMixin(
        Item,
        {} as InstanceType<typeof foundry.documents.BaseItem>,
    )
    implements InternalClientDocument
{
    declare readonly name: string;
    declare readonly flags: PlainObject;
    declare apps: Record<string, foundry.applications.api.ApplicationV2.Any>;
    declare readonly collection: Collection<this, Collection.Methods<this>>;
    declare readonly compendium: CompendiumCollection<any> | undefined;
    declare readonly isOwner: boolean;
    declare readonly hasPlayerOwner: boolean;
    declare readonly limited: boolean;
    declare readonly link: string;
    declare readonly permission: any;
    declare readonly sheet: foundry.applications.api.ApplicationV2.Any | null;
    declare readonly visible: boolean;
    declare prepareData: () => void;
    declare prepareBaseData: () => void;
    declare prepareEmbeddedDocuments: () => void;
    declare prepareDerivedData: () => void;
    declare render: (
        force?: boolean,
        context?:
            | Application.RenderOptions
            | foundry.applications.api.ApplicationV2.RenderOptions,
    ) => void;
    declare sortRelative: (
        options?: ClientDocument.SortOptions<this, "sort"> | undefined,
    ) => Promise<this>;
    declare getRelativeUUID: (relative: ClientDocument) => string;
    declare _dispatchDescendantDocumentEvents: (
        event: ClientDocument.LifeCycleEventName,
        collection: string,
        args: never,
        _parent: never,
    ) => void;
    declare _onSheetChange: (
        options?: ClientDocument.OnSheetChangeOptions,
    ) => Promise<void>;
    declare deleteDialog: (
        options?: PlainObject,
    ) => Promise<false | this | null | undefined>;
    declare exportToJSON: (
        options?: ClientDocument.ToCompendiumOptions,
    ) => void;
    declare toDragData: () => foundry.abstract.Document.DropData<
        foundry.abstract.Document.Internal.Instance.Complete<any>
    >;
    declare importFromJSON: (json: string) => Promise<this>;
    declare importFromJSONDialog: () => Promise<void>;
    declare toCompendium: (
        pack?: CompendiumCollection<CompendiumCollection.Metadata> | null,
        options?: PlainObject,
    ) => ClientDocument.ToCompendiumReturnType<any, any>;
    declare toAnchor: (
        options?: TextEditor.EnrichmentAnchorOptions,
    ) => HTMLAnchorElement;
    declare toEmbed: (
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _buildEmbedHTML: (
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | HTMLCollection | null>;
    declare _createInlineEmbed: (
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _createFigureEmbed: (
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _preCreateEmbeddedDocuments: (
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _onCreateEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _preUpdateEmbeddedDocuments: (
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _onUpdateEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _preDeleteEmbeddedDocuments: (
        embeddedName: string,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _onDeleteEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _preCreateDescendantDocuments: (
        embeddedName: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare public _onCreateDescendantDocuments: (
        embeddedName: any,
        documents: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare public _preUpdateDescendantDocuments: (
        embeddedName: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare public _onUpdateDescendantDocuments: (
        embeddedName: any,
        documents: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare public _preDeleteDescendantDocuments: (
        embeddedName: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare public _onDeleteDescendantDocuments: (
        embeddedName: any,
        documents: any,
        result: any,
        options: any,
        userId: any,
    ) => void;
    declare type: string;
    declare img: FilePath;
    declare static create: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<SohlItem | undefined>;
    declare update: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<this | undefined>;
    declare delete: (options?: PlainObject) => Promise<this | undefined>;
    readonly [kSohlItem] = true;

    static isA(obj: unknown): obj is SohlItem {
        return typeof obj === "object" && obj !== null && kSohlItem in obj;
    }

    get typeLabel(): string {
        const typeText = sohl.i18n.format("TYPE.Item." + this.type);
        if (this.system.subType) {
            const subTypeText = sohl.i18n.format(
                `SOHL.${this.system.langId}.Item.` + this.system.subType,
            );
            return sohl.i18n.format("{subType} {type}", {
                subType: (this.constructor as any).subTypes[
                    this.system.subType
                ],
                type: typeText,
            });
        } else {
            return sohl.i18n.format("{type}", {
                type: typeText,
            });
        }
    }

    get label() {
        return this.system.label;
    }

    get defaultIntrinsicActionName(): string {
        throw new Error("Method not implemented.");
    }

    get nestedIn(): SohlItem | null {
        return this.system?.nestedIn ?
                (this.actor?.items.get(this.system.nestedIn) as SohlItem)
            :   null;
    }

    get actor(): SohlActor | null {
        if (SohlActor.isA(this.parent)) {
            return this.parent;
        } else {
            throw new Error("item parent must be an Actor or null");
        }
    }

    get isNested(): boolean {
        return !!this.system?.nestedIn;
    }

    nestedItems(types: string[] = []): SohlItem[] {
        return (this.actor as any)?.items.filter(
            (i: SohlItem) =>
                i.system?.nestedIn === this.id &&
                (!types?.length || types.includes(i.type)),
        );
    }

    static _getContextOptions(doc: SohlItem): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.system.logic._getContextOptions();
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
}

export namespace SohlItem {
    export interface Data extends SohlLogic.Data {
        get item(): SohlItem;
        get actor(): SohlActor | null;
        get logic(): Logic;
        get i18nPrefix(): string;
        get kind(): string;
        label(withName?: boolean): string;
        notes: HTMLString;
        description: HTMLString;
        textReference: HTMLString;
        transfer: boolean;
        nestedInUuid: string | null;
    }

    export interface Logic extends SohlLogic.Logic {
        readonly parent: Data;
    }

    export type DataModelConstructor = SohlDataModel.Constructor<SohlItem>;

    /**
     * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
     * a structured data model for items in the "Song of Heroic Lands" module. It
     * encapsulates logic and behavior associated with items, offering a schema
     * definition and initialization logic.
     */
    export class DataModel extends SohlDataModel<SohlItem> implements Data {
        declare notes: HTMLString;
        declare description: HTMLString;
        declare textReference: HTMLString;
        declare transfer: boolean;
        declare nestedInUuid: string | null;
        static override LOCALIZATION_PREFIXES = ["SohlItem.DataModel"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        get logic(): Logic {
            this._logic ??= new this.logicClass(this);
            return this._logic as Logic;
        }

        get item(): SohlItem {
            return this.parent;
        }

        get actor(): SohlActor | null {
            return this.item.actor;
        }

        get i18nPrefix(): string {
            return `SOHL.Item.${this.kind}`;
        }

        label(withName: boolean = true): string {
            const typeText = sohl.i18n.localize(`TYPE.Item.${this.kind}`);
            let profile: string;
            if (withName) {
                if (SubTypeMixin.Data.isA(this)) {
                    profile = "SOHL.BASEDATA.nameLabelWithSubType";
                } else {
                    profile = "SOHL.BASEDATA.nameLabelWithoutSubType";
                }
            } else {
                if (SubTypeMixin.Data.isA(this)) {
                    profile = "SOHL.BASEDATA.TypeLabelWithSubType";
                } else {
                    profile = "SOHL.BASEDATA.TypeLabelWithoutSubType";
                }
            }
            const data = {
                type: typeText,
                subtype: "",
                name: this.parent.name,
            };
            if (SubTypeMixin.Data.isA(this)) data.subtype = this.subType;

            return sohl.i18n.format(profile, {
                type: typeText,
                subtype: data.subtype,
                name: this.parent.name,
            });
        }

        /** @override */
        static defineSchema(): foundry.data.fields.DataSchema {
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
        export interface Statics extends SohlDataModel.TypeDataModelStatics {
            readonly kind: string;
            readonly _metadata: SohlDataModel.Element;
            isA(obj: unknown): obj is unknown;
        }
    }

    type HandlebarsTemplatePart =
        foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;

    export class Sheet extends SohlDataModel.Sheet<SohlItem> {
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
            return this.item.actor;
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

        /** @override */
        async _onDropItem(
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
            if (!this.actor || !this.item.isOwner) return false;
            const itemList = data instanceof Array ? data : [data];
            const toCreate = [];
            for (let itemData of itemList) {
                // Determine if a similar item exists
                let similarItem = this.actor.items.find(
                    (it: SohlItem) =>
                        it.name === itemData.name &&
                        it.type === itemData.type &&
                        it.system.subType === itemData.system.subType,
                );

                if (similarItem) {
                    const confirm = await Dialog.confirm({
                        title: `Confirm Overwrite: ${similarItem.label}`,
                        content: `<p>Are You Sure?</p><p>This item will be overwritten and cannot be recovered.</p>`,
                        options: { jQuery: false },
                    });
                    if (confirm) {
                        delete itemData._id;
                        delete itemData.pack;
                        let result = await similarItem.delete();
                        if (result) {
                            result = await SohlItem.create(itemData, {
                                parent: this.actor,
                            });
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
                maxItems: item.system.quantity,
                sourceName: "",
            };

            if (item.nestedIn) {
                dlgData.sourceName = `${item.nestedIn.label}`;
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
            let destContainer;
            if (destContainerId) {
                destContainer = this.document.actor?.items.get(destContainerId);
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

            const similarItem = destContainer
                .nestedItems()
                .find(
                    (it) =>
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

            let quantity = droppedItem.system.quantity;
            if (quantity > 1 && !droppedItem.parent) {
                // Ask how many to move
                quantity = await this._moveQtyDialog(
                    droppedItem,
                    destContainer,
                );
            }

            const itemData = droppedItem.toObject();
            delete itemData._id; // Remove ID to create a new item
            itemData.system.quantity = quantity;
            return (
                (await SohlItem.create(itemData, {
                    parent: destContainer,
                })) || false
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
                const result = await this._onSortItem(
                    event,
                    droppedItem.toObject(),
                );
                return !!result?.length;
            } else {
                const result = await this._onDropItemCreate(
                    droppedItem.toObject(),
                    event,
                );
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
            const siblings: SohlItem[] = Array.from(
                targetElement.parentElement?.children || [],
            )
                .map((el) =>
                    items.get((el as HTMLElement).dataset.itemId || ""),
                )
                .filter((i): i is SohlItem => !!i && i.id !== sourceId);

            // Sort the item using Foundry's utility
            const sorted: { target: SohlItem; update: Partial<SohlItem> }[] =
                fvtt.utils.performIntegerSort(source, {
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
