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
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { SohlDataModel, defineSohlDataSchema } from "@src/core/SohlDataModel";
import { SohlActionContext } from "@src/core/SohlActionContext";
import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
import type { CombatantLogic } from "../logic/CombatantLogic";
import { chooseInitialDisplayedMedium } from "../combatant-logic";
import { DEFAULT_COMBAT_GROUP } from "@src/document/combat/combat-logic";
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

    /** The {@link CombatantLogic} for this combatant. */
    get logic(): CombatantLogic {
        return (this.system as any).logic as CombatantLogic;
    }

    /**
     * Dispatch a chat-card button click to this combatant's logic — the
     * automated-combat defense resumes (Block/Dodge/Counterstrike/Ignore) live
     * on {@link CombatantLogic} as intrinsic actions, and the attack card's
     * defense buttons address the defender's combatant. The button's dataset
     * becomes the action's `scope`.
     * @param btn - The clicked chat-card button element.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        const actionName = btn.dataset.action;
        if (!actionName) return;

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
                `SoHL | ${this.name} (Combatant) received unhandled chat-card action "${actionName}".`,
            );
        }
    }

    /**
     * Begin an automated attack with this combatant as the attacker — the
     * single entry point for combat start. Delegates to
     * {@link CombatantLogic.automatedCombatStart}; the per-weapon and
     * per-technique item actions route here, passing their source logic and
     * strike mode in the context scope.
     * @param context - The action context (target, scope, chat options).
     */
    async automatedCombatStart(context: SohlActionContext): Promise<void> {
        await this.logic.automatedCombatStart(context);
    }

    /**
     * The context-menu entries for this combatant — the combatant's available
     * actions. Delegates to {@link CombatantLogic.getContextOptions} (the shared
     * {@link SohlLogic} contract), mirroring `SohlActor`/`SohlItem`. The combat
     * tracker's row context menu is built from these.
     * @returns The combatant's context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic.getContextOptions();
    }

    /**
     * Prompt the GM to move this combatant into an existing {@link CombatantGroup}
     * or a new one, then apply the assignment. Selecting the combatant's current
     * group is a no-op. Backs the `moveToGroup` intrinsic action.
     */
    async moveToGroup(): Promise<void> {
        const combat = this.combat as any;
        if (!combat) return;

        const groups = (combat.groups?.contents ?? []) as any[];
        const currentId = this.groupId;

        const options = groups
            .map((g) => {
                const sel = g.id === currentId ? " selected" : "";
                return `<option value="${escapeAttr(g.id)}"${sel}>${escapeHtml(
                    g.name,
                )}</option>`;
            })
            .join("");

        const content = `
            <div class="form-group">
                <label>Group</label>
                <div class="form-fields">
                    <select name="group">
                        ${options}
                        <option value="__new__">➕ New group…</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>New group name</label>
                <div class="form-fields">
                    <input type="text" name="newName" placeholder="${DEFAULT_COMBAT_GROUP}">
                </div>
            </div>
        `;

        const result = await (foundry.applications.api.DialogV2 as any).wait({
            window: { title: "Move to Group" },
            content,
            buttons: [
                {
                    action: "ok",
                    label: "Move",
                    icon: "sohl-check",
                    default: true,
                    callback: (_event: Event, button: any) => {
                        const form = button.form as HTMLFormElement;
                        return {
                            group: (
                                form.elements.namedItem(
                                    "group",
                                ) as HTMLSelectElement
                            )?.value,
                            newName: (
                                form.elements.namedItem(
                                    "newName",
                                ) as HTMLInputElement
                            )?.value,
                        };
                    },
                },
                {
                    action: "cancel",
                    label: "Cancel",
                    icon: "sohl-xmark",
                },
            ],
            close: () => null,
        });

        if (!result || result === "cancel") return;

        let targetGroupId: string | undefined;
        if (result.group === "__new__") {
            const name = result.newName?.trim() || DEFAULT_COMBAT_GROUP;
            const [created] = (await combat.createEmbeddedDocuments(
                "CombatantGroup",
                [{ name }],
            )) as any[];
            targetGroupId = created?.id;
        } else {
            targetGroupId = result.group || undefined;
        }

        if (!targetGroupId || targetGroupId === currentId) return;
        await this.update({ group: targetGroupId } as any);
    }

    /** The strike mode last used to attack, or `null` (combat-scoped). */
    get lastAttackMode(): StrikeModeRef | null {
        return this.logic.lastAttackMode;
    }

    /** The strike mode last used to block, or `null` (combat-scoped). */
    get lastBlockMode(): StrikeModeRef | null {
        return this.logic.lastBlockMode;
    }

    /**
     * Remember the strike mode just used to attack (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordAttackMode(itemId: string, smId: string): Promise<void> {
        await this.logic.recordAttackMode(itemId, smId);
    }

    /**
     * Remember the strike mode just used to block (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordBlockMode(itemId: string, smId: string): Promise<void> {
        await this.logic.recordBlockMode(itemId, smId);
    }

    /**
     * The id of this combatant's {@link CombatantGroup}, or `null` when ungrouped.
     *
     * @remarks
     * `_source.group` is the canonical stored id. Core's `_prepareGroup()`
     * reassigns the derived `this.group` to the resolved {@link CombatantGroup}
     * document when it resolves, but leaves it as the raw id (or null)
     * otherwise — so reading `_source` avoids that heterogeneity.
     */
    get groupId(): string | null {
        return this.logic.groupId;
    }

    /**
     * An array of combatants which are considered allies of this combatant:
     * the other combatants sharing this one's (non-null) {@link CombatantGroup}.
     * The inverse of {@link isEnemyOf}.
     */
    get allies(): SohlCombatant[] {
        return this.logic.allies.map((cl) => cl.combatant!);
    }

    /**
     * Pure relational predicate: two combatants are enemies iff they belong to
     * different {@link CombatantGroup}s. A combatant is never its own enemy, and an
     * absent group on either side is treated defensively as enemy.
     *
     * Reads only already-loaded combatant fields — no Foundry API calls.
     *
     * @param other - The combatant to compare against.
     * @returns `true` if the two combatants are enemies.
     */
    isEnemyOf(other: SohlCombatant): boolean {
        return this.logic.isEnemyOf(other.logic);
    }

    /**
     * The combatants currently threatening this one — enemies that are not
     * defeated, not incapacitated, not hidden, and within reach. See
     * {@link CombatantLogic.threatenedBy}.
     */
    get threatenedBy(): SohlCombatant[] {
        return this.logic.threatenedBy.map((cl) => cl.combatant!);
    }

    /**
     * This combatant's melee reach (feet): the reach of its actor — the
     * greatest reach among the actor's currently available melee strike
     * modes. 0 when the actor is absent or is not a Being.
     */
    get reach(): number {
        return this.logic.reach;
    }

    /**
     * Whether this combatant's melee reach extends to `other` — i.e. the
     * center-to-center grid distance between the two combatants' tokens is
     * within this combatant's {@link reach}. Returns `false` when either token
     * position is unavailable.
     *
     * @remarks
     * Distance is measured center-to-center *by design*: a large creature's
     * body size is folded into its lineage `reachBase`, so a big token's reach
     * already accounts for the distance from its center to an adjacent target.
     * Do not "fix" this to edge-to-edge.
     *
     * @param other - The combatant to test reach against.
     * @returns `true` if this combatant's reach extends to `other`.
     */
    reaches(other: SohlCombatant): boolean {
        return this.logic.reaches(other.logic);
    }

    /**
     * .
     *
     * @returns True if the combatant has performed an action, false otherwise.
     */
    get didAction(): boolean {
        return this.logic.didAction;
    }

    /**
     * The number of spaces this combatant has moved since
     * the start of its turn.
     *
     * @returns The number of spaces moved this turn.
     */
    get spacesMovedThisTurn(): number {
        return this.logic.spacesMovedThisTurn;
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
        return this.logic.computedMove(medium);
    }

    /**
     * The computed move for the medium the combat tracker should display
     * for this combatant. Tracker rows read this getter.
     */
    get displayedMove(): number | null {
        return this.logic.displayedMove;
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
 * Escape a string for safe use inside an HTML attribute value.
 * @param value - The raw string to escape.
 * @returns The string with `&` and `"` escaped as HTML entities.
 */
function escapeAttr(value: string): string {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Escape a string for safe use as HTML text content.
 * @param value - The raw string to escape.
 * @returns The string with `&`, `<`, and `>` escaped as HTML entities.
 */
function escapeHtml(value: string): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Builds the Foundry data schema for the SoHL combatant: turn start location,
 * action flag, move factor, displayed medium, and last attack/block strike modes.
 * @returns The combatant data schema.
 */
function defineSohlCombatantDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...defineSohlDataSchema(),
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
> extends SohlDataModel<TSchema, SohlCombatant, CombatantLogic> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Combatant"];
    static override readonly kind = "sohlcombatantdata";
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
