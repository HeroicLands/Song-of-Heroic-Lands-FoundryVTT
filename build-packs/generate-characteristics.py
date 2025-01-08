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

with open(f"{args.dataDir}/traits.yaml", "r", encoding="utf8") as infile:
    traitsData = yaml.safe_load(infile)

for trait in traitsData:
    print(f"Processing trait {trait['name']}")
    fname = trait["name"] + "_" + trait["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": trait["name"],
        "type": "trait",
        "img": trait["img"],
        "_id": trait["id"],
        "system": {
            "subType": trait["subType"],
            "notes": "",
            "textReference": "",
            "description": trait["description"],
            "macros": trait["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": trait["abbrev"],
            "skillBaseFormula": trait["skillBaseFormula"],
            "masteryLevelBase": 0,
            "improveFlag": False,
            "textValue": trait["textValue"],
            "isNumeric": bool(trait["isNumeric"]),
            "intensity": trait["intensity"],
            "max": trait["max"],
            "valueDesc": trait["valueDesc"],
            "choices": trait["choices"],
        },
        "effects": [],
        "flags": trait["flags"],
        "_stats": stats,
        "ownership": {"default": 3},
        "folder": trait["folderId"],
        "_key": "!items!" + trait["id"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/skills.yaml", "r", encoding="utf8") as infile:
    skillsData = yaml.safe_load(infile)

for skill in skillsData:
    print(f"Processing skill {skill['name']}")
    fname = skill["name"] + "_" + skill["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    merge(
        skill["flags"],
        {
            "sohl": {
                "legendary": {
                    "initSkillMult": skill["initSM"],
                    "expertiseParentSkill": skill.get("expertiseParentSkill", ""),
                },
            },
        },
    )
    out = {
        "name": skill["name"],
        "type": "skill",
        "img": skill["img"],
        "_id": skill["id"],
        "system": {
            "subType": skill["subType"],
            "notes": "",
            "textReference": "",
            "description": skill["description"],
            "macros": skill["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": skill["abbrev"],
            "skillBaseFormula": skill["skillBaseFormula"],
            "masteryLevelBase": 0,
            "improveFlag": False,
            "weaponGroup": skill["weaponGroup"],
            "domain": skill["domain"],
            "baseSkill": skill["baseSkill"],
        },
        "effects": skill["effects"],
        "flags": skill["flags"],
        "_stats": stats,
        "ownership": {"default": 3},
        "folder": skill["folderId"],
        "_key": "!items!" + skill["id"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/combatmaneuvers.yaml", "r", encoding="utf8") as infile:
    combatmaneuversData = yaml.safe_load(infile)

with open(f"{args.dataDir}/combattechsm.yaml", "r", encoding="utf8") as infile:
    combattechniquesmData = yaml.safe_load(infile)

combatmaneuvers = {}

for cmbtman in combatmaneuversData:
    print(f"Processing Combat Maneuver {cmbtman['name']}")
    id = cmbtman["id"]
    fname = cmbtman["name"] + "_" + id
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname
    combatmaneuvers[id] = {
        "name": cmbtman["name"],
        "type": "combatmaneuver",
        "img": cmbtman["img"],
        "_id": cmbtman["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": cmbtman["description"],
            "macros": cmbtman["macros"],
            "nestedItems": [],
            "transfer": True,
            "abbrev": cmbtman["abbrev"],
        },
        "effects": cmbtman["effects"],
        "flags": cmbtman["flags"],
        "_stats": stats,
        "ownership": {"default": 3},
        "folder": cmbtman["folderId"],
        "_key": "!items!" + cmbtman["id"],
    }

for cmbttech in combattechniquesmData:
    smname = f"{cmbttech['name']} ({cmbttech['subDesc']})"
    print(f"Processing StrikeMode {smname}")
    maneuver = combatmaneuvers[cmbttech["combatManeuverId"]]
    subdesc = cmbttech["subDesc"]

    merge(
        cmbttech["flags"],
        {
            "sohl": {
                "legendary": {
                    "zoneDie": cmbttech["zoneDie"],
                },
            },
        },
    )

    sm = {
        "name": cmbttech["subDesc"],
        "type": "combattechniquestrikemode",
        "img": cmbttech["img"],
        "_id": cmbttech["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": "",
            "macros": cmbttech["macros"],
            "nestedItems": [],
            "transfer": True,
            "mode": subdesc,
            "minParts": cmbttech["minParts"],
            "assocSkillName": cmbttech["assocSkill"],
            "lengthBase": cmbttech["lengthBase"],
            "impactBase": {
                "numDice": 1 if cmbttech["impactDie"] > 0 else 0,
                "die": cmbttech["impactDie"],
                "modifier": cmbttech["impactMod"],
                "aspect": cmbttech["impactAspect"],
            },
        },
        "effects": [],
        "flags": cmbttech["flags"],
        "_stats": stats,
        "ownership": {"default": 3},
        "folder": None,
    }

    eid = cmbttech["effectId"]
    effect = {
        "name": f"{cmbttech['subDesc']} Traits",
        "icon": "icons/svg/aura.svg",
        "changes": [],
        "flags": {},
        "_id": eid,
        "disabled": False,
        "type": "sohlactiveeffect",
        "system": {
            "targetType": "this",
            "targetName": "",
        },
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

    for chg in cmbttech["effectChanges"]:
        change = {
            "key": chg["key"],
            "mode": int(chg["mode"]),
            "value": str(chg["value"]),
            "priority": None,
        }
        effect["changes"].append(change)
    sm["effects"].append(effect)
    combatmaneuvers[cmbttech["combatManeuverId"]]["system"]["nestedItems"].append(sm)

for cmid in combatmaneuvers.keys():
    if cmid == None:
        continue
    fname = combatmaneuvers[cmid]["name"] + "_" + cmid
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(combatmaneuvers[cmid], outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/afflictions.yaml", "r", encoding="utf8") as infile:
    afflictionsData = yaml.safe_load(infile)

for affliction in afflictionsData:
    print(f"Processing Affliction {affliction['name']}")
    fname = affliction["name"] + "_" + affliction["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": affliction["name"],
        "type": "affliction",
        "img": affliction["img"],
        "_id": affliction["id"],
        "_key": "!items!" + affliction["id"],
        "system": {
            "subType": affliction["subType"],
            "notes": "",
            "textReference": "",
            "description": affliction["description"],
            "macros": affliction["macros"],
            "nestedItems": [],
            "transfer": False,
            "isDormant": False,
            "isTreated": False,
            "diagnosisBonusBase": affliction["diagnosisBonus"],
            "levelBase": affliction["level"],
            "healingRateBase": affliction["healingRate"],
            "contagionIndexBase": affliction["contagionIndex"],
            "transmission": affliction["transmission"],
        },
        "effects": affliction["effects"],
        "flags": affliction["flags"],
        "_stats": stats,
        "ownership": {"default": 3},
        "folder": affliction["folderId"],
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
