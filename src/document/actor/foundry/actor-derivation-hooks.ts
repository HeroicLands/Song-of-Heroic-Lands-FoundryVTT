/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { fvttWorldActors } from "@src/core/FoundryHelpers";

const priorAliases = new WeakMap<object, Set<string>>();
const priorTokenActors = new WeakMap<object, any>();

/**
 * Collect world and synthetic actors without preparing or persisting them.
 * @returns The client-visible actor documents.
 */
function actors(): any[] {
    const result = new Set(fvttWorldActors());
    for (const scene of (game as any).scenes ?? []) {
        for (const token of scene.tokens ?? []) if (token.actor) result.add(token.actor);
    }
    return [...result];
}

/**
 * Retain references that an update or deletion can make unresolvable.
 * @param actor - The changed actor.
 * @returns Current and previously captured identifiers.
 */
function aliases(actor: any): Set<string> {
    const result = new Set(priorAliases.get(actor) ?? []);
    for (const ref of [actor.id, actor.uuid, actor.system?.shortcode]) if (ref) result.add(ref);
    priorAliases.set(actor, result);
    return result;
}

/**
 * Actor handles used by existing Cohort, Structure and Vehicle rosters.
 * @param actor - The roster owner.
 * @returns Stored actor handles.
 */
function references(actor: any): string[] {
    return [
        ...(actor.system?.members ?? []).map((member: any) => member.shortcodeOrUuid),
        ...(actor.system?.occupants ?? []).map((occupant: any) => occupant.actorCodeOrUuid),
    ];
}

/**
 * Refresh only transient derivation methods and already-open applications.
 * @param actor - The derived actor.
 */
function refresh(actor: any): void {
    const logic = actor.logic;
    const derive =
        logic?.deriveMembershipState ?? logic?.deriveStructureState ?? logic?.deriveVehicleState;
    if (typeof derive !== "function") return;
    derive.call(logic);
    for (const app of Object.values(actor.apps ?? {}) as any[])
        if (app.rendered) void app.render(false);
}

/**
 * Refresh a changed actor and its transitive roster dependents once each.
 * With no argument, refresh every actor after initial world preparation.
 * @param changed - The changed actor or actors, if any.
 */
export function refreshActorDerivations(changed?: any): void {
    const all = actors();
    if (!changed) {
        for (const actor of all) {
            aliases(actor);
            refresh(actor);
        }
        return;
    }
    const pending = Array.isArray(changed) ? [...changed] : [changed];
    const visited = new Set<any>();
    while (pending.length) {
        const actor = pending.shift();
        if (!actor || visited.has(actor)) continue;
        visited.add(actor);
        refresh(actor);
        const keys = aliases(actor);
        for (const candidate of all) {
            if (!visited.has(candidate) && references(candidate).some((ref) => keys.has(ref)))
                pending.push(candidate);
        }
    }
}

/** Register client-local observers; none mutate documents or require ownership. */
export function registerActorDerivationHooks(): void {
    for (const event of ["preUpdateActor", "preDeleteActor"]) (Hooks as any).on(event, aliases);
    for (const event of ["createActor", "updateActor", "deleteActor"])
        (Hooks as any).on(event, refreshActorDerivations);
    for (const kind of ["Item", "ActiveEffect"]) {
        for (const operation of ["create", "update", "delete"]) {
            (Hooks as any).on(`${operation}${kind}`, (document: any) => {
                let parent = document.actor ?? document.parent;
                while (parent && parent.documentName !== "Actor") parent = parent.parent;
                if (parent) refreshActorDerivations(parent);
            });
        }
    }
    for (const event of ["preUpdateToken", "preDeleteToken"])
        (Hooks as any).on(event, (token: any) => {
            if (token.actor) {
                aliases(token.actor);
                priorTokenActors.set(token, token.actor);
            }
        });
    for (const event of ["createToken", "updateToken", "deleteToken"])
        (Hooks as any).on(event, (token: any) => {
            const previous = priorTokenActors.get(token);
            priorTokenActors.delete(token);
            const changed = [previous, token.actor].filter(Boolean);
            if (changed.length) refreshActorDerivations(changed);
        });
    refreshActorDerivations();
}

Hooks.once("ready", registerActorDerivationHooks);
