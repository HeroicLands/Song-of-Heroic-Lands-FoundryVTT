/*
 * Global test setup for vitest.
 *
 * Provides a minimal globalThis.sohl object that satisfies the SoHL
 * system's runtime expectations without a running Foundry VTT environment.
 */

// Minimal SohlLocalize mock
const i18n = {
    lang: "en",
    localize(key: string): string {
        return key;
    },
    format(key: string, data: Record<string, unknown> = {}): string {
        let result = key;
        for (const [k, v] of Object.entries(data)) {
            result = result.replace(`{${k}}`, String(v));
        }
        return result;
    },
    normalizeText(text: string, _opts?: { caseInsensitive?: boolean; ascii?: boolean }): string {
        return text.toLowerCase().trim();
    },
    formatListOr(items: string[]): string {
        return items.join(" or ");
    },
    getListFormatter(): Intl.ListFormat {
        return new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    },
};

// Minimal SohlLogger mock
const log = {
    warn(..._args: unknown[]): void {},
    error(..._args: unknown[]): void {},
    uiWarn(..._args: unknown[]): void {},
    uiError(..._args: unknown[]): void {},
    info(..._args: unknown[]): void {},
    debug(..._args: unknown[]): void {},
    setLogThreshold(_level: number): void {},
};

// Minimal SohlSystem mock
const sohlMock = {
    id: "sohl",
    i18n,
    log,
    ready: true,
    CONFIG: {
        MOD: {} as Record<string, any>,
    } as Record<string, any>,
};

(globalThis as any).sohl = sohlMock;

// Minimal Foundry global stubs needed by fvtt-types at import time
(globalThis as any).foundry = {
    CONST: {
        DEFAULT_TOKEN: "icons/svg/mystery-man.svg",
    },
    utils: {
        mergeObject(original: any, other: any) {
            return { ...original, ...other };
        },
        setProperty(obj: any, key: string, value: any) {
            const parts = key.split(".");
            let current = obj;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!(parts[i] in current)) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        },
        getProperty(obj: any, key: string) {
            return key.split(".").reduce((o, k) => o?.[k], obj);
        },
        expandObject(obj: any) {
            return obj;
        },
    },
    data: {
        fields: {
            StringField: class { constructor(_opts?: any) {} },
            NumberField: class { constructor(_opts?: any) {} },
            BooleanField: class { constructor(_opts?: any) {} },
            ArrayField: class { constructor(_inner?: any, _opts?: any) {} },
            ObjectField: class { constructor(_opts?: any) {} },
            SchemaField: class { constructor(_schema?: any, _opts?: any) {} },
            HTMLField: class { constructor(_opts?: any) {} },
            FilePathField: class { constructor(_opts?: any) {} },
            DocumentIdField: class { constructor(_opts?: any) {} },
        },
    },
    abstract: {
        TypeDataModel: class {
            constructor(_data?: any, _options?: any) {}
            static defineSchema() { return {}; }
        },
    },
    applications: {
        ux: {
            TextEditor: {
                implementation: {
                    async enrichHTML(content: string) { return content; },
                },
            },
        },
    },
    documents: {
        ChatMessage: {
            async create(_data: any) { return null; },
        },
    },
    dice: {
        Roll: class {
            constructor(public formula: string) {}
            async evaluate() { return { total: 0 }; }
        },
    },
};

(globalThis as any).game = {
    time: { worldTime: 0 },
    settings: {
        get(_module: string, _key: string) { return undefined; },
        register() {},
    },
    i18n: i18n,
    user: { id: "testUser", isGM: true, isActiveGM: true },
    actors: new Map(),
    scenes: new Map(),
    users: new Map(),
};

(globalThis as any).canvas = {
    tokens: new Map(),
};

(globalThis as any).ui = {
    notifications: {
        warn(_msg: string) {},
        error(_msg: string) {},
        info(_msg: string) {},
    },
};

(globalThis as any).Hooks = {
    callAll(_name: string, ..._args: any[]) {},
    call(_name: string, ..._args: any[]) { return true; },
    onError(_source: string, _error: Error, _data?: any) {},
    on(_name: string, _fn: Function) {},
    once(_name: string, _fn: Function) {},
};

(globalThis as any).CONST = {
    DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, LIMITED: 1, OBSERVER: 2, OWNER: 3 },
};

(globalThis as any).ChatMessage = {
    applyRollMode(_data: any, _mode: string) {},
};

(globalThis as any).Roll = {
    create(formula: string) {
        return {
            formula,
            async evaluate() { return { total: 0 }; },
            total: 0,
        };
    },
};

(globalThis as any).fromUuid = async (_uuid: string) => null;
(globalThis as any).fromUuidSync = (_uuid: string) => null;
(globalThis as any).TokenDocument = class {
    constructor(_data?: any, _context?: any) {}
};
(globalThis as any).Ray = class {
    constructor(public origin: any, public destination: any) {}
};
(globalThis as any).Dialog = {
    async prompt(_opts: any) { return null; },
};
(globalThis as any).FormDataExtended = class {
    object = {};
    constructor(_form: any) {}
};
