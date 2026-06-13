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
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { CombatantLogic } from "@src/document/combatant/logic/CombatantLogic";
import { SohlTokenDocumentLogic } from "@src/document/token/SohlTokenDocumentLogic";

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
 * Build a {@link SohlActorData} port object backed by a mock actor document.
 * `itemLogics`/`actorLogic` are lazy getters (so items added after construction
 * via `actor.items.set(...)` are picked up); flag/update calls delegate to the
 * document's vi.fn()s.
 */
function buildActorData(actor: any, kind: string): any {
    const data: any = {
        id: actor.id,
        name: actor.name,
        type: actor.type,
        uuid: `Actor.${actor.id}`,
        isOwner: actor.isOwner,
        kind,
        shortcode: kind,
        actionDefs: [],
        dossier: "",
        appearance: "",
        portrait: "",
        hasPlayerOwner: actor.hasPlayerOwner,
        update: actor.update,
        getFlag: actor.getFlag,
        setFlag: actor.setFlag,
        label: (_o?: unknown) => `${kind} label`,
        parent: actor,
        logic: null,
    };
    // `itemLogics` is what the actor logic's logicTypes/getItemLogic/allLogics
    // read. Bridge BOTH harness conventions: items added via makeItemLogic (in
    // `actor.items`, real logics with `data.kind`) and bare stubs set on
    // `actor.itemTypes` (tagged with their kind from the group key). Deduped by
    // logic identity so an item present in both is counted once.
    Object.defineProperty(data, "itemLogics", {
        get: () => {
            const seen = new Set<any>();
            const out: any[] = [];
            const add = (it: any, logic: any, kind?: string) => {
                if (!logic || seen.has(logic)) return;
                seen.add(logic);
                if (kind && !logic.data?.kind) {
                    logic.data = { ...(logic.data ?? {}), kind };
                }
                // Bare stubs carry id/name on the item, not the logic; the
                // production code reads them off the logic, so copy them down.
                if (it?.id != null && logic.id == null) logic.id = it.id;
                if (it?.name != null && logic.name == null)
                    logic.name = it.name;
                out.push(logic);
            };
            for (const it of actor.items.values())
                add(it, it.logic, it.logic?.data?.kind ?? it.type);
            for (const [kind, arr] of Object.entries(actor.itemTypes ?? {})) {
                for (const it of (arr as any[]) ?? []) add(it, it.logic, kind);
            }
            return out;
        },
        enumerable: false,
    });
    Object.defineProperty(data, "actorLogic", {
        get: () => actor.logic,
        enumerable: false,
    });
    Object.defineProperty(data, "actor", {
        get: () => actor,
        enumerable: false,
    });
    return data;
}

/**
 * Build a mock actor document carrying a real {@link SohlActorBaseLogic} over a
 * {@link SohlActorData} port. `items` is a {@link MockCollection} keyed by item
 * id; the attached actor logic's `allLogics` / `logicTypes` / `getItemLogic`
 * read those items' `.logic` through `data.itemLogics`.
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
        setFlag: vi.fn(async () => undefined),
    };
    const data = buildActorData(actor, opts.kind ?? "being");
    const logic = new SohlActorBaseLogic({}, { parent: data });
    data.logic = logic;
    actor.system = data;
    actor.logic = logic;
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
        setFlag: vi.fn(async () => undefined),
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
        id: item.id,
        name: item.name,
        type: kind,
        uuid: `Item.${item.id}`,
        isOwner: item.isOwner,
        kind,
        shortcode: opts.shortcode ?? kind,
        actionDefs: [],
        notes: "",
        docHtml: "",
        // Port members delegate to the mock document, so `logic.item.update` /
        // `logic.item.getFlag` assertions still observe the call.
        update: item.update,
        getFlag: item.getFlag,
        setFlag: item.setFlag,
        label: (_o?: unknown) => `${kind} label`,
        parent: item,
        logic: null, // wired by makeItemLogic
        ...fields,
    };
    Object.defineProperty(data, "item", {
        get: () => item,
        enumerable: false,
    });
    Object.defineProperty(data, "actorLogic", {
        get: () => item.actor?.logic ?? null,
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
    const data = Object.assign(buildActorData(actor, kind), fields);
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
 * Construct a {@link CombatantLogic} over a {@link CombatantData} port backed by
 * a mock combatant document. `actorLogic` resolves to the supplied (or a fresh)
 * mock actor's logic, so the resume methods can read strike-mode capability.
 *
 * @param opts.actor - The combatant's actor mock (defaults to a fresh one).
 * @param opts.token - The combatant's token (default `null`).
 * @param opts.combat - The active combat (default `null`).
 */
export function makeCombatantLogic(
    opts: { actor?: any; token?: any; combat?: any; name?: string } = {},
): any {
    const actor = opts.actor ?? makeMockActor();
    const combatant: any = {
        id: "combatant00mock1",
        name: opts.name ?? actor.name,
        documentName: "Combatant",
        isOwner: true,
        actor,
        token: opts.token ?? null,
        combat: opts.combat ?? null,
        update: vi.fn(async (data: any) => data),
        getFlag: vi.fn(() => undefined),
        setFlag: vi.fn(async () => undefined),
    };
    const data: any = {
        id: combatant.id,
        name: combatant.name,
        type: "sohlcombatantdata",
        uuid: `Combatant.${combatant.id}`,
        isOwner: true,
        kind: "sohlcombatantdata",
        shortcode: "",
        actionDefs: [],
        startLocation: { x: 0, y: 0, elevation: 0 },
        didAction: false,
        moveFactor: 1,
        displayedMedium: "terrestrial",
        lastAttackMode: null,
        lastBlockMode: null,
        // Derived Foundry-side facts (the combatant data port). Defaults here
        // mirror an ungrouped, healthy, visible combatant; relational tests can
        // override per mock.
        groupId: null,
        isDefeated: false,
        statuses: new Set<string>(),
        isHidden: false,
        update: combatant.update,
        getFlag: combatant.getFlag,
        setFlag: combatant.setFlag,
        parent: combatant,
        logic: null,
    };
    Object.defineProperty(data, "actorLogic", {
        get: () => actor.logic,
        enumerable: false,
    });
    const logic = new CombatantLogic({}, { parent: data });
    data.logic = logic;
    combatant.logic = logic;
    return logic;
}

/**
 * Construct a {@link SohlTokenDocumentLogic} over a transient {@link TokenData}
 * port backed by a mock token document. `actorLogic` resolves to the supplied
 * (or a fresh) mock actor's logic, so the opposed-test methods can read the
 * actor's skills/attributes.
 *
 * @param opts.actor - The token's actor mock (defaults to a fresh one).
 * @param opts.name - The token's name (defaults to the actor's name).
 */
export function makeTokenLogic(opts: { actor?: any; name?: string } = {}): any {
    const actor = opts.actor ?? makeMockActor();
    const token: any = {
        id: "token0000000mok",
        name: opts.name ?? actor.name,
        documentName: "Token",
        isOwner: true,
        actor,
        getFlag: vi.fn(() => undefined),
        setFlag: vi.fn(async () => undefined),
        update: vi.fn(async (data: any) => data),
    };
    const data: any = {
        id: token.id,
        name: token.name,
        type: "token",
        uuid: `Token.${token.id}`,
        isOwner: true,
        kind: "token",
        shortcode: "token",
        actionDefs: [],
        getFlag: token.getFlag,
        setFlag: token.setFlag,
        update: token.update,
        parent: token,
        logic: null,
    };
    Object.defineProperty(data, "actorLogic", {
        get: () => actor.logic,
        enumerable: false,
    });
    const logic = new SohlTokenDocumentLogic({}, { parent: data });
    data.logic = logic;
    token.logic = logic;
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
            data: {
                kind: "attribute",
                shortcode,
                name: opts.name ?? shortcode,
            },
            score: { effective: score },
            masteryLevel: {
                disabled: opts.disabled ?? "",
                effective: opts.masteryLevel ?? score * 5,
            },
        },
    };
}
