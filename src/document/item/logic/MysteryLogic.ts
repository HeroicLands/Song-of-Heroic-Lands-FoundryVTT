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
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { resolveAssocAffiliation } from "@src/document/item/logic/resolveAssocAffiliation";
import { computeBoostContribution } from "@src/document/item/logic/masteryBoost";
import { mergeSkillAptitudes } from "@src/document/item/logic/skill-aptitudes";
import {
    dialog,
    fvttCreateEmbeddedItems,
    fvttFindItemByShortcode,
} from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import {
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    MysterySubType,
} from "@src/utils/constants";

/**
 * A passive or charge-based mystical power associated with a character or
 * object.
 *
 * Mysteries represent supernatural gifts, blessings, and connections that
 * influence a character's capabilities. Unlike {@link MysticalAbilityLogic | Mystical Abilities}
 * (which are actively cast), mysteries are often passive or limited-use
 * powers that enhance skills, grant re-rolls, or provide divine favor.
 *
 * A Mystery models what a character **is** — a standing condition, pool, or
 * blessing — so it carries no "use it" action of its own: there is no universal
 * meaning to *using* a Mystery. Anything a character actively **invokes** is a
 * {@link MysticalAbilityLogic | Mystical Ability}, which has its own action and
 * roll; a subtype that should be spent down is driven by whatever consumes it.
 *
 * Each mystery tracks a **level** and optional **charges** (value and max); a
 * `null` charge value denotes infinite uses. A mystery may name an associated
 * {@link SkillLogic | Skill} (e.g. the skill a boon or boost affects).
 *
 * Subtypes ({@link MysterySubType}):
 * - **Boon** — a flat `±N` modifier to an associated skill's mastery level, from any source.
 * - **Boost** — one or more temporary Mastery Boosts to an associated skill (the Mastery Boost table).
 * - **Fate** — quantifies the ability to alter destiny or fate (the stored fate pool). The "Fate" *invocation* is a Divination {@link MysticalAbilityLogic | Mystical Ability}; a per-skill fate bonus is modelled with Active Effects, and a fate-point bonus is not yet modelled.
 * - **Grace** — quantifies the ability to call effectually on divine favour.
 * - **Other** — a mechanically inert carrier with no behaviour of its own; a birthsign (a passive standing influence on whole classes of skills) is authored this way, carrying its effect entirely in {@link MysteryData.skillAptitudes}.
 * - **Piety** — quantifies devotion to a religion.
 *
 * A **Boon** or **Boost** mystery names its target skill via
 * {@link MysteryData.assocSkillCode} and, while active (a present, non-zero
 * {@link level}), contributes a live delta onto that skill's mastery level in
 * {@link finalize}. The mystery's {@link level | level} carries the effect's
 * magnitude — `±N` for a Boon, the boost count `N` for a Boost.
 *
 * @typeParam TData - The Mystery data interface.
 */
export class MysteryLogic<
    TData extends MysteryData = MysteryData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The mystery's level as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link MysteryData.levelBase}. Disabled when the mystery has no level
     * (`levelBase === null`).
     */
    level!: ValueModifier;

    /**
     * The mystery's charge tracking. Both `value` and `max` are always
     * {@link sohl.entity.modifier.ValueModifier}s; a `null` source value leaves the corresponding
     * modifier **disabled**, which the sheet reads to pick the ×/∞ display:
     *
     * - `max` disabled (source `max === null`) → mystery does not use charges,
     *   shown as "×".
     * - `value` disabled (source `value === null`) → infinite charges
     *   remaining, shown as "∞".
     * - `max.effective === 0` → infinite charges available, shown as
     *   "`value`/∞".
     * - otherwise → "`value`/`max`".
     */
    charges!: {
        /** Current charges; disabled when charges are infinite (`value === null`). */
        value: ValueModifier;
        /** Maximum charges; disabled when the mystery does not use charges (`max === null`). */
        max: ValueModifier;
    };

    /**
     * The associated skill (a {@link SkillLogic}) resolved during
     * {@link evaluate} from {@link MysteryData.assocSkillCode}, or `undefined`
     * when the mystery names no skill.
     */
    assocSkill?: SkillLogic;

    /**
     * The faction/**Affiliation** (an {@link AffiliationLogic}) this mystery
     * draws its standing from, resolved during {@link evaluate} from
     * {@link MysteryData.assocAffiliationCode}, or `undefined` when the mystery
     * names no Affiliation, the item is not on an actor, or the shortcode
     * matches none. This is separate from the associated
     * {@link assocSkill | skill}: a religion, arcane or alchemical school, or
     * ancestor/totem/spirit whose membership confers the mystery (the source of
     * a Piety or Grace pool, say). Surfaced as the Being sheet's Affiliation
     * column; a subtype may consult its {@link AffiliationLogic.level | rank} to
     * inform a capability derivation.
     */
    affiliation?: AffiliationLogic;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();

        // Level: a null base means "no level" and leaves the modifier
        // disabled (shown as "×"); 0 is a real level and stays enabled.
        this.level = new entity.ValueModifier(this);
        if (this.data.levelBase === null) {
            this.level.setDisabled("SOHL.Mystery.NoLevel");
        } else {
            this.level.setBase(this.data.levelBase);
        }

        /*
         * Charges: `value` and `max` are always ValueModifiers; a null source
         * value leaves the modifier disabled so the sheet can pick the ×/∞
         * display (see the `charges` field docs). A null `max` means the
         * mystery does not use charges at all, so both modifiers are disabled.
         */
        this.charges = {
            value: new entity.ValueModifier(this),
            max: new entity.ValueModifier(this),
        };
        if (this.data.charges.max === null) {
            this.charges.value.setDisabled("SOHL.Mystery.DoesNotUseCharges");
            this.charges.max.setDisabled("SOHL.Mystery.DoesNotUseCharges");
        } else {
            this.charges.max.setBase(this.data.charges.max);
            if (this.data.charges.value === null) {
                this.charges.value.setDisabled("SOHL.Mystery.InfiniteCharges");
            } else {
                this.charges.value.setBase(this.data.charges.value);
            }
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();

        this.contributeSkillAptitudes();

        // Resolve the associated skill (e.g. the skill a boon/boost affects or a
        // fate success-level bump applies to) from its shortcode, when the actor is known.
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;
        this.assocSkill = resolveAssocSkill(
            actorLogic,
            this.data.assocSkillCode,
        );

        // The associated Affiliation is independent of the associated skill: it
        // records the faction (religion, arcane/alchemical school,
        // ancestor/totem/spirit) whose standing confers this mystery. Undefined
        // when blank or unmatched.
        this.affiliation = resolveAssocAffiliation(
            actorLogic,
            this.data.assocAffiliationCode,
        );
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        this.contributeSkillEffect();
    }

    /**
     * Merge this mystery's {@link MysteryData.skillAptitudes | aptitudes} into
     * the being's accumulator, keeping the greater value per selector.
     *
     * Runs in `evaluate` so that the accumulator is complete — every mystery on
     * the actor having contributed — before any skill reads it in its own
     * `finalize`, which the phase barrier guarantees. Contribution is
     * unconditional: unlike a boon or a boost, an aptitude is not gated on the
     * mystery's level, because a birthsign has no level to be active at. It is
     * simply true of the character.
     *
     * A being that carries no aptitude-bearing mystery never allocates anything
     * beyond the empty accumulator; an actor kind that has no accumulator at all
     * (only a Being does) is silently skipped.
     */
    protected contributeSkillAptitudes(): void {
        const aptitudes = this.data.skillAptitudes;
        if (!aptitudes) return;
        // `skillAptitudes` is Being-specific state, reached the way other
        // being-level accumulators are (cf. TraumaLogic and `fatiguePenalty`).
        const accumulator = (this.actorLogic as any)?.skillAptitudes as
            | Map<string, number>
            | undefined;
        if (!accumulator) return;
        mergeSkillAptitudes(accumulator, aptitudes);
    }

    /**
     * Push this mystery's skill-affecting effect (a `boon` or `boost`) onto its
     * associated skill's mastery-level modifier as a live delta.
     *
     * Both effects are **derived state**: the delta is recomputed every prepare
     * cycle and added to the real skill's {@link SkillLogic.masteryLevel}, which
     * is read at roll time. So the effect applies only while the mystery is
     * active (a present, non-zero {@link level}) and reverts automatically when
     * it lapses — nothing is persisted to unwind.
     *
     * - **Boon:** a flat `±N` modifier, where `N` is the mystery's
     *   {@link level | level.effective}.
     * - **Boost:** `N` temporary Mastery Boosts (see
     *   {@link computeBoostContribution}). Off a **learned** skill they compound
     *   off its seeded mastery level; off an **unlearned** skill (seeded ML 0)
     *   the first boost opens it at its Skill Base and the rest compound, so the
     *   skill is conferred at that EML. Either way the result is a live delta.
     *
     * A `boost` naming a skill the actor lacks entirely contributes nothing here;
     * materializing that skill (at ML 0, so this method then confers it) is
     * offered once when the Boost is dropped onto the actor — see
     * {@link maybeOfferConferredSkill}. #981.
     */
    protected contributeSkillEffect(): void {
        const skill = this.assocSkill;
        if (!skill) return;

        // Active gate: a mystery with no level (disabled) or a zero level is
        // inactive and contributes nothing.
        if (this.level.disabled) return;
        const n = this.level.effective;
        if (n === 0) return;

        if (this.data.subType === MYSTERY_SUBTYPE.BOON) {
            skill.masteryLevel.add("SOHL.Mystery.BoonMod", "Boon", n);
        } else if (this.data.subType === MYSTERY_SUBTYPE.BOOST) {
            // An unlearned skill (seeded mastery level 0 — e.g. one conferred at
            // ML 0 by dropping this Boost, see maybeOfferConferredSkill) is
            // *opened at its Skill Base* and the remaining boosts compound off
            // that; a learned skill boosts off its own seed. #981.
            const seedML = skill.masteryLevelSeed;
            const { delta } = computeBoostContribution(
                seedML === 0 ?
                    {
                        hasSkill: false,
                        skillBase: skill.skillBase ?? 0,
                        count: n,
                    }
                :   { hasSkill: true, seedML, count: n },
            );
            if (delta !== 0) {
                skill.masteryLevel.add("SOHL.Mystery.BoostMod", "Boost", delta);
            }
        }
    }

    /**
     * When this Boost names a skill the actor does not have, offer to add that
     * skill — resolved from the world/compendiums by its shortcode — as an
     * **unlearned** embedded skill (mastery level base 0). Once present, the
     * Boost opens it at its Skill Base and boosts it (see the boost-contribution
     * logic in `contributeSkillEffect`); should the Boost later lapse, the skill
     * simply sits at ML 0 (harmless) until its owner deletes it.
     *
     * This is the only way an absent-skill Boost arises: an *embedded* mystery's
     * `assocSkillCode` is picked from the actor's own skills, so a code the actor
     * lacks can only come from a world/compendium Boost **dropped onto the
     * actor** — which is exactly the human-initiated moment this offer belongs to
     * (the consent model: offer at a behest, never act unbidden). Driven from
     * `MysteryDataModel._onCreate`, on the initiating client only.
     *
     * No-op unless this is a `boost` naming a skill absent from the actor; a
     * shortcode resolving to no skill anywhere is reported, not offered. #981.
     *
     * @returns Resolves once the offer — and any resulting skill creation —
     *   settles.
     */
    async maybeOfferConferredSkill(): Promise<void> {
        if (this.data.subType !== MYSTERY_SUBTYPE.BOOST) return;
        const code = this.data.assocSkillCode;
        if (!code) return;
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;
        // Already on the actor? Nothing to confer.
        if (resolveAssocSkill(actorLogic, code)) return;

        const def = await fvttFindItemByShortcode(code, ITEM_KIND.SKILL);
        if (!def) {
            sohl.log.uiWarn("SOHL.Mystery.ConferSkill.notFound", { code });
            return;
        }

        const skillName = String(def.name ?? code);
        const answer = await dialog({
            title: sohl.i18n.localize("SOHL.Mystery.ConferSkill.title"),
            content: toHTMLString("<p>{{prompt}}</p>"),
            data: {
                prompt: sohl.i18n.format("SOHL.Mystery.ConferSkill.prompt", {
                    skill: skillName,
                    actor: actorLogic.name ?? "",
                }),
            },
            buttons: [
                {
                    action: "add",
                    label: sohl.i18n.localize("SOHL.Mystery.ConferSkill.add"),
                    icon: "fa-solid fa-plus",
                    default: true,
                },
                {
                    action: "no",
                    label: sohl.i18n.localize("SOHL.Mystery.ConferSkill.no"),
                },
            ],
            callback: (_formData: unknown, action: string) => action,
        });
        if (answer !== "add") return;

        // Add as an unlearned skill: masteryLevelBase 0 so the Boost opens it at
        // Skill Base. Drop the source `_id` so Foundry mints a fresh embedded id.
        const skillData: PlainObject = {
            ...def,
            system: { ...(def.system as object), masteryLevelBase: 0 },
        };
        delete skillData._id;
        await fvttCreateEmbeddedItems(actorLogic, [skillData]);
    }
}

/**
 * @remarks The shape of `system` on a `mystery` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "mystery"`. The backing DataModel implements this interface.
 */
export interface MysteryData<
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<any>,
> extends SohlItemData<TLogic> {
    /**
     * The mystery's subtype: `boon` / `boost` name a skill-affecting mystery,
     * `fate` / `grace` / `piety` a passive pool, and `other` a catch-all.
     */
    subType: MysterySubType;
    /**
     * Shortcode of the skill this mystery is associated with (the skill a boon
     * or boost affects, a fate success-level bump applies to, etc.); blank for
     * mysteries that name no skill.
     */
    assocSkillCode?: string | null;
    /**
     * Shortcode of the faction/**Affiliation** whose standing confers this
     * mystery — a religion, an arcane or alchemical school, an
     * ancestor/totem/spirit — `null` when the mystery is not
     * affiliation-associated. Resolved to {@link MysteryLogic.affiliation}
     * during {@link MysteryLogic.evaluate}.
     */
    assocAffiliationCode?: string | null;
    /**
     * The base level of the mystery, or null if not applicable. For a `boon` it
     * is the flat `±N` modifier magnitude; for a `boost` it is the boost count
     * `N` applied to the associated skill.
     */
    levelBase: number | null;
    /**
     * Innate aptitude toward or away from whole classes of skills, keyed by
     * selector — a skill shortcode, or `subType:<value>` for every skill of a
     * subtype. Contributed to the being's merged accumulator during
     * {@link MysteryLogic.evaluate} and applied by each skill in its own
     * `finalize`.
     *
     * The canonical carrier is a **birthsign**, whose six elements expand to
     * the subtypes each element claims. Aptitudes from several mysteries never
     * sum: the greatest value per selector wins, which is what makes a birth
     * under two signs a cusp rather than a doubling. See
     * {@link sohl.document.item.logic.mergeSkillAptitudes}.
     */
    skillAptitudes?: Record<string, number>;
    /**
     * Usage tracking: current charges and maximum. Whether the mystery uses
     * charges at all is carried by `max` alone — there is no separate flag.
     */
    charges: {
        /** Current number of charges remaining. `null` means infinite. */
        value: number | null;
        /**
         * Maximum number of charges. `0` means no maximum; `null` means the
         * mystery does not use charges.
         */
        max: number | null;
    };
}
