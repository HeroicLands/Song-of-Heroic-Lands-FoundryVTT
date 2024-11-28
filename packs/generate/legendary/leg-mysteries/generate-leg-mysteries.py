#!./venv/bin/python3

import yaml
import json
import argparse
from unidecode import unidecode
import re

parser = argparse.ArgumentParser()
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

with open("./data/domains.yaml", "r", encoding="utf8") as infile:
    domainsData = yaml.safe_load(infile)

for domain in domainsData:
    print(f"Processing Domain {domain['name']}")
    fname = domain["name"] + "_" + domain["id"]
    fname = unidecode(fname)
    fname = re.sub(r"[^0-9a-zA-Z]+", "_", fname) + ".json"
    pname = args.outputDir + "/" + fname

    out = {
        "name": domain["name"],
        "type": "domain",
        "img": domain["img"],
        "_id": domain["id"],
        "_key": "!items!" + domain["id"],
        "system": {
            "notes": "",
            "textReference": "",
            "description": domain["description"],
            "macros": domain["macros"],
            "nestedItems": [],
            "transfer": False,
            "categories": domain["categories"],
            "abbrev": domain["abbrev"],
            "philosophy": domain["philosophy"],
        },
        "effects": domain["effects"],
        "flags": domain["flags"],
        "_stats": stats,
        "folder": domain["folderId"],
        "sort": 0,
        "ownership": {"default": 0, "TMJsvJWT6ytpHZ0M": 3},
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open("./data/mysticalabilities.yaml", "r", encoding="utf8") as infile:
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
        "sort": 0,
        "ownership": {"default": 0, "TMJsvJWT6ytpHZ0M": 3},
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open("./data/mysteries.yaml", "r", encoding="utf8") as infile:
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
        "sort": 0,
        "ownership": {"default": 0, "TMJsvJWT6ytpHZ0M": 3},
    }
    with open(pname, "w", encoding="utf8") as outfile:
        json.dump(out, outfile, indent=2, ensure_ascii=False)

with open("./data/folders.yaml", "r", encoding="utf8") as infile:
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
