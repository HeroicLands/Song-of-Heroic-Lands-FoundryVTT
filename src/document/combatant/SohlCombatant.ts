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
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { getCanvas } from "@src/core/FoundryHelpers";
import {
    areCombatantsEnemies,
    isThreatening,
    THREAT_NEGATING_STATUSES,
    computeMove,
    chooseInitialDisplayedMedium,
} from "./combatant-logic";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementMedium,
    MovementMediums,
} from "@src/utils/constants";

/** A reference to a specific strike mode on an item: `{ itemId, smId }`. */
export interface StrikeModeRef {
    /** Id of the item carrying the strike mode. */
    itemId: string;
    /** Id of the strike mode on that item. */
    smId: string;
}

/**
 * SoHL's Combatant document. Adds strike-mode memory (last attack/block) and
 * threat queries on top of Foundry's combatant.
 */
export class SohlCombatant<
    SubType extends Combatant.SubType = Combatant.SubType,
> extends Combatant<SubType> {
    /** This combatant's actor as a {@link SohlActor}, or `null`. */
    override get actor(): SohlActor | null {
        return super.actor as SohlActor | null;
    }

    /** The strike mode last used to attack, or `null` (combat-scoped). */
    get lastAttackMode(): StrikeModeRef | null {
        return (this.system as SohlCombatantDataModel).lastAttackMode;
    }

    /** The strike mode last used to block, or `null` (combat-scoped). */
    get lastBlockMode(): StrikeModeRef | null {
        return (this.system as SohlCombatantDataModel).lastBlockMode;
    }

    /**
     * Remember the strike mode just used to attack (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordAttackMode(itemId: string, smId: string): Promise<void> {
        await this.update({
            "system.lastAttackMode": { itemId, smId },
        } as any);
    }

    /**
     * Remember the strike mode just used to block (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordBlockMode(itemId: string, smId: string): Promise<void> {
        await this.update({
            "system.lastBlockMode": { itemId, smId },
        } as any);
    }

    /**
     * The id of this combatant's `CombatantGroup`, or `null` when ungrouped.
     *
     * @remarks
     * `_source.group` is the canonical stored id. Core's `_prepareGroup()`
     * reassigns the derived `this.group` to the resolved `CombatantGroup`
     * document when it resolves, but leaves it as the raw id (or null)
     * otherwise — so reading `_source` avoids that heterogeneity.
     */
    get groupId(): string | null {
        const src = (this as any)._source?.group;
        if (typeof src === "string" && src) return src;
        const g = (this as any).group;
        if (g && typeof g === "object" && typeof g.id === "string") return g.id;
        if (typeof g === "string" && g) return g;
        return null;
    }

    /**
     * An array of combatants which are considered allies of this combatant:
     * the other combatants sharing this one's (non-null) `CombatantGroup`.
     * The inverse of {@link isEnemyOf}.
     */
    get allies(): SohlCombatant[] {
        if (!this.combat) return [];
        if (!this.groupId) return [];

        return this.combat.combatants.contents.filter(
            (combatant: SohlCombatant) =>
                combatant !== this && !this.isEnemyOf(combatant),
        ) as SohlCombatant[];
    }

    /**
     * Pure relational predicate: two combatants are enemies iff they belong to
     * different `CombatantGroup`s. A combatant is never its own enemy, and an
     * absent group on either side is treated defensively as enemy.
     *
     * Reads only already-loaded combatant fields — no Foundry API calls.
     *
     * @param other - The combatant to compare against.
     * @returns `true` if the two combatants are enemies.
     */
    isEnemyOf(other: SohlCombatant): boolean {
        return areCombatantsEnemies(
            this.groupId,
            other.groupId,
            other === this,
        );
    }

    /**
     * An array of combatants which are currently threatening this combatant.
     * A combatant `c` threatens this one iff it is an enemy that is not
     * defeated, not incapacitated (see {@link THREAT_NEGATING_STATUSES}),
     * not hidden, and within weapon reach. This is useful for various combat
     * mechanics, such as determining if a combatant is outnumbered or can be
     * attacked in melee.
     */
    get threatenedBy(): SohlCombatant[] {
        if (!this.combat) return [];

        return this.combat.combatants.contents.filter((c: SohlCombatant) => {
            if (c === this) return false;
            const statuses: Set<string> =
                (c.actor as any)?.statuses ?? new Set<string>();
            return isThreatening({
                isEnemy: this.isEnemyOf(c),
                isDefeated: c.isDefeated,
                isIncapacitated: THREAT_NEGATING_STATUSES.some((s) =>
                    statuses.has(s),
                ),
                isHidden: !!(c.token as any)?.hidden,
                reaches: c.reaches(this),
            });
        }) as SohlCombatant[];
    }

    /**
     * This combatant's melee reach (feet): the reach of its actor — the
     * greatest reach among the actor's currently available melee strike
     * modes. 0 when the actor is absent or is not a Being.
     */
    get reach(): number {
        return (this.actor?.logic as BeingLogic | undefined)?.reach ?? 0;
    }

    /**
     * The point used to measure distance to/from this combatant — its token
     * center (with elevation), or `null` when no placed token is available.
     */
    private get measurePoint(): {
        x: number;
        y: number;
        elevation: number;
    } | null {
        const token = this.token as any;
        const center = token?.object?.center ?? token?.center;
        if (!center) return null;
        return { x: center.x, y: center.y, elevation: token?.elevation ?? 0 };
    }

    /**
     * Whether this combatant's melee reach extends to `other` — i.e. the
     * center-to-center grid distance between the two combatants' tokens is
     * within this combatant's {@link reach}. Returns `false` when either
     * token position is unavailable.
     *
     * @remarks
     * Distance is measured center-to-center *by design*: a large creature's
     * body size is folded into its lineage `reachBase` (a dragon has a large
     * reach), so a big token's reach already accounts for the distance from
     * its center to an adjacent target. Do not "fix" this to edge-to-edge.
     *
     * @param other - The combatant to test reach against.
     * @returns `true` if this combatant's reach extends to `other`.
     */
    reaches(other: SohlCombatant): boolean {
        const from = this.measurePoint;
        const to = other.measurePoint;
        if (!from || !to) return false;
        const result = getCanvas().grid?.measurePath([from, to], {});
        const distance = result?.distance ?? Infinity;
        return distance <= this.reach;
    }

    /**
     * .
     *
     * @returns True if the combatant has performed an action, false otherwise.
     */
    get didAction(): boolean {
        return (this.system as SohlCombatantDataModel).didAction;
    }

    /**
     * The number of spaces this combatant has moved since
     * the start of its turn.
     *
     * @returns The number of spaces moved this turn.
     */
    get spacesMovedThisTurn(): number {
        const start = (this.system as SohlCombatantDataModel).startLocation;
        const current = (this.token as any)?.object?.center ??
            (this.token as any)?.center ?? {
                x: start.x,
                y: start.y,
            };

        const result = getCanvas().grid?.measurePath(
            [
                {
                    x: start.x,
                    y: start.y,
                    elevation: start.elevation,
                },
                {
                    x: current.x,
                    y: current.y,
                    elevation: (this.token as any)?.elevation,
                },
            ],
            {},
        );

        return result?.spaces ?? 0;
    }

    /**
     * The computed tactical move for this combatant in the given medium,
     * accounting for the combatant's situational `moveFactor` scalar.
     *
     * Returns `null` when the combatant's actor has no `BeingLogic`
     * (e.g. a Vehicle, which has no movement model) or when the actor's
     * base move in this medium is 0.
     *
     * @param medium - The movement medium to compute for.
     * @returns The tactical move, or `null` when movement is unavailable.
     */
    computedMove(medium: MovementMedium): number | null {
        const beingLogic = this.actor?.logic as BeingLogic | undefined;
        const sys = this.system as SohlCombatantDataModel;
        return computeMove(beingLogic as any, medium, sys.moveFactor ?? 1);
    }

    /**
     * The computed move for the medium the combat tracker should display
     * for this combatant. Tracker rows read this getter.
     */
    get displayedMove(): number | null {
        const sys = this.system as SohlCombatantDataModel;
        return this.computedMove(sys.displayedMedium);
    }

    /**
     * Seed the displayed movement medium from the actor's lineage default
     * when the creating user did not set one explicitly.
     * @param data - The pending creation data.
     * @param options - The creation options.
     * @param user - The user performing the creation.
     * @returns `false` to veto creation, otherwise nothing.
     */
    protected override async _preCreate(
        data: any,
        options: any,
        user: any,
    ): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        const userSetMedium = data?.system?.displayedMedium;
        const lineageItem = (this.actor?.itemTypes as any)?.[
            ITEM_KIND.LINEAGE
        ]?.[0];
        const lineageDefault = (lineageItem?.logic as LineageLogic | undefined)
            ?.defaultMoveMedium;
        const chosen = chooseInitialDisplayedMedium(
            userSetMedium,
            lineageDefault,
        );
        if (chosen && chosen !== userSetMedium) {
            (this as any).updateSource({
                "system.displayedMedium": chosen,
            });
        }
    }

    /**
     * The default dice formula which should be used for initiative for this combatant.
     * @remark
     * The SOHL system uses a different approach to initiative than the default Foundry VTT system.
     * Initiative is determined by the character's initiative skill, not a random die roll.
     * So, the roll object returned by this method will always evaluate to the actor's initiative skill,
     * a single number, rather than a dice formula.
     *
     * @returns The initiative formula to use for this combatant.
     */
    protected override _getInitiativeFormula(): string {
        if (this.actor) {
            const init = this.actor.itemTypes.skill.find(
                (s) => (s.system as any).shortcode === "init",
            ) as unknown as SohlItem;
            if (init) {
                return String(
                    (init.logic as SkillLogic).masteryLevel.effective,
                );
            }
        }
        return "0";
    }
}

/**
 * Builds the Foundry data schema for the SoHL combatant: turn start location,
 * action flag, move factor, displayed medium, and last attack/block strike modes.
 * @returns The combatant data schema.
 */
function defineSohlCombatantDataSchema(): foundry.data.fields.DataSchema {
    return {
        startLocation: new foundry.data.fields.ObjectField({
            initial: {
                x: 0,
                y: 0,
                elevation: 0,
            },
            fields: {
                x: new foundry.data.fields.NumberField({ required: true }),
                y: new foundry.data.fields.NumberField({ required: true }),
                elevation: new foundry.data.fields.NumberField({ initial: 0 }),
            },
        }),
        didAction: new foundry.data.fields.BooleanField({
            required: false,
            initial: false,
        }),
        /**
         * A situational multiplier on this combatant's computed move,
         * editable by the GM during combat to express whatever modifier
         * they've decided applies right now (run, sprint, encumbrance,
         * difficult terrain, etc.). Defaults to 1. Lives for the combat
         * encounter only.
         */
        moveFactor: new foundry.data.fields.NumberField({
            required: false,
            initial: 1,
            min: 0,
            nullable: false,
        }),
        /**
         * Which movement medium's computed move is displayed for this
         * combatant in the combat tracker. Seeded at creation time from
         * the actor's lineage `defaultMoveMedium`.
         */
        displayedMedium: new foundry.data.fields.StringField({
            required: true,
            choices: MovementMediums,
            initial: MOVEMENT_MEDIUM.TERRESTRIAL,
        }),
        /**
         * The strike mode this combatant most recently used to **attack**
         * (`{ itemId, smId }`), or `null`. Combatants tend to reuse their last
         * attack, so this drives the default in the automated-attack mode picker.
         * Combat-scoped (lives only for the encounter).
         */
        lastAttackMode: new foundry.data.fields.ObjectField({
            required: false,
            nullable: true,
            initial: null,
        }),
        /**
         * The strike mode this combatant most recently used to **block**
         * (`{ itemId, smId }`), or `null` — drives the default in the Block picker.
         */
        lastBlockMode: new foundry.data.fields.ObjectField({
            required: false,
            nullable: true,
            initial: null,
        }),
    };
}

type SohlCombatantDataSchema = ReturnType<typeof defineSohlCombatantDataSchema>;

/** @internal */
export class SohlCombatantDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlCombatantDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlCombatant> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Combatant"];
    static readonly kind = "sohlcombatantdata";
    startLocation!: {
        x: number;
        y: number;
        elevation: number;
    };
    didAction!: boolean;
    moveFactor!: number;
    displayedMedium!: MovementMedium;
    lastAttackMode!: StrikeModeRef | null;
    lastBlockMode!: StrikeModeRef | null;

    /**
     * Returns the Foundry data schema for the SoHL combatant data model.
     * @returns The combatant data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlCombatantDataSchema();
    }
}
