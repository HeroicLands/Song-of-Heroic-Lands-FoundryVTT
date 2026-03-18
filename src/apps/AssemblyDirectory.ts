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

import type { SohlActor } from "@src/actor/foundry/SohlActor";
import type { SohlItem } from "@src/item/foundry/SohlItem";
import { ACTOR_KIND } from "@src/utils/constants";

/**
 * A custom sidebar directory for Assembly actors.
 *
 * Assemblies are hybrid Actor/Item entities that exist to host complex
 * nested item hierarchies. They get their own sidebar tab, separate from
 * the Actors and Items directories, to reflect their unique nature.
 *
 * This directory filters the world's actor collection to show only
 * Assembly-type actors.
 */
// TODO: The "Create Assembly" button should launch a Create Item workflow
// (item type selection + name entry). The resulting item is created as an
// embedded item inside a new Assembly actor with the same name — not as a
// World Item. This ensures Assemblies are never empty.
export class AssemblyDirectory extends ActorDirectory {
    static tabName = "assemblies";

    /**
     * Filter the actor collection to show only Assembly-type actors.
     */
    _getVisibleTreeContents(): SohlActor[] {
        return (this as any).collection.contents.filter(
            (actor: SohlActor) => actor.type === ACTOR_KIND.ASSEMBLY,
        );
    }
}

/**
 * A custom ActorDirectory subclass that filters out Assembly actors,
 * so they only appear in the dedicated Assemblies sidebar tab.
 */
export class FilteredActorDirectory extends ActorDirectory {
    /**
     * Filter the actor collection to exclude Assembly-type actors.
     */
    _getVisibleTreeContents(): SohlActor[] {
        return (this as any).collection.contents.filter(
            (actor: SohlActor) => actor.type !== ACTOR_KIND.ASSEMBLY,
        );
    }
}

/**
 * Register the Assemblies sidebar tab and related hooks.
 * Call this during the "init" hook.
 */
export function registerAssemblySidebar(): void {
    // Register the custom directories
    (CONFIG.ui as any).assemblies = AssemblyDirectory;
    (CONFIG.ui as any).actors = FilteredActorDirectory;

    // Register the Assemblies tab in the sidebar tab bar
    (foundry.applications.sidebar as any).Sidebar.TABS.assemblies = {
        tooltip: "SOHL.Assembly.sidebar.tooltip",
        icon: "fas fa-box-open",
    };
}

/**
 * Register the "Create Assembly" context menu entry on the Items directory.
 * Call this during the "init" hook or "ready" hook.
 */
export function registerAssemblyContextMenu(): void {
    Hooks.on(
        "getItemDirectoryEntryContext" as any,
        (_directory: any, entries: any[]) => {
            entries.push({
                name: "SOHL.Assembly.contextMenu.createAssembly",
                icon: '<i class="fas fa-box-open"></i>',
                condition: (li: HTMLElement) => {
                    const itemId = li.dataset.documentId ?? li.dataset.entryId;
                    if (!itemId) return false;
                    const item = (game as any).items.get(itemId) as
                        | SohlItem
                        | undefined;
                    return !!item;
                },
                callback: async (li: HTMLElement) => {
                    const itemId = li.dataset.documentId ?? li.dataset.entryId;
                    if (!itemId) return;
                    const sourceItem = (game as any).items.get(itemId) as
                        | SohlItem
                        | undefined;
                    if (!sourceItem) return;

                    // Create a new Assembly actor with the same name
                    const assemblyData = {
                        name: sourceItem.name,
                        type: ACTOR_KIND.ASSEMBLY,
                    };
                    const assembly = (await Actor.create(assemblyData)) as
                        | SohlActor
                        | undefined;
                    if (!assembly) return;

                    // Copy the source item into the Assembly as the canonical item
                    const itemData = sourceItem.toObject();
                    delete (itemData as any)._id;
                    foundry.utils.setProperty(
                        itemData,
                        "system.nestedIn",
                        null,
                    );
                    await assembly.createEmbeddedDocuments("Item", [itemData]);
                },
            });
        },
    );
}
