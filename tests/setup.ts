/*
 * Global test setup for vitest.
 *
 * Provides a minimal globalThis.sohl object that satisfies the SoHL
 * system's runtime expectations without a running Foundry VTT environment.
 */

// Foundry adds paddedString to Number.prototype; replicate it for tests.
(Number.prototype as any).paddedString = function (
    this: number,
    digits: number,
): string {
    if (this < 0) return "-" + Math.abs(this).toString().padStart(digits, "0");
    return this.toString().padStart(digits, "0");
};

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
    normalizeText(
        text: string,
        _opts?: { caseInsensitive?: boolean; ascii?: boolean },
    ): string {
        return text.toLowerCase().trim();
    },
    formatListOr(items: string[]): string {
        return items.join(" or ");
    },
    getListFormatter(): Intl.ListFormat {
        return new Intl.ListFormat("en", {
            style: "long",
            type: "conjunction",
        });
    },
};

// Minimal SohlLogger mock
const log = {
    warn(..._args: unknown[]): void {},
    error(..._args: unknown[]): void {},
    uiWarn(..._args: unknown[]): void {},
    uiError(..._args: unknown[]): void {},
    uiInfo(..._args: unknown[]): void {},
    uiDebug(..._args: unknown[]): void {},
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
        randomID(length: number = 16): string {
            const chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let out = "";
            for (let i = 0; i < length; i++) {
                out += chars[Math.floor(Math.random() * chars.length)];
            }
            return out;
        },
        escapeHTML(s: string): string {
            return s
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;");
        },
        deepClone<T>(obj: T): T {
            return JSON.parse(JSON.stringify(obj));
        },
    },
    data: {
        // Minimal real CalendarData mock — supports the timeToComponents /
        // componentsToTime / static formatter contract used by SohlCalendar.
        // Handles non-leap calendars only (sufficient for SoHL's default config).
        CalendarData: class {
            name?: string;
            description?: string;
            years?: any;
            months?: any;
            days?: any;
            seasons?: any;
            constructor(config: any = {}, _options?: any) {
                Object.assign(this, config);
            }
            static defineSchema(): any {
                return {};
            }

            private _secondsPerDay(): number {
                const d = this.days;
                return d.secondsPerMinute * d.minutesPerHour * d.hoursPerDay;
            }
            private _secondsPerYear(): number {
                return this.days.daysPerYear * this._secondsPerDay();
            }

            timeToComponents(time: number = 0): any {
                const secondsPerDay = this._secondsPerDay();
                const secondsPerYear = this._secondsPerYear();
                const secondsPerHour =
                    this.days.secondsPerMinute * this.days.minutesPerHour;
                const secondsPerMinute = this.days.secondsPerMinute;

                let year = Math.floor(time / secondsPerYear);
                let rem = time - year * secondsPerYear;
                if (rem < 0) {
                    year -= 1;
                    rem += secondsPerYear;
                }
                const day = Math.floor(rem / secondsPerDay);
                rem -= day * secondsPerDay;

                let dayOfMonth = day;
                let month = 0;
                for (month = 0; month < this.months.values.length; month++) {
                    const md = this.months.values[month].days;
                    if (dayOfMonth < md) break;
                    dayOfMonth -= md;
                }

                const totalDays = Math.floor(time / secondsPerDay);
                const wlen = this.days.values.length;
                const dayOfWeek =
                    (((totalDays + (this.years?.firstWeekday ?? 0)) % wlen) +
                        wlen) %
                    wlen;

                const hour = Math.floor(rem / secondsPerHour);
                rem -= hour * secondsPerHour;
                const minute = Math.floor(rem / secondsPerMinute);
                const second = rem - minute * secondsPerMinute;

                return {
                    day,
                    dayOfMonth,
                    dayOfWeek,
                    hour,
                    leapYear: false,
                    minute,
                    month,
                    season: undefined,
                    second,
                    year,
                };
            }

            componentsToTime(c: any): number {
                const secondsPerDay = this._secondsPerDay();
                const secondsPerYear = this._secondsPerYear();
                const secondsPerHour =
                    this.days.secondsPerMinute * this.days.minutesPerHour;
                const secondsPerMinute = this.days.secondsPerMinute;

                let time = (c.year ?? 0) * secondsPerYear;
                if (c.day != null) {
                    time += c.day * secondsPerDay;
                } else if (c.month != null && c.dayOfMonth != null) {
                    let d = c.dayOfMonth;
                    for (let m = 0; m < c.month; m++)
                        d += this.months.values[m].days;
                    time += d * secondsPerDay;
                }
                time += (c.hour ?? 0) * secondsPerHour;
                time += (c.minute ?? 0) * secondsPerMinute;
                time += c.second ?? 0;
                return time;
            }

            // Non-leap calendars only (matches real CalendarData when
            // `years.leapYear` is unset), sufficient for SoHL's default config.
            isLeapYear(_year: number): boolean {
                return false;
            }
        },
        fields: {
            StringField: class {
                constructor(public options: any = {}) {}
            },
            NumberField: class {
                constructor(public options: any = {}) {}
            },
            BooleanField: class {
                constructor(public options: any = {}) {}
            },
            ArrayField: class {
                constructor(
                    public element?: any,
                    public options: any = {},
                ) {}
            },
            ObjectField: class {
                constructor(public options: any = {}) {}
            },
            SchemaField: class {
                fields: any;
                options: any;
                constructor(schema: any = {}, options: any = {}) {
                    this.fields = schema;
                    this.options = options;
                }
            },
            HTMLField: class {
                constructor(public options: any = {}) {}
            },
            FilePathField: class {
                constructor(public options: any = {}) {}
            },
            DocumentIdField: class {
                constructor(public options: any = {}) {}
            },
        },
    },
    abstract: {
        TypeDataModel: class {
            constructor(_data?: any, _options?: any) {}
            static defineSchema() {
                return {};
            }
        },
    },
    applications: {
        ux: {
            TextEditor: {
                implementation: {
                    async enrichHTML(content: string) {
                        return content;
                    },
                },
            },
            ContextMenu: class {
                constructor(..._args: any[]) {}
            },
        },
        sheets: {
            ActiveEffectConfig: class {
                constructor(..._args: any[]) {}
            },
        },
    },
    documents: {
        ChatMessage: {
            async create(_data: any) {
                return null;
            },
        },
    },
    dice: {
        Roll: class {
            constructor(public formula: string) {}
            async evaluate() {
                return { total: 0 };
            }
        },
    },
};

(globalThis as any).game = {
    time: { worldTime: 0 },
    settings: {
        get(_module: string, _key: string) {
            return undefined;
        },
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
    call(_name: string, ..._args: any[]) {
        return true;
    },
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
            async evaluate() {
                return { total: 0 };
            },
            total: 0,
        };
    },
};

(globalThis as any).fromUuid = async (_uuid: string) => null;
(globalThis as any).fromUuidSync = (_uuid: string) => null;
(globalThis as any).ActiveEffect = class {
    parent?: any;
    constructor(data: any = {}, context: any = {}) {
        Object.assign(this, data);
        this.parent = context?.parent;
    }
    static _applyChangeUnguided(_t: any, _c: any, _ch: any, _o?: any): any {
        return undefined;
    }
};
(globalThis as any).Item = class {
    parent?: any;
    constructor(data: any = {}, context: any = {}) {
        Object.assign(this, data);
        this.parent = context?.parent;
    }
};
(globalThis as any).Actor = class {
    items: any = new Map();
    effects: any = new Map();
    constructor(data: any = {}, _context: any = {}) {
        Object.assign(this, data);
    }
    prepareBaseData() {}
    prepareEmbeddedData() {}
    prepareDerivedData() {}
};
(globalThis as any).TokenDocument = class {
    constructor(_data?: any, _context?: any) {}
};
(globalThis as any).Ray = class {
    constructor(
        public origin: any,
        public destination: any,
    ) {}
};
(globalThis as any).Dialog = {
    async prompt(_opts: any) {
        return null;
    },
};
(globalThis as any).FormDataExtended = class {
    object = {};
    constructor(_form: any) {}
};
