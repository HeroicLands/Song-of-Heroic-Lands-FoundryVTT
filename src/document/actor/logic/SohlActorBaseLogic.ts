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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItemLogic } from "@src/document/item/foundry/SohlItem";
import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import { BRAND, ItemKinds, type ItemKind } from "@src/utils/constants";
import type { FilePath, HTMLString } from "@src/utils/helpers";
import { SohlTriggerContext } from "@src/entity/event/event-trigger";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
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
 * without Foundry globals. References to the {@link sohl.document.actor.foundry.SohlActor} document type
 * are type-only and erased at compile time.
 */

/**
 * Logic interface implemented by all actor logic classes — {@link sohl.core.logic.SohlLogic}
 * specialized for {@link sohl.document.actor.foundry.SohlActor} data.
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

    // --- Foundry-document port (actor-specific) --------------------------
    // Lets actor logic iterate its items' logic and read ownership without
    // touching the Foundry actor. Implemented by `SohlActorDataModel`.

    /** The logic instance of every embedded item, in `items` order. */
    itemLogics: SohlItemLogic<any>[];
    /** Whether the actor is owned by at least one player (non-GM) user. */
    hasPlayerOwner: boolean;
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
    /**
     * Runtime brand identifying any actor logic — inherited by every actor-kind
     * logic, so `isA(x, "SohlActorLogic")` matches across the whole hierarchy
     * (which a leaf `.kind` string can't). Never an own/serialized property.
     */
    get [BRAND.SohlActorLogic](): true {
        return true;
    }

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

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritDoc */
    override initialize(): void {}
    /** @inheritDoc */
    override evaluate(): void {}
    /** @inheritDoc */
    override finalize(): void {}
}
