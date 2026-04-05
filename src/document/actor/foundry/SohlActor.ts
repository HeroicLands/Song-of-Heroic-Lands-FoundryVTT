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

import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
import type { ActionLogic } from "@src/document/item/logic/ActionLogic";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { FilePath, HTMLString } from "@src/utils/helpers";
import type { SohlActiveEffect } from "@src/document/effect/SohlActiveEffect";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SohlDataModel } from "@src/core/SohlDataModel";
import { SohlLogic } from "@src/core/SohlLogic";
import { SohlMap } from "@src/utils/collection/SohlMap";
import { SkillBase } from "@src/core/SkillBase";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import {
    callHook as fvttCallHook,
    callHookCancel as fvttCallHookCancel,
    hookOnError as fvttHookOnError,
    resolveUuidAsync as fvttResolveUuidAsync,
    createRoll as fvttCreateRoll,
} from "@src/core/foundry-helpers";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

/**
 * Base class for all Actor documents in the SoHL system, including
 * Beings, Cohorts, Structures, Vehicles, and Assemblies.
 *
 * TODO: This file is a monolith — contains SohlActor (Document), SohlActorLogic (interface),
 * SohlActorData (interface), SohlActorBaseLogic (base class), SohlActorDataModel (base DataModel),
 * and SohlActorSheetBase (base Sheet). Should be split following the logic/foundry pattern.
 */
export class SohlActor extends Actor {
    protected _speaker?: SohlSpeaker;
    protected _lifecycleActionsCache: Map<string, SohlItem>;

    constructor(data: any, options?: any) {
        super(data, options);
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
        if (fvttCallHookCancel(`sohl.actor.${this.type}.preInitialize`, this)) {
            this.logic.initialize();
        }
        fvttCallHook(`sohl.actor.${this.type}.postInitialize`, this);
    }

    getLifecycleAction(name: string): SohlItem | undefined {
        // let actionItem = this._lifecycleActionsCache.get(name);
        // if (!actionItem) {
        //     actionItem = this.items.find(
        //         (it) => it.type === ITEM_KIND.ACTION && it.name === name,
        //     ) as SohlItem | undefined;
        //     if (actionItem) {
        //         this._lifecycleActionsCache.set(name, actionItem);
        //     }
        // }
        // return actionItem;
        return undefined;
    }

    prepareEmbeddedData(): void {
        // @ts-expect-error - prepareEmbeddedData exists in FoundryVTT V13 Actor but is missing from foundry-vtt-types
        // It's called between prepareBaseData() and prepareDerivedData() in the data preparation lifecycle
        super.prepareEmbeddedData();

        const ctx = this._getContext();

        // Initialize all items
        this.items.forEach((item) => {
            if (
                fvttCallHookCancel(`sohl.${item.type}.preInitialize`, item, ctx)
            ) {
                item.logic.initialize();
            }
            fvttCallHook(`sohl.${item.type}.postInitialize`, item, ctx);

            const postInitialize = this.getLifecycleAction(
                `${item.type}.${item.system.shortcode}.postInitialize`,
            );
            if (postInitialize) {
                (postInitialize.logic as ActionLogic).execute(ctx);
            }
        });

        // Evaluate and finalize all items
        this.items.forEach((it) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preEvaluate`, it, ctx)) {
                it.logic.evaluate();
            }
            fvttCallHook(`sohl.${it.type}.postEvaluate`, it, ctx);

            const postEvaluate = this.getLifecycleAction(
                `${it.type}.${it.system.shortcode}.postEvaluate`,
            );
            if (postEvaluate) {
                (postEvaluate.logic as ActionLogic).execute(ctx);
            }
        });

        this.items.forEach((it) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preFinalize`, it, ctx)) {
                it.logic.finalize();
            }
            fvttCallHook(`sohl.${it.type}.postFinalize`, it, ctx);

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
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preEvaluate`, this, ctx)
        ) {
            this.logic.evaluate();
        }
        fvttCallHook(`sohl.actor.${this.type}.postEvaluate`, this, ctx);
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preFinalize`, this, ctx)
        ) {
            this.logic.finalize();
        }
        fvttCallHook(`sohl.actor.${this.type}.postFinalize`, this, ctx);
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
                const cloneActor = await fvttResolveUuidAsync(
                    options.cloneActorUuid,
                );
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
                        if (obj.system.initSkillMult) {
                            const sb = new SkillBase(
                                obj.system.skillBaseFormula,
                                {
                                    items: updateData.items,
                                },
                            );
                            obj.system.masteryLevelBase =
                                sb.value * obj.system.initSkillMult;
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

export interface SohlActorLogic<
    TData extends SohlDataModel.Data<SohlActor>,
> extends SohlLogic<TData> {}

/**
 * An interface representing the common data structure for all Actor types in the SoHL system.
 */
export interface SohlActorData<
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> extends SohlDataModel.Data<SohlActor, TLogic> {
    label(options?: { withName: boolean }): string;
    shortcode: string;
    dossier: HTMLString;
    appearance: HTMLString;
    portrait: FilePath;
}

/**
 * Base logic class for all actor types (Being, Cohort, Structure, Vehicle, Assembly).
 *
 * Provides the foundation that all actor logic classes build upon.
 * Concrete actor logic classes extend this to implement type-specific rules:
 * health tracking, anatomy modeling, passenger management, etc.
 *
 * @typeParam TData - The actor data interface, extending {@link SohlActorData}.
 */
export class SohlActorBaseLogic<
    TData extends SohlActorData = SohlActorData,
> extends SohlLogic<TData> {
    override initialize(): void {}
    override evaluate(): void {}
    override finalize(): void {}
}

function defineSohlActorDataSchema(): foundry.data.fields.DataSchema {
    return {
        shortcode: new StringField({
            blank: false,
            required: true,
        }),
        portrait: new FilePathField({
            categories: ["IMAGE"],
            initial: foundry.CONST.DEFAULT_TOKEN,
        }),
        appearance: new HTMLField(),
        dossier: new HTMLField(),
    };
}

type SohlActorDataSchema = ReturnType<typeof defineSohlActorDataSchema>;

export abstract class SohlActorDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlActorDataSchema,
    TLogic extends SohlActorLogic<SohlActorData> =
        SohlActorLogic<SohlActorData>,
>
    extends SohlDataModel<TSchema, SohlActor, TLogic>
    implements SohlActorData<TLogic>
{
    shortcode!: string;
    dossier!: HTMLString;
    appearance!: HTMLString;
    portrait!: FilePath;

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
        const type = this.document.type;
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
