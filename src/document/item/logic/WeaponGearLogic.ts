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

import { entity } from "@src/entity/registry";
import { GearLogic, GearData } from "@src/document/item/logic/GearLogic";
import { runStrikeModeTest } from "@src/document/item/logic/strikeModeTest";
import {
    ACTION_SUBTYPE,
    defineType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STRIKE_MODE_TYPE,
} from "@src/utils/constants";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { CombatResult } from "@src/entity/result/CombatResult";
import { fvttActiveCombatantForActor } from "@src/core/FoundryHelpers";
import { AutomatedCombat } from "@src/document/combatant/logic/SohlCombatantLogic";
import { SohlAction, SohlActionContext } from "@src/entity/action";
import { SuccessTestResult } from "@src/entity/result";
import { BodyPart } from "@src/entity/body/BodyPart";

/**
 * A weapon that can be wielded in combat.
 *
 * Weapon Gear represents a physical weapon: swords, axes, bows, maces, daggers,
 * and similar. The weapon itself is primarily a container; the actual attack
 * capabilities are defined by the strike modes.
 *
 * @typeParam TData - The WeaponGear data interface.
 */
export class WeaponGearLogic<
    TData extends WeaponGearData = WeaponGearData,
> extends GearLogic<TData> {
    /** Strike mode domain objects, constructed from persisted data. */
    strikeModes!: StrikeModeBase[];
    /** Weapon encumbrance */
    encumbrance!: ValueModifier;
    /** Weapon heft */
    heft!: ValueModifier;

    /* --------------------------------------------- */
    /* Strike mode helpers                           */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a strike mode under a new id.
     *
     * @param strikeMode - The strike mode data to add.
     * @param id - Optional id; a fresh `randomID()` is generated when omitted.
     * @returns An `update()` payload writing the strike mode under `system.strikeModes.<id>`.
     * @throws If a strike mode with the same id already exists on this weapon.
     */
    addStrikeModeUpdate(
        strikeMode: StrikeModeBase.Data,
        id: string = foundry.utils.randomID(),
    ): PlainObject {
        if (this.data.strikeModes[id]) {
            throw new Error(
                `Strike mode with id "${id}" already exists on this weapon.`,
            );
        }
        return { [`system.strikeModes.${id}`]: strikeMode };
    }

    /**
     * Build an `update()` payload that removes a strike mode by id, using
     * Foundry's `-=` deletion key syntax for object fields.
     *
     * @param id - The id of the strike mode to remove.
     * @returns An `update()` payload deleting `system.strikeModes.<id>`.
     */
    removeStrikeModeUpdate(id: string): PlainObject {
        return { [`system.strikeModes.-=${id}`]: null };
    }

    /**
     * Build an `update()` payload that applies a partial update to a single
     * strike mode, leaving other strike modes untouched.
     *
     * @param id - The id of the strike mode to update.
     * @param partial - The fields to change on that strike mode.
     * @returns An `update()` payload writing each changed field under `system.strikeModes.<id>`.
     */
    updateStrikeModeUpdate(
        id: string,
        partial: Partial<StrikeModeBase.Data>,
    ): PlainObject {
        const update: PlainObject = {};
        for (const [key, value] of Object.entries(partial)) {
            update[`system.strikeModes.${id}.${key}`] = value;
        }
        return update;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Perform an assisted attack with one of this weapon's strike modes.
     *
     * Thin wrapper over the shared {@link runStrikeModeTest}: the strike mode is
     * resolved from `context.scope.strikeModeId` (auto-selected when the weapon
     * has only one, otherwise prompted), and the roll runs with `context` so its
     * speaker/title/`skipDialog` propagate.
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no strike mode could be resolved.
     */
    async attackTest(
        context: SohlActionContext<Partial<WeaponGearLogic.ContextScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "attack", context);
    }

    /**
     * Perform an assisted block with one of this weapon's strike modes. A block
     * requested on a non-melee mode resolves to `false` (see
     * {@link runStrikeModeTest}, via its `selectStrikeModeModifier` mapping).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async blockTest(
        context: SohlActionContext<Partial<WeaponGearLogic.ContextScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "block", context);
    }

    /**
     * Perform an assisted counterstrike with one of this weapon's strike modes.
     * A counterstrike requested on a non-melee mode resolves to `false` (see
     * {@link runStrikeModeTest}, via its `selectStrikeModeModifier` mapping).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async counterstrikeTest(
        context: SohlActionContext<Partial<WeaponGearLogic.ContextScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "counterstrike", context);
    }

    /**
     * Define and return all intrinsic actions for skill logic.
     *
     * @returns The intrinsic action definitions, including those inherited from the base logic.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...GearLogic.defineIntrinsicActions(),
            {
                shortcode: "attackTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.attackTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-sword",
                executor: "attackTest",
                visible: "itemLogic.heldBy.length > 0",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "blockTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.blockTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-shield",
                executor: "blockTest",
                visible: "itemLogic.heldBy.length > 0",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "counterstrikeTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.counterstrikeTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-circle-half-stroke",
                executor: "counterstrikeTest",
                visible: "itemLogic.heldBy.length > 0",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.encumbrance = new entity.ValueModifier(this).setBase(
            this.data.encumbranceBase,
        );
        this.heft = new entity.ValueModifier(this).setBase(this.data.heftBase);
        this.strikeModes = Object.entries(this.data.strikeModes ?? {}).map(
            ([id, d]) =>
                d.type === STRIKE_MODE_TYPE.MELEE ?
                    new entity.MeleeStrikeMode(
                        d as MeleeStrikeMode.Data,
                        this,
                        id,
                    )
                :   new entity.MissileStrikeMode(
                        d as MissileStrikeMode.Data,
                        this,
                        id,
                    ),
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        // A melee mode's reach is its weapon length (the reach base) plus the
        // wielder's body reach. A non-Being wielder (or an incorporeal one) has
        // no body, so reach stays at length alone.
        const bodyReach = getActorBody(this.actorLogic)?.reach.effective ?? 0;
        for (const sm of this.strikeModes) {
            if (sm instanceof MeleeStrikeMode) {
                sm.reach.add("SOHL.INFO.Reach", "Size", bodyReach);
            }
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export namespace WeaponGearLogic {
    export interface ContextScope {
        strikeModeId: string;
    }
}

/**
 * Persisted data backing {@link WeaponGearLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `weapongear` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "weapongear"`. The backing DataModel implements this interface.
 */
export interface WeaponGearData<
    TLogic extends WeaponGearLogic<WeaponGearData> = WeaponGearLogic<any>,
> extends GearData<TLogic> {
    /** Encumbrance value of the weapon */
    encumbranceBase: number;
    /** Heft of the weapon */
    heftBase: number;
    /** Persisted strike modes, keyed by Foundry-style id. */
    strikeModes: StrictObject<StrikeModeBase.Data>;
}
