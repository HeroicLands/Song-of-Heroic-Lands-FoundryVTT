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

import type { SohlActionContext } from "@common/SohlActionContext";

import {
    SohlActor,
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import { ACTOR_KIND } from "@utils/constants";
const { DocumentIdField } = foundry.data.fields;

/**
 * Logic for the **Assembly** actor type — a container for complex items with
 * nested item hierarchies.
 *
 * In Foundry VTT, items can only exist as embedded documents within an actor.
 * SoHL models item nesting (items within items) using `nestedIn` pointers,
 * but this virtual hierarchy still requires all items to be owned by an actor.
 * An Assembly provides that actor — it exists so that complex, multi-part
 * items can be expressed as a complete unit with their full nesting structure.
 *
 * For example, a "Broadsword" Assembly might contain:
 * - A Broadsword {@link WeaponGearLogic | WeaponGear} item (the root)
 *   - Nested {@link MeleeWeaponStrikeModeLogic | Strike Modes} (Slash, Thrust)
 *   - A nested {@link MysticalDeviceLogic | Mystical Device} (enchantment)
 *     - Nested {@link MysticalAbilityLogic | Mystical Abilities} (the device's powers)
 *
 * The Assembly's **canonical item** ({@link AssemblyData.canonicalItemId})
 * identifies the root item that the assembly represents — in this example,
 * the Broadsword WeaponGear. Items whose `nestedIn` is `null` are top-level
 * items within the assembly; items with a `nestedIn` value are nested under
 * the referenced parent item.
 *
 * Assemblies are somewhat ephemeral: when an Assembly is dropped onto another
 * actor (e.g., giving a character the Broadsword), its items are copied into
 * the target actor with their nesting relationships preserved. Since Foundry
 * does not allow actors to embed other actors, the Assembly itself is not
 * transferred — only its items are.
 *
 * @typeParam TData - The Assembly data interface.
 */
export class AssemblyLogic<
    TData extends AssemblyData = AssemblyData,
> extends SohlActorBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface AssemblyData<
    TLogic extends SohlActorLogic<AssemblyData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /** ID of the root item this assembly represents, or null */
    canonicalItemId: string | null;
}

function defineAssemblyDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),

        /**
         * The ID of the canonical item that this assembly represents, if any.
         *
         * @remarks
         * An assembly often represents a singlular item and all of its nested
         * items. This field indicates the item that is considered to be the
         * "root" item of the assembly; that is, the item that the assembly represents.
         * It is possible for an assembly to not have a canonical item, in which case
         * this field will be `null`.
         */
        canonicalItemId: new DocumentIdField({
            initial: null,
        }),
    };
}

type AssemblyDataSchema = ReturnType<typeof defineAssemblyDataSchema>;

/**
 * The Foundry VTT data model for the Assembly actor.
 */
export class AssemblyDataModel<
        TSchema extends foundry.data.fields.DataSchema = AssemblyDataSchema,
        TLogic extends
            AssemblyLogic<AssemblyData> = AssemblyLogic<AssemblyData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements AssemblyData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Assembly", "SOHL.Actor"];
    static override readonly kind = ACTOR_KIND.ASSEMBLY;
    canonicalItemId!: string | null;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineAssemblyDataSchema();
    }
}

export abstract class AssemblySheet extends SohlActorSheetBase {}
