/// <reference types="@league-of-foundry-developers/foundry-vtt-types/src/types/index.d.mts" />
import "@league-of-foundry-developers/foundry-vtt-types/src/types/index.d.mts";

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
import type * as FoundryNamespace from "foundry/foundry.js";
import type { Game } from "foundry/client/game";
import type { Canvas } from "foundry/client/canvas";
import type { Time } from "foundry/client/time";
import type * as FoundryHelpers from "foundry/common/utils/helpers.d.ts";

// ✅ Custom utility types
declare global {
    var foundry: typeof FoundryNamespace;
    var game: Game;
    var canvas: Canvas;
    var time: Time;

    /** Special type of string that is guaranteed to be HTML */
    export type HtmlString = string & { __htmlBrand: never };

    // Common types
    type PlainObject = Record<string, any>;
    type UnknownObject = Record<string, unknown>;
    type EmptyObject = Record<string, never>;
    type AnyObject = object;
    type StrictObject<T> = Record<string, T>;
    type AnyFunction = (...args: any[]) => any;
    type MaybePromise<T> = T | Promise<T>;

    /** May be missing or intentionally cleared */
    type Maybe<T> = T | null | undefined;

    /** Nullable but expected */
    type Nullable<T> = T | null;

    /** Optional field */
    type Optional<T> = T | undefined;

    type OptArray<T> = T[] | undefined;

    /** A constructed object (non-plain) */
    type ConstructedObject = object & {
        constructor: {
            name: Exclude<string, "Object">;
        };
    };

    type Constructor<T = unknown> = new (...args: any[]) => T;
    type AbstractConstructor<T = unknown> = abstract new (...args: any[]) => T;
    type AnyConstructor<T = unknown> = Constructor<T> | AbstractConstructor<T>;

    type Func = (...args: any[]) => any;
    type ConstructorOrFunction = Constructor | Func;
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

    type ModifierAtom = {
        name: string;
        abbrev: string;
    };

    // ✅ JSON-safe types
    type JsonValue =
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

    // ✅ Global system accessor
    var sohl: {
        foundry: StrictObject<ConstructorOrFunction>;
        CONFIG: PlainObject;
        CONST: PlainObject;
        variants: StrictObject<SohlSystem>;
        game: SohlSystem;
        classRegistry: SohlClassRegistry;
        i18n: SohlLocalize;
        log: SohlLogger;
        utils: typeof import("@utils");
        simpleCalendar: {
            api: SCAPI;
            calendar: Calendar;
        } | null;
        ready: boolean; // Indicates if the system is fully initialized
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

declare global {
    namespace foundry {
        const utils: typeof FoundryHelpers;
    }
}

export {};
