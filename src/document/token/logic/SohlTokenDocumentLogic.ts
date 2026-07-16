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

import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlAction } from "@src/entity/action/SohlAction";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import {
    ACTION_SUBTYPE,
    BRAND,
    isA,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import { showDefenseDialog } from "@src/document/combatant/logic/combatant-dialogs";

/**
 * The Foundry-free data contract for a SoHL token — the {@link sohl.core.logic.SohlLogicData}
 * port specialized for `SohlTokenDocument`.
 *
 * Tokens are not typed documents (no `system` DataModel), so unlike actors,
 * items, and combatants this port is not implemented by a `SohlDataModel`;
 * `SohlTokenDocument.logic` builds a transient adapter over the live token
 * instead. The token carries no persisted SoHL state — opposed tests live in
 * chat-card JSON, never on the token.
 */
export interface TokenData extends SohlLogicData<SohlTokenDocument> {}

/**
 * An item logic that backs an opposed test: a skill or attribute exposing a
 * usable {@link sohl.entity.modifier.MasteryLevelModifier}.
 */
interface OpposedItemLogic {
    /** The opaque identity token of the item logic. */
    uuid: string;
    /** The item's display name. */
    name: string;
    /** The mastery-level modifier the opposed test rolls against. */
    masteryLevel: MasteryLevelModifier;
}

/**
 * Token-scoped logic. Opposed tests (skill-vs-skill, skill-vs-attribute,
 * attribute-vs-attribute) are about **tokens**: the source side rolls from the
 * source token (the actor derived from it) and the responder side is dispatched
 * to the **target** token from the opposed-request chat card.
 *
 * The structure parallels {@link sohl.document.combatant.logic.SohlCombatantLogic}'s automated-combat actions: a
 * canonical {@link opposedTestStart} action (which the skill/attribute item
 * logics delegate into, passing their `logicUuid`) and an
 * {@link opposedTestResume} action (the card handler on the target token). The
 * test mechanics themselves stay on {@link sohl.entity.modifier.MasteryLevelModifier} —
 * `opposedTestStart`/`opposedTestResume` here resolve the source/responder
 * item logic and delegate to it, just as the combatant delegates to
 * `startAutomatedAttackFromItem`.
 */
export class SohlTokenDocumentLogic<
    TData extends TokenData = TokenData,
> extends SohlLogic<TData> {
    /**
     * Runtime brand identifying this as a token logic without needing an
     * `instanceof` check against the class. Consumers in the Foundry-free
     * layer (e.g. {@link sohl.entity.action.SohlActionContext}) detect it via `isA` to avoid
     * importing the class as a value, which would form an import cycle through
     * {@link sohl.core.logic.SohlLogic}.
     */
    get [BRAND.SohlTokenDocumentLogic](): true {
        return true;
    }

    /** This token's actor name, for dialog/warning text. */
    private get actorName(): string {
        return this.actorLogic?.name ?? this.name;
    }

    /**
     * The skill and attribute item logics on this token's actor that can take
     * part in an opposed test — those exposing a usable (non-disabled)
     * {@link sohl.entity.modifier.MasteryLevelModifier}. Traits are excluded (no mastery level).
     * @returns The candidate opposed-test item logics.
     */
    private opposedItemLogics(): OpposedItemLogic[] {
        const actorLogic = this.actorLogic as any;
        const logics: any[] = actorLogic?.allLogics ?? [];
        return logics.filter(
            (il) =>
                (isA(il, ITEM_KIND.SKILL) || isA(il, ITEM_KIND.ATTRIBUTE)) &&
                il?.masteryLevel &&
                !il.masteryLevel.disabled,
        ) as OpposedItemLogic[];
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Begin an opposed test from this (the **source**) token — the canonical
     * action the source skill/attribute item logic delegates into. Resolves the
     * source item logic from `scope.logicUuid` and runs its opposed test; the
     * target is taken from `scope.targetToken` or the user's current target.
     *
     * @param context - The action context; `scope.logicUuid` names the source
     *   skill/attribute item logic.
     * @returns The resulting opposed test, or `null` when it cannot be started.
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const logicUuid = (context.scope as any)?.logicUuid as
            | string
            | undefined;
        const source = this.opposedItemLogics().find(
            (il) => il.uuid === logicUuid,
        );
        if (!source) {
            sohl.log.uiWarn(
                `${this.actorName} has no skill or attribute matching the requested opposed test.`,
            );
            return null;
        }
        return source.masteryLevel.opposedTestStart(context);
    }

    /**
     * Resume an opposed test on this (the **target**) token — the handler the
     * opposed-request card's Respond button addresses. Reads the prior
     * {@link OpposedTestResult} (already revived from the card's `data-scope`),
     * lets the defender pick the responding skill or attribute, and resolves the
     * contest.
     *
     * @param context - The action context; `scope.opposedTestResult` is the live
     *   prior opposed test (revived by the dispatch handler), and (when
     *   `skipDialog`) `scope.responderLogicUuid` selects the responding item logic.
     * @returns The evaluated {@link OpposedTestResult}, `false` if a side
     *   cancelled, or `null` when it cannot be resumed.
     */
    async opposedTestResume(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | false | undefined> {
        const scope = (context.scope as any) ?? {};
        const priorTestResult = scope.opposedTestResult as
            | OpposedTestResult
            | undefined;
        if (!priorTestResult) {
            sohl.log.uiWarn(
                `${this.actorName} has no opposed test to resolve.`,
            );
            return undefined;
        }

        const candidates = this.opposedItemLogics();
        if (!candidates.length) {
            sohl.log.uiWarn(
                `${this.actorName} has no usable skill or attribute to respond with.`,
            );
            return undefined;
        }

        const choices: Record<string, string> = {};
        candidates.forEach((c, i) => {
            choices[String(i)] =
                `${c.name} (ML:${c.masteryLevel.constrainedEffective})`;
        });

        let dlgResult: { key: string; situationalModifier: number } | undefined;
        if (scope.skipDialog) {
            const idx = candidates.findIndex(
                (c) => c.uuid === scope.responderLogicUuid,
            );
            dlgResult = {
                key: idx >= 0 ? String(idx) : "0",
                situationalModifier:
                    Number.parseInt(String(scope.situationalModifier), 10) || 0,
            };
        } else {
            dlgResult = await showDefenseDialog(
                `${this.actorName} — Respond to Opposed Test`,
                "Respond with:",
                choices,
                "0",
            );
        }
        if (!dlgResult) return undefined;

        const responder = candidates[Number(dlgResult.key)];
        if (!responder) return undefined;

        const resumeContext = context.clone();
        resumeContext.scope = {
            ...scope,
            priorTestResult,
            situationalModifier: dlgResult.situationalModifier,
        } as any;

        return responder.masteryLevel.opposedTestResume(resumeContext);
    }

    /**
     * Define the token's intrinsic actions — the opposed-test start and resume,
     * dispatched programmatically (start, from the source item logic) and from
     * the opposed-request card's Respond button (resume).
     * @returns The token intrinsic-action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlLogic.defineIntrinsicActions(),
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass:
                    "fa-solid fa-arrow-down-left-and-arrow-up-right-to-center",
                executor: "opposedTestStart",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "opposedTestResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.opposedTestResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fas fa-people-arrows",
                executor: "opposedTestResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {}

    /** @inheritdoc */
    override evaluate(): void {}

    /** @inheritdoc */
    override finalize(): void {}
}
