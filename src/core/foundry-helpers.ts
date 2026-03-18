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

/**
 * Foundry VTT runtime shim.
 *
 * This module wraps all direct access to Foundry VTT globals (`game`,
 * `canvas`, `foundry.*`, `CONFIG`, `ChatMessage`, etc.) behind a stable
 * API. During testing, vitest swaps this module for a mock that provides
 * no-op or simple implementations, allowing logic classes and utilities
 * to be unit-tested without a running Foundry VTT environment.
 *
 * @module foundry-helpers
 */

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Deep-merge two objects using Foundry's mergeObject. */
export function mergeObject(
    original: object,
    other: object,
    options?: { inplace?: boolean; insertKeys?: boolean; insertValues?: boolean },
): object {
    return foundry.utils.mergeObject(original, other, options) as object;
}

// ---------------------------------------------------------------------------
// Document resolution
// ---------------------------------------------------------------------------

/** Synchronously resolve a document by UUID. */
export function resolveUuid(uuid: string): any {
    return fromUuidSync(uuid);
}

/** Asynchronously resolve a document by UUID. */
export async function resolveUuidAsync(uuid: string): Promise<any> {
    return fromUuid(uuid);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/** Show a UI warning notification. */
export function notifyWarn(message: string): void {
    ui.notifications.warn(message);
}

/** Show a UI error notification. */
export function notifyError(message: string): void {
    ui.notifications.error(message);
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

/** Create a Roll instance from a formula string. */
export function createRoll(formula: string): any {
    return Roll.create(formula);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Call all hooks registered for the given event name. */
export function callHook(name: string, ...args: unknown[]): void {
    Hooks.callAll(name as any, ...args);
}

/**
 * Call hooks with cancellation support. Returns false if any handler
 * returns false explicitly, indicating that processing should be skipped.
 * Used for pre-phase hooks (preInitialize, preEvaluate, preFinalize).
 */
export function callHookCancel(name: string, ...args: unknown[]): boolean {
    return Hooks.call(name as any, ...args);
}

/** Report an error to the Foundry hook error handler. */
export function hookOnError(source: string, error: Error, data?: object): void {
    Hooks.onError(source as any, error, data as any);
}

// ---------------------------------------------------------------------------
// System identity and CONFIG
// ---------------------------------------------------------------------------

/** Whether the current user has the GM role. */
export function isCurrentUserGM(): boolean {
    return !!(game as any).user?.isGM;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/** Get the current world time in seconds. */
export function worldTime(): number {
    return game.time.worldTime;
}

/** Retrieve a game setting value. */
export function getSetting(module: string, key: string): unknown {
    return (game as any).settings.get(module, key);
}

/** Whether the current user is the active GM. */
export function isActiveGM(): boolean {
    return !!(game as any).user?.isActiveGM;
}

/** Get the current user document. */
export function currentUser(): any {
    return (game as any).user;
}

/** Get the Intl.ListFormat formatter for the current game locale. */
export function getListFormatter(): Intl.ListFormat {
    return (game as any).i18n.getListFormatter();
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

/** Get an actor by ID from the world collection. */
export function getActor(id: string): any {
    return (game as any).actors?.get(id) ?? null;
}

/** Get a scene by ID from the world collection. */
export function getScene(id: string): any {
    return (game as any).scenes?.get(id) ?? null;
}

/** Get a token by ID from the current canvas. */
export function getToken(id: string): any {
    return (canvas as any)?.tokens?.get(id) ?? null;
}

/** Get a user by ID from the world collection. */
export function getUser(id: string): any {
    return (game as any).users?.get(id) ?? null;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/** Create a chat message. */
export async function createChatMessage(data: object): Promise<any> {
    return foundry.documents.ChatMessage.create(data);
}

/** Apply the specified roll mode to chat message data. */
export function applyRollMode(data: object, mode: string): void {
    ChatMessage.applyRollMode(data, mode as any);
}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

/** Enrich HTML content using Foundry's TextEditor. */
export async function enrichHTML(content: string): Promise<string> {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(content);
}
