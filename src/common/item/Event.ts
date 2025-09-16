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

import { SohlItem } from "@common/item/SohlItem";
import type { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlEvent } from "@common/event/SohlEvent";
import {
    EVENT_SUBTYPE,
    EventSubType,
    EventSubTypes,
    SOHL_EVENT_STATE,
    SohlEventState,
    SohlEventStates,
} from "@utils/constants";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import { SohlScriptAction } from "@common/event/SohlScriptAction";
import { DocumentId } from "@utils/helpers";
import { SohlTemporal } from "@common/event/SohlTemporal";

const { StringField, BooleanField, SchemaField, NumberField, DocumentIdField } =
    foundry.data.fields;
const kEvent = Symbol("Event");
const kData = Symbol("Event.Data");

export class Event
    extends SubTypeMixin(SohlItem.BaseLogic)
    implements Event.Logic
{
    declare readonly _parent: Event.Data;
    readonly [kEvent] = true;
    isAsync!: boolean;
    script!: string;

    static isA(obj: unknown): obj is Event {
        return typeof obj === "object" && obj !== null && kEvent in obj;
    }
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
        if (this.item?.nestedIn) {
            const parent = this.parent as Event.Data;
            const data: PlainObject = {
                id: parent.parent.id,
                title: parent.title,
                state: parent.state,
                activation: parent.activation,
                initiation: parent.initiation,
                expiration: parent.expiration,
            };
            let event;
            switch (this.item.nestedIn.system.subType) {
                case EVENT_SUBTYPE.SCRIPT_ACTION:
                    data.script = this.script;
                    data.isAsync = this.isAsync;
                    event = new SohlScriptAction(data);
                    break;

                case EVENT_SUBTYPE.BASIC:
                    event = new SohlEvent(data);
                    break;

                default:
                    throw new Error(
                        `Unsupported Event subType ${this.item.nestedIn.system.subType} for nested Event`,
                    );
            }
            this.item.nestedIn.logic.events.set(event.title, event);
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Event {
    export interface Logic
        extends SohlItem.Logic,
            SubTypeMixin.Logic<EventSubType> {
        readonly [kEvent]: true;
        readonly _parent: Event.Data;
    }

    export interface Data
        extends SubTypeMixin.Data<EventSubType>,
            SohlItem.Data {
        readonly [kData]: true;
        title: string;
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
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        EventSubType,
        typeof EventSubTypes
    >(SohlItem.DataModel, EventSubTypes) as unknown as Constructor<Event.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Event"];
        id!: DocumentId;
        title!: string;
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

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                id: new DocumentIdField({ required: true }),
                title: new StringField({ initial: "" }),
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
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/scriptaction.hbs",
                },
            });
    }
}
