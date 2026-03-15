import { GROUP_STANCE, GroupStance, COMBAT_KIND } from "@utils/constants";

export class SohlCombat extends Combat<typeof COMBAT_KIND.COMBATDATA> {
    getGroupStances(group: string): StrictObject<GroupStance> {
        const combatData = this.system as SohlCombatDataModel;
        const groupStances = combatData.groupStances[group] ?? {};
        return groupStances;
    }
    
    async setGroupStance(group: string, targetGroup: string, stance: GroupStance) {
        const combatData = this.system as SohlCombatDataModel;
        const groupStances = foundry.utils.deepClone(
            combatData.groupStances,
        ) as StrictObject<StrictObject<GroupStance>>;

        const existing = groupStances[group] ?? {};
        groupStances[group] = {
            ...existing,
            [targetGroup]: stance,
        };

        const updateData = {
            system: {
                groupStances,
            },
        } as Combat.UpdateData;

        return await this.update(updateData);
    }

    async removeGroup(group: string): Promise<void> {
        const combatData = this.system as SohlCombatDataModel;
        const groupStances = foundry.utils.deepClone(
            combatData.groupStances,
        ) as StrictObject<StrictObject<GroupStance>>;
        delete groupStances[group];
        const updateData = {
            system: {
                groupStances,
            },
        } as Combat.UpdateData;

        await this.update(updateData);
    }

    allyGroups(group: string): string[] {
        const combatData = this.system as SohlCombatDataModel;
        const stances = combatData.groupStances[group] ?? {};
        return Object.entries(stances)
            .filter(([_, stance]) => stance === GROUP_STANCE.ALLY)
            .map(([targetGroup, _]) => targetGroup);
    }

    enemyGroups(group: string): string[] {
        const combatData = this.system as SohlCombatDataModel;
        const stances = combatData.groupStances[group] ?? {};
        return Object.entries(stances)
            .filter(([_, stance]) => stance === GROUP_STANCE.ENEMY)
            .map(([targetGroup, _]) => targetGroup);
    }
}

function defineSohlCombatDataSchema(): foundry.data.fields.DataSchema {
    return {
        groupStances: new foundry.data.fields.ObjectField({
            required: false,
            default: {},
        }),
    };
}

type SohlCombatDataSchema = ReturnType<typeof defineSohlCombatDataSchema>;

export class SohlCombatDataModel<
        TSchema extends foundry.data.fields.DataSchema = SohlCombatDataSchema,
    >
    extends foundry.abstract.TypeDataModel<TSchema, SohlCombat>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.SohlCombat.DATA"];
    static readonly kind = "sohlcombatdata";

    groupStances!: StrictObject<StrictObject<GroupStance>>;
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlCombatDataSchema();
    }
}
