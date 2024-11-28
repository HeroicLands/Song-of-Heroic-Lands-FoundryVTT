#!./venv/bin/python3

import openpyxl
import json;
import random;
import string;
from unidecode import unidecode;
import re;

anatomy = {
    "name": "Humanoid",
    "type": "anatomy",
    "img": "icons/svg/item-bag.svg",
    "system": {
        "macros": json.loads(row[MACROS].value),
        "notes": "",
        "description": row[DESC].value,
        "textReference": "",
        "transfer": False,
        "defaultAim": "",
        "weaponLimbs": [ "Left Arm", "Right Arm", "Left Arm, Right Arm" ],
        "macros": []
        "nestedItems": [],
    },
    "effects": [],
    "flags": {},
    "_stats": {
        "systemId": "sohl",
        "systemVersion": "0.7.2",
        "coreVersion": "11.313",
        "createdTime": 1684119710177,
        "modifiedTime": 1684119710177,
        "lastModifiedBy": "nM52Hn9VSW6oonaL"
    },
    "_id": "M10pzGVlLgO1zsnh",
    "folder": None,
    "sort": 0,
    "ownership": {
        "default": 0,
         "nM52Hn9VSW6oonaL": 3
    },
    "_key": "!items!M10pzGVlLgO1zsnh"
}

templBodyLocation = {
  "name": "",
  "type": "bodylocation",
  "img": "icons/svg/item-bag.svg",
  "system": {
      "notes": "",
      "description": "",
      "source": "",
      "layers": "",
      "quality": 0,
      "blunt": {
        "base": 0
      },
      "edged": {
        "base": 0
      },
      "piercing": {
        "base": 0
      },
      "fire": {
        "base": 0
      },
      "isFumble": False,
      "isStumble": False,
      "isRigid": False,
      "bleedingSevThreshold": 0,
      "amputatePenalty": -1,
      "shockValue": 0,
      "impactType": "custom",
      "location": {
        "bodyPart": "",
        "probWeight": {
            "base": 0
        }
      }
  },
  "effects": [],
  "flags": {},
  "_stats": {
    "systemId": "sohl",
    "systemVersion": "0.7.2",
    "coreVersion": "11.313",
    "createdTime": 1684119710177,
    "modifiedTime": 1684119710177,
    "lastModifiedBy": "nM52Hn9VSW6oonaL"
  },
  "_id": "",
  "folder": None,
  "sort": 0,
  "ownership": {
    "default": 0,
    "nM52Hn9VSW6oonaL": 3
  },
  "_key": "!items!8XMvH9YELdut0Q5o"
}

templBodyPart = {
  "name": "",
  "type": "bodypart",
  "img": "icons/svg/item-bag.svg",
  "system": {
      "notes": "",
      "description": "",
      "source": "",
      "abbrev": "",
      "zone": "",
      "expand": False,
      "probWeight": {
          "base": 0
      }
  },
  "effects": [],
  "flags": {},
  "_stats": {
    "systemId": "sohl",
    "systemVersion": "0.7.2",
    "coreVersion": "11.313",
    "createdTime": 1684119710177,
    "modifiedTime": 1684119710177,
    "lastModifiedBy": "nM52Hn9VSW6oonaL"
  },
  "_id": "",
  "folder": None,
  "sort": 0,
  "ownership": {
    "default": 0,
    "nM52Hn9VSW6oonaL": 3
  },
  "_key": "!items!8XMvH9YELdut0Q5o"
}

templZoneLocation = {
  "name": "",
  "type": "bodyzone",
  "img": "icons/svg/item-bag.svg",
  "system": {
      "notes": "",
      "description": "",
      "source": "",
      "probWeight": {
        "base": 0
      },
      "affectedSkills": [],
      "affectedAttributes": [],
      "affectsMobility": False
  },
  "effects": [],
  "flags": {},
  "_stats": {
    "systemId": "sohl",
    "systemVersion": "0.7.2",
    "coreVersion": "11.313",
    "createdTime": 1684119710177,
    "modifiedTime": 1684119710177,
    "lastModifiedBy": "nM52Hn9VSW6oonaL"
  },
  "_id": "",
  "folder": None,
  "sort": 0,
  "ownership": {
    "default": 0,
    "nM52Hn9VSW6oonaL": 3
  },
  "_key": "!items!8XMvH9YELdut0Q5o"
}

injuryLocations = {
    "Custom": { "impactType": "custom", "location": {"probWeight": 50}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 5, "bleedingSevThreshold": 0, "affectsMobility": False },
    "Skull": { "impactType": "skull", "location": {"probWeight": 50}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 5, "bleedingSevThreshold": 5, "affectsMobility": True },
    "Face": { "impactType": "face", "location": {"probWeight": 30}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 4, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Eye": { "impactType": "face", "location": {"probWeight": 30}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 5, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Nose": { "impactType": "face", "location": {"probWeight": 30}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 5, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Neck": { "impactType": "neck", "location": {"probWeight": 20}, "isStumble": False, "isFumble": False, "amputatePenalty": -10, "shockValue": 5, "bleedingSevThreshold": 3, "affectsMobility": True },
    "Shoulder": { "impactType": "shoulder", "location": {"probWeight": 15}, "isStumble": False, "isFumble": True, "amputatePenalty": 0, "shockValue": 3, "bleedingSevThreshold": 4, "affectsMobility": False },
    "Upper Arm": { "impactType": "upperarm", "location": {"probWeight": 15}, "isStumble": False, "isFumble": True, "amputatePenalty": -20, "shockValue": 1, "bleedingSevThreshold": 5, "affectsMobility": False },
    "Elbow": { "impactType": "elbow", "location": {"probWeight": 5}, "isStumble": False, "isFumble": True, "amputatePenalty": -20, "shockValue": 2, "bleedingSevThreshold": 5, "affectsMobility": False },
    "Forearm": { "impactType": "forearm", "location": {"probWeight": 10}, "isStumble": False, "isFumble": True, "amputatePenalty": -20, "shockValue": 1, "bleedingSevThreshold": 5, "affectsMobility": False },
    "Hand": { "impactType": "hand", "location": {"probWeight": 5}, "isStumble": False, "isFumble": True, "amputatePenalty": -30, "shockValue": 2, "bleedingSevThreshold": 0, "affectsMobility": False },
    "Thorax": { "impactType": "thorax", "location": {"probWeight": 13}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 4, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Abdomen": { "impactType": "abdomen", "location": {"probWeight": 13}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 4, "bleedingSevThreshold": 3, "affectsMobility": True },
    "Pelvis": { "impactType": "pelvis", "location": {"probWeight": 7}, "isStumble": False, "isFumble": False, "amputatePenalty": 0, "shockValue": 4, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Thigh": { "impactType": "thigh", "location": {"probWeight": 20}, "isStumble": True, "isFumble": False, "amputatePenalty": -10, "shockValue": 3, "bleedingSevThreshold": 4, "affectsMobility": True },
    "Knee": { "impactType": "knee", "location": {"probWeight": 5}, "isStumble": True, "isFumble": False, "amputatePenalty": -20, "shockValue": 2, "bleedingSevThreshold": 5, "affectsMobility": True },
    "Calf": { "impactType": "calf", "location": {"probWeight": 15}, "isStumble": True, "isFumble": False, "amputatePenalty": -20, "shockValue": 1, "bleedingSevThreshold": 5, "affectsMobility": True },
    "Foot": { "impactType": "foot", "location": {"probWeight": 10}, "isStumble": True, "isFumble": False, "amputatePenalty": -20, "shockValue": 2, "bleedingSevThreshold": 0, "affectsMobility": True },
}

zoneList = [
        {"id": "XQJBDj4Zd2ILR5rH", "name": 'Head', "zoneNumbers": [1], "affectsMobility": True,
        "affectedSkills": ['Acrobatics','Climbing','Legerdemain','Melee','Archery','Riding','Stealth','Swimming'],
        "affectedAttributes": ['Agility','Dexterity','Strength']},
        {"id": "DzyCHcZwLLZekBgq", "name": 'Arms', "zoneNumbers": [2,3], "affectsMobility": False,
        "affectedSkills": ['Acrobatics','Climbing','Legerdemain','Melee','Archery','Riding','Swimming'],
        "affectedAttributes": ['Dexterity','Strength']},
        {"id": "qPncC1ZBr2H8lPSy", "name": 'Torso', "zoneNumbers": [4,5,6,7], "affectsMobility": True,
        "affectedSkills": ['Acrobatics','Climbing','Melee','Archery','Riding','Stealth','Swimming'],
        "affectedAttributes": ['Agility','Dexterity','Strength']},
        {"id": "KFrOQEbBNicAxikZ", "name": 'Legs',  "zoneNumbers": [8,9,10], "affectsMobility": True,
        "affectedSkills": ['Acrobatics','Climbing','Melee','Archery','Riding','Stealth','Swimming'],
        "affectedAttributes": ['Agility','Strength']}
        ]

bodyPartList = [
        {"id": "WljCPWk6oAmUZ73d", "name": 'Head', "zone": 'Head', "probWeight": 100, "abbrev": "Head"},
        {"id": "Tsrx9WQ2L9HyAVvi", "name": 'Right Arm', "zone": 'Arms', "probWeight": 50, "abbrev": "RArm"},
        {"id": "rnqBua6Rduc0u0P6", "name": 'Left Arm', "zone": 'Arms', "probWeight": 50, "abbrev": "LArm"},
        {"id": "ltL67w6gOzXDgHYD", "name": 'Torso', "zone": 'Torso', "probWeight": 100, "abbrev": "Torso"},
        {"id": "30kOIuDmY81IosL4", "name": 'Right Leg', "zone": 'Legs', "probWeight": 50, "abbrev": "RLeg"},
        {"id": "KocnXsjJtL3doBVr", "name": 'Left Leg', "zone": 'Legs', "probWeight": 50, "abbrev": "LLeg"}
        ]

bodyLocationList = [
        [ 'Skull',"0XmtjaBJDxMk0Ucd", 'Skull', 'Head', 500],
        [ 'Left Eye',"6kX9YIUIVja3Y0MP", 'Eye', 'Head', 15],
        [ 'Right Eye',"QEfArWukfNxKta0f", 'Eye', 'Head', 15],
        [ 'Nose',"QRVralNrMEk93Kwj", 'Nose', 'Head', 30],
        [ 'Left Cheek',"8J1XWjV1tsFyugVH", 'Face', 'Head', 60],
        [ 'Right Cheek',"ofe4FzVdGkKkZQV2", 'Face', 'Head', 60],
        [ 'Left Ear',"UwvPtm6rbB5noi7l", 'Face', 'Head', 15],
        [ 'Right Ear',"htpEEuxEAhz7AAsP", 'Face', 'Head', 15],
        [ 'Mouth',"U30OhbPBl2QhBQoF", 'Face', 'Head', 30],
        [ 'Jaw',"ogK3sN7cu2ajAT5K", 'Face', 'Head', 60],
        [ 'Neck',"vZA6OW3EaN0ggS6U", 'Neck', 'Head', 200],
        [ 'Left Shoulder',"nuInmwcEVKaPbhiH", 'Shoulder', 'Left Arm', 30],
        [ 'Left Upper Arm',"NGjZLBbjFzHdvv0l", 'Upper Arm', 'Left Arm', 30],
        [ 'Left Elbow',"ubWdclQbNEQ70pEe", 'Elbow', 'Left Arm', 10],
        [ 'Left Forearm',"6mLZet21nySm9VVd", 'Forearm', 'Left Arm', 20],
        [ 'Left Hand',"SrpubIBD6K42tsO1", 'Hand', 'Left Arm', 10],
        [ 'Right Shoulder',"V7F5ilVtTWnzoyu6", 'Shoulder', 'Right Arm', 30],
        [ 'Right Upper Arm',"YfN7RARAAi0UrPld", 'Upper Arm', 'Right Arm', 30],
        [ 'Right Elbow',"1kH02rurCS8ft63Q", 'Elbow', 'Right Arm', 10],
        [ 'Right Forearm',"pNB4IdNQHFPOnvwD", 'Forearm', 'Right Arm', 20],
        [ 'Right Hand',"Rfi2iUDdK2qQz2pv", 'Hand', 'Right Arm', 10],
        [ 'Thorax',"Sfp6lj3H6N20woHc", 'Thorax', 'Torso', 40],
        [ 'Abdomen',"GYWlGzJ1oE2QlVc0", 'Abdomen', 'Torso', 40],
        [ 'Pelvis',"yMsU1PHsaPfGlygr", 'Pelvis', 'Torso', 20],
        [ 'Left Thigh',"pOsgjfKKFAr8I8aE", 'Thigh', 'Left Leg', 40],
        [ 'Left Knee',"gi2S9Dt4w46x2wOL", 'Knee', 'Left Leg', 10],
        [ 'Left Calf',"IX6Bbg9YSahDwI45", 'Calf', 'Left Leg', 30],
        [ 'Left Foot',"REmu5X3CBlbfLqvh", 'Foot', 'Left Leg', 20],
        [ 'Right Thigh',"AJwjP1rJBbmpamNe", 'Thigh', 'Right Leg', 40],
        [ 'Right Knee',"WUnUX9Vw3f9aJXuR", 'Knee', 'Right Leg', 10],
        [ 'Right Calf',"Zb9lV9AXinrSftXd", 'Calf', 'Right Leg', 30],
        [ 'Right Foot',"aGOXGJxHUfwnfB5M", 'Foot', 'Right Leg', 20]
        ]


for row in zoneList:
    fname = row['name']+'_'+row['id']
    fname = unidecode(fname)
    fname = re.sub(r'[^0-9a-zA-Z]+','_',fname) + '.json'
    templZoneLocation['_id'] = row['id']
    templZoneLocation['_key'] = "!items!" + row['id']
    templZoneLocation['name'] = row['name']
    templZoneLocation['system']['zoneNumbers'] = row['zoneNumbers']
    templZoneLocation['system']['affectsMobility'] = row['affectsMobility']
    templZoneLocation['system']['affectedSkills'] = row['affectedSkills']
    templZoneLocation['system']['affectedAttributes'] = row['affectedAttributes']
    with open(fname, 'w', encoding='utf8') as outfile:
        json.dump(templZoneLocation, outfile, indent=2, ensure_ascii=False)

for row in bodyPartList:
    fname = row['name']+'_'+row['id']
    fname = unidecode(fname)
    fname = re.sub(r'[^0-9a-zA-Z]+','_',fname) + '.json'
    templBodyPart['_id'] = row['id']
    templBodyPart['_key'] = "!items!" + row['id']
    templBodyPart['name'] = row['name']
    templBodyPart['system']['abbrev'] = row['abbrev']
    templBodyPart['system']['zone'] = row['zone']
    templBodyPart['system']['probWeight']['base'] = row['probWeight']
    with open(fname, 'w', encoding='utf8') as outfile:
        json.dump(templBodyPart, outfile, indent=2, ensure_ascii=False)


for row in bodyLocationList:
    name = row[0]
    id = row[1]
    bodypart = row[3]
    probweight = row[4]
    il = injuryLocations[row[2]]

    fname = name+'_'+id
    fname = unidecode(fname)
    fname = re.sub(r'[^0-9a-zA-Z]+','_',fname) + '.json'
    templBodyLocation['_id'] = id
    templBodyLocation['_key'] = "!items!" + id
    templBodyLocation['name'] = name
    templBodyLocation['system']['isStumble'] = il['isStumble']
    templBodyLocation['system']['isFumble'] = il['isFumble']
    templBodyLocation['system']['amputatePenalty'] = il['amputatePenalty']
    templBodyLocation['system']['shockValue'] = il['shockValue']
    templBodyLocation['system']['impactType'] = il['impactType']
    templBodyLocation['system']['bleedingThreshold'] = il['bleedingSevThreshold']
    templBodyLocation['system']['location']['bodyPart'] = bodypart
    templBodyLocation['system']['location']['probWeight']['base'] = probweight
    with open(fname, 'w', encoding='utf8') as outfile:
        json.dump(templBodyLocation, outfile, indent=2, ensure_ascii=False)
