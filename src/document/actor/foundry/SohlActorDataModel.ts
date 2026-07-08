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

import type { SohlActor } from "./SohlActor";
import type {
    SohlItem,
    SohlItemLogic,
} from "@src/document/item/foundry/SohlItem";
import type { FilePath, HTMLString } from "@src/utils/helpers";
import {
    SohlDataModel,
    defineSohlDataSchema,
} from "@src/core/foundry/SohlDataModel";
import type {
    SohlActorLogic,
    SohlActorData,
} from "@src/document/actor/logic/SohlActorBaseLogic";
const { HTMLField, FilePathField } = foundry.data.fields;

/**
 * Builds the base actor data schema (portrait, appearance, dossier).
 * @returns The base actor data schema.
 */
function defineSohlActorDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...defineSohlDataSchema(),
        portrait: new FilePathField({
            categories: ["IMAGE"],
            initial: foundry.CONST.DEFAULT_TOKEN,
        }),
        appearance: new HTMLField(),
        dossier: new HTMLField(),
        /**
         * The {@link CombatantGroup} name this actor's combatants are auto-
         * assigned to when they enter combat (blank → the default group). Read
         * by `SohlCombat.seedCombatantGroups` at combatant creation. Lives on the
         * actor (not the token) because tokens cannot carry typed system data.
         */
        defaultCombatGroup: new foundry.data.fields.StringField({
            required: false,
            blank: true,
            initial: "",
        }),
    };
}

type SohlActorDataSchema = ReturnType<typeof defineSohlActorDataSchema>;

/**
 * Base persisted data model for all actor types — defines the common schema
 * (portrait, appearance, dossier) and label helpers. Concrete actor data models
 * extend this with their type-specific fields.
 *
 * @typeParam TSchema - The Foundry data schema for this model.
 * @typeParam TLogic - The actor logic type this data drives.
 * @internal
 */
export abstract class SohlActorDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlActorDataSchema,
    TLogic extends SohlActorLogic<SohlActorData> =
        SohlActorLogic<SohlActorData>,
>
    extends SohlDataModel<TSchema, SohlActor, TLogic>
    implements SohlActorData<TLogic>
{
    /** Rich-text dossier / background notes. */
    dossier!: HTMLString;
    /** Rich-text physical-appearance description. */
    appearance!: HTMLString;
    /** Path to the actor's portrait image. */
    portrait!: FilePath;
    /**
     * The {@link CombatantGroup} name this actor's combatants are auto-assigned
     * to on entering combat; blank uses the default group.
     */
    defaultCombatGroup!: string;

    /**
     * Constructs the actor data model, requiring a {@link SohlActor} parent.
     * @param data - Source data for the model.
     * @param options - Must provide `options.parent` as a {@link SohlActor}.
     * @throws If the parent is not a {@link SohlActor}.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent?.documentName === "Actor")) {
            throw new Error("Parent must be of type SohlActor");
        }
        super(data, options);
    }

    /** The owning {@link SohlActor}. */
    get actor(): SohlActor {
        return this.parent;
    }

    /**
     * The logic instance of every embedded item — the single Foundry-coupled
     * accessor the actor logic layer iterates through ({@link SohlActorData}
     * port). The pure `allLogics` / `logicTypes` / `getItemLogic` getters on the
     * actor logic derive everything from this list.
     */
    get itemLogics(): SohlItemLogic<any>[] {
        return this.parent.items.map((it: SohlItem) => it.logic);
    }

    /** Whether the actor is owned by at least one player (non-GM) user. */
    get hasPlayerOwner(): boolean {
        return this.parent.hasPlayerOwner ?? false;
    }

    /** Localization key prefix for this actor kind (e.g. `SOHL.Actor.being`). */
    get i18nPrefix(): string {
        return `SOHL.Actor.${this.kind}`;
    }

    /**
     * The localized type label for this actor; with `withName`, combined with
     * the actor's name.
     * @param options - Label-formatting options.
     * @param options.withName - Whether to combine the type with the actor name.
     * @returns The localized label.
     */
    label(
        options: { withName: boolean } = {
            withName: true,
        },
    ): string {
        let result = sohl.i18n.localize(`SOHL.${this.kind}.typelabel`);
        if (options.withName) {
            result = sohl.i18n.format("SOHL.SohlActor.labelWithName", {
                name: this.parent.name,
                type: result,
            });
        }
        return result;
    }

    /**
     * Define the common actor data schema (portrait, appearance, dossier).
     * @returns The base actor data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlActorDataSchema();
    }
}
