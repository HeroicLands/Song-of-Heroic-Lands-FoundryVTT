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
 * **Programmatic Script Action attach** (issue #588, deliverable §7) — the clean
 * API a module or macro uses to bind a Foundry Macro to a host document as a
 * SCRIPT action, so it can then be scheduled ({@link sohl.core.logic.SohlSystem.schedule})
 * or offered on a context menu.
 *
 * This is the non-UI sibling of the sheet's `createAction` helper: instead of a
 * dialog it takes a minimal {@link ScriptActionSpec} and fills the same sensible
 * defaults, so the caller never has to know the full {@link SohlAction.Data}
 * shape. The first-class entry point is {@link sohl.core.logic.SohlSystem.addScriptAction}
 * (`sohl.addScriptAction(doc, spec)`), which GM-gates and delegates here.
 *
 * **Identity.** `spec.name` becomes both the action's `shortcode` (the key
 * `logic.actions` is built under, and what `sohl.schedule(doc, name, …)` and the
 * `[Perform]` reminder resolve) **and** its default `title`. Re-attaching the same
 * `name` replaces the entry rather than duplicating it, so an init hook can run on
 * every reload safely.
 *
 * **Security.** `spec.executor` is a Foundry Macro **UUID** — a reference, never
 * inline code (see the security model). Authorship of SCRIPT entries is
 * GM-restricted at the document boundary (`SohlActor`/`SohlItem._preUpdate` via
 * `isScriptActionMutationAllowed`) and execution runs through `Macro#execute`,
 * which enforces the `MACRO_SCRIPT` permission. This module only assembles and
 * persists the reference; it compiles nothing.
 *
 * Foundry-free: it operates on a minimal {@link ActionAttachable} surface, so it
 * is unit-testable without a running Foundry.
 */

import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { SohlAction } from "@src/entity/action/SohlAction";

/**
 * The minimal spec for {@link buildScriptActionDef} — what a module supplies to
 * attach a Script Action. Only `name` and `executor` are required; the rest
 * default to match the sheet's `createAction` authoring path.
 */
export interface ScriptActionSpec {
    /**
     * The action's identity — becomes both the `shortcode` (what
     * `sohl.schedule` / the `[Perform]` reminder address) and, unless
     * {@link title} overrides it, the display `title`. Must be non-blank.
     */
    name: string;
    /**
     * The UUID of the Foundry Macro to run — a reference, never inline code.
     * Must be non-blank. Running the action invokes `Macro#execute`
     * (permission-gated).
     */
    executor: string;
    /** Display title; defaults to {@link name}. */
    title?: string;
    /**
     * Execution scope selecting which logic the executor runs against
     * (`SELF` / `ITEM` / `ACTOR`); defaults to `SELF`.
     */
    scope?: string;
    /** FontAwesome icon class; defaults to `fa-solid fa-bolt`. */
    iconFAClass?: string;
    /** Context-menu sort group; defaults to `GENERAL`. */
    group?: string;
    /**
     * Minimum Foundry document-ownership level to execute (0–3); defaults to
     * `3` (OWNER). GMs always pass.
     */
    minActorOwnership?: number;
    /**
     * {@link sohl.entity.expr.SafeExpression} gating whether the action may run;
     * defaults to `"true"`.
     */
    trigger?: string;
    /**
     * {@link sohl.entity.expr.SafeExpression} gating whether the action appears
     * in the UI; defaults to `"true"`.
     */
    visible?: string;
}

/** The minimal document surface {@link attachScriptAction} needs. */
export interface ActionAttachable {
    /** The document's system data (carries `actionDefs`). */
    system: { actionDefs?: SohlAction.Data[] };
    /** Persist a partial update to the document. */
    update(data: Record<string, unknown>): Promise<unknown>;
}

/**
 * Build a full {@link SohlAction.Data} SCRIPT def from a minimal spec, filling
 * the same defaults as the sheet's `createAction`. Pure — no persistence.
 *
 * @param spec - The Script Action spec.
 * @returns The complete action def, ready to upsert into `system.actionDefs`.
 * @throws If `name` or `executor` is blank.
 */
export function buildScriptActionDef(spec: ScriptActionSpec): SohlAction.Data {
    const name = String(spec.name ?? "").trim();
    if (!name) {
        throw new Error(
            "addScriptAction: `name` is required and must be non-blank.",
        );
    }
    const executor = String(spec.executor ?? "").trim();
    if (!executor) {
        throw new Error(
            "addScriptAction: `executor` is required and must be a Foundry Macro UUID.",
        );
    }
    return {
        shortcode: name,
        subType: ACTION_SUBTYPE.SCRIPT,
        title: spec.title ?? name,
        scope: spec.scope ?? SOHL_ACTION_SCOPE.SELF,
        executor,
        trigger: spec.trigger ?? "true",
        visible: spec.visible ?? "true",
        iconFAClass: spec.iconFAClass ?? "fa-solid fa-bolt",
        group: spec.group ?? SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
        minActorOwnership: spec.minActorOwnership ?? 3,
    } as SohlAction.Data;
}

/**
 * Insert or replace (by `shortcode`) an action def, returning a **new** array —
 * the whole array is written back to the document (never by index). Pre-existing
 * defs (e.g. intrinsic actions) are preserved in place. Pure.
 *
 * @param list - The current `system.actionDefs`.
 * @param def - The def to upsert.
 * @returns The updated defs.
 */
export function upsertActionDef(
    list: SohlAction.Data[] | undefined,
    def: SohlAction.Data,
): SohlAction.Data[] {
    const rest = (list ?? []).filter((d) => d.shortcode !== def.shortcode);
    return [...rest, def];
}

/**
 * Build a SCRIPT action def from `spec` and **persist** it onto `doc`, writing
 * the whole `system.actionDefs` array back (upsert by `shortcode`, never by
 * index). Idempotent: re-attaching the same `name` replaces the entry.
 *
 * The caller must be an owner of `doc`, and — because SCRIPT entries are
 * GM-authored — a GM (enforced at the document boundary and pre-checked by
 * {@link sohl.core.logic.SohlSystem.addScriptAction}).
 *
 * @param doc - The document to attach the action to (an actor or item).
 * @param spec - The Script Action spec.
 * @returns The persisted action def.
 * @throws If `name` or `executor` is blank.
 */
export async function attachScriptAction(
    doc: ActionAttachable,
    spec: ScriptActionSpec,
): Promise<SohlAction.Data> {
    const def = buildScriptActionDef(spec);
    const list = upsertActionDef(doc.system.actionDefs, def);
    await doc.update({ "system.actionDefs": list });
    return def;
}
