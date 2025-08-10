import { ClientDocumentExtendedMixin } from "@utils/helpers";

export class SohlCombatant extends ClientDocumentExtendedMixin(
    Combatant,
    {} as InstanceType<typeof foundry.documents.BaseCombatant>,
) {}
