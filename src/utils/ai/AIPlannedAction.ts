import { defineType } from "@utils/helpers";

const {
    kind: PLANNED_ACTION,
    values: PlannedActions,
    isValue: isPlannedAction,
} = defineType("SOHL.PlannedAction", {
    CREATE_DOCUMENT: "createDocument",
    MODIFY_DOCUMENT: "modifyDocument",
    DELETE_DOCUMENT: "deleteDocument",
    CREATE_SCRIPT_ACTION: "createScriptAction",
    MODIFY_SCRIPT_ACTION: "modifyScriptAction",
    DELETE_SCRIPT_ACTION: "deleteScriptAction",
    CREATE_EVENT: "createEvent",
    MODIFY_EVENT: "modifyEvent",
    DELETE_EVENT: "deleteEvent",
    CREATE_TOKEN: "createToken",
    MODIFY_TOKEN: "modifyToken",
    DELETE_TOKEN: "deleteToken",
    START_COMBAT: "startCombat",
    END_COMBAT: "endCombat",
    ACTIVATE_ACTION: "activateAction",
    ADVANCE_GAME_TIME: "advanceGameTime",
    PAUSE_GAME: "pauseGame",
    RESUME_GAME: "resumeGame",
});
export type PlannedAction =
    (typeof PLANNED_ACTION)[keyof typeof PLANNED_ACTION];

export interface AIPlannedAction {
    /** The type of action to be performed */
    type: PlannedAction;
    /** Textual description of action to be performed in natural language */
    description: string;
    /** Parameters passed into the command service */
    payload: Record<string, unknown>;
    /** Generated Code or data that will be used */
    preview?: string;
}
