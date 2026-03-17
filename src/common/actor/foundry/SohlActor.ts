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
import { SohlItem } from "@common/item/foundry/SohlItem";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlActionContext } from "@common/SohlActionContext";
import { FilePath, HTMLString } from "@utils/helpers";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlLogic } from "@common/SohlLogic";
import { SohlMap } from "@utils/collection/SohlMap";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SkillBase } from "@common/SkillBase";
import { SohlSpeaker } from "@common/SohlSpeaker";
import { ACTOR_KIND, ITEM_KIND } from "@utils/constants";
import type { ActionLogic } from "@common/item/logic/ActionLogic";
import {
    callHook as fvttCallHook,
    hookOnError as fvttHookOnError,
    resolveUuidAsync as fvttResolveUuidAsync,
    createRoll as fvttCreateRoll,
    notifyWarn as fvttNotifyWarn,
} from "@common/foundry-helpers";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

/**
 * Base class for all Actor documents in the SoHL system, including
 * Beings, Cohorts, Structures, Vehicles, and Assemblies.
 *
 * TODO: This file is a monolith — contains SohlActor (Document), SohlActorLogic (interface),
 * SohlActorData (interface), SohlActorBaseLogic (base class), SohlActorDataModel (base DataModel),
 * and SohlActorSheetBase (base Sheet). Should be split following the logic/foundry pattern.
 *
 * This class provides functionality to manage both embedded items
 * (persisted in the database) and virtual items (created dynamically
 * during preparation and not persisted), and the nested items. It
 * also handles context menu options, chat card interactions, and
 * lifecycle management of items during actor preparation.
 */
export class SohlActor extends Actor {
    private _allItemsMap?: SohlMap<string, SohlItem>;
    private _allItemTypesCache?: StrictObject<SohlItem[]>;
    private _allItemsBuilt: boolean;
    protected _speaker?: SohlSpeaker;
    protected _lifecycleActionsCache: Map<string, SohlItem>;

    constructor(data: any, options?: any) {
        super(data, options);
        this._allItemsBuilt = false;
        this._lifecycleActionsCache = new Map<string, SohlItem>();
    }

    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlActorLogic<any> {
        return (this.system as any).logic as SohlActorLogic<any>;
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

    /**
     * Handle a timed event dispatched by the SoHL event queue.
     * Override in subclasses to implement actor-specific event handling.
     * @param kind - Event kind identifier
     * @param time - Scheduled trigger time (world seconds)
     * @param payload - Optional context data
     */
    async handleSohlEvent(
        kind: string,
        _time: number,
        _payload?: Record<string, unknown>,
    ): Promise<void> {
        console.warn(
            `SoHL | ${this.name} (Actor) received unhandled event "${kind}"`,
        );
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

    /** Returns all items, including both embedded and virtual items. */
    get allItems(): SohlMap<string, SohlItem> {
        return this._allItemsMap ?? new SohlMap<string, SohlItem>();
    }

    /** Returns all item types, categorized by type. */
    get allItemTypes(): StrictObject<SohlItem[]> {
        return this._allItemTypesCache ?? {};
    }

    /**
     * A generator that yields all items, including both embedded and virtual items.
     * This is used during preparation to ensure that any virtual items added during
     * initialization are included in the preparation lifecycle.
     */
    *dynamicAllItems(): Generator<SohlItem> {
        const seen = new Set<string>();

        // 1) Yield embedded items (fixed set)
        for (const [id, it] of this.items.entries()) {
            seen.add(id);
            yield it as SohlItem;
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

    /**
     * Finalizes the items cache, including both embedded and virtual items.
     * Any virtual items added after this point will not be included.
     */
    finalizeItemsCache(): void {
        if (this._allItemsBuilt) return;

        this._allItemsMap = new SohlMap<string, SohlItem>();

        for (const [id, it] of this.items.entries()) {
            this._allItemsMap.set(id, it as SohlItem);
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

    /**
     * Returns the Token representing this actor in the active scene, if any.
     * @returns The Token representing this actor in the active scene, or null if none exists.
     */
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

    /**
     * Returns the {@link SohlActionContext} for this actor.
     * @param token The token to use for context, if any.
     * @returns The action context for this actor.
     */
    protected _getContext(token?: TokenDocument): SohlActionContext {
        return new SohlActionContext({
            speaker: this.getSpeaker(token),
        });
    }

    /**
     * Returns a SohlSpeaker for this actor, optionally using a specific token if provided.
     * @param token The token to use for the speaker, if any.
     * @returns The SohlSpeaker for this actor.
     */
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

    /**
     * Sets up the intrinsic actions for this actor.
     * @param context The action context to use for setup.
     */
    setupIntrinsicActions(context: SohlActionContext): void {}

    prepareBaseData(): void {
        super.prepareBaseData();
        this._speaker = undefined;
        this._lifecycleActionsCache = new Map<string, SohlItem>();
        this.logic.initialize();
    }

    getLifecycleAction(name: string): SohlItem | undefined {
        let actionItem = this._lifecycleActionsCache.get(name);
        if (!actionItem) {
            actionItem = this.items.find(
                (it) => it.type === ITEM_KIND.ACTION && it.name === name,
            ) as SohlItem | undefined;
            if (actionItem) {
                this._lifecycleActionsCache.set(name, actionItem);
            }
        }
        return actionItem;
    }

    prepareEmbeddedData(): void {
        // @ts-expect-error - prepareEmbeddedData exists in FoundryVTT V13 Actor but is missing from foundry-vtt-types
        // It's called between prepareBaseData() and prepareDerivedData() in the data preparation lifecycle
        super.prepareEmbeddedData();

        const ctx = this._getContext();

        // Initialize all items, handling the initialization logic adding items to virtualItems
        for (const item of this.dynamicAllItems()) {
            item.logic.initialize();

            // Call any hooks listening for this item type's post-initialize event
            fvttCallHook(`sohl.${item.type}.postInitialize`, item, ctx);

            const postInitialize = this.getLifecycleAction(
                `${item.type}.${item.system.shortcode}.postInitialize`,
            );
            // Execute the post-initialize action if it exists on this item
            if (postInitialize) {
                (postInitialize.logic as ActionLogic).execute(ctx);
            }
        }

        this.finalizeItemsCache();

        // Evaluate and finalize all objects, recognizing that the virtualItems map is now immutable
        this.allItems.forEach((it) => {
            it.logic.evaluate();

            // Call any hooks listening for this item's post-evaluate event
            fvttCallHook(`sohl.${it.type}.postEvaluate`, it, ctx);

            // Execute the post-evaluate action if it exists on this item
            const postEvaluate = this.getLifecycleAction(
                `${it.type}.${it.system.shortcode}.postEvaluate`,
            );
            if (postEvaluate) {
                (postEvaluate.logic as ActionLogic).execute(ctx);
            }
        });

        this.allItems.forEach((it) => {
            it.logic.finalize();

            // Call any hooks listening for this item's post-finalize event
            fvttCallHook(`sohl.${it.type}.postFinalize`, it, ctx);

            // Execute the post-finalize action if it exists on this item
            const postFinalize = this.getLifecycleAction(
                `${it.type}.${it.system.shortcode}.postFinalize`,
            );
            if (postFinalize) {
                (postFinalize.logic as ActionLogic).execute(ctx);
            }
        });
    }

    prepareDerivedData(): void {
        super.prepareDerivedData();
        const ctx = this._getContext();
        this.logic.evaluate();
        this.logic.finalize();
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
                const cloneActor = await fvttResolveUuidAsync(options.cloneActorUuid);
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
                                obj.system.diceFormula
                            :   options.rollFormula) || "0";

                        try {
                            let roll = fvttCreateRoll(rollFormula);
                            const rollResult = await roll.evaluate();
                            if (rollResult?.total)
                                obj.system.textValue =
                                    rollResult.total.toString();
                        } catch (err: any) {
                            fvttHookOnError("SohlActor#_preCreate", err, {
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

    /* --------------------------------------------- */
    /* Assembly Invariant Enforcement                */
    /* --------------------------------------------- */

    /**
     * Enforce the Assembly canonical item invariant on item creation:
     * an Assembly must have exactly one root item (nestedIn === null).
     * New items added to an Assembly that already has a root must have nestedIn set.
     */
    protected override _preCreateDescendantDocuments(
        ...args: Actor.PreCreateDescendantDocumentsArgs
    ): void {
        super._preCreateDescendantDocuments(...args);

        if (this.type !== ACTOR_KIND.ASSEMBLY) return;

        const [_parent, collection, data, _options, _userId] = args;
        if (collection !== "items") return;

        const hasRoot = this.items.some(
            (i: SohlItem) => (i.system as any).nestedIn == null,
        );

        for (const itemData of data as PlainObject[]) {
            const nestedIn = foundry.utils.getProperty(itemData, "system.nestedIn");
            if (nestedIn == null && hasRoot) {
                fvttNotifyWarn(
                    sohl.i18n.format("SOHL.Assembly.invalidState.multipleRoots", {
                        name: this.name,
                    }),
                );
                // Prevent creation by clearing the data array
                data.length = 0;
                return;
            }
        }
    }

    // TODO: Add _preUpdateDescendantDocuments to enforce Assembly invariant when
    // an item's nestedIn is changed to null (would create a second root item).
    // Also guard against setting nestedIn to non-null on the canonical item
    // (would leave no root item).

    // TODO: Also sync Assembly actor image (img) with canonical item image
    // when the canonical item's image changes.

    /**
     * Synchronize the Assembly actor's name when its canonical item's name changes.
     */
    protected override _onUpdateDescendantDocuments(
        ...args: Actor.OnUpdateDescendantDocumentsArgs
    ): void {
        super._onUpdateDescendantDocuments(...args);

        if (this.type !== ACTOR_KIND.ASSEMBLY) return;

        const [_parent, collection, documents, changes, _options, _userId] = args;
        if (collection !== "items") return;

        // Check if any of the updated items is the canonical item (nestedIn === null)
        // and if its name changed
        for (let i = 0; i < documents.length; i++) {
            const item = documents[i] as SohlItem;
            const change = changes[i] as PlainObject;
            if (
                (item.system as any).nestedIn == null &&
                change.name &&
                change.name !== this.name
            ) {
                this.update({ name: change.name });
                break;
            }
        }
    }
}

export interface SohlActorLogic<TData extends SohlDataModel.Data<SohlActor>>
    extends SohlLogic<TData> {
    virtualItems: SohlMap<string, SohlItem>;
}

/**
 * An interface representing the common data structure for all Actor types in the SoHL system.
 */
export interface SohlActorData<TLogic extends SohlLogic<any> = SohlLogic<any>>
    extends SohlDataModel.Data<SohlActor, TLogic> {
    label(options?: { withName: boolean }): string;
    biography: HTMLString;
    description: HTMLString;
    bioImage: FilePath;
    textReference: string;
}

/**
 * Base logic class for all actor types (Being, Cohort, Structure, Vehicle, Assembly).
 *
 * Provides the foundation that all actor logic classes build upon, including
 * management of {@link virtualItems} — dynamically created items that exist only
 * during the preparation lifecycle (not persisted to the database). Virtual items
 * are registered during {@link initialize} and become part of the actor's item
 * collection for the remainder of the lifecycle.
 *
 * Concrete actor logic classes extend this to implement type-specific rules:
 * health tracking, anatomy modeling, passenger management, etc.
 *
 * @typeParam TData - The actor data interface, extending {@link SohlActorData}.
 */
export class SohlActorBaseLogic<
    TData extends SohlActorData = SohlActorData,
> extends SohlLogic<TData> {
    virtualItems!: SohlMap<string, SohlItem>;
    override initialize(): void {
        this.virtualItems = new SohlMap<string, SohlItem>();
    }
    override evaluate(): void {}
    override finalize(): void {}
}

function defineSohlActorDataSchema(): foundry.data.fields.DataSchema {
    return {
        shortcode: new StringField({
            blank: false,
            required: true,
        }),
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
            result = sohl.i18n.format("SOHL.SohlItem.labelWithName", {
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

// Define the base type for the sheet
const SohlActorSheetBase_Base = SohlDataModel.SheetMixin<
    SohlActor,
    typeof foundry.applications.api.DocumentSheetV2<SohlActor>
>(foundry.applications.api.DocumentSheetV2<SohlActor>);

export abstract class SohlActorSheetBase extends SohlActorSheetBase_Base {
    get document(): SohlActor {
        return super.document as SohlActor;
    }

    get actor(): SohlActor | null {
        return (this.document as any).actor;
    }

    _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        // All actor sheets have these parts
        options.parts = ["header", "tabs", "facade"];
    }

    async _prepareContext(
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

    async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        // _preparePartContext is called for each part with the specific partId
        // This is where you prepare part-specific data
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
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    async _prepareFacadeContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
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
