---
aliases:
  - Brunjár Skathhelm
  - Brunjar Skathhelm
  - being-brunjarskathhel
tags:
  - blackpine-wolves
  - brigand
  - vrystwald
name:
  full: Brunjár Skathhelm
  title: ""
  given: Brunjár
  clan: Skathhelm
  aliases: []
id: elrlXp3vtP02E0Tr
folder: Nu7AgLZEmR26u2pk
shortcode: brunjarskathhel
img: icons/game-icons/delapouite/person.svg
portrait: images/being/brunjarskathhel-portrait.webp
type: being
social:
  occupation: Brigand
  station: underworld
  class: unfree
  society: Varokh
  organizations:
    - blackpine-wolves
traits:
  gender: male
  age: 22
  birthday: 697/10/3
  height:
    m: 1.75
  weight:
    kg: 68
  build:
    frame: medium
  appearance:
    eye_color: hazel
    hair_color: brown
    skin_color: fair
    complexion: freckled
    extra_features:
      - boyish face that makes him look younger than his years
      - fidgets constantly
sohl:
  kbcat: npc
  archetype: null
  attributes:
    str: 10
    end: 10
    dex: 12
    agl: 11
    per: 13
    cml: 12
    aur: 8
    wil: 6
    rea: 10
    cre: 9
    emp: 11
    elo: 10
    mor: 8
    voi: 11
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Arms
          shortcode: armszone
          probWeight: 4
        - name: Torso
          shortcode: torsozone
          probWeight: 4
        - name: Legs
          shortcode: legszone
          probWeight: 6
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
          canHoldItem: false
          probWeight: 1
        - name: Right Arm
          shortcode: rarmpart
          bodyZoneCode: armszone
          roles:
            - manipulator
          canHoldItem: true
          probWeight: 2
        - name: Left Arm
          shortcode: larmpart
          bodyZoneCode: armszone
          roles:
            - manipulator
          canHoldItem: true
          probWeight: 2
        - name: Torso
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 4
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: legszone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 3
        - name: Left Leg
          shortcode: llegpart
          bodyZoneCode: legszone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 3
      locations:
        - name: Skull
          shortcode: skullloc
          bodyPartCode: headpart
          bleedingSusceptibility: low
          amputability: none
          shockValue: 5
          probWeight: 500
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Eye
          shortcode: leyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Eye
          shortcode: reyeloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Nose
          shortcode: noseloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Cheek
          shortcode: lcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Cheek
          shortcode: rcheekloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Ear
          shortcode: learloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Ear
          shortcode: rearloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 15
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Mouth
          shortcode: mouthloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Jaw
          shortcode: jawloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 60
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 200
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Shoulder
          shortcode: rshldloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Upper Arm
          shortcode: rupaloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Elbow
          shortcode: relbloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Forearm
          shortcode: rfraloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Hand
          shortcode: rhandloc
          bodyPartCode: rarmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Shoulder
          shortcode: lshldloc
          bodyPartCode: larmpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Upper Arm
          shortcode: lupaloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Elbow
          shortcode: lelbloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Forearm
          shortcode: lfraloc
          bodyPartCode: larmpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Hand
          shortcode: lhandloc
          bodyPartCode: larmpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Thorax
          shortcode: thrxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Abdomen
          shortcode: abdmnloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Pelvis
          shortcode: plvisloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Thigh
          shortcode: rthghloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: medium
          amputability: low
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Knee
          shortcode: rkneeloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Calf
          shortcode: rcalfloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Right Foot
          shortcode: rfootloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: none
          amputability: medium
          shockValue: 2
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Thigh
          shortcode: lthghloc
          bodyPartCode: llegpart
          bleedingSusceptibility: medium
          amputability: low
          shockValue: 3
          probWeight: 40
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Knee
          shortcode: lkneeloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Calf
          shortcode: lcalfloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 30
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
        - name: Left Foot
          shortcode: lfootloc
          bodyPartCode: llegpart
          bleedingSusceptibility: none
          amputability: medium
          shockValue: 2
          probWeight: 20
          protectionBase:
            blunt: 0
            edged: 0
            piercing: 0
            fire: 0
    weight:
      base: 150
      calc: (9 * str) + 50
    reachBase: 0
    bodyScaleBase: 1
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 50
      leaguesPerWatch: 5
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: melee
      type: skill
      system:
        masteryLevelBase: 42
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 38
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 30
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 35
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 45
    - shortcode: thro
      type: skill
      system:
        masteryLevelBase: 40
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 50
    - shortcode: srvl
      type: skill
      system:
        masteryLevelBase: 35
    - shortcode: clmb
      type: skill
      system:
        masteryLevelBase: 42
    - shortcode: swim
      type: skill
      system:
        masteryLevelBase: 18
    - shortcode: trak
      type: skill
      system:
        masteryLevelBase: 30
    - shortcode: slng
      type: skill
      system:
        masteryLevelBase: 55
    - shortcode: anmcft
      type: skill
      system:
        masteryLevelBase: 35
    - shortcode: cook
      type: skill
      system:
        masteryLevelBase: 30
    - shortcode: common
      type: skill
      system:
        masteryLevelBase: 45
    - shortcode: guil
      type: skill
      system:
        masteryLevelBase: 25
    - shortcode: chrm
      type: skill
      system:
        masteryLevelBase: 28
    - shortcode: archery
      type: skill
      system:
        masteryLevelBase: 20
    - shortcode: Clb
      type: weapongear
    - shortcode: Dgr
      type: weapongear
    - shortcode: Slng
      type: weapongear
    - shortcode: HsTunic
      type: armorgear
    - shortcode: LtShoe
      type: armorgear
    - shortcode: bgsmcvs
      type: containergear
    - shortcode: SSton
      type: projectilegear
      system:
        quantity: 2
    - shortcode: pence
      type: miscgear
      system:
        quantity: 2
    - shortcode: spirit
      type: skill
      initSkillMult: 3
    - shortcode: bflkbite
      type: skill
      initSkillMult: 2
    - shortcode: bflkgrab
      type: skill
      initSkillMult: 2
    - shortcode: bflkheadbutt
      type: skill
      initSkillMult: 2
    - shortcode: bflkkick
      type: skill
      initSkillMult: 2
    - shortcode: limbblock
      type: skill
      initSkillMult: 2
    - shortcode: press
      type: skill
      initSkillMult: 2
    - shortcode: bflkpunch
      type: skill
      initSkillMult: 2
    - shortcode: trip
      type: skill
      initSkillMult: 2
    - shortcode: sprt
      type: mysticalability
---

# Appearance {#appearance}

Brunjár Skathhelm looks like what he is: a boy who ended up in a bad place and is in over his head. He has a round, freckled face that makes him look sixteen rather than twenty-two, with hazel eyes that dart nervously and never quite meet anyone's gaze. His brown hair is shaggy and unkempt, and he has the soft, unfinished look of someone who has not yet grown fully into his frame. He wears a homespun tunic and leather shoes — the worst-equipped member of the gang — and carries a club, a dagger, and a sling with a pouch of stones. He fidgets constantly, picking at his nails, shifting his weight, tugging at his sleeves. He is the member of the Blackpine Wolves that victims remember as "the one who looked like he didn't want to be there."

# Dossier {#dossier}

Brunjár grew up in a small Varokh village not far from Dágulf's own birthplace, the son of a herdsman and a weaver. His was an unremarkable childhood — poor but not desperate, with parents who tried their best and an older sister who looked out for him. He was never strong or brave, but he was observant, good with animals, and a fair hand with a sling from years of chasing crows out of the barley fields.

His trouble began when his father was accused of stealing a neighbor's ram — a charge that was true, as it happened, though born of desperation during a hard winter. The village clanhead ordered a beating that left his father crippled, and the family's small holding was forfeit. Brunjár's mother died of fever the following spring, and his sister married into another village to survive. At seventeen, alone and landless, Brunjár drifted into poaching, then petty theft, and finally stumbled into Dágulf's orbit when the gang raided a caravan Brunjár happened to be robbing at the same time.

Dágulf kept him because he was useful — a good lookout, quiet on his feet, and too frightened to disobey. Brunjár has been with the Blackpine Wolves for two years now and hates every moment of it, but sees no way out. He has witnessed things that haunt him, and participated in acts he cannot undo.

# Skills and Abilities

Brunjár is the gang's primary lookout and scout. His perception is good, he moves quietly through the forest, and his sling work is the best in the group — he can drop a crow at forty paces. He has a knack with animals and can calm horses during an ambush, which is practically useful. He is a mediocre fighter at best, lacks confidence, and freezes under pressure.

## Psyche

### Personality

Brunjár is anxious, guilt-ridden, and desperately unhappy. He is not a bad person — he has genuine empathy, a functioning conscience, and the moral awareness to know that what the gang does is wrong. He simply lacks the will to leave and the courage to resist. He is eager to please and quick to obey, which makes him useful to Dágulf but contemptible to Skathilda. He talks too much when nervous, apologizes compulsively, and sleeps badly.

### Motivation

Brunjár wants out. He dreams of a quiet life — a small farm, a wife, honest work — but cannot see how to get there from where he is. He fears Dágulf's retribution if he tries to leave, and he fears the law if he turns himself in. He is paralyzed between guilt and cowardice, and each day he stays makes the next departure harder.

### Strengths

His perception and stealth make him a genuinely useful scout. His empathy, though it torments him, means he occasionally shows kindness to captives when no one is watching. His sling skill is underestimated by those who don't take the weapon seriously.

## Social

## Companions

The Blackpine Wolves, reluctantly. Thráwald ignores him. Skathilda openly despises him. Dágulf uses him. He finds the company of the gang's dogs and horses more tolerable than the company of its men.

### Patrons

None.

### Enemies

No personal enemies beyond those the gang has made collectively. His sister, Hildára, married into a village two days' walk south and does not know what her brother has become.

## Plot Hooks

1. **The Reluctant Informant** — Brunjár is captured during a botched ambush and, terrified, offers to lead the party to the Blackpine Wolves' camp in exchange for mercy. He is telling the truth and will cooperate fully, but his information may be incomplete — and if Dágulf learns of the betrayal before the party can act, Brunjár's life is forfeit.

2. **A Sister's Letter** — The party encounters a Varokh woman who is searching for her younger brother. She carries a scrap of cloth he'd recognize and asks strangers on the road if they've seen a young man with freckles and a sling. If the party has already dealt with the Blackpine Wolves, they must decide what to tell her about her brother's fate.

3. **The Captive's Friend** — After a robbery, one of the gang's captives reports that a freckle-faced young bandit secretly loosened their bonds and whispered where to find help. The party can use this information to identify a potential ally within the gang — if they can reach Brunjár before Dágulf discovers his treachery.
