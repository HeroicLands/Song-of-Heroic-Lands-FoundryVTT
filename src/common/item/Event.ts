/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlEventContext } from "@common/event/SohlEventContext";
import {
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { SohlEvent } from "@common/event/SohlEvent";
import {
    EVENT_SUBTYPE,
    EventSubType,
    EventSubTypes,
    ITEM_KIND,
    SOHL_EVENT_STATE,
    SohlEventState,
    SohlEventStates,
} from "@utils/constants";
import { SohlScriptAction } from "@common/event/SohlScriptAction";
import type { SohlTemporal } from "@common/event/SohlTemporal";
const { StringField, BooleanField, SchemaField, NumberField, DocumentIdField } =
    foundry.data.fields;

export class Event<TData extends Event.Data = Event.Data>
    extends SohlItem.BaseLogic<TData>
    implements Event.Logic<TData>
{
    isAsync!: boolean;
    script!: string;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
        if (this.item?.nestedIn) {
            const data: PlainObject = {
                id: this.id,
                state: this.data.state,
                activation: this.data.activation,
                initiation: this.data.initiation,
                expiration: this.data.expiration,
            };
            let event;
            switch (this.item.nestedIn.system.subType) {
                case EVENT_SUBTYPE.SCRIPT_ACTION:
                    data.subType = EVENT_SUBTYPE.SCRIPT_ACTION;
                    data.script = this.script;
                    data.isAsync = this.isAsync;
                    event = new SohlScriptAction(data);
                    break;

                case EVENT_SUBTYPE.INTRINSIC_ACTION:
                    // This is an error. Intrinsic actions should not be
                    // created as nested items or persisted.
                    sohl.log.warn(
                        `Illegal persisted Intrinsic Action Event ${this.name} (${this.id}) encountered and ignored.`,
                    );
                    break;

                case EVENT_SUBTYPE.BASIC:
                    data.subType = EVENT_SUBTYPE.BASIC;
                    event = new SohlEvent(data);
                    break;

                default:
                    throw new Error(
                        `Unsupported Event subType ${this.item.nestedIn.system.subType} for nested Event`,
                    );
            }
            //this.item.nestedIn.logic.events.set(event.title, event);
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Event {
    export const Kind = ITEM_KIND.EVENT;
    export interface Logic<TData extends Event.Data<any> = Event.Data<any>>
        extends SohlItem.Logic<TData> {}

    export interface Data<TLogic extends Event.Logic<any> = Event.Logic<any>>
        extends SohlItem.Data<TLogic> {
        subType: EventSubType;
        state: SohlEventState;
        activation: {
            delay: number;
            at: SohlTemporal | null;
        };
        initiation: {
            delay: number;
            at: SohlTemporal | null;
        };
        expiration: {
            duration: number | null;
            at: SohlTemporal | null;
            repeatCount: number | null;
            repeatUntil: SohlTemporal | null;
        };
        script: string | null;
        isAsync: boolean;
    }
}

function defineEventSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: EventSubTypes,
            required: true,
        }),
        state: new StringField({
            choices: SohlEventStates,
            initial: SOHL_EVENT_STATE.CREATED,
        }),
        activation: new SchemaField({
            delay: new NumberField({ nullable: true, initial: null }),
            at: new NumberField({ nullable: true, initial: null }),
        }),
        initiation: new SchemaField({
            delay: new NumberField({ nullable: true, initial: null }),
            at: new NumberField({ nullable: true, initial: null }),
        }),
        expiration: new SchemaField({
            duration: new NumberField({
                nullable: true,
                initial: null,
            }),
            at: new NumberField({ nullable: true, initial: null }),
            repeatCount: new NumberField({
                nullable: true,
                initial: null,
            }),
            repeatUntil: new NumberField({
                nullable: true,
                initial: null,
            }),
        }),
        script: new StringField({ nullable: true, initial: null }),
        isAsync: new BooleanField({ initial: false }),
    };
}

type EventDataSchema = ReturnType<typeof defineEventSchema>;

export class EventDataModel<
        TSchema extends foundry.data.fields.DataSchema = EventDataSchema,
        TLogic extends Event.Logic<Event.Data> = Event.Logic<Event.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Event.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["Event"];
    static readonly kind = Event.Kind;
    subType!: EventSubType;
    state!: SohlEventState;
    activation!: {
        delay: number;
        at: SohlTemporal | null;
    };
    initiation!: {
        delay: number;
        at: SohlTemporal | null;
    };
    expiration!: {
        duration: number | null;
        at: SohlTemporal | null;
        repeatCount: number | null;
        repeatUntil: SohlTemporal | null;
    };
    script!: string;
    isAsync!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineEventSchema();
    }
}

export class EventSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/event.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
