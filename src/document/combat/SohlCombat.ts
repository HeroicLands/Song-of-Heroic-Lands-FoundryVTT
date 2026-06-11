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

import { fvttIsActiveGM } from "@src/core/FoundryHelpers";
import type { SohlCombatant } from "@src/document/combatant/SohlCombatant";
import {
    type ExistingGroup,
    type SeedingCombatant,
    resolveGroupSeeding,
} from "./combat-logic";

/**
 * SoHL's Combat document. Seeds newly created combatants into
 * {@link CombatantGroup}s (see {@link resolveGroupSeeding}) and drives the
 * system's combat lifecycle.
 */
export class SohlCombat<
    SubType extends Combat.SubType = Combat.SubType,
> extends Combat<SubType> {
    /**
     * After combatants are created, seed each ungrouped one into a
     * {@link CombatantGroup} derived from its token's `sohl.defaultCombatGroup`
     * flag (defaulting to `"Opponents"`). Batch-aware: several combatants
     * created in one operation that want the same new group share a single
     * group create. Only the active GM performs the authoritative writes.
     *
     * @param parent - The parent document of the created descendants.
     * @param collection - The name of the embedded collection that was modified.
     * @param documents - The created descendant documents.
     * @param data - The source data used to create the documents.
     * @param options - The options passed to the creation operation.
     * @param userId - The id of the user that performed the creation.
     */
    protected override _onCreateDescendantDocuments(
        parent: any,
        collection: string,
        documents: any[],
        data: any,
        options: any,
        userId: string,
    ): void {
        (super._onCreateDescendantDocuments as any)(
            parent,
            collection,
            documents,
            data,
            options,
            userId,
        );
        if (collection !== "combatants") return;
        if (!fvttIsActiveGM()) return;
        void this.seedCombatantGroups(documents as SohlCombatant[]);
    }

    /**
     * Assign newly created combatants to their desired {@link CombatantGroup}s,
     * creating any missing groups first and then updating each combatant's
     * group, per the plan from {@link resolveGroupSeeding}.
     *
     * @param combatants - The combatants to seed into groups.
     */
    private async seedCombatantGroups(
        combatants: SohlCombatant[],
    ): Promise<void> {
        const newCombatants: SeedingCombatant[] = combatants.map((c) => ({
            id: c.id!,
            hasGroup: !!c.groupId,
            desiredName:
                ((c.token as any)?.getFlag?.("sohl", "defaultCombatGroup") as
                    | string
                    | undefined) ?? null,
        }));

        const existingGroups: ExistingGroup[] = (
            this.groups.contents as any[]
        ).map((g) => ({ id: g.id, name: g.name }));

        const plan = resolveGroupSeeding(newCombatants, existingGroups);
        if (!plan.assignments.length) return;

        let created: any[] = [];
        if (plan.groupsToCreate.length) {
            created = (await this.createEmbeddedDocuments(
                "CombatantGroup",
                plan.groupsToCreate.map((name) => ({ name })),
            )) as any[];
        }

        // Case-insensitive name -> id map from existing + freshly created groups.
        const idByLower = new Map<string, string>();
        for (const g of this.groups.contents as any[]) {
            idByLower.set(g.name.toLowerCase(), g.id);
        }
        for (const g of created) {
            idByLower.set(g.name.toLowerCase(), g.id);
        }

        const updates = plan.assignments
            .map((a) => {
                const groupId = idByLower.get(a.groupName.toLowerCase());
                return groupId ? { _id: a.combatantId, group: groupId } : null;
            })
            .filter((u): u is { _id: string; group: string } => u !== null);

        if (updates.length) {
            await this.updateEmbeddedDocuments("Combatant", updates as any[]);
        }
    }
}

/**
 * Builds the Foundry data schema for the SoHL Combat document (currently empty).
 * @returns The combat data schema.
 */
function defineSohlCombatDataSchema(): foundry.data.fields.DataSchema {
    return {};
}

type SohlCombatDataSchema = ReturnType<typeof defineSohlCombatDataSchema>;

/** @internal */
export class SohlCombatDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlCombatDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlCombat> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Combat"];
    static readonly kind = "sohlcombatdata";

    /**
     * Returns the Foundry data schema for the SoHL Combat document.
     * @returns The combat data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlCombatDataSchema();
    }
}
