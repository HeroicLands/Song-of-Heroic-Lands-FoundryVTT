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

import {
    ClientDocumentExtendedMixin,
    FilePath,
    HTMLString,
    toDocumentId,
} from "@utils/helpers";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import type { InternalClientDocument } from "@common/FoundryProxy";
import { SohlDataModel } from "@common/SohlDataModel";
import type { SohlItem } from "@common/item/SohlItem";
import { SohlLogic } from "@common/SohlLogic";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SohlMap } from "@utils/collection/SohlMap";
import { MasteryLevelMixin } from "@common/item/MasteryLevelMixin";
import { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlSpeaker } from "@common/SohlSpeaker";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;
const kSohlActor = Symbol("SohlActor");
const kData = Symbol("SohlActor.Data");

export class SohlActor<
        TLogic extends SohlActor.Logic = SohlActor.Logic,
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
    declare readonly items: Collection<SohlItem, Collection.Methods<SohlItem>>;
    declare readonly effects: Collection<
        SohlActiveEffect,
        Collection.Methods<SohlActiveEffect>
    >;
    declare readonly compendium: CompendiumCollection<any> | undefined;
    declare readonly isOwner: boolean;
    declare readonly hasPlayerOwner: boolean;
    declare readonly limited: boolean;
    declare readonly link: string;
    declare readonly permission: any;
    declare readonly sheet: foundry.applications.api.ApplicationV2.Any | null;
    declare readonly visible: boolean;
    declare prototypeToken: { texture: { src: string } };
    declare prepareData: () => void;
    declare prepareEmbeddedDocuments: () => void;
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

    private _allItemsMap?: SohlMap<string, SohlItem>;
    private _allItemTypesCache?: StrictObject<SohlItem[]>;
    private _allItemsBuilt = false;
    private _ctx = new SohlEventContext({
        speaker: new SohlSpeaker({
            actor: toDocumentId(this.id || ""),
            alias: null,
        }),
    });

    static isA(obj: unknown): obj is SohlActor {
        return typeof obj === "object" && obj !== null && kSohlActor in obj;
    }

    get logic(): TLogic {
        return this.system.logic as TLogic;
    }

    static _getContextOptions(doc: SohlActor): SohlContextMenu.Entry[] {
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

    addVirtualItem(item: SohlItem): void {
        if (this._allItemsBuilt) {
            throw new Error(
                "Virtual items have already been finalized, no new items may be added.",
            );
        }
        if (!this.logic.virtualItems) {
            throw new Error("Virtual items map not initialized.");
        }
        if (item.id) {
            this.logic.virtualItems.set(item.id, item);
        }
    }

    get allItems(): SohlMap<string, SohlItem> {
        return this._allItemsMap ?? new SohlMap<string, SohlItem>();
    }

    get itemTypes(): StrictObject<SohlItem[]> {
        return this._allItemTypesCache ?? {};
    }

    *dynamicAllItems(): Generator<SohlItem> {
        const seen = new Set<string>();

        // 1) Yield embedded items (fixed set)
        for (const [id, it] of this.items.entries()) {
            seen.add(id);
            yield it;
        }

        // 2) Repeatedly sweep virtuals until a full pass finds nothing new
        const virtuals = this.system.virtualItems as Map<string, SohlItem>;
        let emitted: number;
        // optional safety cap if you fear runaway item factories
        const MAX = 10_000;
        let total = 0;

        do {
            emitted = 0;
            for (const [id, it] of virtuals) {
                if (!seen.has(id)) {
                    seen.add(id);
                    emitted++;
                    if (++total > MAX)
                        throw new Error("dynamicAllItems(): runaway growth?");
                    yield it; // caller will call initialize(); next pass picks up anything it added
                }
            }
        } while (emitted > 0);
    }

    finalizeItemsCache(): void {
        if (this._allItemsBuilt) return;

        this._allItemsMap = new SohlMap<string, SohlItem>();

        for (const [id, it] of this.items.entries()) {
            this._allItemsMap.set(id, it);
        }
        for (const [id, it] of this.system.virtualItems.entries()) {
            this._allItemsMap.set(id, it);
        }

        this._allItemTypesCache = this.allItems.reduce(
            (acc: StrictObject<SohlItem[]>, it: SohlItem) => {
                const ary: SohlItem[] = acc[it.type] ?? [];
                ary.push(it);
                acc[it.type] = ary;
                return acc;
            },
            {},
        );
        this._allItemsBuilt = true;
    }

    prepareBaseData(): void {
        // @ts-expect-error TS doesn't recognize prepareBaseData is declared in base class
        super.prepareBaseData();
        this.logic.initialize(this._ctx);
    }

    prepareEmbeddedData(): void {
        // @ts-expect-error TS doesn't recognize prepareEmbeddedData is declared in base class
        super.prepareEmbeddedData();

        // Initialize all items, handling the initialization logic adding items to virtualItems
        for (const item of this.dynamicAllItems()) {
            item.logic.initialize(this._ctx);
        }
        this.finalizeItemsCache();

        // Evaluate and finalize all objects, recognizing that the virtualItems map is now immutable
        this.allItems.forEach((it) => {
            it.logic.evaluate(this._ctx);
            it.logic.finalize(this._ctx);
        });
    }

    prepareDerivedData(): void {
        // @ts-expect-error TS doesn't recognize prepareDerivedData is declared in base class
        super.prepareDerivedData();
        this.logic.evaluate(this._ctx);
        this.logic.finalize(this._ctx);
    }

    static createUniqueName(baseName: string): string {
        if (!baseName) {
            throw new Error("Must provide baseName");
        }
        const takenNames = new Set();
        for (const document of (game as any).actors)
            takenNames.add(document.name);
        let name = baseName;
        let index = 1;
        while (takenNames.has(name)) name = `${baseName} (${++index})`;
        return name;
    }

    // /**
    //  * Present a Dialog form to create a new Actor.
    //  * Choose a name and a type from a select menu of types.
    //  * @param data                Document creation data
    //  * @param createOptions  Document creation options.
    //  * @param options        Options forwarded to DialogV2.prompt
    //  * @param options.folders Available folders in which the new Document can be place
    //  * @param options.types   A restriction of the selectable sub-types of the Dialog.
    //  * @param options.template  A template to use for the dialog contents instead of the default.
    //  * @param options.context   Additional render context to provide to the template.
    //  * @returns A Promise which resolves to the created Document, or null if the dialog was closed.
    //  */
    // static async createDialog(
    //     data: PlainObject,
    //     createOptions: PlainObject = {},
    //     options: {
    //         folders?: { id: string; name: string }[];
    //         types?: string[];
    //         template?: string;
    //         context?: PlainObject;
    //         [key: string]: any;
    //     } = {},
    // ): Promise<SohlActor | null> {
    //     const { folders, types, template, context, ...dialogOptions } = options;
    //     // Function body here
    // }

    async _preCreate(
        createData: PlainObject,
        options: PlainObject,
        user: string,
    ) {
        const allowed = await super._preCreate(createData, options, user);
        if (allowed === false) return false;
        let updateData: PlainObject = {};

        const similarActorExists =
            !this.pack &&
            (game as any).actors.some(
                (actor: SohlActor) =>
                    actor.type === createData.type &&
                    actor.name === createData.name,
            );
        if (similarActorExists) {
            updateData["name"] = SohlActor.createUniqueName(createData.name);
        }

        // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
        if (createData.items) {
            if (options.cloneActorUuid) {
                const cloneActor = await fromUuid(options.cloneActorUuid);
                if (cloneActor) {
                    let newData = cloneActor.toObject();
                    delete newData._id;
                    delete newData.folder;
                    delete newData.sort;
                    delete newData.pack;
                    if ("ownership" in newData) {
                        newData.ownership = {
                            default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                            [(game as any).user.id]:
                                CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                        };
                    }

                    updateData = foundry.utils.mergeObject(newData, createData);
                }
            }

            const artwork = (this.constructor as any).getDefaultArtwork?.(
                this.toObject(),
            );
            if (!this.img) updateData["img"] = artwork?.img;
            if (!this.prototypeToken.texture.src)
                updateData["prototypeToken.texture.src"] = artwork?.texture.src;

            // If a rollFormula is provided, then we will perform the designated rolling
            // for all attributes, and then for all skills we will calculate the initial
            // mastery level based on those attributes.
            if (options.rollFormula) {
                for (const obj of updateData.items) {
                    if (
                        options.rollFormula &&
                        obj.type === "trait" &&
                        obj.system.intensity === "attribute"
                    ) {
                        const rollFormula =
                            (options.rollFormula === "default" ?
                                obj.flags?.sohl?.diceFormula
                            :   options.rollFormula) || "0";

                        try {
                            let roll = Roll.create(rollFormula);
                            const rollResult = await roll.evaluate();
                            if (rollResult?.total)
                                obj.system.textValue =
                                    rollResult.total.toString();
                        } catch (err: any) {
                            Hooks.onError("SohlActor#_preCreate", err, {
                                msg: `Roll formula "${rollFormula}" is invalid`,
                                log: "error",
                            });
                        }
                    }
                }

                // Calculate initial skills mastery levels
                for (const obj of updateData.items) {
                    if (obj.type === "skill") {
                        if (obj.flags?.sohl?.legendary?.initSkillMult) {
                            const sb = new MasteryLevelMixin.SkillBase(
                                obj.system.skillBaseFormula,
                                {
                                    items: updateData.items,
                                },
                            );
                            obj.system.masteryLevelBase =
                                sb.value *
                                obj.flags.sohl.legendary.initSkillMult;
                        }
                    }
                }
            }
        }

        this.updateSource(updateData);

        return true;
    }

    _onCreate(data: PlainObject, options: any, userId: string) {
        super._onCreate(data, options, userId);
        //        this.updateEffectsOrigin();
    }

    // async updateEffectsOrigin(): Promise<{_id: string, origin: string}[] | void> {
    //     // If we are in a compendium, do nothing
    //     if (this.pack) return;

    //     const actorUpdate = this.effects.reduce((toUpdate, e) => {
    //         const id = e?.id;
    //         if (id && e.origin !== this.uuid) {
    //             return toUpdate.concat({ _id: id ?? "", origin: this.uuid });
    //         }
    //         return toUpdate;
    //     }, []);
    //     if (actorUpdate.length) {
    //         await this.updateEmbeddedDocuments("ActiveEffect", actorUpdate);
    //     }

    //     for (const it of this.items) {
    //         const toUpdate = it.updateEffectsOrigin();
    //         if (toUpdate.length) {
    //             await it.updateEmbeddedDocuments("ActiveEffect", toUpdate);
    //         }
    //     }

    //     this.system.virtualItems.forEach((it) => {
    //         const toUpdate = it.updateEffectsOrigin();
    //         while (toUpdate.length) {
    //             const eChange = toUpdate.pop();
    //             const effect = it.effects.get(eChange._id);
    //             if (effect) {
    //                 effect.update({ origin: eChange.origin });
    //             }
    //         }
    //     });
    // }
}

export namespace SohlActor {
    export interface Data extends SohlLogic.Data {
        readonly [kData]: true;
        label(options?: { withName: boolean }): string;
        biography: HTMLString;
        description: HTMLString;
        bioImage: FilePath;
        textReference: string;
    }

    export interface Logic extends SohlLogic {
        readonly _parent: Data;
        virtualItems: SohlMap<string, SohlItem>;
    }

    export class BaseLogic extends SohlLogic implements Logic {
        declare readonly _parent: Data;
        declare _getContextOptions: () => SohlContextMenu.Entry[];
        virtualItems!: SohlMap<string, SohlItem>;
        override initialize(context?: SohlEventContext): void {
            this.virtualItems = new SohlMap<string, SohlItem>();
        }
        override evaluate(context?: SohlEventContext): void {}
        override finalize(context?: SohlEventContext): void {}
    }

    export abstract class DataModel
        extends SohlDataModel<SohlActor, any>
        implements Data
    {
        declare biography: HTMLString;
        declare description: HTMLString;
        declare bioImage: FilePath;
        declare textReference: string;
        readonly [kData] = true;

        constructor(data: PlainObject = {}, options: PlainObject = {}) {
            if (!(options.parent instanceof SohlActor)) {
                throw new Error("Parent must be of type SohlActor");
            }
            super(data, options);
        }

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get actor(): SohlActor {
            return this.parent;
        }

        get i18nPrefix(): string {
            return `SOHL.Actor.${this.kind}`;
        }

        label(
            options: { withName: boolean } = {
                withName: true,
            },
        ): string {
            let result = sohl.i18n.localize(`SOHL.${this.kind}.typelabel`);
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

    export namespace DataModel {
        export interface Statics extends SohlDataModel.DataModel.Statics {
            readonly kind: string;
            isA(obj: unknown): obj is unknown;
        }

        export const Shape: WithStatics<typeof SohlActor.DataModel, Statics> =
            SohlActor.DataModel;
    }

    type HandlebarsTemplatePart =
        foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;

    export class Sheet extends SohlDataModel.Sheet<SohlActor> {
        static DEFAULT_OPTIONS: PlainObject = {
            id: "sohl-actor-sheet",
            tag: "form",
            position: { width: 900, height: 640 },
        };

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
        } as const;

        static TABS = {
            sheet: {
                navSelector: ".tabs[data-group='sheet']",
                contentSelector: ".content[data-group='sheet']",
                initial: "profile",
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
            const context = {
                ...(await super._prepareContext(options)),
            };
            return context;
        }

        async _preparePartContext(
            partId: string,
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            // @ts-expect-error TS doesn't recognize _preparePartContext is declared in base class
            context = await super._preparePartContext(partId, context, options);
            switch (partId) {
                case "facade":
                    return await this._prepareFacadeContext(context, options);
                case "profile":
                    return this._prepareProfileContext(context, options);
                case "skills":
                    return await this._prepareSkillsContext(context, options);
                case "combat":
                    return await this._prepareCombatContext(context, options);
                case "trauma":
                    return await this._prepareTraumaContext(context, options);
                case "mysteries":
                    return await this._prepareMysteriesContext(
                        context,
                        options,
                    );
                case "gear":
                    return await this._prepareGearContext(context, options);
                case "actions":
                    return await this._prepareActionsContext(context, options);
                case "events":
                    return await this._prepareEventsContext(context, options);
                case "effects":
                    return await this._prepareEffectsContext(context, options);
                case "header":
                    return await this._prepareHeaderContext(context, options);
                case "tabs":
                    return await this._prepareTabsContext(context, options);
                default:
                    return context;
            }
        }

        async _prepareTabsContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareHeaderContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareFacadeContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareProfileContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareSkillsContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareCombatContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareTraumaContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareMysteriesContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareGearContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareActionsContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareEventsContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        async _prepareEffectsContext(
            context: PlainObject,
            options: PlainObject,
        ): Promise<PlainObject> {
            return context;
        }

        protected _displayFilteredResults(
            event: KeyboardEvent,
            query: string,
            rgx: RegExp,
            content: HTMLElement | null,
        ): void {
            if (!content) return;

            const rows = content.querySelectorAll<HTMLElement>(".item");

            if (!query.trim()) {
                rows.forEach((el) => el.classList.remove("hidden"));
            } else {
                if (rgx && (rgx as any).global) rgx.lastIndex = 0;

                const q = sohl.i18n.normalizeText(query.trim(), {
                    caseInsensitive: true,
                    ascii: true,
                });
                rows.forEach((el) => {
                    const name = sohl.i18n.normalizeText(
                        (el.dataset.itemName ?? "").trim(),
                        {
                            caseInsensitive: true,
                            ascii: true,
                        },
                    );
                    const match = rgx ? rgx.test(name) : name.includes(q);
                    el.classList.toggle("hidden", !match);
                    if (rgx && (rgx as any).global) rgx.lastIndex = 0;
                });
            }
        }

        protected _filters: SearchFilter[] = [
            new SearchFilter({
                inputSelector: 'input[name="search-traits"]',
                contentSelector: ".traits",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-skills"]',
                contentSelector: ".skills",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-bodylocations"]',
                contentSelector: ".bodylocations-list",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-afflictions"]',
                contentSelector: ".afflictions-list",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-mysteries"]',
                contentSelector: ".mysteries-list",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-mysticalabilities"]',
                contentSelector: ".mysticalabilities-list",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-gear"]',
                contentSelector: ".gear-list",
                callback: this._displayFilteredResults.bind(this),
            }),
            new SearchFilter({
                inputSelector: 'input[name="search-effects"]',
                contentSelector: ".effects-list",
                callback: this._displayFilteredResults.bind(this),
            }),
        ];

        _onRender(context: PlainObject, options: PlainObject): void {
            super._onRender(context, options);

            // Rebind all search filters
            this._filters.forEach((filter) => filter.bind(this.element));
        }
    }
}
