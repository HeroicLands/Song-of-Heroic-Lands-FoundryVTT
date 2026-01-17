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

import type { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlItem } from "@common/item/SohlItem";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlActionContext } from "@common/SohlActionContext";
import { FilePath, HTMLString, toDocumentId } from "@utils/helpers";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlLogic } from "@common/SohlLogic";
import { SohlMap } from "@utils/collection/SohlMap";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SkillBase } from "@common/SkillBase";
import { SohlSpeaker } from "@common/SohlSpeaker";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

export class SohlActor<
    TLogic extends SohlActorLogic<any> = SohlActorLogic<any>,
    SubType extends Actor.SubType = Actor.SubType,
> extends Actor<SubType> {
    private _allItemsMap?: SohlMap<string, SohlItem>;
    private _allItemTypesCache?: StrictObject<SohlItem[]>;
    private _allItemsBuilt: boolean;
    protected _speaker?: SohlSpeaker;

    constructor(data: any, options?: any) {
        super(data, options);
        this._allItemsBuilt = false;
    }

    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): TLogic {
        return (this.system as any).logic as TLogic;
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    static _getContextOptions(doc: SohlActor): SohlContextMenu.Entry[] {
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

    get allItemTypes(): StrictObject<SohlItem[]> {
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
        const virtuals = (this.system as any).virtualItems as Map<
            string,
            SohlItem
        >;
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
        for (const [id, it] of (this.system as any).virtualItems.entries()) {
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

    getToken(): SohlTokenDocument | null {
        // Case 1: synthetic (unlinked) actor -> has a backing TokenDocument
        if (this.isToken && this.token) {
            return this.token; // TokenDocument
        }

        // Case 2: linked actor -> find an active-scene token linked to this actor
        const scene = canvas?.scene;
        if (!scene) return null;

        const linkedTokens = scene.tokens.filter(
            (td) => td.actorLink && td.actorId === this.id,
        );

        return linkedTokens[0] ?? null;
    }

    protected _getContext(token?: TokenDocument): SohlActionContext {
        return new SohlActionContext({
            speaker: this.getSpeaker(token),
        });
    }

    getSpeaker(token?: TokenDocument): SohlSpeaker {
        if (token) {
            return new SohlSpeaker({ token: token.id });
        }
        if (!this._speaker) {
            this._speaker = new SohlSpeaker({
                actor: this.id,
                token: this.getToken()?.id,
            });
        }
        return this._speaker;
    }

    prepareBaseData(): void {
        super.prepareBaseData();
        this._speaker = undefined;
        this.logic.initialize(this._getContext());
    }

    prepareEmbeddedData(): void {
        // @ts-expect-error TS doesn't recognize prepareEmbeddedData is declared in base class
        super.prepareEmbeddedData();

        const ctx = this._getContext();
        // Initialize all items, handling the initialization logic adding items to virtualItems
        for (const item of this.dynamicAllItems()) {
            item.logic.initialize(ctx);
        }
        this.finalizeItemsCache();

        // Evaluate and finalize all objects, recognizing that the virtualItems map is now immutable
        this.allItems.forEach((it) => {
            it.logic.evaluate(ctx);
            it.logic.finalize(ctx);
        });
    }

    prepareDerivedData(): void {
        super.prepareDerivedData();
        const ctx = this._getContext();
        this.logic.evaluate(ctx);
        this.logic.finalize(ctx);
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
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(
            createData as any,
            options as any,
            user,
        );
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
                            const sb = new SkillBase(
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
        // Call base implementation dynamically to avoid TypeScript override signature noise
        const __sohl_base = Object.getPrototypeOf(SohlActor.prototype) as any;
        __sohl_base._onCreate.call(
            this,
            data as any,
            options as any,
            userId as any,
        );
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

    /**
     * Create a new item embedded in this actor.
     * @param data The data for the new item.
     * @returns The created SohlItem.
     */
    async createItem(
        data: foundry.abstract.Document.CreateDataForName<"Item">,
    ): Promise<SohlItem> {
        const [created] = (await this.createEmbeddedDocuments("Item", [
            data,
        ])) as SohlItem[];
        return created;
    }

    async createActiveEffect(
        data: foundry.abstract.Document.CreateDataForName<"ActiveEffect">,
    ): Promise<SohlActiveEffect> {
        const [created] = (await this.createEmbeddedDocuments("ActiveEffect", [
            data,
        ])) as SohlActiveEffect[];
        return created;
    }
}

export interface SohlActorLogic<TData extends SohlDataModel.Data<SohlActor>>
    extends SohlLogic<TData> {
    virtualItems: SohlMap<string, SohlItem>;
}

export interface SohlActorData<TLogic extends SohlLogic<any> = SohlLogic<any>>
    extends SohlDataModel.Data<SohlActor, TLogic> {
    label(options?: { withName: boolean }): string;
    biography: HTMLString;
    description: HTMLString;
    bioImage: FilePath;
    textReference: string;
}

export class SohlActorBaseLogic<
    TData extends SohlActorData = SohlActorData,
> extends SohlLogic<TData> {
    virtualItems!: SohlMap<string, SohlItem>;
    override initialize(context?: SohlActionContext): void {
        this.virtualItems = new SohlMap<string, SohlItem>();
    }
    override evaluate(context?: SohlActionContext): void {}
    override finalize(context?: SohlActionContext): void {}
}

function defineSohlActorDataSchema(): foundry.data.fields.DataSchema {
    return {
        bioImage: new FilePathField({
            categories: ["IMAGE"],
            initial: foundry.CONST.DEFAULT_TOKEN,
        }),
        description: new HTMLField(),
        biography: new HTMLField(),
        textReference: new StringField(),
    };
}

type SohlActorDataSchema = ReturnType<typeof defineSohlActorDataSchema>;

export abstract class SohlActorDataModel<
        TSchema extends foundry.data.fields.DataSchema = SohlActorDataSchema,
        TLogic extends
            SohlActorLogic<SohlActorData> = SohlActorLogic<SohlActorData>,
    >
    extends SohlDataModel<TSchema, SohlActor, TLogic>
    implements SohlActorData<TLogic>
{
    biography!: HTMLString;
    description!: HTMLString;
    bioImage!: FilePath;
    textReference!: string;

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent instanceof SohlActor)) {
            throw new Error("Parent must be of type SohlActor");
        }
        super(data, options);
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
        return defineSohlActorDataSchema();
    }
}

export abstract class SohlActorSheetBase extends (SohlDataModel.SheetMixin<
    SohlActor,
    foundry.applications.api.DocumentSheetV2.AnyConstructor
>(
    // @ts-ignore TypeScript has lost track of the super class due to erasure
    foundry.applications.api
        .DocumentSheetV2<SohlActor> as unknown as foundry.applications.api.DocumentSheetV2.AnyConstructor,
) as unknown as AbstractConstructor) {
    get document(): SohlItem {
        // @ts-expect-error TypeScript has lost track of the super class due to erasure
        return super.document as SohlItem;
    }

    get actor(): SohlActor | null {
        return (this.document as any).actor;
    }

    _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        // @ts-expect-error TypeScript has lost track of the super class due to erasure
        super._configureRenderOptions(options);

        // All actor sheets have these parts
        options.parts = ["header", "tabs", "facade"];
    }

    async _prepareContext(options: any): Promise<PlainObject> {
        // @ts-expect-error TypeScript has lost track of the super class due to erasure
        return await super._prepareContext(options);
    }

    async _preparePartContext(
        partId: string,
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        // @ts-expect-error TypeScript has lost track of the super class due to erasure
        context = await super._preparePartContext.call(
            this,
            partId,
            context as any,
            options as any,
        );
        switch (partId) {
            case "header":
                return await this._prepareHeaderContext(context, options);
            case "tabs":
                return await this._prepareTabsContext(context, options);
            case "facade":
                return await this._prepareFacadeContext(context, options);
            default:
                return context;
        }
    }

    async _prepareHeaderContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareTabsContext(
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

    protected _displayFilteredResults(
        event: KeyboardEvent | null,
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
}
