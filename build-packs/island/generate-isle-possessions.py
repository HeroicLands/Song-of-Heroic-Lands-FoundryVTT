#!./venv/bin/python3

import yaml
import json
import argparse
from unidecode import unidecode
from mergedeep import merge
import re

parser = argparse.ArgumentParser()
parser.add_argument("dataDir", help="folder where data files are located")
parser.add_argument("outputDir", help="folder where generated files should be placed")
args = parser.parse_args()

stats = {
    "systemId": "sohl",
    "systemVersion": "0.9.0",
    "coreVersion": "12.330",
    "createdTime": 0,
    "modifiedTime": 0,
    "lastModifiedBy": "TMJsvJWT6ytpHZ0M",
}

with open(f"{args.dataDir}/miscgear.yaml", "r", encoding="utf8") as infile:
    miscgearData = yaml.safe_load(infile)

for miscgear in miscgearData:
    print(f"Processing Misc Gear {miscgear['name']}")
    fname = miscgear["name"] + "_" + miscgear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": miscgear["name"],
        "type": "miscgear",
        "img": miscgear["img"],
        "_id": miscgear["id"],
        "_key": "!items!" + miscgear["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": miscgear["description"],
            "macros": miscgear["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": miscgear["abbrev"],
            "quantity": 1,
            "weightBase": miscgear["weight"],
            "valueBase": miscgear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": miscgear["quality"],
            "durabilityBase": miscgear["durability"],
        },
        "effects": miscgear["effects"],
        "flags": miscgear["flags"],
        "_stats": stats,
        "folder": miscgear["folderId"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/containergear.yaml", "r", encoding="utf8") as infile:
    containergearData = yaml.safe_load(infile)

for containergear in containergearData:
    print(f"Processing Container Gear {containergear['name']}")
    fname = containergear["name"] + "_" + containergear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": containergear["name"],
        "type": "containergear",
        "img": containergear["img"],
        "_id": containergear["id"],
        "_key": "!items!" + containergear["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": containergear["description"],
            "macros": containergear["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": "",
            "quantity": 1,
            "weightBase": containergear["weight"],
            "valueBase": containergear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": containergear["quality"],
            "durabilityBase": containergear["durability"],
            "maxCapacityBase": containergear["maxCapacity"],
        },
        "effects": containergear["effects"],
        "flags": containergear["flags"],
        "_stats": stats,
        "folder": "dl8lJ729W1mFlDvt",
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/concoctiongear.yaml", "r", encoding="utf8") as infile:
    concoctiongearData = yaml.safe_load(infile)

for concoctiongear in concoctiongearData:
    print(f"Processing Concoction Gear {concoctiongear['name']}")
    fname = concoctiongear["name"] + "_" + concoctiongear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": concoctiongear["name"],
        "type": "concoctiongear",
        "img": concoctiongear["img"],
        "_id": concoctiongear["id"],
        "_key": "!items!" + concoctiongear["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": concoctiongear["description"],
            "macros": concoctiongear["macros"],
            "nestedItems": [],
            "transfer": False,
            "subType": concoctiongear["subType"],
            "abbrev": "",
            "quantity": 1,
            "weightBase": concoctiongear["weight"],
            "valueBase": concoctiongear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": concoctiongear["quality"],
            "durabilityBase": concoctiongear["durability"],
            "potency": concoctiongear["potency"],
            "strength": concoctiongear["strength"],
        },
        "effects": concoctiongear["effects"],
        "flags": concoctiongear["flags"],
        "_stats": stats,
        "folder": concoctiongear["folderId"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/folders.yaml", "r", encoding="utf8") as infile:
    foldersData = yaml.safe_load(infile)

for folder in foldersData:
    print(f"Processing Folder {folder['name']}")
    fname = folder["name"] + "_" + folder["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": folder["name"],
        "sorting": "a",
        "folder": folder["parentFolderId"] or None,
        "type": "Item",
        "_id": folder["id"],
        "sort": 0,
        "color": folder["color"],
        "flags": {},
        "_stats": stats,
        "_key": "!folders!" + folder["id"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/armorgear.yaml", "r", encoding="utf8") as infile:
    armorgearData = yaml.safe_load(infile)

for armorgear in armorgearData:
    print(f"Processing Armor Gear {armorgear['name']}")
    fname = armorgear["name"] + "_" + armorgear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    merge(
        armorgear["flags"],
        {
            "sohl": {
                "island": {
                    "encumbrance": armorgear["encumbrance"],
                },
            },
        },
    )
    out = {
        "name": armorgear["name"],
        "type": "armorgear",
        "img": armorgear["img"],
        "_id": armorgear["id"],
        "_key": "!items!" + armorgear["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": armorgear["description"],
            "macros": armorgear["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": armorgear["abbrev"],
            "quantity": 1,
            "weightBase": armorgear["weight"],
            "valueBase": armorgear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": 0,
            "durabilityBase": armorgear["durability"],
            "material": armorgear["material"],
            "locations": {
                "flexible": armorgear["flexloc"],
                "rigid": armorgear["rigidloc"],
            },
            "protectionBase": {
                "blunt": armorgear["blunt"],
                "edged": armorgear["edged"],
                "piercing": armorgear["piercing"],
                "fire": armorgear["fire"],
            },
        },
        "effects": [],
        "flags": armorgear["flags"],
        "_stats": stats,
        "folder": armorgear["folderId"],
    }

    if armorgear["perception"] != 0:
        out["effects"].append(
            {
                "name": armorgear["name"] + " Perception",
                "icon": "icons/svg/aura.svg",
                "changes": [
                    {
                        "key": "mod:system.$masteryLevel",
                        "mode": 2,
                        "value": str(armorgear["perception"]),
                        "priority": None,
                    }
                ],
                "flags": {},
                "type": "sohlactiveeffect",
                "system": {
                    "targetType": "this",
                    "targetName": "",
                },
                "_id": armorgear["perceptionEffectId"],
                "disabled": False,
                "duration": {
                    "startTime": None,
                    "seconds": None,
                    "combat": None,
                    "rounds": None,
                    "turns": None,
                    "startRound": None,
                    "startTurn": None,
                },
                "origin": "",
                "tint": None,
                "transfer": False,
                "description": "",
                "statuses": [],
                "_key": "!items.effects!"
                + armorgear["id"]
                + "."
                + armorgear["perceptionEffectId"],
            }
        )

    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/projectilegear.yaml", "r", encoding="utf8") as infile:
    projectilegearData = yaml.safe_load(infile)

for projectilegear in projectilegearData:
    print(f"Processing Projectile Gear {projectilegear['name']}")
    fname = projectilegear["name"] + "_" + projectilegear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": projectilegear["name"],
        "type": "projectilegear",
        "img": projectilegear["img"],
        "_id": projectilegear["id"],
        "_key": "!items!" + projectilegear["id"],
        "system": {
            "notes": projectilegear["notes"],
            "textReference": projectilegear["textReference"],
            "description": projectilegear["description"],
            "macros": projectilegear["macros"],
            "nestedItems": [],
            "transfer": False,
            "subType": projectilegear["type"],
            "abbrev": projectilegear["abbrev"],
            "quantity": 1,
            "weightBase": projectilegear["weight"],
            "valueBase": projectilegear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": 0,
            "durabilityBase": projectilegear["durability"],
            "shortName": projectilegear["easyname"],
            "impactBase": {
                "numDice": 0,
                "die": 6,
                "modifier": projectilegear["impactMod"],
                "aspect": projectilegear["aspect"],
            },
        },
        "effects": [],
        "flags": projectilegear["flags"],
        "_stats": stats,
        "folder": "ADQPHjgKsdWsJhyy",
    }

    if projectilegear["AEID"]:
        effect = {
            "name": f"{projectilegear['easyname']} {projectilegear['type']} Traits",
            "icon": "icons/svg/aura.svg",
            "changes": [],
            "flags": {},
            "type": "sohlactiveeffect",
            "system": {
                "targetType": "this",
                "targetName": "",
            },
            "_id": projectilegear["AEID"],
            "disabled": False,
            "duration": {
                "startTime": None,
                "seconds": None,
                "combat": None,
                "rounds": None,
                "turns": None,
                "startRound": None,
                "startTurn": None,
            },
            "origin": "",
            "tint": None,
            "transfer": False,
            "description": "",
            "statuses": [],
            "_key": "!items.effects!"
            + projectilegear["id"]
            + "."
            + projectilegear["AEID"],
        }

        if projectilegear["ARvalue"] > 0:
            effect["changes"].append(
                {
                    "key": "mod:system.$impact.armorReduction",
                    "mode": 2,
                    "value": projectilegear["ARvalue"],
                    "priority": None,
                }
            )

        if projectilegear["bleed"]:
            effect["changes"].append(
                {
                    "key": "mod:system.$impact.armorReduction",
                    "mode": 5,
                    "value": str(projectilegear["bleed"]),
                    "priority": None,
                }
            )

        out["effects"].append(effect)

    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/weapongear.yaml", "r", encoding="utf8") as infile:
    weapongearData = yaml.safe_load(infile)

weapons = {}

for weapongear in weapongearData:
    weaponname = weapongear["name"]
    weaponid = weapongear["id"]
    print(f"Processing Weapon Gear {weaponname}")
    fname = weapongear["name"] + "_" + weapongear["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    merge(
        weapongear["flags"],
        {
            "sohl": {
                "island": {
                    "heftBase": weapongear["heft"],
                    "lengthBase": weapongear["length"],
                },
            },
        },
    )
    weapons[weaponid] = {
        "name": weaponname,
        "type": "weapongear",
        "img": weapongear["img"],
        "_id": weaponid,
        "_key": "!items!" + weaponid,
        "system": {
            "notes": weapongear["notes"],
            "textReference": weapongear["textReference"],
            "description": weapongear["description"],
            "macros": weapongear["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": weapongear["abbrev"],
            "quantity": 1,
            "weightBase": weapongear["weight"],
            "valueBase": weapongear["value"],
            "isCarried": True,
            "isEquipped": False,
            "qualityBase": 0,
            "durabilityBase": weapongear["durability"],
        },
        "effects": [],
        "flags": weapongear["flags"],
        "_stats": stats,
        "folder": "c0GXEU9oCZ1N3mSl",
    }
    weapons[weaponid]["flags"].get("island", {})


with open(f"{args.dataDir}/weapons-strike-modes.yaml", "r", encoding="utf8") as infile:
    weaponsmData = yaml.safe_load(infile)

for weaponsm in weaponsmData:
    smname = f"{weaponsm['name']} ({weaponsm['subDesc']})"
    print(f"Processing StrikeMode {smname}")
    weapon = weapons[weaponsm["weaponId"]]
    subdesc = weaponsm["subDesc"]

    traits = {
        "blockMod": weaponsm["blockMod"],
        "attackMod": weaponsm["meleeMod"],
        "noAttack": weaponsm["noAttack"],
        "noBlock": weaponsm["noBlock"],
        "oneHandPenalty": weaponsm["oneHandPenalty"],
        "minParts": weaponsm["minParts"],
        "long": weaponsm["long"],
    }

    sm = {
        "name": subdesc,
        "type": "meleestrikemode",
        "img": weapon["img"],
        "_id": weaponsm["smId"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": "",
            "macros": weaponsm["macros"],
            "nestedItems": [],
            "transfer": True,
            "mode": subdesc,
            "minParts": weaponsm["minParts"],
            "assocSkillName": weaponsm["assocSkill"],
            "impactBase": {
                "numDice": 0,
                "die": 6,
                "modifier": weaponsm["modifier"],
                "aspect": weaponsm["aspect"],
            },
        },
        "effects": [],
        "flags": weaponsm["flags"],
        "_stats": stats,
        "folder": None,
    }
    if subdesc == "Ranged" or subdesc == "Thrown":
        projtype = weaponsm["projtype"]
        if projtype == "arrow":
            sm["img"] = "systems/sohl/assets/icons/arrow.svg"
        elif projtype == "bolt":
            sm["img"] = "systems/sohl/assets/icons/arrow.svg"
        elif projtype == "bullet":
            sm["img"] = "systems/sohl/assets/icons/stones.svg"
        elif projtype == "dart":
            sm["img"] = "systems/sohl/assets/icons/arrow.svg"
        else:
            sm["img"] = "systems/sohl/assets/icons/throw.svg"
        sm["type"] = "missilestrikemode"
        sm["system"]["projectileType"] = projtype
        merge(
            sm["flags"],
            {
                "sohl": {
                    "island": {
                        "range": {
                            "short": weaponsm["shortRange"],
                            "medium": weaponsm["mediumRange"],
                            "long": weaponsm["longRange"],
                            "extreme": weaponsm["extremeRange"],
                        },
                    },
                },
            },
        )

    eid = weaponsm["AEID"]
    effect = {
        "name": f"{subdesc} Traits",
        "icon": "icons/svg/aura.svg",
        "changes": [],
        "flags": {},
        "type": "sohlactiveeffect",
        "system": {
            "targetType": "this",
            "targetName": "",
        },
        "_id": eid,
        "disabled": False,
        "duration": {
            "startTime": None,
            "seconds": None,
            "combat": None,
            "rounds": None,
            "turns": None,
            "startRound": None,
            "startTurn": None,
        },
        "origin": "",
        "tint": None,
        "transfer": False,
        "description": "",
        "statuses": [],
        "_key": "!items.effects!" + sm["_id"] + "." + eid,
    }

    if traits["blockMod"]:
        effect["changes"].append(
            {
                "key": "mod:system.$defense.block",
                "mode": 2,
                "value": traits["blockMod"],
                "priority": None,
            }
        )
    if traits["counterMod"]:
        effect["changes"].append(
            {
                "key": "mod:system.$defense.counterstrike",
                "mode": 2,
                "value": traits["counterMod"],
                "priority": None,
            }
        )
    if traits["meleeMod"]:
        effect["changes"].append(
            {
                "key": "mod:system.$attack.block",
                "mode": 2,
                "value": traits["meleeMod"],
                "priority": None,
            }
        )
    if traits["long"]:
        effect["changes"].append(
            {
                "key": "system.$traits.long",
                "mode": 5,
                "value": "true",
                "priority": None,
            }
        )
    if traits["durMod"]:
        effect["changes"].append(
            {
                "key": "mod:system.$durability",
                "mode": 2,
                "value": traits["durMod"],
                "priority": None,
            }
        )
    if traits["noAttack"]:
        effect["changes"].append(
            {
                "key": "system.$traits.noAttack",
                "mode": 5,
                "value": "true",
                "priority": None,
            }
        )
    if traits["noBlock"]:
        effect["changes"].append(
            {
                "key": "system.$traits.noBlock",
                "mode": 5,
                "value": "true",
                "priority": None,
            }
        )
    if traits["oneHandPenalty"]:
        effect["changes"].append(
            {
                "key": "system.$traits.oneHandPenalty",
                "mode": 5,
                "value": "true",
                "priority": None,
            }
        )
    if traits["long"]:
        effect["changes"].append(
            {
                "key": "system.$traits.long",
                "mode": 5,
                "value": "true",
                "priority": None,
            }
        )

    sm["effects"].append(effect)
    sm["sort"] = (len(weapon["system"]["nestedItems"]) + 1) * 100000
    weapon["system"]["nestedItems"].append(sm)

for weaponid in weapons.keys():
    if weaponid == None:
        continue
    fname = weapons[weaponid]["name"] + "_" + weaponid
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(weapons[weaponid], outfile, indent=2, ensure_ascii=False)
