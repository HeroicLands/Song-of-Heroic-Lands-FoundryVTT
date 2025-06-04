import { baseClassOf } from "@utils";

const Actor = foundry.documents.Actor;
export class SohlTokenDocument extends baseClassOf(
    foundry.documents.TokenDocument,
) {
    declare id: string;
    declare name: string;
    declare displayName: string;
    declare actorId: string;
    declare actorLink: boolean;
    declare delta: any;
    declare width: number;
    declare height: number;
    declare texture: string;
    declare shape: number;
    declare x: number;
    declare y: number;
    declare elevation: number;
    declare sort: number;
    declare locked: boolean;
    declare lockRotation: boolean;
    declare rotation: number;
    declare alpha: number;
    declare hidden: boolean;
    declare disposition: number;
    declare displayBars: boolean;
    declare bar1: {
        attribute: string;
    };
    declare bar2: {
        attribute: string;
    };
    declare light: any;
    declare sight: {
        enabled: boolean;
        range: number;
        angle: number;
        visionMode: string;
        color: string;
        attenuation: number;
        brightness: number;
        saturation: number;
        contrast: number;
    };
    declare detectionModes: {
        id: string;
        enabled: boolean;
        range: number;
    }[];
    declare occludable: {
        radius: number;
    };
    declare ring: {
        enabled: boolean;
        colors: {
            ring: string;
            background: string;
        };
        effects: number;
        subject: {
            scale: number;
            texture: string;
        };
    };
    declare turnMarker: {
        mode: number;
        animation: string;
        src: string;
        disposition: boolean;
    };
    declare movementAction: string;
    declare readonly parent: InstanceType<
        typeof foundry.documents.Scene
    > | null;
    declare flags: any;

    declare readonly actor: InstanceType<typeof foundry.documents.Actor> | null;
    declare readonly baseActor: InstanceType<
        typeof foundry.documents.Actor
    > | null;
    declare readonly isOwner: boolean;
    declare readonly isLinked: boolean;
    declare readonly combatant: InstanceType<
        typeof foundry.documents.Combatant
    > | null;
    declare readonly inCombat: boolean;
    prepareBaseData(): void {
        super.prepareBaseData();
    }
    prepareDerivedData(): void {
        super.prepareDerivedData();
    }
    prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();
    }
}
