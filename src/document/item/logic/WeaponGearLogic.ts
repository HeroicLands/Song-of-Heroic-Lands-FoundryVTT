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
import {
    anyMeleeStrikeMode,
    runStrikeModeTest,
} from "@src/document/item/logic/strikeModeTest";
import {
    ACTION_SUBTYPE,
    defineType,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STATUS_EFFECT,
    STRIKE_MODE_TYPE,
} from "@src/utils/constants";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { applyWielderStrengthImpact } from "@src/document/item/logic/wielderStrength";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { applyProneMeleePenalty } from "@src/entity/strikemode/prone";
import { applyGoverningMasteryLevel } from "@src/entity/strikemode/governing";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { CombatResult } from "@src/entity/result/CombatResult";
import {
    fvttActiveCombatantForActor,
    fvttActorStatuses,
} from "@src/core/FoundryHelpers";
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

    /** The persisted strike modes as an array (never `undefined`). */
    get #strikeModeData(): StrikeModeBase.Data[] {
        return this.data.strikeModes ?? [];
    }

    /**
     * Build an `update()` payload that appends a strike mode to this weapon's
     * `strikeModes` array. The whole array is written back (never an element by
     * index — see {@link https://kb.heroiclands.org/dev/reference/runtime-contracts/ | Runtime Contracts}).
     *
     * @param strikeMode - The strike mode data to add (carries its own `shortcode`).
     * @returns An `update()` payload writing the new `system.strikeModes` array.
     * @throws If a strike mode with the same shortcode already exists on this weapon.
     */
    addStrikeModeUpdate(strikeMode: StrikeModeBase.Data): PlainObject {
        const current = this.#strikeModeData;
        if (current.some((m) => m.shortcode === strikeMode.shortcode)) {
            throw new Error(
                `Strike mode with shortcode "${strikeMode.shortcode}" already exists on this weapon.`,
            );
        }
        return { "system.strikeModes": [...current, strikeMode] };
    }

    /**
     * Build an `update()` payload that removes a strike mode by shortcode,
     * writing the whole filtered array back.
     *
     * @param shortcode - The shortcode of the strike mode to remove.
     * @returns An `update()` payload writing the reduced `system.strikeModes` array.
     */
    removeStrikeModeUpdate(shortcode: string): PlainObject {
        return {
            "system.strikeModes": this.#strikeModeData.filter(
                (m) => m.shortcode !== shortcode,
            ),
        };
    }

    /**
     * Build an `update()` payload that replaces one strike mode (matched by its
     * current shortcode) with new data, writing the whole array back. Used by
     * the editor, whose `strikeMode.shortcode` may itself have changed.
     *
     * @param currentShortcode - The shortcode identifying the element to replace.
     * @param strikeMode - The replacement strike-mode data.
     * @returns An `update()` payload writing the updated `system.strikeModes` array.
     */
    replaceStrikeModeUpdate(
        currentShortcode: string,
        strikeMode: StrikeModeBase.Data,
    ): PlainObject {
        return {
            "system.strikeModes": this.#strikeModeData.map((m) =>
                m.shortcode === currentShortcode ? strikeMode : m,
            ),
        };
    }

    /**
     * Whether this weapon exposes at least one melee strike mode — the gate the
     * block and counterstrike actions hang their visibility on (#1137). A
     * missile-only weapon (a bow, a sling) can never block or counterstrike, so
     * it must not offer them; a mixed weapon (thrust + throw) still does.
     */
    get hasMeleeStrikeMode(): boolean {
        return anyMeleeStrikeMode(this);
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
        return GearLogic.gateOnCarried([
            ...GearLogic.defineIntrinsicActions(),
            {
                shortcode: "attackTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.attackTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "ginf-broadsword",
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
                visible:
                    "itemLogic.heldBy.length > 0 && itemLogic.hasMeleeStrikeMode",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "counterstrikeTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.counterstrikeTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-circle-half-stroke",
                executor: "counterstrikeTest",
                visible:
                    "itemLogic.heldBy.length > 0 && itemLogic.hasMeleeStrikeMode",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ]);
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
        this.strikeModes = (this.data.strikeModes ?? []).map((d) =>
            d.type === STRIKE_MODE_TYPE.MELEE ?
                new entity.MeleeStrikeMode(
                    d as MeleeStrikeMode.Data,
                    this,
                    d.shortcode,
                )
            :   new entity.MissileStrikeMode(
                    d as MissileStrikeMode.Data,
                    this,
                    d.shortcode,
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
        // A prone wielder suffers −20 to all melee attacks and defenses (#562).
        const prone =
            !!this.actor &&
            fvttActorStatuses(this.actor).has(STATUS_EFFECT.PRONE);
        for (const sm of this.strikeModes) {
            if (sm instanceof MeleeStrikeMode) {
                sm.reach.add("SOHL.INFO.Reach", "Size", bodyReach);
                if (prone) applyProneMeleePenalty(sm);
            }
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        // Drive each strike mode's Atk/Blk/CX from its associated skill's
        // mastery level (#755). A weapon has no mastery level of its own, so —
        // unlike a combat technique (SkillLogic), which falls back to its own ML
        // — there is no self-fallback: a strike mode contributes only its flat
        // Atk/Blk/CX modifiers unless its `assocSkillCode` resolves to a skill on
        // the wielder. Skills are finalized in the same phase, so their mastery
        // levels are complete here (the same cross-item read SkillLogic makes).
        for (const sm of this.strikeModes) {
            const governing = resolveAssocSkill(
                this.actorLogic,
                sm.assocSkillCode,
            )?.masteryLevel;
            if (governing) applyGoverningMasteryLevel(sm, governing);
        }
        // Fold the wielder's Strength into each mode's impact (#1253). Also a
        // cross-item read — the Strength attribute's score is settled by this
        // phase — and it must follow `heldBy`, which decides the off hand.
        applyWielderStrengthImpact(this);
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
    /** Persisted strike modes, each carrying its own unique `shortcode`. */
    strikeModes: StrikeModeBase.Data[];
}
