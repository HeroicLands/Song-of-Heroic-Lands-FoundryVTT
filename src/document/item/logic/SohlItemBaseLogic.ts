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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import { toHTMLString, type HTMLString } from "@src/utils/helpers";
import {
    ACTION_SUBTYPE,
    BRAND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import {
    fvttEnrichHTML,
    fvttIsCurrentUserGM,
    fvttRenderSheet,
} from "@src/core/FoundryHelpers";
// `action-card` is a pure, Foundry-free module (it touches Foundry only through
// the `FoundryHelpers` shims); the path-based boundary rule can't tell it apart
// from the Foundry-coupled files under `document/chat/`, so allow this import.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
    postActionCard,
    type ActionCardSpec,
} from "@src/document/chat/action-card";

/**
 * The Foundry-free foundation of the item logic layer.
 *
 * This module owns the contracts between item logic classes and the
 * Foundry-side data models: the {@link SohlItemLogic} and
 * {@link SohlItemData} interfaces and the {@link SohlItemBaseLogic} base
 * class. The Foundry layer (`foundry/SohlItem.ts`) implements
 * {@link SohlItemData} via `SohlItemDataModel` and re-exports these symbols;
 * logic classes import them from here so they remain loadable without
 * Foundry globals. References to the `SohlItem` document type are
 * type-only and erased at compile time.
 */

/**
 * Logic interface implemented by all item logic classes — {@link sohl.core.logic.SohlLogic}
 * specialized for `SohlItem` data.
 */
export interface SohlItemLogic<
    TData extends SohlLogicData<SohlItem>,
> extends SohlLogic<TData> {}

/**
 * @remarks The base shape of `system` on every SoHL item; each concrete item type's `*Data` extends it.
 */
export interface SohlItemData<
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> extends SohlLogicData<SohlItem, TLogic> {
    /** The owning `SohlItem`. */
    get item(): SohlItem;
    /**
     * The item's display label; with `withName`, includes the item's name, and
     * with `withSubType`, includes its sub-type.
     */
    label(options?: { withName: boolean; withSubType: boolean }): string;
    /** Rich-text GM/player notes for the item. */
    notes: HTMLString;
    /** Rich-text description shown on the item's sheet and chat cards. */
    docHtml: HTMLString;
}

/**
 * Base logic class for all item types.
 *
 * Provides the minimal lifecycle implementation (no-op {@link initialize},
 * {@link evaluate}, and {@link finalize}) that all item logic classes inherit
 * from. Concrete item classes extend this to implement type-specific rules,
 * modifiers, and calculations.
 *
 * @typeParam TData - The item data interface, extending {@link SohlItemData}.
 */
export class SohlItemBaseLogic<
    TData extends SohlItemData = SohlItemData,
> extends SohlLogic<TData> {
    /**
     * Runtime brand identifying any item logic — inherited by every item-kind
     * logic, so `isA(x, "SohlItemLogic")` matches across the whole hierarchy
     * (which a leaf `.kind` string can't). Never an own/serialized property.
     */
    get [BRAND.SohlItemLogic](): true {
        return true;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Intrinsic actions shared by every item kind: the {@link SohlLogic} base
     * pair (edit/delete) plus {@link outputDescription}, which posts the item's
     * description to the chat log.
     * @returns The intrinsic action definitions shared by every item kind.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...super.defineIntrinsicActions(),
            {
                shortcode: "outputDescription",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.SohlItemBaseLogic.Action.outputDescription.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-message",
                executor: "outputDescription",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /**
     * Post this item's description to the chat log — a human-triggered,
     * informational card (no follow-up buttons) built by
     * {@link buildItemDescCardData}. Assist, never act: this only *shows* the
     * item's own text; it takes no action on any character.
     * @param _context - The action context; unused.
     */
    async outputDescription(_context: SohlActionContext): Promise<void> {
        await postActionCard(this.speaker, await buildItemDescCardData(this));
    }

    /**
     * **GM result-edit** for a posted test card (#856) — the higher-fidelity
     * counterpart to Fate. Re-opens the standard test dialog pre-filled with the
     * result's current situational and success-level modifiers; on submit it
     * applies the new modifiers and **re-evaluates on the SAME frozen roll**
     * (never a re-roll, no Fate cost), then reposts the card. The prior result
     * rides in `context.scope.priorTestResult` (the reconstruction seam), so this
     * works for any standard test card — skill, attribute, or combat strike mode.
     *
     * Changing the **situational modifier** changes the effective target, so the
     * base success level re-derives from the frozen roll; the success-level
     * modifier is a flat offset applied after. Clicking OK without a change is a
     * no-op (nothing re-evaluated, nothing reposted).
     *
     * **GM-only.** The pencil is render-hidden from non-GMs
     * ({@link sohl.document.chat.gateEditActionPencil}); this is the click-time
     * half of that gate — a synthesized click from a non-GM is refused here.
     *
     * @param context - The action context; `context.scope.priorTestResult` is the
     *   result being edited. When `skipDialog` is set, the new
     *   `situationalModifier` / `successLevelMod` are taken from `context.scope`
     *   instead of the dialog.
     * @returns The re-evaluated result, or `undefined` when refused (non-GM),
     *   cancelled (dialog dismissed), or unchanged (no-op).
     */
    async resultEdit(
        context: SohlActionContext<{
            priorTestResult?: SuccessTestResult;
            situationalModifier?: number;
            successLevelMod?: number;
        }>,
    ): Promise<SuccessTestResult | undefined> {
        // Click-time GM gate (defense-in-depth): the render gate hides the pencil
        // from non-GMs, but a synthesized click bypasses it, so refuse here too.
        if (!fvttIsCurrentUserGM()) {
            sohl.log.uiWarn("SOHL.ResultEdit.gmOnly");
            return undefined;
        }

        const original = context.scope?.priorTestResult;
        if (!original) {
            sohl.log.warn(
                "resultEdit invoked without a priorTestResult in scope.",
            );
            return undefined;
        }

        // Re-open the pre-filled editor and fold the new modifiers in. The
        // dialog/apply half is shared with the opposed-contest pencil (#1082),
        // which runs it once per side.
        const edit = await original.editModifiers({
            skipDialog: context.skipDialog,
            situationalModifier: context.scope.situationalModifier,
            successLevelMod: context.scope.successLevelMod,
        });

        // A dismissed dialog cancels the edit; nothing changes.
        if (!edit) return undefined;
        // OK-without-change is a no-op: no re-evaluation, no repost.
        if (!edit.changed) return original;

        // Re-evaluate on the SAME frozen roll (idempotent; never re-rolls) and
        // repost the card with the new outcome.
        await original.evaluate();
        await original.toChat({});
        return original;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritDoc */
    override initialize(): void {}
    /** @inheritDoc */
    override evaluate(): void {}
    /** @inheritDoc */
    override finalize(): void {}
}

/**
 * Assemble the informational **description card** for an item — the body of the
 * {@link SohlItemBaseLogic.outputDescription} action. Pure (Foundry access only
 * through the enrich shim), so it is unit-testable and carries no posting side
 * effect. The description HTML is enriched through the normal
 * {@link fvttEnrichHTML} path and the card is rendered/sanitized by
 * {@link sohl.document.chat.buildActionCard}; item data is never interpolated
 * into template source.
 *
 * @param logic - The item logic whose description is being output.
 * @returns The {@link ActionCardSpec} for `item-desc-card.hbs` (no buttons).
 */
export async function buildItemDescCardData(
    logic: SohlItemBaseLogic,
): Promise<ActionCardSpec> {
    const data = logic.data;
    // `charges` is a type-specific field (mysteries, mystical abilities) shaped
    // `{ value, max }`, where a null `value` means infinite and a null `max`
    // means the item does not use charges. Show a concrete count where one
    // applies; omit it otherwise.
    const chargesData = (data as unknown as { charges?: unknown }).charges as
        | { value?: number | null; max?: number | null }
        | undefined;
    let charges: string | undefined;
    if (chargesData && typeof chargesData === "object") {
        const { value, max } = chargesData;
        if (value != null) {
            charges = max != null ? `${value} / ${max}` : `${value}`;
        }
    }
    return {
        template: "systems/sohl/templates/chat/item-desc-card.hbs",
        data: {
            actorId: logic.actor?.id ?? null,
            name: logic.name,
            subtitle: logic.typeLabel,
            notes: data.notes ?? "",
            // `textReference` is an optional, loosely-typed field present only on
            // some item kinds; read it defensively so the card's `{{#if textRef}}`
            // simply hides when it is absent.
            textRef:
                (data as unknown as { textReference?: string }).textReference ??
                "",
            charges,
            desc: await fvttEnrichHTML(data.docHtml ?? ""),
        },
    };
}
