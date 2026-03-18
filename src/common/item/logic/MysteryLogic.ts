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

import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SkillLogic } from "@common/item/logic/SkillLogic";
import type { DomainLogic } from "@common/item/logic/DomainLogic";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@common/item/foundry/SohlItem";
import {
    ITEM_KIND,
    MYSTERY_CATEGORY,
    MYSTERY_CATEGORYMAP,
    MYSTERY_SUBTYPE,
    MysterySubType,
} from "@utils/constants";
import { isItemWithSubType } from "@utils/helpers";

/**
 * Logic for the **Mystery** item type — a passive or charge-based mystical
 * power associated with a character or object.
 *
 * Mysteries represent supernatural gifts, blessings, and connections that
 * influence a character's capabilities. Unlike {@link MysticalAbilityLogic | Mystical Abilities}
 * (which are actively cast), mysteries are often passive or limited-use
 * powers that enhance skills, grant re-rolls, or provide divine favor.
 *
 * Each mystery tracks a **level** and optional **charges** (value and max),
 * where charges of −1 indicate infinite uses. Mysteries link to a
 * {@link DomainLogic | Domain} and/or specific {@link SkillLogic | Skills}
 * that they affect.
 *
 * Mysteries are organized by category:
 * - **Skill** — Enhance a character's success with specific skills
 * - **Creature** — Tied to a specific creature type
 * - **Divine** — Granted by a divine entity or force
 *
 * Supported subtypes:
 * - Grace (Divine): Divine favor manifesting as a granted wish
 * - Piety (Divine): Deep religious devotion
 * - Fate (Skill): Ability to influence random outcomes (re-rolls)
 * - FateBonus (Skill): Temporary bonus to fate rolls
 * - FatePointBonus: Increase in available fate points
 * - Blessing (Divine): Religious fervor boosting a skill's mastery level
 * - Ancestor Spirit Power (Skill): Ancestral connection boosting a skill
 * - Totem Spirit Power (Creature): Animal spirit connection granting skill bonuses
 *
 * @typeParam TData - The Mystery data interface.
 */
export class MysteryLogic<
    TData extends MysteryData = MysteryData,
> extends SohlItemBaseLogic<TData> {
    domain?: DomainLogic | null;
    skills!: SkillLogic[];
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    get fieldData(): string {
        this.data.subType;
        const category = MYSTERY_CATEGORYMAP[this.data.subType];

        let field: string = "";
        switch (category) {
            case MYSTERY_CATEGORY.DIVINE:
                field =
                    this.actor?.allItems.find(
                        (d) =>
                            d.type === ITEM_KIND.DOMAIN &&
                            d.name === this.domain?.item.name &&
                            d.system.philosophy === this.domain?.philosophy,
                    )?.name ?? "";
                break;

            case MYSTERY_CATEGORY.SKILL:
                if (this.skills.length) {
                    field = sohl.i18n.formatListOr(
                        Array.from(this.skills.values()) as unknown as string[],
                    );
                } else {
                    field = "SOHL.AllSkills";
                }
                break;

            case MYSTERY_CATEGORY.CREATURE:
                field =
                    this.actor?.allItems.find(
                        (d) =>
                            d.type === ITEM_KIND.DOMAIN &&
                            d.name === this.domain?.item.name &&
                            d.system.philosophy === this.domain?.philosophy,
                    )?.name ?? "";
                break;

            default:
                field = "SOHL.Mystery.UnknownDomain";
                break;
        }

        return field;
    }

    getApplicableFate(target: SohlItem): SohlItem[] {
        const result: SohlItem[] = [];
        if (this.data.subType === MYSTERY_SUBTYPE.FATE) {
            // If a fate item has a list of skills, then that fate
            // item is only applicable to those skills.  If the fate item
            // has no list of skills, then the fate item is applicable
            // to all skills.
            if (
                !this.data.skills.length ||
                this.data.skills.includes(target.name)
            ) {
                if (this.level.effective > 0) result.push(this.item);
            }
        }
        return result;
    }

    _usesCharges(): boolean {
        return (
            [
                MYSTERY_SUBTYPE.FATE,
                MYSTERY_SUBTYPE.FATEBONUS,
                MYSTERY_SUBTYPE.FATEPOINTBONUS,
                MYSTERY_SUBTYPE.GRACE,
                MYSTERY_SUBTYPE.PIETY,
            ] as MysterySubType[]
        ).includes(this.data.subType);
    }

    _usesLevels(): boolean {
        return (
            [
                MYSTERY_SUBTYPE.ANCESTORSPIRITPOWER,
                MYSTERY_SUBTYPE.TOTEMSPIRITPOWER,
            ] as MysterySubType[]
        ).includes(this.data.subType);
    }

    get fateBonusItems(): SohlItem[] {
        let result: SohlItem[] = [];
        if (!this.item?.name) return result;

        if (this.actor) {
            this.actor.allItems.forEach((it: SohlItem) => {
                if (
                    it.type === ITEM_KIND.MYSTERY &&
                    isItemWithSubType(it, MYSTERY_SUBTYPE.FATEBONUS)
                ) {
                    const itLogic = it.logic as any;
                    const skills = (it.system as any).skills;
                    if (!skills || skills.includes(this.item.name)) {
                        if (
                            !itLogic.charges.value.disabled ||
                            itLogic.charges.value.effective > 0
                        ) {
                            result.push(it);
                        }
                    }
                }
            });
        }
        return result;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();

        this.level = new sohl.modifier.Value({}, { parent: this }).setBase(
            this.data.levelBase,
        );

        this.charges = {
            value: new sohl.modifier.Value({}, { parent: this }).setBase(
                this.data.charges.value,
            ),
            max: new sohl.modifier.Value({}, { parent: this }).setBase(
                this.data.charges.max,
            ),
        };
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        if (!this.actor) return;
        const allItemTypes = this.actor.allItemTypes;

        this.domain = allItemTypes.domain.find(
            (it: SohlItem) => it.system.shortcode === this.data.domainCode,
        )?.logic as DomainLogic;

        this.skills = allItemTypes.skill
            .filter((it: SohlItem) =>
                this.data.skills.includes(it.system.shortcode),
            )
            .map((it: SohlItem) => it.logic as SkillLogic);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface MysteryData<
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<any>,
> extends SohlItemData<TLogic> {
    /** Mystery category (Grace, Piety, Fate, Blessing, etc.) */
    subType: MysterySubType;
    /** Shortcode of the associated mystical domain */
    domainCode?: string;
    /** Shortcodes of skills this mystery affects */
    skills: string[];
    /** Power level of this mystery */
    levelBase: number;
    /** Usage tracking: current charges and maximum */
    charges: {
        value: number;
        max: number;
    };
}
