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

import { SohlMap } from "@utils/collection";
import { SohlItem } from "@common/item";
import { DocumentId, FilePath, HTMLString } from "@utils";
import { SohlPerformer, SohlDataModel } from "@common";
const { HTMLField, StringField, FilePathField } = foundry.data.fields;

const kSohlActor = Symbol("SohlActor");
const kDataModel = Symbol("SohlActor.DataModel");

export class SohlActor<
    P extends SohlPerformer = SohlPerformer,
    M extends SohlActor.DataModel<P> = any,
> extends Actor {
    declare parent: null;
    declare id: DocumentId;
    declare name: string;
    declare img: FilePath;
    declare type: string;
    declare system: M;
    declare limited: boolean;
    readonly [kSohlActor] = true;

    static isA(obj: unknown): obj is SohlActor {
        return typeof obj === "object" && obj !== null && kSohlActor in obj;
    }

    get items(): SohlMap<string, SohlItem> {
        return new SohlMap(
            // @ts-expect-error TypeScript does not recognize the parent `items` collection
            super.items.map((item: SohlItem) => [item.id, item]),
        );
    }

    override get itemTypes(): StrictObject<SohlItem[]> {
        return super.itemTypes as StrictObject<SohlItem[]>;
    }

    async update(
        data: PlainObject | PlainObject[],
        options?: PlainObject,
    ): Promise<SohlActor | SohlActor[]> {
        // @ts-expect-error Foundry mixin: update is implemented at runtime
        return await super.update(data as any, options);
    }
    async delete(context?: PlainObject): Promise<SohlActor> {
        // @ts-expect-error Foundry mixin: delete is implemented at runtime
        return await super.delete(context);
    }
}

export namespace SohlActor {
    export interface Data<T extends SohlPerformer = SohlPerformer>
        extends SohlPerformer.Data {
        biography: HTMLString;
        description: HTMLString;
        bioImage: FilePath;
        textReference: string;
    }

    export abstract class DataModel<P extends SohlPerformer = SohlPerformer>
        extends SohlDataModel<SohlActor, P>
        implements SohlActor.Data<P>
    {
        declare parent: SohlActor;
        static override LOCALIZATION_PREFIXES = ["SOHLACTORDATA"];
        protected _logic!: P;
        biography!: HTMLString;
        description!: HTMLString;
        bioImage!: FilePath;
        textReference!: string;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        get logic(): P {
            return ((this._logic as SohlPerformer) ??= new this.logicClass(
                this,
            )) as P;
        }

        get actor(): SohlActor {
            return this.parent;
        }

        /** @override */
        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                bioImage: new FilePathField({
                    categories: ["IMAGE"],
                    initial: foundry.CONST.DEFAULT_TOKEN,
                }),
                description: new HTMLField(),
                biography: new HTMLField(),
                textReference: new StringField(),
            };
        }
    }

    type HandlebarsTemplatePart =
        foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart;

    export class Sheet extends SohlDataModel.Sheet<SohlActor> {
        static PARTS: StrictObject<HandlebarsTemplatePart> = {
            header: {
                template: "system/sohl/templates/actor/parts/actor-header.hbs",
            },
            tabs: {
                template: "system/sohl/templates/actor/parts/actor-tabs.hbs",
            },
            facade: {
                template: "system/sohl/templates/actor/parts/actor-facade.hbs",
            },
            profile: {
                template: "system/sohl/templates/actor/parts/actor-profile.hbs",
            },
            skills: {
                template: "system/sohl/templates/actor/parts/actor-skills.hbs",
            },
            combat: {
                template: "system/sohl/templates/actor/parts/actor-combat.hbs",
            },
            trauma: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-trauma.hbs",
            },
            mysteries: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-mysteries.hbs",
            },
            gear: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-gear.hbs",
            },
            actions: {
                template:
                    "system/sohl/templates/actor/parts/actor-nested-actions.hbs",
            },
            events: {
                template: "system/sohl/templates/actor/parts/actor-events.hbs",
            },
            effects: {
                template: "system/sohl/templates/actor/parts/actor-effects.hbs",
            },
        };

        override _configureRenderOptions(
            options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
        ): void {
            super._configureRenderOptions(options);
            if (this.document.limited) {
                options.parts = ["header", "facade"];
            } else {
                options.parts = [
                    "header",
                    "tabs",
                    "facade",
                    "profile",
                    "skills",
                    "combat",
                    "trauma",
                    "mysteries",
                    "gear",
                    "actions",
                    "events",
                    "effects",
                ];
            }
        }

        override async _prepareContext(
            options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
        ): Promise<PlainObject> {
            return await super._prepareContext(options);
        }

        // static get defaultOptions() {
        //     return foundryHelpers.mergeObject(super.defaultOptions, {
        //         classes: ["sohl", "sheet", "actor"],
        //         width: 900,
        //         height: 640,
        //         filters: [
        //             {
        //                 inputSelector: 'input[name="search-traits"]',
        //                 contentSelector: ".traits",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-skills"]',
        //                 contentSelector: ".skills",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-bodylocations"]',
        //                 contentSelector: ".bodylocations-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-afflictions"]',
        //                 contentSelector: ".afflictions-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-mysteries"]',
        //                 contentSelector: ".mysteries-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-mysticalabilities"]',
        //                 contentSelector: ".mysticalabilities-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-gear"]',
        //                 contentSelector: ".gear-list",
        //             },
        //             {
        //                 inputSelector: 'input[name="search-effects"]',
        //                 contentSelector: ".effects-list",
        //             },
        //         ],
        //     });
        // }
    }
}
