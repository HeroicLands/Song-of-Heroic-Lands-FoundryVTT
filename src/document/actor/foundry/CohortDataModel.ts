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

import { SohlActorDataModel } from "@src/document/actor/foundry/SohlActor";
import {
    ACTOR_KIND,
    COHORT_MEMBER_ROLE,
    CohortMemberRoles,
} from "@src/utils/constants";
import type { CohortData } from "@src/document/actor/logic/CohortLogic";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";

const { ArrayField, SchemaField, StringField, BooleanField, DocumentIdField } =
    foundry.data.fields;

/**
 * Defines the data schema for the Cohort actor.
 */
function defineCohortDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        leaderName: new StringField(),
        moveRepName: new StringField(),
        members: new ArrayField(
            new SchemaField({
                shortcode: new StringField({
                    blank: false,
                    required: true,
                }),
                name: new StringField({
                    blank: false,
                    required: true,
                }),
                role: new StringField({
                    choices: CohortMemberRoles,
                    initial: COHORT_MEMBER_ROLE.MEMBER,
                }),
            }),
        ),
    };
}

type CohortDataSchema = ReturnType<typeof defineCohortDataSchema>;

/**
 * The Foundry VTT data model for the Cohort actor.
 */
export class CohortDataModel<
    TSchema extends foundry.data.fields.DataSchema = CohortDataSchema,
    TLogic extends CohortLogic<CohortData> = CohortLogic<CohortData>,
>
    extends SohlActorDataModel<TSchema, TLogic>
    implements CohortData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Cohort",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.COHORT;
    leaderName!: string;
    moveRepName!: string;
    members!: { shortcode: string; name: string; role: string }[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineCohortDataSchema();
    }

    /**
     * Find valid placement positions for multiple tokens near a drop point.
     *
     * Uses BFS outward from the drop cell, skipping cells that are occupied
     * by existing tokens, already claimed in this batch, or separated from
     * the drop point by a wall.
     *
     * @param dropX - Drop X coordinate (canvas pixels)
     * @param dropY - Drop Y coordinate (canvas pixels)
     * @param count - Number of positions needed
     * @param elevation - Elevation for all tokens
     * @returns Array of {x, y} positions in canvas coordinates
     */
    static findPlacementPositions(
        dropX: number,
        dropY: number,
        count: number,
        elevation: number,
    ): { x: number; y: number }[] {
        const grid = (canvas as any).grid;
        const gridSize = grid.size;

        // Snap drop point to grid center
        const snapped = grid.getSnappedPoint({ x: dropX, y: dropY });
        const startCol = Math.floor(snapped.x / gridSize);
        const startRow = Math.floor(snapped.y / gridSize);

        // Build set of occupied cells from existing scene tokens at same elevation
        const occupied = new Set<string>();
        for (const token of (canvas as any).scene.tokens) {
            if (token.elevation !== elevation) continue;
            const col = Math.floor(token.x / gridSize);
            const row = Math.floor(token.y / gridSize);
            occupied.add(`${col},${row}`);
        }

        const results: { x: number; y: number }[] = [];
        const visited = new Set<string>();
        const queue: [number, number][] = [[startCol, startRow]];
        visited.add(`${startCol},${startRow}`);

        // 4-directional neighbors (up, down, left, right)
        const dirs = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];

        while (queue.length > 0 && results.length < count) {
            const [col, row] = queue.shift()!;
            const cellKey = `${col},${row}`;
            const cellX = col * gridSize;
            const cellY = row * gridSize;
            const cellCenterX = cellX + gridSize / 2;
            const cellCenterY = cellY + gridSize / 2;

            // Check if cell is occupied
            if (!occupied.has(cellKey)) {
                // Check wall collision between drop point and this cell
                const hasWall =
                    (CONFIG as any).Canvas?.losBackend ?
                        (canvas as any).walls.checkCollision(
                            new Ray(
                                { x: snapped.x, y: snapped.y },
                                { x: cellCenterX, y: cellCenterY },
                            ),
                            { type: "move", mode: "any" },
                        )
                    :   false;

                if (!hasWall) {
                    results.push({ x: cellX, y: cellY });
                    occupied.add(cellKey); // Claim this cell
                }
            }

            // Expand to neighbors
            for (const [dx, dy] of dirs) {
                const nc = col + dx;
                const nr = row + dy;
                const nk = `${nc},${nr}`;
                if (!visited.has(nk)) {
                    visited.add(nk);
                    // Stay within canvas bounds
                    if (
                        nc >= 0 &&
                        nr >= 0 &&
                        nc * gridSize < (canvas as any).dimensions.width &&
                        nr * gridSize < (canvas as any).dimensions.height
                    ) {
                        queue.push([nc, nr]);
                    }
                }
            }
        }

        return results;
    }

    /**
     * Handle placing a Cohort actor on a scene, with a dialog asking
     * the user to choose group or individual token placement.
     *
     * Used both by the canvas drop hook and by encounter spawning.
     *
     * @param actor - The Cohort actor to place
     * @param data - Object with at least `x` and `y` drop coordinates
     */
    static async handleCohortDrop(actor: any, data: any): Promise<void> {
        const dropX = data.x ?? 0;
        const dropY = data.y ?? 0;

        const choice = await foundry.applications.api.DialogV2.wait({
            window: {
                title: game.i18n.localize("SOHL.Cohort.Drop.title"),
            },
            content: game.i18n.format("SOHL.Cohort.Drop.content", {
                name: actor.name,
            }),
            buttons: [
                {
                    action: "group",
                    label: game.i18n.localize("SOHL.Cohort.Drop.group"),
                    icon: "fa-solid fa-users",
                },
                {
                    action: "individual",
                    label: game.i18n.localize("SOHL.Cohort.Drop.individual"),
                    icon: "fa-solid fa-user",
                },
            ],
            close: () => null,
        } as any);

        if (!choice) return; // Dialog closed without choosing

        const scene = (canvas as any).scene;

        if (choice === "group") {
            // Create a single token for the Cohort actor
            const tokenData = (await (actor as any).getTokenDocument(
                { x: dropX, y: dropY },
                { parent: scene },
            )) as any;
            await tokenData.constructor.create(tokenData.toObject(), {
                parent: scene,
            });
        } else if (choice === "individual") {
            await CohortDataModel.spawnCohortMembers(actor, dropX, dropY, 0);
        }
    }

    /**
     * Create individual tokens for each member of a Cohort actor,
     * placed in a cluster around the given point.
     *
     * Used by both the Cohort drop dialog and the TokenHUD expand button.
     *
     * @param actor - The Cohort actor
     * @param dropX - Center X coordinate (canvas pixels)
     * @param dropY - Center Y coordinate (canvas pixels)
     * @param elevation - Elevation for all placed tokens
     */
    static async spawnCohortMembers(
        actor: any,
        dropX: number,
        dropY: number,
        elevation: number,
    ): Promise<void> {
        const scene = (canvas as any).scene;
        const members = actor.system?.members ?? [];
        if (members.length === 0) return;

        const positions = CohortDataModel.findPlacementPositions(
            dropX,
            dropY,
            members.length,
            elevation,
        );

        const tokenDocs: any[] = [];
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const pos = positions[i];
            if (!pos) break;

            const memberActor = game.actors?.find(
                (a: any) => a.system?.shortcode === member.shortcode,
            );
            if (!memberActor) {
                console.warn(
                    game.i18n.format("SOHL.Cohort.Drop.memberNotFound", {
                        shortcode: member.shortcode,
                        name: member.name,
                    }),
                );
                continue;
            }

            const tokenData = (await (memberActor as any).getTokenDocument(
                {
                    x: pos.x,
                    y: pos.y,
                    elevation,
                    name: member.name,
                },
                { parent: scene },
            )) as any;

            tokenDocs.push(tokenData.toObject());
        }

        if (tokenDocs.length > 0) {
            await (TokenDocument as any).createDocuments(tokenDocs, {
                parent: scene,
            });
        }
    }
}
