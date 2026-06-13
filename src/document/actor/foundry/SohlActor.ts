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

import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
import type { SohlAction } from "@src/domain/action/SohlAction";
import { isScriptActionMutationAllowed } from "@src/domain/action/SohlAction";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type {
    SohlItem,
    SohlItemLogic,
} from "@src/document/item/foundry/SohlItem";
import type { FilePath, HTMLString } from "@src/utils/helpers";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SohlDataModel, defineSohlDataSchema } from "@src/core/SohlDataModel";
import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import { SkillBase } from "@src/domain/SkillBase";
import { SohlSpeaker } from "@src/core/SohlSpeaker";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import {
    fvttCallHook,
    fvttCallHookCancel,
    fvttHookOnError,
    fvttResolveUuidAsync,
    inputDialog,
    type DialogButtonCallback,
} from "@src/core/FoundryHelpers";
import { toFilePath } from "@src/utils/helpers";
import { IMPACT_ASPECT } from "@src/utils/constants";
import { resolveInjury } from "@src/domain/body/InjuryResolution";
import {
    parseInjuryRequest,
    isAutomatedRequest,
    readInjuryDialogForm,
    buildInjuryCardData,
    resolveAutomatedInjury,
    getActorBodyStructure,
    createTraumaFromInjury,
    type InjuryDialogForm,
} from "@src/document/actor/foundry/injury-actions";
import type { ResolvedInjury } from "@src/domain/body/InjuryResolution";
import type { SohlTriggerContext } from "@src/core/SohlEventTrigger";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

/**
 * Base class for all Actor documents in the SoHL system, including
 * Beings, Cohorts, Structures, Vehicles, and Assemblies.
 *
 * NOTE: The Foundry-free contracts (SohlActorLogic, SohlActorData, SohlActorBaseLogic)
 * now live in src/document/actor/logic/SohlActorBaseLogic.ts and are re-exported here.
 * TODO: The remaining Foundry-coupled contents (SohlActor Document, SohlActorDataModel,
 * SohlActorSheetBase) could still be split into separate files per concern.
 */
export class SohlActor extends Actor {
    protected _speaker?: SohlSpeaker;
    protected _lifecycleActionsCache: Map<string, SohlItem>;

    /**
     * Constructs a SohlActor and initializes its lifecycle-actions cache.
     * @param data - Foundry actor source data.
     * @param options - Foundry document construction options.
     */
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
    protected static _getContextOptions(
        doc: SohlActor,
    ): SohlContextMenu.Entry[] {
        return doc.getContextOptions();
    }

    /**
     * The context-menu options — the actions currently available — for this
     * actor.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the actor.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic.getContextOptions();
    }

    /**
     * Helper method to handle chat card button clicks.
     * @param btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        const actionName = btn.dataset.action;
        if (!actionName) return;

        // `createInjury` is handled directly (it posts an injury rather than
        // running an intrinsic action).
        if (actionName === "createInjury") {
            await this.onCreateInjury(btn);
            return;
        }

        // Otherwise dispatch generically to the actor's logic — the same shape
        // SohlItem uses — so defender chat-card actions (e.g. the automated
        // combat defenses) reach their intrinsic-action methods. The button's
        // dataset becomes the action's `scope`.
        const context = new SohlActionContext({
            speaker: this.logic.speaker,
            type: actionName,
            title: btn.textContent?.trim() ?? actionName,
            scope: { ...btn.dataset },
        });

        const action =
            this.logic.actions.get(actionName) ??
            [...this.logic.actions.values()].find(
                (act) =>
                    act.data.executor === actionName ||
                    act.data.title === actionName,
            );

        if (action) {
            await action.execute(context);
            return;
        }

        const fn = (this.logic as any)[actionName];
        if (typeof fn === "function") {
            await fn.call(this.logic, context);
        } else {
            sohl.log.warn(
                `SoHL | ${this.name} (Actor) received unhandled chat-card action "${actionName}".`,
            );
        }
    }

    /**
     * Resolve and post an injury from a chat-card `createInjury` click. The
     * forward-carried `data-test-result-json` discriminates the two modes:
     * an automated request (aimed `targetPart` + `spread`) resolves with no
     * player input; an assisted request opens the Add Injury dialog so the GM
     * can pick the location and tune armor reduction.
     * @param btn - The clicked chat-card button carrying the injury request.
     */
    private async onCreateInjury(btn: HTMLElement): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} has no Lineage body structure; cannot resolve an injury.`,
            );
            return;
        }

        const req = parseInjuryRequest(btn.dataset.testResultJson);
        if (!req) {
            sohl.log.uiWarn(
                `SoHL | createInjury button on ${this.name} carried no valid injury request.`,
            );
            return;
        }

        // Automated: aim was forwarded, so resolve and record with no dialog.
        if (isAutomatedRequest(req)) {
            const injury = resolveAutomatedInjury(req, body);
            await this.postInjury(injury, injury.level >= 1);
            if (injury.level >= 1) await createTraumaFromInjury(this, injury);
            return;
        }

        // Assisted: let the player confirm location, aspect, impact, and armor.
        await this.addInjuryViaDialog({
            location: req.location ?? "",
            aspect: req.aspect,
            impact: req.impact,
            armorReduction: req.armorReduction ?? 0,
            extraBleedRisk: !!req.extraBleedRisk,
        });
    }

    /**
     * Open the Add Injury dialog, resolve the player's input into an injury,
     * post the injury card, and (when requested) record the Trauma. Shared by
     * the assisted-combat `createInjury` flow and the character sheet's manual
     * Add Injury action. Pre-fills the dialog from `prefill`; an empty prefill
     * yields a blank manual-entry dialog.
     * @param prefill - Initial values to pre-fill the dialog with.
     * @param prefill.location - The hit-location shortcode.
     * @param prefill.aspect - The weapon impact aspect.
     * @param prefill.impact - The raw impact total.
     * @param prefill.armorReduction - Manual armor reduction.
     * @param prefill.extraBleedRisk - Force the wound to bleed.
     */
    async addInjuryViaDialog(
        prefill: {
            location?: string;
            aspect?: string;
            impact?: number;
            armorReduction?: number;
            extraBleedRisk?: boolean;
        } = {},
    ): Promise<void> {
        const body = getActorBodyStructure(this);
        if (!body) {
            sohl.log.uiWarn(
                `${this.name} has no Lineage body structure; cannot add an injury.`,
            );
            return;
        }

        const dialogData = {
            hitLocations: body
                .getAllLocations()
                .map((l) => ({ code: l.shortcode, name: l.name })),
            aspectChoices: Object.values(IMPACT_ASPECT),
            location: prefill.location ?? "",
            aspect: prefill.aspect ?? "",
            impactVal: prefill.impact ?? 0,
            armorReduction: prefill.armorReduction ?? 0,
            extraBleedRisk: !!prefill.extraBleedRisk,
            addToCharSheet: true,
            askRecordInjury: true,
        };

        const result = await inputDialog({
            title: `${this.name}: Add Injury`,
            template: toFilePath(
                "systems/sohl/templates/dialog/injury-dialog.hbs",
            ),
            data: dialogData,
            callback: ((
                _event: PointerEvent | SubmitEvent,
                button: HTMLButtonElement,
            ): Promise<InjuryDialogForm | null> => {
                const form = button.querySelector("form");
                if (!form) return Promise.resolve(null);
                const fd = new FormDataExtended(form);
                return Promise.resolve(readInjuryDialogForm(fd.object));
            }) as DialogButtonCallback,
            rejectClose: false,
        });
        if (!result) return;

        const form = result as InjuryDialogForm;
        const location = body
            .getAllLocations()
            .find((l) => l.shortcode === form.locationCode);
        const injury = resolveInjury({
            impact: form.impact,
            aspect: form.aspect,
            body,
            location,
            armorReduction: form.armorReduction,
            extraBleedRisk: form.extraBleedRisk,
        });
        await this.postInjury(injury, form.addToCharSheet);
        if (form.addToCharSheet && injury.level >= 1)
            await createTraumaFromInjury(this, injury);
    }

    /**
     * Post an `injury-card` to chat for a resolved injury on this actor.
     * @param injury - The resolved injury to render.
     * @param addToCharSheet - Whether the injury was recorded on the sheet.
     */
    private async postInjury(
        injury: ResolvedInjury,
        addToCharSheet: boolean,
    ): Promise<void> {
        const data = buildInjuryCardData(injury, {
            actorId: this.id,
            handlerActorUuid: this.uuid,
            name: this.name ?? "",
            addToCharSheet,
        });
        await this.getSpeaker().toChat(
            toFilePath("systems/sohl/templates/chat/injury-card.hbs"),
            data,
        );
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
     * Handle a trigger dispatched by the SoHL event queue.
     * Override in subclasses to implement actor-specific trigger handling.
     * @param kind - Subscription kind identifier
     * @param _context - Trigger context (discriminated by `context.name`)
     * @param _payload - Optional context data attached when subscribing
     */
    async handleSohlEvent(
        kind: string,
        _context: SohlTriggerContext,
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
            return this.token as SohlTokenDocument; // TokenDocument
        }

        // Case 2: linked actor -> find an active-scene token linked to this actor
        const scene = canvas?.scene;
        if (!scene) return null;

        const linkedTokens = scene.tokens.filter(
            (td) => td.actorLink && td.actorId === this.id,
        );

        return (linkedTokens[0] as SohlTokenDocument) ?? null;
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

    /**
     * Reset per-cycle caches and run the actor logic's initialize phase.
     *
     * @remarks
     * Clears the cached speaker and lifecycle-action cache and resets each
     * embedded item's effect-phase tracker, then — unless cancelled by the
     * `sohl.actor.<type>.preInitialize` hook — calls {@link logic}'s `initialize`
     * and fires `postInitialize`. Part of Foundry's data-preparation lifecycle.
     */
    override prepareBaseData(): void {
        super.prepareBaseData();
        this._speaker = undefined;
        this._lifecycleActionsCache = new Map<string, SohlItem>();
        // Reset each embedded item's effect-phase tracker for the new prep
        // cycle (mirrors Foundry's Actor#_clearData() handling on itself).
        this.items?.forEach((i) =>
            (i as any)._completedActiveEffectPhases?.clear?.(),
        );
        if (fvttCallHookCancel(`sohl.actor.${this.type}.preInitialize`, this)) {
            this.logic.initialize();
        }
        fvttCallHook(`sohl.actor.${this.type}.postInitialize`, this);
    }

    /**
     * Effects living on owned items whose `targets` include this actor.
     * Phaseless; the caller filters by `change.phase` when iterating changes.
     * @returns The active effects transferred onto this actor.
     */
    transferredActiveEffects(): SohlActiveEffect[] {
        const out: SohlActiveEffect[] = [];
        for (const item of this.items.values() as Iterable<SohlItem>) {
            for (const effect of item.effects.values() as Iterable<SohlActiveEffect>) {
                if (effect.targets.includes(this)) out.push(effect);
            }
        }
        return out;
    }

    /**
     * All effects applicable to this actor: own effects whose `targets`
     * include this actor (scope `"this"` or `"actor"`), plus item-owned
     * effects whose scope targets this actor. Replaces Foundry's
     * transfer-flag-driven generator with scope-driven inclusion.
     */
    override *allApplicableEffects(): Generator<SohlActiveEffect> {
        for (const effect of this.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) yield effect;
        }
        for (const effect of this.transferredActiveEffects()) yield effect;
    }

    /**
     * Run the **phase-batched lifecycle** across all embedded items.
     *
     * @remarks
     * Foundry prepares each embedded item fully before the next, so siblings
     * cannot depend on one another. This override instead runs three passes over
     * all items — initialize, then evaluate, then finalize — each gated by
     * `sohl.<itemType>.pre|post<Phase>` hooks and matching per-phase action
     * items, and applies items' Active Effects between initialize and evaluate.
     * Because of this, items' own `prepare*` methods must not be overridden. See
     * the Lifecycle Model documentation.
     */
    prepareEmbeddedData(): void {
        // @ts-expect-error - prepareEmbeddedData exists in FoundryVTT V13 Actor but is missing from foundry-vtt-types
        // It's called between prepareBaseData() and prepareDerivedData() in the data preparation lifecycle
        super.prepareEmbeddedData();

        const ctx = this._getContext();

        /*
         * Here we implement the phase-batched lifecycle for all embedded items
         * in three phases: initialize, evaluate, and finalize.
         *
         * Each phase runs across all items before moving to the next phase.
         * Within each phase, we first call the pre-phase hooks for each item,
         * then execute the phase method on the item's logic, and finally call
         * the post-phase hooks for each item.
         *
         * The hooks here are per item type, not per individual item, and are
         * passed in the specific item being processed and context.
         *
         * NOTE: The implication here is that the normal prepare* methods on items
         * must not be overriden; they are not used for the item lifecycle.
         */

        // Phase I: Initialize all embedded items
        this.items.forEach((item) => {
            if (
                fvttCallHookCancel(`sohl.${item.type}.preInitialize`, item, ctx)
            ) {
                item.logic.initialize();
                fvttCallHook(`sohl.${item.type}.postInitialize`, item, ctx);

                const postInitialize = item.logic.actions.get("postInitialize");
                postInitialize?.execute(ctx);
            }
        });

        // Evaluate all Active Effects on the items
        this.items.forEach((item) => {
            item.applyActiveEffects("initial");
        });

        // Phase II: Evaluate all embedded items
        this.items.forEach((it) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preEvaluate`, it, ctx)) {
                it.logic.evaluate();
                fvttCallHook(`sohl.${it.type}.postEvaluate`, it, ctx);

                const postEvaluate = it.logic.actions.get("postEvaluate");
                postEvaluate?.execute(ctx);
            }
        });

        // Phase III: Finalize all embedded items
        this.items.forEach((it) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preFinalize`, it, ctx)) {
                it.logic.finalize();
                fvttCallHook(`sohl.${it.type}.postFinalize`, it, ctx);

                const postFinalize = it.logic.actions.get("postFinalize");
                postFinalize?.execute(ctx);
            }
        });
    }

    /**
     * Run the actor logic's evaluate and finalize phases after items are
     * prepared.
     *
     * @remarks
     * Each phase is gated by its `sohl.actor.<type>.pre<Phase>` hook and followed
     * by the matching `post<Phase>` hook. Part of Foundry's data-preparation
     * lifecycle.
     */
    override prepareDerivedData(): void {
        super.prepareDerivedData();
        const ctx = this._getContext();
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preEvaluate`, this, ctx)
        ) {
            this.logic.evaluate();
            fvttCallHook(`sohl.actor.${this.type}.postEvaluate`, this, ctx);
        }
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preFinalize`, this, ctx)
        ) {
            this.logic.finalize();
            fvttCallHook(`sohl.actor.${this.type}.postFinalize`, this, ctx);
        }
    }

    /**
     * Produce a name unique among existing world actors by appending a numeric
     * suffix (`Name (2)`, `Name (3)`, …) when the base name is already taken.
     *
     * @param baseName - The desired name.
     * @returns A name not currently used by any world actor.
     * @throws If `baseName` is empty.
     */
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

    /**
     * Pre-creation hook: de-duplicate the name and seed cloned-actor data.
     *
     * @remarks
     * Renames the actor via {@link createUniqueName} when a same-type, same-name
     * world actor already exists; and, when created with items (a duplicate) and
     * an `options.cloneActorUuid`, copies the source actor's data and default
     * artwork.
     * @param createData - The pending actor source data.
     * @param options - Document creation options.
     * @param user - The user requesting creation.
     * @returns `false` to veto creation, otherwise `true`.
     */
    protected override async _preCreate(
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
        }

        this.updateSource(updateData);

        return true;
    }

    /**
     * Authoring gate: block non-GM users from adding, removing, or modifying
     * SCRIPT entries in `system.actionDefs`. SCRIPT actions run
     * unsandboxed JavaScript, so authorship is restricted to the GM.
     * Intrinsic actions and non-actionDefs updates are unaffected.
     * @param changes - The changes about to be applied.
     * @param options - Foundry update options.
     * @param user - The user attempting the update.
     * @returns `false` to cancel the update, otherwise delegates to super.
     */
    protected override async _preUpdate(
        changes: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preUpdate(
            changes as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        const newActionDefs = (changes as any)?.system?.actionDefs;
        if (newActionDefs !== undefined) {
            const oldActionDefs = (this.system as any)?.actionDefs;
            if (
                !isScriptActionMutationAllowed(
                    oldActionDefs,
                    newActionDefs,
                    user,
                )
            ) {
                sohl.log.warn(
                    `Refusing actionDefs update on "${this.name}": only the GM may modify SCRIPT action entries.`,
                    { actor: this.id, user: (user as any)?.id },
                );
                (globalThis as any).ui?.notifications?.warn?.(
                    "Only the GM can modify scripted actions on this actor.",
                );
                return false;
            }
        }
    }

    /**
     * Post-creation hook; delegates to Foundry's base `_onCreate`.
     * @param data - The created actor source data.
     * @param options - Document creation options.
     * @param userId - The id of the user that created the actor.
     */
    protected override _onCreate(
        data: PlainObject,
        options: any,
        userId: string,
    ) {
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
}

/*
 * The Foundry-free logic-layer contracts (SohlActorLogic, SohlActorData,
 * SohlActorBaseLogic) live in the logic layer; they are re-exported here so
 * Foundry-side consumers can keep importing them from this module.
 */
export {
    SohlActorBaseLogic,
    type SohlActorLogic,
    type SohlActorData,
} from "@src/document/actor/logic/SohlActorBaseLogic";
import type {
    SohlActorLogic,
    SohlActorData,
} from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * Builds the base actor data schema (portrait, appearance, dossier).
 * @returns The base actor data schema.
 */
function defineSohlActorDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...defineSohlDataSchema(),
        portrait: new FilePathField({
            categories: ["IMAGE"],
            initial: foundry.CONST.DEFAULT_TOKEN,
        }),
        appearance: new HTMLField(),
        dossier: new HTMLField(),
        /**
         * The {@link CombatantGroup} name this actor's combatants are auto-
         * assigned to when they enter combat (blank → the default group). Read
         * by `SohlCombat.seedCombatantGroups` at combatant creation. Lives on the
         * actor (not the token) because tokens cannot carry typed system data.
         */
        defaultCombatGroup: new foundry.data.fields.StringField({
            required: false,
            blank: true,
            initial: "",
        }),
    };
}

type SohlActorDataSchema = ReturnType<typeof defineSohlActorDataSchema>;

/**
 * Base persisted data model for all actor types — defines the common schema
 * (portrait, appearance, dossier) and label helpers. Concrete actor data models
 * extend this with their type-specific fields.
 *
 * @typeParam TSchema - The Foundry data schema for this model.
 * @typeParam TLogic - The actor logic type this data drives.
 * @internal
 */
export abstract class SohlActorDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlActorDataSchema,
    TLogic extends SohlActorLogic<SohlActorData> =
        SohlActorLogic<SohlActorData>,
>
    extends SohlDataModel<TSchema, SohlActor, TLogic>
    implements SohlActorData<TLogic>
{
    /** Rich-text dossier / background notes. */
    dossier!: HTMLString;
    /** Rich-text physical-appearance description. */
    appearance!: HTMLString;
    /** Path to the actor's portrait image. */
    portrait!: FilePath;
    /**
     * The {@link CombatantGroup} name this actor's combatants are auto-assigned
     * to on entering combat; blank uses the default group.
     */
    defaultCombatGroup!: string;

    /**
     * Constructs the actor data model, requiring a {@link SohlActor} parent.
     * @param data - Source data for the model.
     * @param options - Must provide `options.parent` as a {@link SohlActor}.
     * @throws If the parent is not a {@link SohlActor}.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent instanceof SohlActor)) {
            throw new Error("Parent must be of type SohlActor");
        }
        super(data, options);
    }

    /** The owning {@link SohlActor}. */
    get actor(): SohlActor {
        return this.parent;
    }

    /**
     * The logic instance of every embedded item — the single Foundry-coupled
     * accessor the actor logic layer iterates through ({@link SohlActorData}
     * port). The pure `allLogics` / `logicTypes` / `getItemLogic` getters on the
     * actor logic derive everything from this list.
     */
    get itemLogics(): SohlItemLogic<any>[] {
        return this.parent.items.map((it) => it.logic);
    }

    /** Whether the actor is owned by at least one player (non-GM) user. */
    get hasPlayerOwner(): boolean {
        return this.parent.hasPlayerOwner ?? false;
    }

    /** Localization key prefix for this actor kind (e.g. `SOHL.Actor.being`). */
    get i18nPrefix(): string {
        return `SOHL.Actor.${this.kind}`;
    }

    /**
     * The localized type label for this actor; with `withName`, combined with
     * the actor's name.
     * @param options - Label-formatting options.
     * @param options.withName - Whether to combine the type with the actor name.
     * @returns The localized label.
     */
    label(
        options: { withName: boolean } = {
            withName: true,
        },
    ): string {
        let result = sohl.i18n.localize(`SOHL.${this.kind}.typelabel`);
        if (options.withName) {
            result = sohl.i18n.format("SOHL.SohlActor.labelWithName", {
                name: this.parent.name,
                type: result,
            });
        }
        return result;
    }

    /**
     * Define the common actor data schema (portrait, appearance, dossier).
     * @returns The base actor data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlActorDataSchema();
    }
}

// Define the base type for the sheet
const SohlActorSheetBase_Base = SohlDataModel.SheetMixin<
    SohlActor,
    typeof foundry.applications.api.DocumentSheetV2<SohlActor>
>(foundry.applications.api.DocumentSheetV2<SohlActor>);

/**
 * Base application sheet for all actor types. Provides the shared render parts
 * (header, tabs, facade), the per-part context hooks, and list filtering.
 * Concrete actor sheets extend this and override the `_prepare*Context` hooks.
 * @internal
 */
export abstract class SohlActorSheetBase extends SohlActorSheetBase_Base {
    /** The {@link SohlActor} this sheet renders (narrowed from the base type). */
    override get document(): SohlActor {
        return super.document as SohlActor;
    }

    /** The {@link SohlActor} this sheet renders, or `null`. */
    get actor(): SohlActor | null {
        return (this.document as any).actor;
    }

    /**
     * Register the actor sheet's render parts: `header`, `tabs`, and `facade`.
     * @param options - The render options to populate with the sheet parts.
     */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        // All actor sheets have these parts
        options.parts = ["header", "tabs", "facade"];
    }

    /**
     * Build the render context shared across all sheet parts.
     * @param options - Sheet render options.
     * @returns The shared render context.
     */
    protected override async _prepareContext(
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

    /**
     * Dispatch to the per-part context builder (`header` / `tabs` / `facade`)
     * and fire the matching `sohl.actor.<type>.prepare*Context` hooks.
     *
     * @param partId - The render part being prepared.
     * @param context - The in-progress render context.
     * @param options - Foundry render options.
     * @returns The render context for the given part.
     */
    protected async _preparePartContext(
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

    /**
     * Build the `header` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The header part context.
     */
    protected async _prepareHeaderContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Build the `tabs` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The tabs part context.
     */
    protected async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Build the `facade` part's render context. Override in subclasses; the base returns it unchanged.
     * @param context - The in-progress render context.
     * @param options - Sheet render options.
     * @returns The facade part context.
     */
    protected async _prepareFacadeContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /**
     * Show or hide item rows in the sheet content based on a search query,
     * matching each row's normalized item name against the query or regex.
     * @param event - The triggering keyboard event, if any.
     * @param query - The raw search query text.
     * @param rgx - The regular expression to match item names against.
     * @param content - The container element holding the item rows.
     */
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
