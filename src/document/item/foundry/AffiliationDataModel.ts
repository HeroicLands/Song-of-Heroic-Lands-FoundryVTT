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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItemDataModel";
import { AffiliationLogic, AffiliationData } from "@src/document/item/logic/AffiliationLogic";
import {
    AffiliationStandingChoices,
    AffiliationSubTypeChoices,
    ITEM_KIND,
    type AffiliationStanding,
    type AffiliationSubType,
} from "@src/utils/constants";
const { ArrayField, StringField, NumberField, TypedObjectField } = foundry.data.fields;

/**
 * Builds the data schema for the Affiliation item, extending the base item
 * schema with affiliation-specific fields (subtype, society, office, title,
 * level, standing toward other affiliations, the bodies it is subordinate to,
 * where its authority sits, and the places it holds sway over).
 * @returns The Foundry data schema for the affiliation.
 */
function defineAffiliationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        // The kind of organization — required with no default, as on every
        // other subtype-bearing item: an Affiliation declares its kind at
        // creation. `choices` is the value-keyed map (never the values array,
        // which would submit option indices and be rejected wholesale).
        subType: new StringField({
            required: true,
            choices: AffiliationSubTypeChoices,
        }),
        society: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        office: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        title: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        level: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        // How this organization stands toward others, keyed by affiliation
        // shortcode. Only relations that differ from neutral are authored; an
        // absent key reads as `unaligned` (see AffiliationLogic.standingWith).
        // `{}` rather than nullable: "neutral toward everyone" is a valid state,
        // not an unset one.
        relations: new TypedObjectField(
            new StringField({
                required: true,
                blank: false,
                choices: AffiliationStandingChoices,
            }),
            { initial: {} },
        ),
        // The bodies this one is subordinate to, by affiliation shortcode.
        // A list because an organization may sit under more than one
        // at once — Eídma Pyréthos is an arcane tradition within the Ordo
        // Arcanis, and nothing says a body answers to a single parent.
        //
        // `[]` rather than nullable: "subordinate to nobody" is a valid state
        // — a sovereign polity is exactly that — not an unset one.
        parents: new ArrayField(new StringField({ required: true, blank: false }), {
            initial: [],
        }),
        // Where the affiliation's authority sits, as a place shortcode.
        //
        // Deliberately not `capital` or `headquarters`: each fits about half
        // the eleven subTypes — an empire has a capital and a guild does not, a
        // criminal association has a headquarters and an empire does not —
        // while a seat covers a polity, a guild, an order and a faith alike.
        //
        // Nullable because "no seat" and "a seat nobody has recorded" are
        // different states worth telling apart, unlike the two lists here.
        seat: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        // The places it holds sway over, by place shortcode. A list, since a
        // polity can span several regions and a guild can operate in several
        // settlements.
        //
        // This is the geographic relation, kept apart from the organisational
        // one above: `parents` is *subordinate to*, `domain` is *holds sway
        // over*, and grouping them under one key made a note say the wrong one.
        //
        // The seat normally lies within the domain. Worth a warning where it
        // does not — a government in exile — never an error.
        domain: new ArrayField(new StringField({ required: true, blank: false }), {
            initial: [],
        }),
        commonSkills: new ArrayField(new StringField({ required: true, blank: false }), {
            initial: [],
        }),
    };
}

type SohlAffiliationDataSchema = ReturnType<typeof defineAffiliationDataSchema>;

/** @internal */
export class AffiliationDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlAffiliationDataSchema,
    TLogic extends AffiliationLogic<AffiliationData> = AffiliationLogic<AffiliationData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AffiliationData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Affiliation", "SOHL.Item"];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.AFFILIATION;
    subType!: AffiliationSubType;
    society!: string | null;
    office!: string | null;
    title!: string | null;
    level!: number;
    relations!: Record<string, AffiliationStanding>;
    parents!: string[];
    seat!: string | null;
    domain!: string[];
    commonSkills!: string[];

    /**
     * Returns the Foundry data schema for the affiliation item.
     * @returns The affiliation data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}
