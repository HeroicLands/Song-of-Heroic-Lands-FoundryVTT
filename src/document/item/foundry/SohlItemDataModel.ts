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

import type { SohlItem } from "./SohlItem";
import { resolveShortcodeKey, type HTMLString } from "@src/utils/helpers";
import {
    SohlDataModel,
    defineSohlDataSchema,
} from "@src/core/foundry/SohlDataModel";
import type {
    SohlItemLogic,
    SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
const { HTMLField } = foundry.data.fields;

/**
 * Builds the base data schema shared by all SoHL items (the notes and
 * generated documentation HTML fields). `shortcode` — required and non-blank —
 * comes from the shared base schema ({@link defineSohlDataSchema}); items and
 * actors both enforce the `(type, shortcode)` key.
 * @returns The Foundry data schema common to every item kind.
 */
function defineSohlItemDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...defineSohlDataSchema(),
        notes: new HTMLField(),
        docHtml: new HTMLField(),
    };
}

type SohlItemDataSchema = ReturnType<typeof defineSohlItemDataSchema>;

/**
 * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" system. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 * @internal
 */
export abstract class SohlItemDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlItemDataSchema,
    TLogic extends SohlItemLogic<SohlItemData> = SohlItemLogic<SohlItemData>,
>
    extends SohlDataModel<TSchema, SohlItem, TLogic>
    implements SohlItemData<TLogic>
{
    notes!: HTMLString;
    docHtml!: HTMLString;

    /**
     * Builds the item data model, enforcing that its parent document is a
     * {@link SohlItem}.
     * @param data - Source data for the data model.
     * @param options - Data model options; `parent` must be a `SohlItem`.
     * @throws If the supplied parent is not a `SohlItem`.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!(options.parent?.documentName === "Item")) {
            throw new Error("Parent must be of type SohlItem");
        }
        super(data, options);
    }

    /** The owning {@link SohlItem} document. */
    get item(): SohlItem {
        return this.parent;
    }

    /** Localization key prefix for this item kind, e.g. `"SOHL.Item.skill"`. */
    get i18nPrefix(): string {
        return `SOHL.Item.${this.kind}`;
    }

    /**
     * Get the full label for this item, optionally including name and subtype.
     * @remarks
     * The item name and item subtype are both optional, although shown by default.
     * In English, the format will be:
     *    `[<item name>] [<item subtype>] <item type>`
     *
     * @example
     * EN: `Melee Combat Skill`
     * ES: `Habilidad de Combate Cuerpo a Cuerpo`
     * RU: `Навык боя Ближний бой`
     * DE: `Nahkampf Kampffertigkeit`
     *
     * @param options - Controls which parts of the label are included.
     * @param options.withName - Whether to prefix the label with the item name.
     * @param options.withSubType - Whether to include the item subtype in the label.
     * @returns The fully localized string in the appropriate language based on the
     * user's settings.
     */
    label(
        options: { withName: boolean; withSubType: boolean } = {
            withName: true,
            withSubType: true,
        },
    ): string {
        let typeText: string;
        if (options.withSubType && (this as any).subType) {
            typeText = `SOHL.${this.kind}.typelabel.${(this as any).subType}`;
        } else {
            typeText = `SOHL.${this.kind}.typelabel`;
        }

        let result = sohl.i18n.localize(typeText);
        if (options.withName) {
            result = sohl.i18n.format("SOHL.SohlItem.labelWithName", {
                name: this.parent.name,
                type: result,
            });
        }
        return result;
    }

    /**
     * Returns the Foundry data schema common to all SoHL items.
     * @returns The base item data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlItemDataSchema();
    }

    /**
     * Enforce the item-key invariant on create. `(type, shortcode)` is a unique
     * key — per owning actor for an embedded item, per world item directory for a
     * world item (compendium-pack items keep their source key). A create that
     * names no shortcode gets one derived and uniquified; an explicitly-requested
     * shortcode that collides is auto-bumped for a Foundry duplicate and rejected
     * for a general create. See {@link resolveShortcodeKey}. Subtype `_preCreate`
     * overrides run this via their `super` call.
     *
     * @param data - The creation source data.
     * @param options - The creation options.
     * @param user - The requesting user.
     * @returns `false` to veto the creation, otherwise void.
     */
    protected override async _preCreate(
        data: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(
            data as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;

        const item = this.parent;
        const type = item.type;
        const desired = (this as any).shortcode ?? "";

        // Scope of the key: an embedded item is unique among its actor's items
        // of the same type; a world item is unique across the world item
        // directory. Items inside a compendium pack keep their source key.
        const actor = (item as any)?.actor;
        const siblings =
            actor ? actor.items
            : item.pack ? undefined
            : (game as any).items;
        const taken = new Set<string>();
        if (siblings) {
            for (const other of siblings) {
                if (other.id !== item.id && other.type === type) {
                    taken.add((other.system as any)?.shortcode);
                }
            }
        }

        const isDuplicate = !!(
            (data as any)?._stats?.duplicateSource ??
            (item as any)?._stats?.duplicateSource
        );
        const resolved = resolveShortcodeKey(
            desired,
            item.name ?? "",
            type,
            taken,
            isDuplicate,
        );
        if ("reject" in resolved) {
            (globalThis as any).ui?.notifications?.warn(
                `${actor?.name ?? "The world"} already has a ${type} with shortcode "${desired}".`,
            );
            return false;
        }
        if (resolved.shortcode !== desired) {
            this.updateSource({ shortcode: resolved.shortcode } as any);
        }
        return undefined;
    }
}
