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

/**
 * Shared sheet-layer helpers for **custom (SCRIPT) action authoring**, used by
 * both the actor (Being) and item sheets so the create / edit / delete / run
 * controls behave identically on either. Each function takes the owning
 * document (a {@link SohlActor} or {@link SohlItem} — both carry
 * `system.actionDefs`, a `logic.actions` collection, and Macro-bound SCRIPT
 * actions) plus the clicked control, and performs one action-management
 * operation.
 *
 * @remarks Foundry-boundary code (touches `game`, Macros, dialogs, documents) —
 * intentionally in the Foundry layer, not the logic layer.
 */

import { fvttRenderSheet } from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    ActorKinds,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";

/** A document that owns custom actions — an actor or an item. */
type ActionOwner = SohlActor | SohlItem;

/**
 * Escape a value for safe interpolation into dialog HTML.
 * @param v - The value to escape (coerced to string).
 * @returns The HTML-escaped string.
 */
function esc(v: unknown): string {
    return String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
            (
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                }) as Record<string, string>
            )[c],
    );
}

/**
 * Resolve the {@link SohlAction} for a clicked control by walking up to its
 * `[data-action-name]` row (whose value is the action's shortcode) and looking
 * it up on the owner's logic.
 *
 * @param doc - The action-owning document.
 * @param target - The clicked control inside an action row.
 * @returns The action, or `undefined` if the row or action is missing.
 */
export function actionFromRow(
    doc: ActionOwner,
    target: HTMLElement,
): SohlAction | undefined {
    const shortcode = target
        .closest("[data-action-name]")
        ?.getAttribute("data-action-name");
    if (!shortcode) return undefined;
    return (doc as any).logic?.actions.get(shortcode) as SohlAction | undefined;
}

/**
 * Prompt for a world Macro to bind (or `<New Macro…>`, which creates a fresh
 * SCRIPT Macro and opens its sheet), then append a SCRIPT action def bound by
 * the Macro's UUID to the document's `system.actionDefs`. Macro authoring is
 * left entirely to Foundry's own UI.
 *
 * @param doc - The document to add the action to.
 */
export async function createAction(doc: ActionOwner): Promise<void> {
    const options = (game as any).macros.contents
        .map(
            (m: any) =>
                `<option value="${esc(m.uuid)}">${esc(m.name)}</option>`,
        )
        .join("");
    const content = `<form><div class="form-group"><label>${esc(
        game.i18n.localize("SOHL.Actions.name.label"),
    )}</label><input type="text" name="title" autofocus /></div><div class="form-group"><label>${esc(
        game.i18n.localize("SOHL.Actions.macro.label"),
    )}</label><select name="macro"><option value="__new__">${esc(
        game.i18n.localize("SOHL.Actions.newMacro"),
    )}</option>${options}</select></div></form>`;

    const result = (await (foundry.applications.api.DialogV2 as any).prompt({
        window: { title: game.i18n.localize("SOHL.Actions.create") },
        content,
        ok: {
            label: game.i18n.localize("SOHL.Actions.create"),
            callback: (_e: Event, button: any) =>
                new (foundry.applications.ux as any).FormDataExtended(
                    button.form,
                ).object,
        },
    })) as { title?: string; macro?: string } | null;
    if (!result?.macro) return;
    const title = String(result.title ?? "").trim();
    if (!title) {
        sohl.log.uiWarn(game.i18n.localize("SOHL.Actions.nameRequired"));
        return;
    }

    let macro: any;
    if (result.macro === "__new__") {
        // Create the Macro ourselves (never via the default create dialog) so
        // it is guaranteed to be a SCRIPT macro. Name it after the owner and
        // action, disambiguated against existing Macro names; the folder is
        // intentionally left to the user's own organization.
        const base = `${doc.name} ${title}`;
        const existing = new Set((game as any).macros.map((m: any) => m.name));
        let name = base;
        for (let n = 2; existing.has(name); n++) name = `${base} (${n})`;
        macro = await (Macro as any).create({
            name,
            type: "script",
            command: "",
        });
        // Defer authoring the Macro body to Foundry's own Macro sheet.
        void fvttRenderSheet(macro);
    } else {
        macro = await fromUuid(result.macro);
    }
    if (!macro) return;

    const def = {
        shortcode: foundry.utils.randomID(),
        subType: ACTION_SUBTYPE.SCRIPT,
        title,
        scope: SOHL_ACTION_SCOPE.SELF,
        executor: macro.uuid,
        trigger: "true",
        visible: "true",
        iconFAClass: "fa-solid fa-bolt",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    };
    const actionDefs = [
        ...(((doc.system as any).actionDefs as any[]) ?? []),
        def,
    ];
    await doc.update({ "system.actionDefs": actionDefs } as any);
}

/**
 * Open the bound Macro's own sheet for the clicked custom action, deferring all
 * macro editing to Foundry's Macro UI.
 *
 * @param doc - The action-owning document.
 * @param target - The clicked control inside an action row.
 */
export async function editAction(
    doc: ActionOwner,
    target: HTMLElement,
): Promise<void> {
    const action = actionFromRow(doc, target);
    const uuid = (action?.data as any)?.executor;
    if (!uuid) return;
    const macro: any = await fromUuid(uuid);
    void fvttRenderSheet(macro);
}

/**
 * Remove the clicked custom action from `system.actionDefs`, after a
 * confirmation prompt. Only the action def is removed — the bound Macro
 * document is left untouched.
 *
 * @param doc - The action-owning document.
 * @param target - The clicked control inside an action row.
 */
export async function deleteAction(
    doc: ActionOwner,
    target: HTMLElement,
): Promise<void> {
    const shortcode = target
        .closest("[data-action-name]")
        ?.getAttribute("data-action-name");
    if (!shortcode) return;
    const current = ((doc.system as any).actionDefs as any[]) ?? [];
    const actionDefs = current.filter((d) => d.shortcode !== shortcode);
    if (actionDefs.length === current.length) return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("SOHL.Actions.remove") },
        content: `<p>${game.i18n.localize("SOHL.Actions.removeHint")}</p>`,
    } as any);
    if (!confirmed) return;
    await doc.update({ "system.actionDefs": actionDefs } as any);
}

/**
 * Run the action for the clicked row (shift-click skips its configuration
 * dialog). The acting speaker is the owning actor — the document itself if it
 * is an actor, otherwise the item's actor.
 *
 * @param doc - The action-owning document.
 * @param target - The clicked control inside an action row.
 * @param event - The triggering pointer event (shift skips the dialog).
 */
export async function runAction(
    doc: ActionOwner,
    target: HTMLElement,
    event: PointerEvent,
): Promise<void> {
    const action = actionFromRow(doc, target);
    if (!action) return;
    const actor: SohlActor | null =
        ActorKinds.includes(doc.type as any) ?
            (doc as SohlActor)
        :   ((doc as SohlItem).actor ?? null);
    const context = new SohlActionContext({
        speaker: actor?.getSpeaker(),
        type: (action.data as any).shortcode,
        title: (action.data as any).title,
        skipDialog: event.shiftKey,
    });
    await action.execute(context);
}
