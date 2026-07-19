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

import type { SohlActor } from "./SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import type { FilePath, HTMLString } from "@src/utils/helpers";
import {
    SohlDataModel,
    defineSohlDataSchema,
} from "@src/core/foundry/SohlDataModel";
import type {
    SohlActorLogic,
    SohlActorData,
} from "@src/document/actor/logic/SohlActorBaseLogic";
import type { MovementProfile } from "@src/document/actor/logic/movement";
import {
    MOVEMENT_MEDIUM,
    MovementMediumChoices,
    type MovementMedium,
} from "@src/utils/constants";
const {
    HTMLField,
    FilePathField,
    SchemaField,
    NumberField,
    StringField,
    ArrayField,
    BooleanField,
    JavaScriptField,
} = foundry.data.fields;

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
         * Token-bar health (`primaryTokenAttribute: "health"`). Present on the
         * schema purely so Foundry lists it as a selectable bar attribute; its
         * value is **derived every preparation** by the actor's logic and
         * **never persisted** — {@link SohlActorDataModel._preUpdate} drops any
         * write, so it stays pinned at this 100/100 initial on disk. `max` is
         * always 100; `value` is a `0…100` capability ceiling.
         */
        health: new SchemaField({
            value: new NumberField({ integer: true, initial: 100, min: 0 }),
            max: new NumberField({ integer: true, initial: 100, min: 0 }),
        }),
        /**
         * The medium this actor is currently moving in; selects the active
         * entry of {@link movementProfiles}. Defaults to
         * {@link MOVEMENT_MEDIUM.NONE} — a non-mover has no movement by data.
         */
        currentMoveMedium: new StringField({
            choices: MovementMediumChoices,
            initial: MOVEMENT_MEDIUM.NONE,
        }),
        /**
         * Per-medium movement profiles (speeds + encumbrance/strength
         * expressions). Movement is a universal actor capability; the base
         * actor logic selects the active profile by {@link currentMoveMedium}.
         */
        movementProfiles: new ArrayField(
            new SchemaField({
                medium: new StringField({
                    required: true,
                    choices: MovementMediumChoices,
                }),
                feetPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                leaguesPerWatch: new NumberField({
                    integer: false,
                    min: 0,
                    initial: 0,
                }),
                encumbrance: new JavaScriptField({
                    blank: false,
                    initial: "0",
                }),
                strMod: new JavaScriptField({ blank: false, initial: "0" }),
                disabled: new BooleanField({ initial: false }),
            }),
            { initial: [] },
        ),
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
     * Token-bar health `{ value, max }` — derived each preparation by the
     * actor's logic and never persisted (see {@link SohlActorDataModel._preUpdate}).
     */
    health!: { value: number; max: number };
    /** The medium this actor is currently moving in (selects a profile). */
    currentMoveMedium!: MovementMedium;
    /** Per-medium movement profiles persisted on this actor. */
    movementProfiles!: MovementProfile[];

    /**
     * Drop any attempt to persist derived health. `health` is recomputed every
     * preparation and exposed only for the token resource bar; because Foundry
     * treats a schema `NumberField` bar as editable, a GM could drag it and try
     * to write `system.health`. We strip that here so the field stays at its
     * 100/100 initial on disk and the derived value always wins at runtime.
     * @param changes - The candidate document changes (health lives at `system.health`).
     * @param options - Update options, forwarded to `super`.
     * @param user - The requesting user.
     * @returns `false` to veto, otherwise `undefined`.
     */
    protected override async _preUpdate(
        changes: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preUpdate(
            changes as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        // Handle both expanded (`system.health`) and flat (`system.health.value`)
        // update shapes.
        if (foundry.utils.hasProperty(changes, "system.health")) {
            foundry.utils.deleteProperty(changes, "system.health");
        }
        for (const key of Object.keys(changes)) {
            if (key === "system.health" || key.startsWith("system.health.")) {
                delete changes[key];
            }
        }
        return undefined;
    }

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
     * accessor the actor logic layer iterates through ({@link sohl.document.actor.logic.SohlActorData}
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
