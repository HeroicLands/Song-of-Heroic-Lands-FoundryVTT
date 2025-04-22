/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { defaultFromJSON, defaultToJSON } from "@utils";

export type InitialType<ReturnType extends any> =
    | ReturnType
    | ((data: JsonValue, thisArg: any) => ReturnType);

export const CollectionType: StrictObject<string> = {
    ARRAY: "array",
    MAP: "map",
    SET: "set",
};
export type CollectionType =
    (typeof CollectionType)[keyof typeof CollectionType];

/**
 * Represents the metadata associated with a field decorated by `@DataField`.
 *
 * This interface describes the structure of each entry in the class's schema,
 * as recorded in the `_metadata.fields` map for runtime inspection, persistence,
 * schema documentation, and validation.
 */
export interface DataFieldElement<T = any> {
    /**
     * The property name of the decorated field.  Note that this might not be a string, but might be a symbol.
     * This is the name of the property in the class that is decorated with the `@DataField` decorator.
     * If the code has been minified, this may be a different name than the original property name.
     */
    propName: string | symbol;

    /**
     * The persistent key of the data field. This is the name that will be used to identify the field
     * in the serialized form of the class. Due to minification, this may not be the same as the
     * property name in the class.
     */
    dataName: string;

    /**
     * The initial value of the data field. This is either the value that will be used if no value
     * is provided, or an initializer function to use to produce the initial value.
     */
    initial: InitialType<T>;

    /**
     * The type of the data field. This is used to determine the type of the field when it is serialized
     * and deserialized. Due to limitation of passing typing information, this must be a constructor
     * function. This means that for primitive types, you should use the class wrapper, e.g., `String`,
     * `Number`, `Array`, etc.).
     */
    type: (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);

    /**
     * The collection type of the data field. This is used to determine how the field should be serialized
     * and deserialized. This can be either "array", "map", or "set". If undefined, the field
     * will be treated as a normal field.
     * @default undefined
     */
    collection?: CollectionType;

    /**
     * This indicates whether the field is required when deserializing the class.
     * If the field is required and is not present in the serialized form, an error will be thrown.
     * @default false
     */
    required: boolean;

    /**
     * Whether the field is transient. If this is true, the field will not be serialized
     * or deserialized. This is useful for fields that are only used in the class and
     * should not be included in the serialized form.
     * @default false
     */
    transient: boolean;

    /**
     * The cast function for the data field. This function is used modify the provided value
     * to the data type of the field in the setter.  For example, it can be used to cast a
     * input number to a string, saving the string as the value of the property. If not provided,
     * no casting will be performed.
     * @param value The value to cast.
     * @returns The casted value.
     */
    cast: (value: any, thisArg: any) => T;

    /**
     * The serializer function for the data field. This function is used to serialize the value of the
     * data field when it is saved. If not provided, the default serializer will be used.
     * @param value The value to serialize.
     * @returns The serialized value.
     */
    serializer: (value: T, thisArg: any) => JsonValue | undefined;

    /**
     * The deserializer function for the data field. This function is used to deserialize the value of the
     * data field when it is loaded. If not provided, the default deserializer will be used.
     * @param data The JSON object.
     * @returns The deserialized value.
     */
    deserializer: (data: JsonValue, thisArg: any) => T;

    /**
     * The validator function used in the setter when setting the value of the
     * field in the instance (not the JSON data). If not provided, no validation
     * will be performed in the setter.
     * @param value The value to validate.
     * @returns `true` if the value is valid, `false` otherwise.
     */
    validator: (value: any, thisArg: any) => boolean;
}

/**
 * @summary
 * Decorator for assigning a child property that receives its property name upon assignment.
 *
 * @description
 * The `@DataField` decorator allows a class property to be aware of its name within the parent object.
 * When a value is assigned to the decorated property, the decorator automatically invokes the `setPropertyName()`
 * method on the assigned value (if present), passing the property's name as an argument.
 *
 * This is especially useful for deeply nested object models where child components need to propagate updates
 * back to their parent, and require contextual awareness of their position in the parent.
 *
 * @remarks
 * This decorator:
 * - Adds a property getter and setter for the decorated property.
 * - Stores the assigned value in a backing field (`__{propName}`).
 * - Invokes `.setPropertyName(propName)` on the assigned value, if such a method exists.
 *
 * The decorator assumes the decorated property is assigned an object that has a method
 * `setPropertyName(name: string): void`. If the object does not have this method, no error is thrown—
 * the setter call is skipped silently.
 *
 * This pattern is designed to be minimally intrusive and compatible with traditional
 * constructor-based instantiation of nested objects.
 *
 * @example
 * ```ts
 * class Modifier {
 *   private _propName = "";
 *   setPropertyName(name: string) {
 *     this._propName = name;
 *   }
 * }
 *
 * class Skill {
 *   @DataField
 *   public mlMod = new Modifier();
 * }
 *
 * const skill = new Skill();
 * // `mlMod` will now have its _propName set to "mlMod"
 * ```
 */

export function DataField(
    dataName: string,
    options: Partial<DataFieldElement> = {
        required: false,
        serializer: defaultToJSON,
        deserializer: defaultFromJSON,
    },
): PropertyDecorator {
    if (!dataName) {
        throw new Error("DataField name cannot be empty");
    }
    return function (target: any, propertyKey: string | symbol) {
        const privateKey = Symbol(`__${String(dataName)}`);

        // Validate that `type` is a constructor function
        if (options.type && typeof options.type !== "function") {
            throw new Error(
                `Invalid type for DataField '${dataName}'. Expected a constructor function, but got ${typeof options.type}.`,
            );
        }

        Object.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable: true,
            get(this: any) {
                if (!this[privateKey]) {
                    this[privateKey] =
                        typeof options.initial === "function" ?
                            (this[privateKey] = options.initial({
                                thisArg: target,
                                propertyName: String(propertyKey),
                            }))
                        :   options.initial;
                }
                return this[privateKey];
            },
            set(this: any, value: any) {
                if (
                    typeof value === "object" &&
                    !value?.propertyName &&
                    typeof value.setPropertyName === "function"
                ) {
                    value.setPropertyName(dataName);
                }

                if (typeof options.validator === "function") {
                    const isValid = options.validator(value, this);
                    if (!isValid) {
                        throw new Error(
                            `Invalid value for DataField '${dataName}': ${value}`,
                        );
                    }
                }

                this._parent.onChange({ [dataName]: value });
                this[privateKey] = value;
            },
        });
        const element = sohl.classRegistry[target.name];
        const dataField = {
            ...options,
            dataName,
            propName: propertyKey,
            type:
                options.type ??
                (options.initial !== undefined ?
                    typeof options.initial
                :   undefined),
        } as DataFieldElement;
        element.dataFields[dataName] = dataField;
        target._metadata[dataName] = dataField;
    };
}
