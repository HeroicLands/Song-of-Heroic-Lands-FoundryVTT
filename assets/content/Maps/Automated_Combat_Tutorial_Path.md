---
shortcode: automatedcombatpath
name: {full: Automated Combat Tutorial Path}
type: map
subType: battlemap
tags: [tutorial]
data:
  pack: scenes
  scene:
    "name": "Automated Combat Tutorial Path"
    "width": 1200
    "height": 800
    "padding": 0
    "backgroundColor": "#48533a"
    "grid": {"type": 1, "size": 100, "distance": 5, "units": "ft", "color": "#000000", "alpha": 0.2}
    "initialLevel": "defaultLevel0000"
    "levels":
      - "_id": "defaultLevel0000"
        "name": "Path"
        "background":
          "src": "tutorial-path-background.svg"
          "scaleX": 1
          "scaleY": 1
          "offsetX": 0
          "offsetY": 0
    "tokens":
      - "_id": "84750152f1b21793"
        "name": "Human"
        "x": 500
        "y": 350
        "width": 1
        "height": 1
        "elevation": 0
        "rotation": 0
        "alpha": 1
        "hidden": false
        "locked": false
        "actorId": "8b7938ed6041ff53"
        "actorLink": true
        "disposition": 1
        "texture": {"src": "tutorial-human-token.svg", "scaleX": 1, "scaleY": 1}
        "flags": {}
      - "_id": "8ad77d802b503743"
        "name": "Grukar-uk"
        "x": 600
        "y": 350
        "width": 1
        "height": 1
        "elevation": 0
        "rotation": 0
        "alpha": 1
        "hidden": false
        "locked": false
        "actorId": "044a1477f6b27b52"
        "actorLink": true
        "disposition": -1
        "texture": {"src": "tutorial-grukar-token.svg", "scaleX": 1, "scaleY": 1}
        "flags": {}
    "walls": []
    "lights": []
    "sounds": []
    "tiles": []
    "notes": []
    "drawings": []
    "templates": []
    "regions": []
    "folder": null
    "ownership": {}
    "flags": {}
  fixup:
    - path: ".levels[defaultLevel0000].background.src"
      type: address
      value: sohl-none-image-tutorialpath
    - {path: ".tokens[0].texture.src", type: address, value: sohl-none-image-tutorialhuman}
    - {path: ".tokens[1].texture.src", type: address, value: sohl-none-image-tutorialgrukar}
---

A wooded path crosses a small clearing. The two neighboring tokens begin within melee reach, and the scene has no active encounter.
