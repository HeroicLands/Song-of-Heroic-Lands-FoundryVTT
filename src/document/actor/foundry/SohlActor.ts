/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
import { isScriptActionMutationAllowed } from "@src/entity/action/SohlAction";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { sohlCreateDialog } from "@src/document/item/foundry/SohlItem";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
import { SohlLogic } from "@src/core/logic/SohlLogic";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { fvttCallHook, fvttCallHookCancel } from "@src/core/FoundryHelpers";
import { resolveShortcodeKey } from "@src/utils/helpers";
import { ITEM_KIND } from "@src/utils/constants";

/**
 * Base class for all Actor documents in the SoHL system, including
 * Beings, Cohorts, Structures, Vehicles, and Assemblies.
 *
 * ## Lifecycle hooks
 *
 * During data preparation SoHL fires cancellable Foundry hooks around each
 * lifecycle phase, so a **module** can augment or replace actor/item behavior
 * without editing system source. Two families are emitted:
 *
 * - **Item hooks** — `sohl.<itemType>.{pre,post}{Initialize,Evaluate,Finalize}`,
 *   once per embedded item (from {@link prepareEmbeddedDocuments}). Args `(item, ctx)`.
 * - **Actor hooks** — `sohl.actor.<actorType>.{pre,post}{Initialize,Evaluate,Finalize}`,
 *   for the actor itself (the init pair from {@link prepareBaseData}, evaluate and
 *   finalize from `prepareDerivedData`). Args `(actor, ctx)` — `ctx` is
 *   omitted for the init pair.
 *
 * `ctx` is a {@link sohl.entity.action.SohlActionContext}; `<itemType>`/`<actorType>` are the type
 * strings in {@link sohl.utils.ITEM_KIND} / {@link sohl.utils.ACTOR_KIND}. The `pre*` hooks are
 * **cancellable**: if any listener returns `false`, that phase's logic method is
 * skipped and its matching `post*` hook is not fired. Phase barriers still hold
 * (every item finishes `initialize` before any `evaluate`, and so on) — see the
 * phase model on {@link sohl.core.logic.SohlLogic}.
 *
 * @example
 * // Augment every Skill after it evaluates (register from a module's init hook).
 * Hooks.on("sohl.skill.postEvaluate", (item, ctx) => {
 *     if (item.system.shortcode !== "tactics") return;
 *     item.system.logic.masteryLevel.add("tactics-bonus", 5);
 * });
 *
 * @example
 * // Replace a phase: returning false from a `pre*` hook skips the built-in logic
 * // (and suppresses the matching `post*` hook) for that document.
 * Hooks.on("sohl.skill.preEvaluate", (item, ctx) => {
 *     if (item.system.shortcode !== "tactics") return;
 *     myCustomEvaluate(item, ctx);
 *     return false; // cancel the default evaluate()
 * });
 *
 * NOTE: The Foundry-free contracts (SohlActorLogic, SohlActorData, SohlActorBaseLogic)
 * now live in src/document/actor/logic/SohlActorBaseLogic.ts and are re-exported here.
 *
 * @internal The Foundry document layer is an implementation detail; author-facing
 * code reaches the actor through the logic layer (`sohl.actorLogics`, `actor.logic`).
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
     * Dispatch a chat-card button click to this actor's logic through the shared
     * {@link sohl.document.chat.dispatchChatCardAction} chokepoint — so
     * actor-addressed card buttons (e.g. `createInjury`, the injury card's Shock
     * Roll) reach their action/method on the actor logic. Mirrors
     * {@link sohl.document.item.foundry.SohlItem.onChatCardButton} (issue #572).
     *
     * @param btn - The clicked chat-card button element.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // Only an owner of this actor (a GM owns all) may run a chat-card action
        // against it; the render-time gate is UX only and a direct or synthesized
        // call bypasses it (issue #167).
        if (!this.isOwner) return;
        await dispatchChatCardAction(this.logic, btn);
    }

    /**
     * Dispatch a chat-card edit-action (`a.edit-action`) click to this actor's
     * logic through the shared dispatch chokepoint. Mirrors
     * {@link onChatCardButton}.
     *
     * @param btn - The clicked edit-action anchor element.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        if (!this.isOwner) return;
        await dispatchChatCardAction(this.logic, btn);
    }

    /**
     * Returns a SohlSpeaker for this actor, optionally using a specific token if provided.
     * @param token - The token to use for the speaker, if any.
     * @returns The SohlSpeaker for this actor.
     */
    getSpeaker(token?: TokenDocument): SohlSpeaker {
        if (token) {
            return new SohlSpeaker({ token: token.id ?? undefined });
        }
        if (!this._speaker) {
            this._speaker = new SohlSpeaker({
                actor: this.id ?? undefined,
                token: this.getToken()?.id ?? undefined,
            });
        }
        return this._speaker;
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
     * Reset per-cycle caches and run the actor logic's initialize phase.
     *
     * @remarks
     * Clears the cached speaker and lifecycle-action cache and resets each
     * embedded item's effect-phase tracker.
     */
    override prepareBaseData(): void {
        super.prepareBaseData();
        this._speaker = undefined;
        this._lifecycleActionsCache = new Map<string, SohlItem>();
        // Reset each embedded item's effect-phase tracker for the new prep
        // cycle (mirrors Foundry's Actor#_clearData() handling on itself).
        this.items?.forEach((i: SohlItem) =>
            (i as any)._completedActiveEffectPhases?.clear?.(),
        );
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
    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();

        const ctx = (this.logic as any)._getContext();

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

        // Perform initialization phase for the actor itself
        if (fvttCallHookCancel(`sohl.actor.${this.type}.preInitialize`, this)) {
            this.logic.initialize();
        }
        fvttCallHook(`sohl.actor.${this.type}.postInitialize`, this);

        // Next, perform the initialization phase for all embedded items
        this.items.forEach((item: SohlItem) => {
            if (
                fvttCallHookCancel(`sohl.${item.type}.preInitialize`, item, ctx)
            ) {
                item.logic.initialize();
                fvttCallHook(`sohl.${item.type}.postInitialize`, item, ctx);

                const postInitialize = item.logic.actions.get("postInitialize");
                void postInitialize?.execute(ctx);
            }
        });

        // Evaluate all Active Effects on the items
        this.items.forEach((item: SohlItem) => {
            item.applyActiveEffects("initial");
        });

        // Perform the evaluate phase for the actor itself
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preEvaluate`, this, ctx)
        ) {
            this.logic.evaluate();
            fvttCallHook(`sohl.actor.${this.type}.postEvaluate`, this, ctx);
            const postEvaluate = this.logic.actions.get("postEvaluate");
            void postEvaluate?.execute(ctx);
        }

        // Next, perform the evaluate phase for all embedded items
        this.items.forEach((it: SohlItem) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preEvaluate`, it, ctx)) {
                it.logic.evaluate();
                fvttCallHook(`sohl.${it.type}.postEvaluate`, it, ctx);

                const postEvaluate = it.logic.actions.get("postEvaluate");
                void postEvaluate?.execute(ctx);
            }
        });

        // Next, perform the finalize phase for all embedded items
        this.items.forEach((it: SohlItem) => {
            if (fvttCallHookCancel(`sohl.${it.type}.preFinalize`, it, ctx)) {
                it.logic.finalize();
                fvttCallHook(`sohl.${it.type}.postFinalize`, it, ctx);

                const postFinalize = it.logic.actions.get("postFinalize");
                void postFinalize?.execute(ctx);
            }
        });

        // Finally, perform the finalize phase for the actor itself
        if (
            fvttCallHookCancel(`sohl.actor.${this.type}.preFinalize`, this, ctx)
        ) {
            this.logic.finalize();
            fvttCallHook(`sohl.actor.${this.type}.postFinalize`, this, ctx);
            const postFinalize = this.logic.actions.get("postFinalize");
            void postFinalize?.execute(ctx);
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

    /**
     * Present a dialog to create a new Actor, mirroring
     * `SohlItem.createDialog`'s progressive type → subtype flow.
     *
     * World actors have no parent, so the created document always has
     * `parent: null`. Actor types currently declare no `subType` field, so the
     * subtype control stays hidden — but the flow is shared with the item path,
     * so any future actor subtype is picked up automatically.
     *
     * @param data - Document creation data; `type` pre-seeds and locks.
     * @param createOptions - Document creation options.
     * @param options - Dialog options; `types` restricts the creatable types.
     * @param options.types - A restriction of the creatable document types.
     * @returns The created actor, or `null` if the dialog was dismissed.
     */
    static override async createDialog(
        this: any,
        data: PlainObject = {},
        createOptions: PlainObject = {},
        options: { types?: string[]; [k: string]: any } = {},
    ): Promise<any> {
        return sohlCreateDialog(
            this as any,
            data,
            { ...createOptions, parent: null },
            options,
        );
    }

    /**
     * Pre-creation hook: de-duplicate the name and resolve the actor key.
     *
     * @remarks
     * Renames the actor via {@link createUniqueName} when a same-type, same-name
     * world actor already exists (the name is a nicety, not the key), then
     * resolves the world-unique `(type, shortcode)` key: a general create that
     * collides is rejected, while an explicit duplicate (Foundry stamps
     * `_stats.duplicateSource`) auto-bumps the shortcode so the copy is created.
     * See {@link resolveShortcodeKey}. Foundry's native duplicate carries the
     * source actor's data, so no manual clone copy is performed here.
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
        const updateData: PlainObject = {};

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

        // World-unique `(type, shortcode)` key. A synthetic token actor is the
        // sole actor of its token (trivially unique); compendium-pack actors
        // keep their source key — so only world actors are resolved here.
        if (!this.pack) {
            const type = createData.type;
            const desired = (this.system as any)?.shortcode ?? "";
            const taken = new Set<string>();
            for (const actor of (game as any).actors) {
                if (actor.id !== this.id && actor.type === type) {
                    taken.add((actor.system as any)?.shortcode);
                }
            }
            const isDuplicate = !!(
                (createData as any)?._stats?.duplicateSource ??
                (this as any)?._stats?.duplicateSource
            );
            const resolved = resolveShortcodeKey(
                desired,
                (createData.name as string) ?? (this as any).name ?? "",
                type,
                taken,
                isDuplicate,
            );
            if ("reject" in resolved) {
                (globalThis as any).ui?.notifications?.warn(
                    `A ${type} actor with shortcode "${desired}" already exists.`,
                );
                return false;
            }
            if (resolved.shortcode !== desired) {
                updateData["system.shortcode"] = resolved.shortcode;
            }
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
        return undefined;
    }

    /** @inheritDoc */
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

    /**
     * Create a new embedded Active Effect on this actor. Called by the sheet's
     * effect-create control (see the {@link SohlDataModel} sheet mixin).
     *
     * @param data - Partial `ActiveEffect` creation data (name, type, img, …).
     * @returns The created effect, or `undefined` if creation did not apply.
     */
    async createEffect(
        data: Record<string, unknown> = {},
    ): Promise<SohlActiveEffect | undefined> {
        const created = await this.createEmbeddedDocuments("ActiveEffect", [
            data,
        ] as any);
        return created?.[0] as unknown as SohlActiveEffect | undefined;
    }
}

// The Foundry-free logic-layer contracts (SohlActorLogic, SohlActorData,
// SohlActorBaseLogic) live in the logic layer and are their sole namespace home
// (`sohl.document.actor.logic.*`). They are imported here for this module's own
// use only — not re-exported, so the Foundry layer does not become a second,
// canonical home for them in the API tree.
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
