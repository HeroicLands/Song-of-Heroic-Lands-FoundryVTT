/*
 * Mock implementation of FoundryHelpers for unit testing.
 *
 * Provides no-op or simple implementations of all shim functions,
 * allowing logic classes and utilities to be tested without a
 * running Foundry VTT environment.
 */

// ---------------------------------------------------------------------------
// Dialog types (re-exported for consumers)
// ---------------------------------------------------------------------------

export type DialogButtonCallback = (...args: any[]) => Promise<any>;
export interface DialogButton {
    action: string;
    label: string;
    icon: string;
    class: string;
    default?: boolean;
    callback: DialogButtonCallback;
}
export type DialogRenderCallback = (...args: any[]) => Promise<void>;
export type DialogCloseCallback = (...args: any[]) => Promise<void>;
export type DialogSubmitCallback = (result: any) => Promise<void>;
export interface DialogConfig {
    template?: string;
    title?: string;
    content?: string;
    data?: Record<string, any>;
    modal?: boolean;
    rejectClose?: boolean;
    render?: DialogRenderCallback;
    close?: DialogCloseCallback;
    submit?: DialogSubmitCallback;
    ok?: Partial<DialogButton>;
    yes?: Partial<DialogButton>;
    no?: Partial<DialogButton>;
    buttons?: Partial<DialogButton>[];
}
export interface AwaitDialogResult {
    value: any;
    action: string;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function fvttMergeObject(
    original: object,
    other: object,
    _options?: { inplace?: boolean; insertKeys?: boolean; insertValues?: boolean },
): object {
    return { ...original, ...other };
}

// ---------------------------------------------------------------------------
// Document resolution
// ---------------------------------------------------------------------------

export function fvttResolveUuid(_uuid: string): any {
    return null;
}

export async function fvttResolveUuidAsync(_uuid: string): Promise<any> {
    return null;
}


// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export async function fvttToFoundryRoll(_simpleRoll: any): Promise<any> {
    return { total: _simpleRoll?.total ?? 0, result: _simpleRoll?.result ?? "0" };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function fvttCallHook(_name: string, ..._args: unknown[]): void {}

export function fvttCallHookCancel(_name: string, ..._args: unknown[]): boolean {
    return true;
}

export function fvttHookOnError(_source: string, _error: Error, _data?: object): void {}

// ---------------------------------------------------------------------------
// System identity and CONFIG
// ---------------------------------------------------------------------------

export function fvttIsCurrentUserGM(): boolean {
    return true;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export function fvttWorldTime(): number {
    return 0;
}

export function fvttGetSetting(_module: string, _key: string): unknown {
    return undefined;
}

export function fvttIsActiveGM(): boolean {
    return true;
}

export function fvttCurrentUser(): any {
    return { id: "mockUser", isGM: true, isActiveGM: true };
}

export function fvttGetListFormatter(): Intl.ListFormat {
    return new Intl.ListFormat("en", { style: "long", type: "conjunction" });
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

export function fvttGetActor(_id: string): any {
    return null;
}

export function fvttGetScene(_id: string): any {
    return null;
}

export function fvttGetToken(_id: string): any {
    return null;
}

export function fvttGetUser(_id: string): any {
    return null;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function fvttCreateChatMessage(_data: object): Promise<any> {
    return null;
}

export function fvttApplyRollMode(_data: object, _mode: string): void {}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

export async function fvttEnrichHTML(content: string): Promise<string> {
    return content;
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

export async function toHTMLWithTemplate(
    _template: string,
    _data: Record<string, any> = {},
): Promise<string> {
    return "";
}

export async function toHTMLWithContent(
    content: string,
    _data: Record<string, any> = {},
): Promise<string> {
    return content;
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

export async function yesNoDialog(_config?: any): Promise<any> {
    return null;
}

export async function okDialog(_config?: any): Promise<any> {
    return null;
}

export async function inputDialog(_config?: any): Promise<any> {
    return null;
}

export async function awaitDialog(_config?: any): Promise<any> {
    return null;
}

// ---------------------------------------------------------------------------
// Sheet registration
// ---------------------------------------------------------------------------

export function unregisterSheet(
    _documentClass: any,
    _sheetClass: any,
    _options: { types?: string[] },
): void {}

// ---------------------------------------------------------------------------
// Canvas and combat
// ---------------------------------------------------------------------------

export function getTokenInCombat(
    _token?: any,
    _forceAllow?: boolean,
): { token: any; actor: any } | null {
    return null;
}

export function getCanvas(): any {
    return { tokens: new Map() };
}

export function getGame(): any {
    return {};
}

export function getCurrentUser(): any {
    return { id: "mockUser", isGM: true };
}

export function getCurrentScene(): any {
    return null;
}

// ---------------------------------------------------------------------------
// Pack / compendium helpers
// ---------------------------------------------------------------------------

export async function getDocsFromPacks(
    _packNames: string[],
    _options?: any,
): Promise<any[]> {
    return [];
}

export async function getDocumentFromPacks(
    _docName: string,
    _packNames: string[],
    _options?: any,
): Promise<any> {
    return undefined;
}

// ---------------------------------------------------------------------------
// Context menu helpers
// ---------------------------------------------------------------------------

export function getContextItem(_header: HTMLElement): any {
    return null;
}

export function getContextLogic(_element: HTMLElement): any {
    return null;
}
