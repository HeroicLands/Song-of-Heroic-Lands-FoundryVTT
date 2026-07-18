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
import { GearLogic, GearData } from "@src/document/item/logic/GearLogic";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { dialog, fvttDeleteEmbeddedItems } from "@src/core/FoundryHelpers";
import { toHTMLString } from "@src/utils/helpers";
import { SohlItemLogic } from "./SohlItemBaseLogic";

/**
 * Storage for other items.
 *
 * Container Gear represents backpacks, saddlebags, chests, belt pouches, cargo
 * holds, and other receptacles that hold gear items. Containers track a
 * **maximum capacity** limiting how much they can store.
 *
 * Container Gear may be attached to Beings (a character's backpack) or Vehicles
 * (a ship's cargo hold). Nested items inside a container inherit carry/equip
 * state from the container.
 *
 * Inherits weight, value, quality, and durability tracking from {@link GearLogic}.
 *
 * @typeParam TData - The ContainerGear data interface.
 */
export class ContainerGearLogic<
    TData extends ContainerGearData = ContainerGearData,
> extends GearLogic<TData> {
    /**
     * Maximum capacity of this container as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link ContainerGearData.maxCapacityBase}.
     */
    maxCapacity!: ValueModifier;

    /**
     * Delete this container, and all contents, after confirming with the user.
     *
     * @remarks Deleting a container also deletes everything inside it, which is
     * not obvious, so warn before it happens.
     * @param _context - The action context (unused).
     * @returns The localized contents-will-be-deleted warning.
     */
    override async deleteDocument(_context: SohlActionContext): Promise<void> {
        const confirmed = await dialog({
            title: sohl.i18n.format("SOHL.ContainerGear.delete.title", {
                name: this.name,
            }),
            content: toHTMLString(`<p>{{warning}}</p>`),
            data: {
                name: this.name,
                warning: sohl.i18n.localize(
                    "SOHL.ContainerGear.delete.warning",
                ),
            },
            buttons: [
                {
                    action: "yes",
                    label: sohl.i18n.localize(
                        "SOHL.SohlItemBaseLogic.delete.yes",
                    ),
                    icon: "fa-solid fa-trash",
                },
                {
                    action: "no",
                    label: sohl.i18n.localize(
                        "SOHL.SohlItemBaseLogic.delete.no",
                    ),
                    default: true,
                },
            ],
            callback: (_formData: any, action: string) => action === "yes",
            rejectClose: false,
        });
        if (confirmed !== true) return;
        this.item.id;
        const delIds =
            this.actorLogic?.allLogics
                .filter((logic: any) => logic.containedIn === this)
                .map((logic) => logic.item.id)
                .filter((id) => id != null) ?? [];
        if (this.id) delIds.push(this.id);
        await fvttDeleteEmbeddedItems(this.actorLogic, [...delIds]);
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.maxCapacity = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.maxCapacityBase);
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

/**
 * Persisted data backing {@link ContainerGearLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `containergear` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "containergear"`. The backing DataModel implements this interface.
 */
export interface ContainerGearData<
    TLogic extends ContainerGearLogic<ContainerGearData> =
        ContainerGearLogic<any>,
> extends GearData<TLogic> {
    /** Maximum weight or volume this container can hold */
    maxCapacityBase: number;
}
