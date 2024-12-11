#!./venv/bin/python3

import yaml
import json
import argparse
from unidecode import unidecode
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

with open(f"{args.dataDir}/philosophies.yaml", "r", encoding="utf8") as infile:
    philosophiesData = yaml.safe_load(infile)

for phil in philosophiesData:
    print(f"Processing Philosophy {phil['name']}")
    fname = phil["name"] + "_" + phil["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": phil["name"],
        "type": "philosophy",
        "img": phil["img"],
        "_id": phil["id"],
        "_key": "!items!" + phil["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": phil["description"],
            "macros": phil["macros"],
            "nestedItems": [],
            "transfer": False,
            "category": phil["category"],
        },
        "effects": phil["effects"],
        "flags": phil["flags"],
        "_stats": stats,
        "folder": phil["folderId"],
    }
    for ni in phil["nestedItems"]:
        nestedItem = {
            "name": ni["name"],
            "type": "domain",
            "img": ni["img"],
            "_id": ni["id"],
            "system": {
                "notes": "",
                "textReference": "",
                "description": ni["description"],
                "macros": ni["macros"],
                "nestedItems": [],
                "transfer": True,
                "abbrev": ni["abbrev"],
            },
            "effects": ni["effects"],
            "flags": ni["flags"],
        }
        out["system"]["nestedItems"].append(nestedItem)
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/mysticalabilities.yaml", "r", encoding="utf8") as infile:
    mysticalabilitiesData = yaml.safe_load(infile)

for mysticalability in mysticalabilitiesData:
    print(f"Processing Mystical Ability {mysticalability['name']}")
    fname = mysticalability["name"] + "_" + mysticalability["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": mysticalability["name"],
        "type": "mysticalability",
        "img": mysticalability["img"],
        "_id": mysticalability["id"],
        "_key": "!items!" + mysticalability["id"],
        "system": {
            "subType": mysticalability["subType"],
            "notes": "",
            "textReference": "",
            "description": mysticalability["description"],
            "macros": mysticalability["macros"],
            "nestedItems": [],
            "transfer": False,
            "abbrev": mysticalability["abbrev"],
            "skillBaseFormula": mysticalability["skillBaseFormula"],
            "masteryLevelBase": 0,
            "improveFlag": False,
            "domain": mysticalability["domain"],
            "levelBase": mysticalability["level"],
            "charges": {
                "usesCharges": mysticalability["usesCharges"],
                "value": mysticalability["chargesValue"],
                "max": mysticalability["chargesMax"],
            },
        },
        "effects": mysticalability["effects"],
        "flags": mysticalability["flags"],
        "_stats": stats,
        "folder": mysticalability["folderId"],
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open(f"{args.dataDir}/mysteries.yaml", "r", encoding="utf8") as infile:
    mysteriesData = yaml.safe_load(infile)

for mystery in mysteriesData:
    print(f"Processing Mystery {mystery['name']}")
    fname = mystery["name"] + "_" + mystery["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": mystery["name"],
        "type": "mystery",
        "img": mystery["img"],
        "_id": mystery["id"],
        "_key": "!items!" + mystery["id"],
        "system": {
            "subType": mystery["subType"],
            "notes": "",
            "textReference": "",
            "description": mystery["description"],
            "macros": mystery["macros"],
            "nestedItems": [],
            "transfer": False,
            "domain": mystery["domain"],
            "skills": mystery["skills"],
            "levelBase": mystery["level"],
            "charges": {
                "usesCharges": mystery["usesCharges"],
                "value": mystery["chargesValue"],
                "max": mystery["chargesMax"],
            },
        },
        "effects": mystery["effects"],
        "flags": mystery["flags"],
        "_stats": stats,
        "folder": mystery["folderId"],
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
