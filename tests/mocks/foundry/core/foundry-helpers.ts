/*
 * Mock implementation of foundry-helpers for unit testing.
 *
 * Provides no-op or simple implementations of all shim functions,
 * allowing logic classes and utilities to be tested without a
 * running Foundry VTT environment.
 */

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function mergeObject(
    original: object,
    other: object,
    _options?: { inplace?: boolean; insertKeys?: boolean; insertValues?: boolean },
): object {
    return { ...original, ...other };
}

// ---------------------------------------------------------------------------
// Document resolution
// ---------------------------------------------------------------------------

export function resolveUuid(_uuid: string): any {
    return null;
}

export async function resolveUuidAsync(_uuid: string): Promise<any> {
    return null;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function notifyWarn(_message: string): void {}

export function notifyError(_message: string): void {}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export function createRoll(_formula: string): any {
    return { evaluate: async () => ({ total: 0 }), total: 0 };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function callHook(_name: string, ..._args: unknown[]): void {}

export function hookOnError(_source: string, _error: Error, _data?: object): void {}

// ---------------------------------------------------------------------------
// System identity and CONFIG
// ---------------------------------------------------------------------------

export function isCurrentUserGM(): boolean {
    return true;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export function worldTime(): number {
    return 0;
}

export function getSetting(_module: string, _key: string): unknown {
    return undefined;
}

export function isActiveGM(): boolean {
    return true;
}

export function currentUser(): any {
    return { id: "mockUser", isGM: true, isActiveGM: true };
}

export function getListFormatter(): Intl.ListFormat {
    return new Intl.ListFormat("en", { style: "long", type: "conjunction" });
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

export function getActor(_id: string): any {
    return null;
}

export function getScene(_id: string): any {
    return null;
}

export function getToken(_id: string): any {
    return null;
}

export function getUser(_id: string): any {
    return null;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function createChatMessage(_data: object): Promise<any> {
    return null;
}

export function applyRollMode(_data: object, _mode: string): void {}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

export async function enrichHTML(content: string): Promise<string> {
    return content;
}
