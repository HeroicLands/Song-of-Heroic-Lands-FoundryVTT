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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { BodyPartConfig } from "@src/apps/foundry/BodyPartConfig";
import { BodyLocationConfig } from "@src/apps/foundry/BodyLocationConfig";
import { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import { blankBodyPart } from "@src/entity/body/blankBodyPart";
import { blankBodyLocation } from "@src/entity/body/blankBodyLocation";
import { validateBodyShortcode } from "@src/entity/body/planBodyShortcode";
import { partHasLocations } from "@src/entity/body/body-structure-edit";
import { SOHL_CONTEXT_MENU_SORT_GROUP } from "@src/utils/constants";

/**
 * Foundry-coupled orchestration for the Being sheet's Combat-tab Body Structure
 * tree. The **Edit** editors (`BodyPartConfig` / `BodyLocationConfig`) come from
 * #721 / #722; this module adds the tree-level affordances of #720 — the add
 * flows, the delete flows (with the part-delete guard), and the per-row `⋮`
 * context menus wiring Edit + Delete. The domain math and blank/validation
 * helpers are pure and unit-tested; this only wires them to dialogs, the actor
 * document, and the context-menu UI.
 */

/**
 * Open the `BodyPartConfig` editor for a body part on an actor.
 * @param actor - The being whose body part is edited.
 * @param shortcode - The part's shortcode (its row key within the structure).
 */
export function openBodyPartEditor(actor: SohlActor, shortcode: string): void {
    void new BodyPartConfig(actor, shortcode).render(true);
}

/**
 * Open the `BodyLocationConfig` editor for a body location on an actor.
 * @param actor - The being whose body location is edited.
 * @param partShortcode - The shortcode of the owning body part.
 * @param shortcode - The location's shortcode (its row key within the part).
 */
export function openBodyLocationEditor(
    actor: SohlActor,
    partShortcode: string,
    shortcode: string,
): void {
    void new BodyLocationConfig(actor, partShortcode, shortcode).render(true);
}

/** The name + shortcode collected by the "Add Part/Location" dialog. */
interface NewBodyEntry {
    /** Display name. */
    name: string;
    /** Unique shortcode within its scope. */
    shortcode: string;
}

/**
 * Prompt for a new body part / location's Name and Shortcode. Returns the
 * entered values, or `undefined` if the dialog was dismissed. The content is
 * static markup with only trusted, localized labels interpolated (never user
 * data), so it does not build HTML from persisted values.
 *
 * @param title - The dialog window title.
 * @returns The entered name/shortcode, or `undefined` on dismissal.
 */
async function promptNewEntry(
    title: string,
): Promise<NewBodyEntry | undefined> {
    const content = `
        <form class="body-structure-create standard-form">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" placeholder="e.g. Left Wing" autofocus />
            </div>
            <div class="form-group">
                <label>Shortcode</label>
                <input type="text" name="shortcode" placeholder="e.g. lwing" />
            </div>
        </form>`;
    let fd: PlainObject | undefined;
    try {
        fd = (await foundry.applications.api.DialogV2.prompt({
            window: { title, icon: "fa-solid fa-plus" },
            content,
            ok: {
                label: "Create",
                icon: "fa-solid fa-plus",
                callback: (_event: Event, button: any) =>
                    new foundry.applications.ux.FormDataExtended(button.form)
                        .object,
            },
        } as any)) as PlainObject | undefined;
    } catch {
        // DialogV2.prompt rejects on dismissal (X / Escape) → treat as no-add.
        return undefined;
    }
    if (!fd) return undefined;
    return {
        name: String(fd.name ?? "").trim(),
        shortcode: String(fd.shortcode ?? "").trim(),
    };
}

/**
 * Prompt for a new body part (Name / Shortcode), append it to the actor's body
 * structure, and open the editor on it. Dismissing the dialog adds nothing; a
 * blank name, or a blank / duplicate shortcode, is refused with a warning.
 * @param actor - The being to add a part to.
 */
export async function addBodyPart(actor: SohlActor): Promise<void> {
    const structure = getActorBody(actor.logic)?.structure;
    if (!structure) {
        sohl.log.uiWarn("This actor has no body structure to edit.");
        return;
    }
    const spec = await promptNewEntry("Add Body Part");
    if (!spec) return;
    if (!spec.name) {
        sohl.log.uiWarn("Body part name cannot be blank.");
        return;
    }
    const existing = structure.parts.map((p) => p.shortcode);
    const error = validateBodyShortcode(
        spec.shortcode,
        existing,
        "body part",
        "this body",
    );
    if (error) {
        sohl.log.uiWarn(error);
        return;
    }

    await actor.update(
        structure.addPartUpdate(blankBodyPart(spec.name, spec.shortcode)),
    );
    openBodyPartEditor(actor, spec.shortcode);
}

/**
 * Prompt for a new hit location (Name / Shortcode), append it to the given
 * body part, and open the editor on it. Dismissing the dialog adds nothing; a
 * blank name, or a blank / duplicate shortcode (within the part), is refused
 * with a warning.
 * @param actor - The owning being.
 * @param partShortcode - The shortcode of the part to add a location to.
 */
export async function addBodyLocation(
    actor: SohlActor,
    partShortcode: string,
): Promise<void> {
    const structure = getActorBody(actor.logic)?.structure;
    const part = structure?.getPartByCode(partShortcode);
    if (!structure || !part) return;

    const spec = await promptNewEntry("Add Hit Location");
    if (!spec) return;
    if (!spec.name) {
        sohl.log.uiWarn("Body location name cannot be blank.");
        return;
    }
    const existing = part.locations.map((l) => l.shortcode);
    const error = validateBodyShortcode(
        spec.shortcode,
        existing,
        "body location",
        "this part",
    );
    if (error) {
        sohl.log.uiWarn(error);
        return;
    }

    await actor.update(
        part.addLocationUpdate(blankBodyLocation(spec.name, spec.shortcode)),
    );
    openBodyLocationEditor(actor, partShortcode, spec.shortcode);
}

/**
 * Delete a body part after confirmation. Deletion is **refused** while the part
 * still owns any hit locations — the user must remove those first — so a part is
 * never removed out from under its locations.
 * @param actor - The owning being.
 * @param shortcode - The shortcode of the part to delete.
 */
export async function deleteBodyPart(
    actor: SohlActor,
    shortcode: string,
): Promise<void> {
    const structure = getActorBody(actor.logic)?.structure;
    const part = structure?.getPartByCode(shortcode);
    if (!structure || !part) return;

    if (partHasLocations(structure.parts as any, part.index)) {
        sohl.log.uiWarn(
            `Cannot delete "${part.name}": remove its hit locations first.`,
        );
        return;
    }

    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Delete Body Part?" },
        content: `<p>Delete body part <strong>${foundry.utils.escapeHTML(
            part.name,
        )}</strong>? This cannot be undone.</p>`,
    } as any);
    if (!confirmed) return;
    await actor.update(structure.removePartUpdate(shortcode));
}

/**
 * Delete a hit location after confirmation.
 * @param actor - The owning being.
 * @param partShortcode - The shortcode of the owning part.
 * @param shortcode - The shortcode of the location to delete.
 */
export async function deleteBodyLocation(
    actor: SohlActor,
    partShortcode: string,
    shortcode: string,
): Promise<void> {
    const structure = getActorBody(actor.logic)?.structure;
    const part = structure?.getPartByCode(partShortcode);
    const loc = part?.getLocationByCode(shortcode);
    if (!part || !loc) return;

    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Delete Hit Location?" },
        content: `<p>Delete hit location <strong>${foundry.utils.escapeHTML(
            loc.name,
        )}</strong>? This cannot be undone.</p>`,
    } as any);
    if (!confirmed) return;
    await actor.update(part.removeLocationUpdate(shortcode));
}

/**
 * Bind the per-row `⋮` context menu to the Combat-tab Body Structure tree,
 * offering **Edit** and **Delete** on each body-part header and each
 * body-location row. Edit opens the relevant config editor (#721 / #722);
 * Delete removes the entry after confirmation, with the part-delete guard
 * (#720). The add / drag-sort affordances are wired on the sheet.
 *
 * Part headers carry `data-part-shortcode`; location rows carry
 * `data-part-shortcode` **and** `data-location-shortcode`, so a single handler
 * resolves the right entry from the clicked element's dataset.
 *
 * @param actor - The being the sheet edits.
 * @param element - The sheet root element to bind the menu within.
 */
export function bindBodyStructureContextMenu(
    actor: SohlActor,
    element: HTMLElement,
): void {
    const partCodeOf = (target: HTMLElement): string | undefined =>
        (target.closest("[data-part-shortcode]") as HTMLElement | null)?.dataset
            .partShortcode;
    const locCodeOf = (target: HTMLElement): string | undefined =>
        (target.closest("[data-location-shortcode]") as HTMLElement | null)
            ?.dataset.locationShortcode;

    const partEntries = [
        new SohlContextMenu.Entry({
            id: "bodypart-edit",
            name: "Edit Body Part",
            iconFAClass: "fa-solid fa-pen-to-square",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const code = partCodeOf(target);
                if (code) openBodyPartEditor(actor, code);
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
        new SohlContextMenu.Entry({
            id: "bodypart-delete",
            name: "Delete Body Part",
            iconFAClass: "fa-solid fa-trash",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const code = partCodeOf(target);
                if (code) void deleteBodyPart(actor, code);
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
    ];

    const locationEntries = [
        new SohlContextMenu.Entry({
            id: "bodylocation-edit",
            name: "Edit Location",
            iconFAClass: "fa-solid fa-pen-to-square",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const partCode = partCodeOf(target);
                const locCode = locCodeOf(target);
                if (partCode && locCode) {
                    openBodyLocationEditor(actor, partCode, locCode);
                }
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
        new SohlContextMenu.Entry({
            id: "bodylocation-delete",
            name: "Delete Location",
            iconFAClass: "fa-solid fa-trash",
            condition: () => true,
            callback: (target: HTMLElement) => {
                const partCode = partCodeOf(target);
                const locCode = locCodeOf(target);
                if (partCode && locCode) {
                    void deleteBodyLocation(actor, partCode, locCode);
                }
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        }),
    ];

    new SohlContextMenu(element, ".bodypart-contextmenu", partEntries, {
        eventName: "click",
        parent: (actor as any).logic,
    });
    new SohlContextMenu(element, ".bodylocation-contextmenu", locationEntries, {
        eventName: "click",
        parent: (actor as any).logic,
    });
}
