/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";

/* ====================================================================== */
/*          Constants                                                     */
/* ====================================================================== */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const fields = foundry.data.fields;

const ISLE = {
    CONST: {},
    CONFIG: {},
};

const IsleActorDataModels = foundry.utils.mergeObject(
    sohl.SohlActorDataModels,
    {},
    { inplace: false },
);

const IsleItemDataModels = foundry.utils.mergeObject(
    sohl.SohlItemDataModels,
    {},
    { inplace: false },
);

const IsleModifiers = foundry.utils.mergeObject(
    sohl.SohlModifiers,
    {},
    { inplace: false },
);

export const verData = {
    id: "legendary",
    label: "Song of Heroic Lands: Island Edition",
    CONFIG: {
        Helper: {
            modifiers: IsleModifiers,
            contextMenu: sohl.SohlContextMenu,
        },
        Actor: {
            documentClass: sohl.SohlActor,
            documentSheets: [
                {
                    cls: sohl.SohlActorSheet,
                    types: Object.keys(IsleActorDataModels),
                },
            ],
            dataModels: IsleActorDataModels,
            typeLabels: sohl.SohlActorTypeLabels,
            typeIcons: sohl.SohlActorTypeIcons,
            types: Object.keys(IsleActorDataModels),
            defaultType: sohl.AnimateEntityActorData.typeName,
            compendiums: [],
        },
        Item: {
            documentClass: sohl.SohlItem,
            documentSheets: [
                {
                    cls: sohl.SohlItemSheet,
                    types: Object.keys(IsleItemDataModels).filter(
                        (t) => t !== sohl.ContainerGearItemData.typeName,
                    ),
                },
                {
                    cls: sohl.SohlContainerGearItemSheet,
                    types: [sohl.ContainerGearItemData.typeName],
                },
            ],
            dataModels: IsleItemDataModels,
            typeLabels: sohl.SohlItemTypeLabels,
            typeIcons: sohl.SohlItemTypeIcons,
            types: Object.keys(IsleItemDataModels),
            compendiums: ["sohl.island-basic-items"],
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
    CONST: foundry.utils.mergeObject(sohl.SOHL.CONST, ISLE.CONST, {
        inplace: false,
    }),
};
