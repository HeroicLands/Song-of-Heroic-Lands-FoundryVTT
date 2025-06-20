import { ClientDocumentExtendedMixin } from "@utils";

export class SohlCombatant extends ClientDocumentExtendedMixin(
    Combatant,
    {} as InstanceType<typeof foundry.documents.BaseCombatant>,
) {}
