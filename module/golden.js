/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";

/* ====================================================================== */
/*          Constants                                                     */
/* ====================================================================== */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const fields = foundry.data.fields;

const GOLD = {
    CONST: {},
    CONFIG: {},
};

const GoldActorDataModels = foundry.utils.mergeObject(
    sohl.SohlActorDataModels,
    {},
    { inplace: false },
);

const GoldItemDataModels = foundry.utils.mergeObject(
    sohl.SohlItemDataModels,
    {},
    { inplace: false },
);

const GoldModifiers = foundry.utils.mergeObject(
    sohl.SohlModifiers,
    {},
    { inplace: false },
);

export const verData = {
    id: "legendary",
    label: "Song of Heroic Lands: Golden Edition",
    CONFIG: {
        Helper: {
            modifiers: GoldModifiers,
            contextMenu: sohl.SohlContextMenu,
        },
        Actor: {
            documentClass: sohl.SohlActor,
            documentSheets: [
                {
                    cls: sohl.SohlActorSheet,
                    types: Object.keys(GoldActorDataModels),
                },
            ],
            dataModels: GoldActorDataModels,
            typeLabels: sohl.SohlActorTypeLabels,
            typeIcons: sohl.SohlActorTypeIcons,
            types: Object.keys(GoldActorDataModels),
            defaultType: sohl.AnimateEntityActorData.typeName,
            compendiums: [],
        },
        Item: {
            documentClass: sohl.SohlItem,
            documentSheets: [
                {
                    cls: sohl.SohlItemSheet,
                    types: Object.keys(GoldItemDataModels).filter(
                        (t) => t !== sohl.ContainerGearItemData.typeName,
                    ),
                },
                {
                    cls: sohl.SohlContainerGearItemSheet,
                    types: [sohl.ContainerGearItemData.typeName],
                },
            ],
            dataModels: GoldItemDataModels,
            typeLabels: sohl.SohlItemTypeLabels,
            typeIcons: sohl.SohlItemTypeIcons,
            types: Object.keys(GoldItemDataModels),
            compendiums: ["sohl.golden-basic-items"],
        },
        ActiveEffect: {
            documentClass: sohl.SohlActiveEffect,
            legacyTransferral: false,
        },
        Macro: {
            documentClass: sohl.SohlMacro,
            documentSheet: sohl.SohlMacroConfig,
        },
    },
    CONST: foundry.utils.mergeObject(sohl.SOHL.CONST, GOLD.CONST, {
        inplace: false,
    }),
};
