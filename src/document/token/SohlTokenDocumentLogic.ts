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

import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import { SohlAction } from "@src/domain/action/SohlAction";
import { OpposedTestResult } from "@src/domain/result/OpposedTestResult";
import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { showDefenseDialog } from "@src/document/actor/logic/automated-combat";
import { resolveActionInput } from "@src/utils/actionInput";
import { instanceFromJSON } from "@src/utils/helpers";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";

/**
 * The Foundry-free data contract for a SoHL token — the {@link SohlLogicData}
 * port specialized for {@link SohlTokenDocument}.
 *
 * Tokens are not typed documents (no `system` DataModel), so unlike actors,
 * items, and combatants this port is not implemented by a `SohlDataModel`;
 * {@link SohlTokenDocument.logic} builds a transient adapter over the live token
 * instead. The token carries no persisted SoHL state — opposed tests live in
 * chat-card JSON, never on the token.
 */
export interface TokenData extends SohlLogicData<SohlTokenDocument> {}

/**
 * An item logic that backs an opposed test: a skill or attribute exposing a
 * usable {@link MasteryLevelModifier}.
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
 * The structure parallels {@link CombatantLogic}'s automated-combat actions: a
 * canonical {@link opposedTestStart} action (which the skill/attribute item
 * logics delegate into, passing their `logicUuid`) and an
 * {@link opposedTestResume} action (the card handler on the target token). The
 * test mechanics themselves stay on {@link MasteryLevelModifier} —
 * `opposedTestStart`/`opposedTestResume` here resolve the source/responder
 * item logic and delegate to it, just as the combatant delegates to
 * `startAutomatedAttackFromItem`.
 */
export class SohlTokenDocumentLogic<
    TData extends TokenData = TokenData,
> extends SohlLogic<TData> {
    /** @inheritdoc */
    override initialize(): void {}

    /** @inheritdoc */
    override evaluate(): void {}

    /** @inheritdoc */
    override finalize(): void {}

    /** This token's actor name, for dialog/warning text. */
    private get actorName(): string {
        return this.actorLogic?.name ?? this.name;
    }

    /**
     * The skill and attribute item logics on this token's actor that can take
     * part in an opposed test — those exposing a usable (non-disabled)
     * {@link MasteryLevelModifier}. Traits are excluded (no mastery level).
     * @returns The candidate opposed-test item logics.
     */
    private opposedItemLogics(): OpposedItemLogic[] {
        const actorLogic = this.actorLogic as any;
        const logics: any[] = actorLogic?.allLogics ?? [];
        return logics.filter(
            (il) =>
                (il?.data?.kind === ITEM_KIND.SKILL ||
                    il?.data?.kind === ITEM_KIND.ATTRIBUTE) &&
                il?.masteryLevel &&
                !il.masteryLevel.disabled,
        ) as OpposedItemLogic[];
    }

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
     * opposed-request card's Respond button addresses. Reconstructs the prior
     * {@link OpposedTestResult} from `scope.opposedTestResultJson`, lets the
     * defender pick the responding skill or attribute, and resolves the contest.
     *
     * @param context - The action context; `scope.opposedTestResultJson` carries
     *   the serialized prior opposed test, and (when `skipDialog`)
     *   `scope.responderLogicUuid` selects the responding item logic.
     * @returns The evaluated {@link OpposedTestResult}, `false` if a side
     *   cancelled, or `null` when it cannot be resumed.
     */
    async opposedTestResume(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | false | null> {
        const scope = (context.scope as any) ?? {};
        const json = scope.opposedTestResultJson;
        if (!json) {
            sohl.log.uiWarn(
                `${this.actorName} has no opposed test to resolve.`,
            );
            return null;
        }

        const candidates = this.opposedItemLogics();
        if (!candidates.length) {
            sohl.log.uiWarn(
                `${this.actorName} has no usable skill or attribute to respond with.`,
            );
            return null;
        }

        const choices: Record<string, string> = {};
        candidates.forEach((c, i) => {
            choices[String(i)] =
                `${c.name} (ML:${c.masteryLevel.constrainedEffective})`;
        });

        const input = await resolveActionInput<{
            key: string;
            situationalModifier: number;
        }>(context, {
            fromScope: (s) => {
                const idx = candidates.findIndex(
                    (c) => c.uuid === s.responderLogicUuid,
                );
                return {
                    key: idx >= 0 ? String(idx) : "0",
                    situationalModifier:
                        Number.parseInt(String(s.situationalModifier), 10) || 0,
                };
            },
            dialog: () =>
                showDefenseDialog(
                    `${this.actorName} — Respond to Opposed Test`,
                    "Respond with:",
                    choices,
                    "0",
                ),
        });
        if (!input) return null;

        const responder = candidates[Number(input.key)];
        if (!responder) return null;

        const priorTestResult = instanceFromJSON<OpposedTestResult>(
            json,
            this.actorLogic ?? this,
        );

        const resumeContext = context.clone();
        resumeContext.scope = {
            ...scope,
            priorTestResult,
            situationalModifier: input.situationalModifier,
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
                iconFAClass: "sohl-confrontation",
                executor: "opposedTestStart",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "opposedTestResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.opposedTestResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-continue",
                executor: "opposedTestResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }
}
