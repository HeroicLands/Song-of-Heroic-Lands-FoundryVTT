/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
// import type {
//     fromUuid,
//     fromUuidSync,
// } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/core/utils.d.mts"; // adjust if needed
import type {
    SohlSystem,
    SohlBase,
    SohlBaseConstructor,
} from "@module/logic/common/core";
import type {
    SohlMap,
    SohlClassRegistry,
    SohlLogger,
    SohlLocalize,
    MersenneTwister,
} from "@utils";
import type { HelperModule } from "@utils/helpers";
import type {
    SCAPI,
    Calendar,
    SCConfiguration,
} from "foundryvtt-simple-calendar";

declare const game: Game; // Foundry VTT Game object

// ✅ Custom utility types
declare global {
    export type PlainObject = PlainObject;
    export type UnknownObject = Record<string, unknown>;
    export type EmptyObject = Record<string, never>;
    export type AnyObject = object;
    export type StrictObject<T> = Record<string, T>;
    export type Constructor<T = {}> = new (...args: any[]) => T;
    export type AnyFunction = (...args: any[]) => any;
    export type MaybePromise<T> = T | Promise<T>;

    /** May be missing or intentionally cleared */
    export type Maybe<T> = T | null | undefined;

    /** Nullable but expected */
    export type Nullable<T> = T | null;

    /** Optional field */
    export type Optional<T> = T | undefined;

    export type OptArray<T> = T[] | undefined;

    /** A constructed object (non-plain) */
    export type ConstructedObject = object & {
        constructor: {
            name: Exclude<string, "Object">;
        };
    };

    type Constructor<T = {}> = new (...args: any[]) => T;
    type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;
    type AnyConstructor<T = {}> = Constructor<T> | AbstractConstructor<T>;

    /**
     * Helper to expose known properties of a class.
     * Make property K in type T recognized and required.
     *
     * @template T - The base type to extend.
     * @template K - The key of the property to add or override.
     * @template V - The type of the value for the property K.
     */
    //    type WithProperty<T, K extends keyof any, V> = T & { [P in K]: V };

    // Foundry VTT Module types
    type CalendarInstance = InstanceType<typeof SimpleCalendar.Calendar>;

    export type ModifierAtom = {
        name: string;
        abbrev: string;
    };

    // ✅ JSON-safe types
    export type JsonValue =
        | string
        | number
        | boolean
        | null
        | { [key: string]: JsonValue }
        | JsonValue[];

    // ✅ Base Logic Compatibility
    type LogicCompatibleDataModel = {
        parent: {
            update: (data: any) => unknown;
        };
    };

    type BaseLogicOptions<TDataModel> = {
        parent?: TDataModel;
    };

    type HTMLString = string;

    // GlobalThis modifications
    // interface GlobalThis {
    //     origFromUuid: typeof fromUuid;
    //     origFromUuidSync: typeof fromUuidSync;
    // }

    var SohlVariant = StrictObject<SohlSystem>;

    // Foundry VTT modifications
    interface Game {
        settings: GameSettings & {
            get(module: "sohl", key: string): unknown;
        };
    }

    /**
     * Configuration options for {@link FormDataExtended}.
     */
    export interface FormDataExtendedOptions {
        /**
         * Include disabled form fields in the result?
         * @default false
         */
        disabled?: boolean;

        /**
         * Include readonly form fields in the result?
         * @default false
         */
        readonly?: boolean;

        /**
         * A mapping of form field names to expected data types.
         * For example: `{ quantity: "number" }`
         */
        dtypes?: Record<string, string>;

        /**
         * TinyMCE editor metadata, keyed by field name.
         */
        editors?: Record<string, object>;
    }

    // ✅ Global system accessor
    var sohl: {
        registerValue: Function;
        unregisterValue: Function;
        registerSheet: Function;
        unregisterSheet: Function;
        registeredClassFactory: Function;
        CONFIG: PlainObject;
        CONST: PlainObject;
        variants: StrictObject<SohlSystem>;
        classRegistry: StrictObject<SohlClassRegistryElement>;
        game: SohlSystem;
        utils: typeof import("@utils/helpers");
        i18n: SohlLocalize;
        ready: boolean; // Indicates if the system is fully initialized
        simpleCalendar: {
            api: SCAPI;
            calendar: Calendar;
        } | null;
        log: SohlLogger;
    };

    var origFromUuid: (
        uuid: string,
        options?: {
            relative?: ClientDocument;
            invalid?: boolean;
        },
    ) => Promise<foundry.abstract.Document.Any | null>;

    var origFromUuidSync: (
        uuid: string,
        options?: {
            relative?: ClientDocument;
            invalid?: boolean;
            strict?: boolean;
        },
    ) => foundry.abstract.Document.Any | Record<string, unknown> | null;
}

export {};
