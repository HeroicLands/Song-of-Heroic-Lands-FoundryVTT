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

import { SohlMap } from "@utils/collection";
import { SohlItem } from "@common/item";
import {
    ClientDocumentExtendedMixin,
    FilePath,
    HTMLString,
    SohlContextMenu,
} from "@utils";
import { SohlLogic, SohlDataModel, InternalClientDocument } from "@common";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

const kSohlActor = Symbol("SohlActor");
const kDataModel = Symbol("SohlActor.DataModel");

export class SohlActor<
        TLogic extends SohlLogic = SohlLogic,
        TDataModel extends SohlActor.DataModel = any,
    >
    extends ClientDocumentExtendedMixin(
        Actor,
        {} as InstanceType<typeof foundry.documents.BaseActor>,
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
    declare _preCreateDescendantDocuments: (...args: any[]) => void;
    declare public _onCreateDescendantDocuments: (...args: any[]) => void;
    declare public _preUpdateDescendantDocuments: (...args: any[]) => void;
    declare public _onUpdateDescendantDocuments: (...args: any[]) => void;
    declare public _preDeleteDescendantDocuments: (...args: any[]) => void;
    declare public _onDeleteDescendantDocuments: (...args: any[]) => void;

    declare type: string;
    declare img: FilePath;
    declare static create: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<SohlActor | undefined>;
    declare update: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<this | undefined>;
    declare delete: (options?: PlainObject) => Promise<this | undefined>;

    readonly [kSohlActor] = true;

    static isA(obj: unknown): obj is SohlActor {
        return typeof obj === "object" && obj !== null && kSohlActor in obj;
    }

    static _getContextOptions(doc: SohlActor): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.system.logic._getContextOptions();
    }

    get items(): SohlMap<string, SohlItem> {
        return new SohlMap(
            // @ts-expect-error TypeScript does not recognize the parent `items` collection
            super.items.map((item: SohlItem) => [item.id, item]),
        );
    }

    get itemTypes(): StrictObject<SohlItem[]> {
        // @ts-expect-error TypeScript does not recognize the parent `items` collection
        return super.items.reduce(
            (acc: StrictObject<SohlItem[]>, it: SohlItem) => {
                const ary: SohlItem[] = acc[it.type] ?? [];
                ary.push(it);
                acc[it.type] = ary;
                return acc;
            },
            {},
        );
    }
}

export namespace SohlActor {
    export interface Data extends SohlLogic.Data {
        get logic(): Logic;
        biography: HTMLString;
        description: HTMLString;
        bioImage: FilePath;
        textReference: string;
    }

    export interface Logic extends SohlLogic.Logic {
        readonly parent: Data;
    }

    export type DataModelConstructor = SohlDataModel.Constructor<SohlActor>;

    export class DataModel extends SohlDataModel<SohlActor> implements Data {
        declare parent: SohlActor;
        declare biography: HTMLString;
        declare description: HTMLString;
        declare bioImage: FilePath;
        declare textReference: string;
        static override LOCALIZATION_PREFIXES = ["SOHLACTORDATA"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        get logic(): Logic {
            this._logic ??= new this.logicClass(this);
            return this._logic as Logic;
        }

        get actor(): SohlActor {
            return this.parent;
        }

        /** @override */
        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                bioImage: new FilePathField({
                    categories: ["IMAGE"],
                    initial: foundry.CONST.DEFAULT_TOKEN,
                }),
                description: new HTMLField(),
                biography: new HTMLField(),
                textReference: new StringField(),
            };
        }
    }

    type HandlebarsTemplatePart =
        foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;

    export class Sheet extends SohlDataModel.Sheet<SohlActor> {
        static PARTS: StrictObject<HandlebarsTemplatePart> = {
            header: {
                template: "system/sohl/templates/actor/parts/actor-header.hbs",
            },
            tabs: {
                template: "system/sohl/templates/actor/parts/actor-tabs.hbs",
            },
            facade: {
                template: "system/sohl/templates/actor/parts/actor-facade.hbs",
            },
            profile: {
                template: "system/sohl/templates/actor/parts/actor-profile.hbs",
            },
            skills: {
                template: "system/sohl/templates/actor/parts/actor-skills.hbs",
            },
            combat: {
                template: "system/sohl/templates/actor/parts/actor-combat.hbs",
            },
            trauma: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-trauma.hbs",
            },
            mysteries: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-mysteries.hbs",
            },
            gear: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-gear.hbs",
            },
            actions: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-actions.hbs",
            },
            events: {
                template: "system/sohl/templates/actor/parts/actor-events.hbs",
            },
            effects: {
                template: "system/sohl/templates/actor/parts/actor-effects.hbs",
            },
        };

        override _configureRenderOptions(
            options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
        ): void {
            super._configureRenderOptions(options);
            if ((this.document as any).limited) {
                options.parts = ["header", "facade"];
            } else {
                options.parts = [
                    "header",
                    "tabs",
                    "facade",
                    "profile",
                    "skills",
                    "combat",
                    "trauma",
                    "mysteries",
                    "gear",
                    "actions",
                    "events",
                    "effects",
                ];
            }
        }

        override async _prepareContext(
            options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
        ): Promise<PlainObject> {
            return await super._prepareContext(options);
        }

        // static get defaultOptions() {
        //     return foundryHelpers.mergeObject(super.defaultOptions, {
        //         classes: ["sohl", "sheet", "actor"],
        //         width: 900,
        //         height: 640,
        //         filters: [
        //             {
        //                 inputSelector: 'input[name="search-traits"]',
        //                 contentSelector: ".traits",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-skills"]',
        //                 contentSelector: ".skills",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-bodylocations"]',
        //                 contentSelector: ".bodylocations-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-afflictions"]',
        //                 contentSelector: ".afflictions-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-mysteries"]',
        //                 contentSelector: ".mysteries-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-mysticalabilities"]',
        //                 contentSelector: ".mysticalabilities-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-gear"]',
        //                 contentSelector: ".gear-list",
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
