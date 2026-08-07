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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import { entity } from "@src/entity/registry";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { dialog, fvttIsCurrentUserGM } from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    BRAND,
    ItemKinds,
    MOVEMENT_MEDIUM,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    isMovementMedium,
    MovementMediumChoices,
    type ItemKind,
    type MovementMedium,
} from "@src/utils/constants";
import { toFilePath, type FilePath, type HTMLString } from "@src/utils/helpers";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SohlAction } from "@src/entity/action/SohlAction";
import { SohlTriggerContext } from "@src/entity/event/event-trigger";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    selectMoveProfile,
    type MovementProfile,
} from "@src/document/actor/logic/movement";
import type {
    ItemLogicByKind,
    ItemLogicArrayByKind,
} from "@src/core/foundry/sohl-config";

/**
 * The Foundry-free foundation of the actor logic layer.
 *
 * This module owns the contracts between actor logic classes and the
 * Foundry-side data models: the {@link SohlActorLogic} and
 * {@link SohlActorData} interfaces and the {@link SohlActorBaseLogic} base
 * class. The Foundry layer (`foundry/SohlActor.ts`) implements
 * {@link SohlActorData} via `SohlActorDataModel` and re-exports these
 * symbols; logic classes import them from here so they remain loadable
 * without Foundry globals. References to the `SohlActor` document type
 * are type-only and erased at compile time.
 */

/**
 * Logic interface implemented by all actor logic classes — {@link sohl.core.logic.SohlLogic}
 * specialized for `SohlActor` data.
 */
export interface SohlActorLogic<
    TData extends SohlLogicData<SohlActor>,
> extends SohlLogic<TData> {
    /**
     * Find an embedded item's logic by its `shortcode` and item kind.
     * @typeParam K The item kind, inferred from the `type` argument.
     * @param shortcode - The item's `system.shortcode`.
     * @param type - The {@link ItemKind} to match (e.g. `ITEM_KIND.SKILL`).
     * @returns The matching item's logic typed for `type`, or `undefined`.
     */
    getItemLogic<K extends ItemKind>(
        shortcode: string,
        type: K,
    ): ItemLogicByKind[K] | undefined;

    /**
     * Find an embedded item's logic by its `shortcode` and item kind.
     * @typeParam K The item kind, inferred from the `type` argument.
     * @param id - The item's id.
     * @returns The matching item's logic typed for `type`, or `undefined`.
     */
    getItemLogic(id: string): SohlItemLogic<any> | undefined;

    /** The logic instances of every embedded item, in `items` order. */
    readonly allLogics: SohlItemLogic<any>[];

    /** Every item's logic instance grouped by item kind. */
    readonly logicTypes: ItemLogicArrayByKind;

    /** Whether the actor is owned by at least one player (non-GM) user. */
    readonly hasPlayerOwner: boolean;

    /** The active movement profile for the actor's current medium. */
    readonly moveProfile: MovementProfile;

    /** The actor's tactical move (feet per combat round) modifier. */
    readonly feetPerRound: ValueModifier;

    /** The actor's overland travel speed (leagues per watch) modifier. */
    readonly leaguesPerWatch: ValueModifier;
}

/**
 * An interface representing the common data structure for all Actor types in the SoHL system.
 * @remarks The base shape of `system` on every SoHL actor; each concrete actor type's `*Data` extends it.
 */
export interface SohlActorData<
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> extends SohlLogicData<SohlActor, TLogic> {
    /** The actor's display label; with `withName`, includes the actor's name. */
    label(options?: { withName: boolean }): string;
    /** Rich-text dossier / background notes. */
    dossier: HTMLString;
    /** Rich-text physical-appearance description. */
    appearance: HTMLString;
    /** Path to the actor's portrait image. */
    portrait: FilePath;
    /**
     * Overall health as a token-bar-shaped `{ value, max }` (both `0…100`,
     * `max` always 100). Derived every preparation and written back here by the
     * owning actor's logic — **never persisted** (see `SohlActorDataModel`). A
     * fresh actor defaults to 100/100; only Being derives it down today.
     */
    health: { value: number; max: number };
    /** The medium this actor is currently moving in (selects a profile). */
    currentMoveMedium: MovementMedium;
    /** Per-medium movement profiles persisted on this actor. */
    movementProfiles: MovementProfile[];

    // --- Foundry-document port (actor-specific) --------------------------
    // Lets actor logic iterate its items' logic and read ownership without
    // touching the Foundry actor. Implemented by `SohlActorDataModel`.

    /** The logic instance of every embedded item, in `items` order. */
    itemLogics: SohlItemLogic<any>[];
    /** Whether the actor is owned by at least one player (non-GM) user. */
    hasPlayerOwner: boolean;
}

/**
 * Base logic class for all actor types (Being, Cohort, Structure, Vehicle).
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
    /**
     * Runtime brand identifying any actor logic — inherited by every actor-kind
     * logic, so `isA(x, "SohlActorLogic")` matches across the whole hierarchy
     * (which a leaf `.kind` string can't). Never an own/serialized property.
     */
    get [BRAND.SohlActorLogic](): true {
        return true;
    }

    /**
     * The active movement profile, selected during {@link initialize} by this
     * actor's {@link SohlActorData.currentMoveMedium}. A disabled
     * {@link MOVEMENT_MEDIUM.NONE} profile when the actor has no matching
     * profile (a non-mover).
     */
    moveProfile!: MovementProfile;

    /**
     * The actor's tactical move (feet per combat round) as a
     * {@link sohl.entity.modifier.ValueModifier} so runtime modifiers (haste,
     * encumbrance, etc.) can layer on. Seeded from the active {@link moveProfile}
     * when it is enabled.
     */
    feetPerRound!: ValueModifier;

    /**
     * The actor's overland travel speed (leagues per watch) as a
     * {@link sohl.entity.modifier.ValueModifier}. Seeded from the active
     * {@link moveProfile} when it is enabled.
     */
    leaguesPerWatch!: ValueModifier;

    /**
     * Find an embedded item's logic by its `shortcode` and item kind.
     *
     * @remarks
     * Both arguments are required: a `shortcode` is only unique within a given
     * item kind, so matching the `type` as well prevents returning an
     * unexpected item that happens to share the shortcode. The item kind also
     * drives the return type — the concrete logic for that kind is resolved
     * from {@link ItemLogicByKind}, so no cast is needed at the call site:
     *
     * ```ts
     * const stealth = actor.logic.getItemLogic("stealth", ITEM_KIND.SKILL);
     * //    ^? SkillLogic | undefined
     * ```
     *
     * @typeParam K The item kind, inferred from the `type` argument.
     * @param shortcode - The item's `system.shortcode`.
     * @param type - The {@link ItemKind} to match (e.g. `ITEM_KIND.SKILL`).
     * @returns The matching item's logic typed for `type`, or `undefined` if
     *   no item matches.
     */
    getItemLogic<K extends ItemKind>(
        shortcode: string,
        type: K,
    ): ItemLogicByKind[K] | undefined;

    /**
     * Find an embedded item's logic by its `id`.
     *
     * @param id - The item's id.
     * @returns The matching item's logic or `undefined` if no item matches.
     */
    getItemLogic(id: string): SohlItemLogic<any> | undefined;

    /**
     * @inheritDoc
     * @param idOrShortcode - Item id (no `type`) or shortcode (with `type`).
     * @param type - The item kind to filter by; omit for id-based lookup.
     * @returns The matching logic instance, or `undefined` if not found.
     */
    getItemLogic(
        idOrShortcode: string,
        type?: ItemKind,
    ): SohlItemLogic<any> | undefined {
        if (type !== undefined) {
            return this.data.itemLogics.find(
                (logic) =>
                    logic.data.kind === type &&
                    logic.data.shortcode === idOrShortcode,
            );
        }
        return this.data.itemLogics.find(
            (logic) => logic.data.id === idOrShortcode,
        );
    }

    /**
     * The logic instances of every embedded item — the logic-layer analogue of
     * Foundry's {@link foundry.documents.Actor#allItems}.
     *
     * @returns One {@link SohlItemLogic} per embedded item, in `items` order.
     */
    get allLogics(): SohlItemLogic<any>[] {
        return this.data.itemLogics;
    }

    /**
     * Every item's logic instance grouped by item kind — the logic-layer
     * analogue of Foundry's {@link foundry.documents.Actor#itemTypes}.
     *
     * @remarks
     * Every {@link ItemKind} key is present; kinds with no items map to an empty
     * array. Each group is typed to the concrete logic for that kind, so
     * `logicTypes.skill` is `SkillLogic[]`.
     *
     * @returns A record of item kind → that kind's logic instances.
     */
    get logicTypes(): ItemLogicArrayByKind {
        const result = {} as Record<ItemKind, SohlItemLogic<any>[]>;
        for (const kind of ItemKinds) {
            result[kind] = [];
        }
        for (const logic of this.data.itemLogics) {
            result[logic.data.kind as ItemKind]?.push(logic);
        }
        return result as unknown as ItemLogicArrayByKind;
    }

    /** Whether the actor is owned by at least one player (non-GM) user. */
    get hasPlayerOwner(): boolean {
        return this.data.hasPlayerOwner;
    }

    /**
     * Sets up the intrinsic actions for this actor.
     * @param context - The action context to use for setup.
     */
    setupIntrinsicActions(context: SohlActionContext): void {}

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

    /** @inheritDoc */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlLogic.defineIntrinsicActions(),
            {
                shortcode: "makeDefaultMedium",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Actor.Action.makeDefaultMedium",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-person-swimming",
                executor: "makeDefaultMedium",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ];
    }

    /**
     * Set this actor's {@link SohlActorData.currentMoveMedium} — the active
     * movement profile — to the medium carried in the action scope.
     *
     * Intrinsic-action executor for the `makeDefaultMedium` action.
     *
     * @remarks
     * The Profile-tab star names the medium in scope and applies it directly.
     * Invoked any other way — from the Actions menu, a macro, a script — there
     * is no medium to apply, so the action **offers the choice** (the
     * prefer-dialog rule) rather than returning silently as it once did
     * (#1098). The prompt lists the no-movement medium plus every medium this
     * actor authors a profile for, preselected at the current one. A caller
     * that suppressed the dialog cannot be prompted, so it gets a notice
     * instead of an unexplained no-op.
     *
     * @param context - The action context; `context.scope.medium` names the
     *   {@link MovementMedium} to make current. Absent, the medium is chosen in
     *   a dialog unless `skipDialog` forbids one.
     * @returns Resolves once the actor update completes, or immediately when no
     *   medium was chosen.
     */
    async makeDefaultMedium(context: SohlActionContext): Promise<void> {
        let medium = (context.scope as PlainObject)?.medium;
        if (!isMovementMedium(medium)) {
            if (context.skipDialog) {
                sohl.log.uiWarn(
                    sohl.i18n.format("SOHL.Actor.makeDefaultMedium.noMedium", {
                        name: this.name,
                    }),
                );
                return;
            }
            medium = await this.promptMoveMedium();
            if (!isMovementMedium(medium)) return;
        }
        await this.data.update({ "system.currentMoveMedium": medium });
    }

    /**
     * Ask which movement medium to make current, listing the no-movement
     * medium plus every medium this actor authors a profile for (the same rows
     * the Profile tab stars), preselected at the current one.
     *
     * @returns The chosen {@link MovementMedium}, or `undefined` when the
     *   dialog was dismissed.
     */
    protected async promptMoveMedium(): Promise<MovementMedium | undefined> {
        // NONE first and always — an actor can be made immobile even when it
        // authors no NONE profile of its own (matching the Profile tab).
        const mediumChoices: Record<string, string> = {
            [MOVEMENT_MEDIUM.NONE]: MovementMediumChoices[MOVEMENT_MEDIUM.NONE],
        };
        for (const profile of this.data.movementProfiles ?? []) {
            mediumChoices[profile.medium] =
                MovementMediumChoices[profile.medium];
        }

        const form = (await dialog({
            title: sohl.i18n.format("SOHL.Actor.makeDefaultMedium.title", {
                name: this.name,
            }),
            template: toFilePath(
                "systems/sohl/templates/dialog/select-medium-dialog.hbs",
            ),
            data: {
                actorName: this.name,
                medium: this.data.currentMoveMedium ?? MOVEMENT_MEDIUM.NONE,
                mediumChoices,
            },
            callback: (formData: PlainObject) => ({
                medium: String(formData.medium ?? ""),
            }),
            rejectClose: false,
        })) as { medium: string } | null;

        if (!form) return undefined; // dismissed
        return isMovementMedium(form.medium) ? form.medium : undefined;
    }

    /**
     * **GM re-edit of a settled opposed contest** (#1082) — the edit pencil in
     * the Opposed Action Result card's header, and the two-sided counterpart to
     * the standard card's
     * {@link sohl.document.item.logic.SohlItemBaseLogic.resultEdit} (#856).
     *
     * Re-opens the standard test dialog for **each** side in turn, pre-filled
     * with that side's current situational and success-level modifiers, applies
     * the new values, re-evaluates the contest on **both frozen rolls** (never a
     * re-roll, no Fate cost), and reposts the Opposed Action Result card. The
     * settled contest rides in `context.scope.opposedTestResult` — the whole
     * result serialized into the pencil's `data-scope` and revived by the
     * chat-card dispatcher — so the edit acts on *that* contest.
     *
     * The contest lives only in the chat log, never on a document, so an edit
     * mutates nothing persistent: it posts a new, corrected card and leaves the
     * original standing (see the action-card consent model). Dismissing either
     * side's dialog cancels the whole edit — no re-evaluation, no repost.
     *
     * **GM-only.** The pencil is render-hidden from non-GMs
     * ({@link sohl.document.chat.gateEditActionPencil}); this is the click-time
     * half of that gate — a synthesized click from a non-GM is refused here.
     *
     * @param context - The action context; `context.scope.opposedTestResult` is
     *   the settled contest. When `skipDialog` is set, each side's new
     *   `situationalModifier` / `successLevelMod` are taken from
     *   `context.scope.source` / `context.scope.target` instead of the dialogs.
     * @returns The re-evaluated contest, or `undefined` when refused (non-GM),
     *   missing a contest, or cancelled (a dialog dismissed).
     */
    async opposedResultEdit(
        context: SohlActionContext<{
            opposedTestResult?: OpposedTestResult;
            source?: { situationalModifier?: number; successLevelMod?: number };
            target?: { situationalModifier?: number; successLevelMod?: number };
        }>,
    ): Promise<OpposedTestResult | undefined> {
        // Click-time GM gate (defense-in-depth): the render gate hides the
        // pencil from non-GMs, but a synthesized click bypasses it.
        if (!fvttIsCurrentUserGM()) {
            sohl.log.uiWarn("SOHL.ResultEdit.gmOnly");
            return undefined;
        }

        const opposed = context.scope?.opposedTestResult;
        if (!opposed) {
            sohl.log.warn(
                "opposedResultEdit invoked without an opposedTestResult in scope.",
            );
            return undefined;
        }

        // Edit each side in turn, naming the side in the dialog heading so the
        // GM can tell the two prompts apart.
        const sides = [
            {
                result: opposed.sourceTestResult,
                scope: context.scope?.source,
            },
            {
                result: opposed.targetTestResult,
                scope: context.scope?.target,
            },
        ];
        let changed = false;
        for (const side of sides) {
            const edit = await side.result.editModifiers({
                skipDialog: context.skipDialog,
                situationalModifier: side.scope?.situationalModifier,
                successLevelMod: side.scope?.successLevelMod,
                title: sohl.i18n.format(
                    "SOHL.OpposedTestResult.resultEdit.dialogTitle",
                    { name: side.result.token?.name ?? side.result.title },
                ),
            });
            // A dismissed dialog cancels the whole edit.
            if (!edit) return undefined;
            changed ||= edit.changed;
        }

        // OK-without-change on both sides is a no-op: nothing re-evaluated,
        // nothing reposted.
        if (!changed) return opposed;

        // A contest posts ONE card, so the source side's roll visibility
        // governs the repost (#1099) — the field the shared dialog offers on
        // each side would otherwise be inert here.
        opposed.rollMode = opposed.sourceTestResult.rollMode;

        // Re-evaluate both sides on their SAME frozen rolls (idempotent; never
        // re-rolls) and repost the result card with the new outcome.
        await opposed.evaluate();
        await opposed.toChat({
            template: "systems/sohl/templates/chat/opposed-result-card.hbs",
            title: sohl.i18n.localize(
                "SOHL.OpposedTestResult.toChat.resultTitle",
            ),
        });
        return opposed;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /**
     * Select the active movement profile from {@link SohlActorData.currentMoveMedium}
     * and seed the {@link feetPerRound} / {@link leaguesPerWatch} modifiers.
     *
     * @remarks Movement is a universal actor capability, so it is derived on the
     * base actor logic. Subclasses that layer encumbrance/strength effects onto
     * the selected profile (e.g. Being) must call `super.initialize()` first.
     * See {@link sohl.core.logic.SohlLogic.initialize} for the lifecycle phase.
     */
    override initialize(): void {
        this.feetPerRound = new entity.ValueModifier(this);
        this.leaguesPerWatch = new entity.ValueModifier(this);
        this.moveProfile = selectMoveProfile(
            this.data.movementProfiles,
            this.data.currentMoveMedium ?? MOVEMENT_MEDIUM.NONE,
        );
        if (!this.moveProfile.disabled) {
            this.feetPerRound.setBase(this.moveProfile.feetPerRound);
            this.leaguesPerWatch.setBase(this.moveProfile.leaguesPerWatch);
        }
    }
    /** @inheritDoc */
    override evaluate(): void {}
    /** @inheritDoc */
    override finalize(): void {}
}
