/*
 * Test harness for constructing Logic classes outside Foundry.
 *
 * Logic classes operate on Data interfaces (SohlItemData / SohlActorData)
 * that the Foundry DataModels implement in production. These builders supply
 * plain-object implementations of those interfaces, which is exactly what
 * the interface-based design enables: a Logic instance never knows whether
 * its `data` is a Foundry DataModel or a mock.
 *
 * Construction mirrors `SohlDataModel.create()`:
 *     new LogicCtor({}, { parent: dataObject })
 * where `dataObject.parent` is the owning document (here a mock item/actor).
 */

import { vi } from "vitest";

/**
 * Minimal stand-in for Foundry's `Collection`: a Map whose `find`/`some`/
 * `filter` iterate values, matching the API surface logic classes use
 * (`items.get`, `items.find`, `items.values`, `items.some`).
 */
export class MockCollection<V> extends Map<string, V> {
    find(predicate: (v: V) => boolean): V | undefined {
        for (const v of this.values()) if (predicate(v)) return v;
        return undefined;
    }
    some(predicate: (v: V) => boolean): boolean {
        for (const v of this.values()) if (predicate(v)) return true;
        return false;
    }
    filter(predicate: (v: V) => boolean): V[] {
        return Array.from(this.values()).filter(predicate);
    }
    map<T>(fn: (v: V) => T): T[] {
        return Array.from(this.values()).map(fn);
    }
}

/** A stub speaker capturing `toChat` calls. */
export function makeMockSpeaker(): any {
    return {
        toChat: vi.fn(async () => null),
        actor: null,
        token: null,
    };
}

export interface MockActorOptions {
    id?: string;
    name?: string;
    kind?: string;
    hasPlayerOwner?: boolean;
    isOwner?: boolean;
}

/**
 * Build a mock actor document: `items` is a {@link MockCollection} keyed by
 * item id; `getSpeaker()` returns a capture-friendly stub speaker.
 */
export function makeMockActor(opts: MockActorOptions = {}): any {
    const actor: any = {
        id: opts.id ?? "actor000000mock",
        name: opts.name ?? "Test Actor",
        type: opts.kind ?? "being",
        documentName: "Actor",
        isOwner: opts.isOwner ?? true,
        hasPlayerOwner: opts.hasPlayerOwner ?? true,
        items: new MockCollection<any>(),
        getSpeaker: vi.fn(() => makeMockSpeaker()),
        update: vi.fn(async (data: any) => data),
        getFlag: vi.fn(() => undefined),
    };
    return actor;
}

export interface MockItemOptions {
    id?: string;
    name?: string;
    actor?: any;
    isOwner?: boolean;
    flags?: Record<string, unknown>;
}

/**
 * Build a mock item document. `update` and `getFlag` are vi.fn()s so tests
 * can assert on update payloads; flags are looked up as `"<scope>.<key>"`
 * in `opts.flags`.
 */
export function makeMockItem(kind: string, opts: MockItemOptions = {}): any {
    const flags = opts.flags ?? {};
    const item: any = {
        id: opts.id ?? "item0000000mock",
        name: opts.name ?? "Test Item",
        type: kind,
        documentName: "Item",
        isOwner: opts.isOwner ?? true,
        actor: opts.actor ?? null,
        getFlag: vi.fn(
            (scope: string, key: string) => flags[`${scope}.${key}`],
        ),
        update: vi.fn(async (data: any) => data),
        system: null, // wired to the data object by makeItemData
        logic: null, // wired by makeItemLogic
    };
    return item;
}

/**
 * Build a plain object implementing {@link SohlItemData} (plus any
 * type-specific fields), wired to a mock item document.
 *
 * @param kind - The item kind (`ITEM_KIND.*` value).
 * @param fields - Type-specific data fields (e.g. `masteryLevelBase`).
 * @param opts - Mock item/document options; `shortcode` defaults to `kind`.
 */
export function makeItemData(
    kind: string,
    fields: Record<string, unknown> = {},
    opts: MockItemOptions & { shortcode?: string } = {},
): any {
    const item = makeMockItem(kind, opts);
    const data: any = {
        kind,
        shortcode: opts.shortcode ?? kind,
        actionDefs: [],
        notes: "",
        docHtml: "",
        label: (_o?: unknown) => `${kind} label`,
        parent: item,
        logic: null, // wired by makeItemLogic
        ...fields,
    };
    Object.defineProperty(data, "item", {
        get: () => item,
        enumerable: false,
    });
    item.system = data;
    return data;
}

/**
 * Construct a Logic instance the way `SohlDataModel.create()` does in
 * production, wiring `data.logic` and `item.logic` back-references.
 *
 * @param LogicCtor - The logic class to construct.
 * @param kind - The item kind.
 * @param fields - Type-specific data fields.
 * @param opts - Mock item/document options (pass `actor` to embed the item).
 * @returns The constructed logic instance (lifecycle NOT yet run — call
 *   `initialize()` / `evaluate()` / `finalize()` in the test as needed).
 */
export function makeItemLogic<T>(
    LogicCtor: new (data: any, options: any) => T,
    kind: string,
    fields: Record<string, unknown> = {},
    opts: MockItemOptions & { shortcode?: string } = {},
): T {
    const data = makeItemData(kind, fields, opts);
    const logic = new LogicCtor({}, { parent: data });
    data.logic = logic;
    data.parent.logic = logic;
    if (opts.actor) {
        opts.actor.items.set(data.parent.id, data.parent);
    }
    return logic;
}

/**
 * Build a plain object implementing {@link SohlActorData} (plus any
 * type-specific fields), wired to a mock actor document.
 */
export function makeActorData(
    kind: string,
    fields: Record<string, unknown> = {},
    opts: MockActorOptions & { shortcode?: string } = {},
): any {
    const actor = makeMockActor({ ...opts, kind });
    const data: any = {
        kind,
        shortcode: opts.shortcode ?? kind,
        actionDefs: [],
        dossier: "",
        appearance: "",
        portrait: "",
        label: (_o?: unknown) => `${kind} label`,
        parent: actor,
        logic: null, // wired by makeActorLogic
        ...fields,
    };
    Object.defineProperty(data, "actor", {
        get: () => actor,
        enumerable: false,
    });
    actor.system = data;
    return data;
}

/**
 * Construct an actor Logic instance, wiring `data.logic` and `actor.logic`
 * back-references. Lifecycle is NOT run automatically.
 */
export function makeActorLogic<T>(
    LogicCtor: new (data: any, options: any) => T,
    kind: string,
    fields: Record<string, unknown> = {},
    opts: MockActorOptions & { shortcode?: string } = {},
): T {
    const data = makeActorData(kind, fields, opts);
    const logic = new LogicCtor({}, { parent: data });
    data.logic = logic;
    data.parent.logic = logic;
    return logic;
}

/**
 * Build an attribute item stub satisfying BOTH consumers of actor-embedded
 * attributes:
 * - `SkillBase` reads `logic.data.shortcode` and `logic.score.effective`
 * - `SkillLogic.initialize` reads `system.shortcode` and
 *   `logic.masteryLevel.{disabled,effective}`
 *
 * @param shortcode - The attribute shortcode (e.g. `"str"`, `"aur"`).
 * @param score - The attribute's effective score.
 * @param opts.masteryLevel - The attribute's effective mastery level
 *   (defaults to `score * 5`); `disabled` marks it unusable.
 */
export function makeAttributeStub(
    shortcode: string,
    score: number,
    opts: {
        id?: string;
        name?: string;
        masteryLevel?: number;
        disabled?: string;
    } = {},
): any {
    return {
        id: opts.id ?? `attr${shortcode.padEnd(12, "0")}`,
        name: opts.name ?? shortcode,
        type: "attribute",
        parent: { name: opts.name ?? shortcode },
        system: { shortcode },
        logic: {
            data: { shortcode },
            score: { effective: score },
            masteryLevel: {
                disabled: opts.disabled ?? "",
                effective: opts.masteryLevel ?? score * 5,
            },
        },
    };
}
