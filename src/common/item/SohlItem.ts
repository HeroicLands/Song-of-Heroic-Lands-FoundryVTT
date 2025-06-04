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
import { DocumentId, HTMLString } from "@utils";
import { SohlDataModel, SohlPerformer } from "@common";
const { ForeignDocumentField } = foundry.data.fields;

const kSohlItem = Symbol("SohlItem");
const kDataModel = Symbol("SohlItem.DataModel");

export class SohlItem<
    TPerformer extends SohlPerformer = SohlPerformer,
    TDataModel extends SohlItem.DataModel<TPerformer> = any,
> extends Item {
    declare parent: SohlActor | null;
    declare id: DocumentId;
    declare name: string;
    declare img: string;
    declare type: string;
    declare system: TDataModel;
    declare limited: boolean;
    declare getFlag: (scope: string, key: string) => unknown | undefined;
    declare setFlag: (
        scope: string,
        key: string,
        value: unknown,
    ) => Promise<void>;

    readonly [kSohlItem] = true;

    static isA(obj: unknown): obj is SohlItem {
        return typeof obj === "object" && obj !== null && kSohlItem in obj;
    }

    get label() {
        return this.system.label;
    }

    get nestedIn(): SohlItem | null {
        return this.system?.nestedIn ?
                (this.actor?.items.get(this.system.nestedIn) as SohlItem)
            :   null;
    }

    get actor(): SohlActor | null {
        return this.parent as SohlActor | null;
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

    async update(
        data: PlainObject | PlainObject[],
        options?: PlainObject,
    ): Promise<SohlItem | SohlItem[]> {
        // @ts-expect-error Foundry mixin: update is implemented at runtime
        return await super.update(data, options);
    }

    async delete(context?: PlainObject): Promise<SohlItem> {
        // @ts-expect-error Foundry mixin: delete is implemented at runtime
        return (await super.delete(context)) as SohlItem;
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
    export interface Data<TPerformer extends SohlPerformer = SohlPerformer>
        extends SohlPerformer.Data {
        notes: HTMLString;
        description: HTMLString;
        textReference: HTMLString;
        transfer: boolean;
        nestedIn: DocumentId | null;
    }

    export type DataModelConstructor<
        TPerformer extends SohlPerformer = SohlPerformer,
    > = SohlDataModel.Constructor<SohlItem>;

    /**
     * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
     * a structured data model for items in the "Song of Heroic Lands" module. It
     * encapsulates logic and behavior associated with items, offering a schema
     * definition and initialization logic.
     */
    export class DataModel<TPerformer extends SohlPerformer = SohlPerformer>
        extends SohlDataModel<SohlItem, TPerformer>
        implements Data<TPerformer>
    {
        declare notes: HTMLString;
        declare description: HTMLString;
        declare textReference: HTMLString;
        declare transfer: boolean;
        declare nestedIn: DocumentId | null;
        static override LOCALIZATION_PREFIXES = ["SohlItem.DataModel"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        get logic(): TPerformer {
            return ((this._logic as SohlPerformer) ??= new this.logicClass(
                this,
            )) as TPerformer;
        }

        get item(): SohlItem {
            return this.parent;
        }

        get actor(): SohlActor | null {
            return this.item.actor;
        }

        /** @override */
        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                nestedIn: new ForeignDocumentField({
                    types: ["Item"],
                    nullable: true,
                    initial: null,
                }),
            };
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

        override _configureRenderOptions(
            options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
        ): void {
            super._configureRenderOptions(options);
            // By default, we only show the header and tabs
            // This is the default behavior for all data model sheets
            options.parts = ["header", "tabs"];
            // Don't show the other tabs if only limited view
            if (this.document.limited) return;
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
