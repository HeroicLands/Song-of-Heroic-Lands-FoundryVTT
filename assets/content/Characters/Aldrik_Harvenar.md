---
aliases:
  - Áldrik Hárvenar
  - Aldrik Harvenar
tags:
  - todo-warrior
name:
  full: Áldrik Hárvenar
  title: ""
  given: Áldrik
  clan: Hárvenar
  home: ""
  aliases: []
id: 9xrT7pAeah4Li8qD
folder: Nu7AgLZEmR26u2pk
shortcode: aldrikharvenar
img: icons/game-icons/delapouite/person.svg
portrait: images/being/aldrikharvenar-portrait.webp
type: being
social:
  occupation: Man-at-Arms
  station: soldiery
  class: freeman
  society: Provenzal
traits:
  gender: male
  age: 34
  birthday: 686/4/2
  height:
    m: 1.8
  weight:
    kg: 67
  build:
    frame: medium
  appearance:
    eye_color: dark_brown
    hair_color: blonde
    skin_color: fair
    complexion: weathered
    extra_features:
      - missing tooth
gear:
  weapons:
    - BrdSwd:1
    - PlBreast:1
    - Bklr:1
  armor:
    - PlBreast:1
    - LtShirt:1
    - torch:2
  misc:
    - backpk:1
    - FeRations:7
    - wtrskin:1
    - Bandg:3
sohl:
  kbcat: npc
  archetype: null
  attributes:
    agl: 14
    aur: 9
    cml: 11
    cre: 12
    dex: 12
    elo: 10
    emp: 8
    end: 13
    mor: 12
    per: 14
    rea: 13
    str: 15
    voi: 10
    wil: 13
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
      base: 148
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
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 42
    - shortcode: cmd
      type: skill
      system:
        masteryLevelBase: 27
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 28
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 44
    - shortcode: melee
      type: skill
      system:
        masteryLevelBase: 59
    - shortcode: ridg
      type: skill
      system:
        masteryLevelBase: 15
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 46
    - shortcode: swim
      type: skill
      system:
        masteryLevelBase: 30
    - shortcode: spirit
      type: skill
      initSkillMult: 3
    - shortcode: swim
      type: skill
      initSkillMult: 1
    - shortcode: thtcs
      type: skill
      initSkillMult: 1
    - shortcode: thro
      type: skill
      initSkillMult: 2
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
---

# Appearance {#appearance}

Áldrik stands 5'11" with a medium, solidly built frame — neither imposing nor forgettable, the kind of man who blends into a garrison line without effort. His blonde hair is cut short and practical, already thinning at the temples despite his thirty-four years. His dark brown eyes are calm and observant beneath a broad forehead, and his fair skin has taken on the weathered quality of a man who has spent sixteen years standing watch in all seasons. His jaw is square, his expression perpetually neutral, and his front left tooth is missing — knocked out years ago in a barracks scuffle he resolved without complaint. He wears his Chastèlclair garrison kit with quiet precision: padded surcoat, leather bracers, broadsword at his hip, everything clean and functional and entirely unremarkable.

# Dossier {#dossier}

Áldrik Hárvenar is the kind of soldier who could be described in three words and be understood completely: reliable, quiet, competent. He was born into a Provenzal craftsman's family in the Chastèlclair's lower quarters—his father was a mason, his mother a dyer. Neither wanted him to be a soldier. But at eighteen, after his father broke his hand in an accident and could no longer work, Áldrik enlisted in the garrison to provide stable income to his family. His parents never quite forgave him for saving them through abandonment.

For sixteen years, Áldrik has served the city garrison without distinction or difficulty. He arrived as a gangly teenager, was trained by competent officers, and quietly became exactly what the garrison needed: a dependable squad-level soldier who did not require complicated motivation. He was promoted to squad sergeant at twenty-eight not through ambition but because he was senior and the garrison needed filling bodies. He wears his promotion like an uncomfortable tunic—necessary, itchy, but functional.

The Chastèlclair garrison is no warzone. The city is wealthy, culturally vibrant, and remarkably peaceful compared to the empire's fractious borders. Áldrik's duty cycle consists primarily of gate watch, tax-collector escort, and the occasional street patrol during merchant festivals. He has drawn his sword in anger exactly twice in sixteen years—once to stop a merchant-family brawl, once to execute a judicial sentence on a condemned criminal.

Missing his front tooth does not impair his function, though it marks him as a common soldier to the refined Provenzal nobility.

## Psyche

### Personality

Áldrik speaks when spoken to and thinks before speaking. He is humorless without being grim, and methodical without being obsessive. He treats all ranks equally—neither fawning before officers nor contemptuous toward junior soldiers. This consistency has made him unexpectedly popular; soldiers know what to expect from him. He has a dry appreciation for absurdity and will occasionally make an understated observation that surprises people who assumed him incapable of wit.

### Motivation

Áldrik's primary motivation is exactly what it has always been: providing income for his aging parents. His secondary motivation is the desire to complete his service honorably and retire without causing problems for anyone. He has no ambitions for advancement and would decline promotion if offered. He simply wants to reach thirty years of service, collect his pension, and return to his family's house to manage their affairs until death claims them.

### Strengths

His competence is thorough rather than exceptional. He is accurate with his sword—not brilliant, but rarely misses. He is physically strong and can hold a defensive line. His greatest strength is reliability; he is the soldier an officer assigns to a critical-but-boring task because nothing will go wrong.

## Social

Áldrik occupies the lowest rung of military society—common-born, no connections to nobility, no aspirations. Chastèlclair's refined culture regards him with gentle indifference, as one might regard a functional piece of furniture.

## Companions

### Patrons

**Garrison Commander Lysard Felaine** — The professional officer commanding the Chastèlclair garrison. Lysard has learned not to promote Áldrik, who quietly but unmistakably hates administrative duty. Instead, Lysard relies on him for sensitive task execution and has ensured that Áldrik's service record is unblemished. It is the closest thing to friendship Áldrik has with his superiors: mutual recognition of utility.

### Enemies

**Merchant-Master Corvino di Valmont** — A powerful merchant prince who has repeatedly attempted to buy preferential treatment from the garrison for his trade operations. Áldrik was assigned to investigate claims that di Valmont's wagons contained smuggled goods. Áldrik found evidence of black-market weapons. Di Valmont used his wealth to suppress the investigation, but Áldrik's report was filed regardless. Di Valmont has sworn publicly that he will eventually ruin Áldrik professionally.

## Plot Hooks

1. **The Corruption Audit** — A senior military inspector arrives from the capital to audit the Chastèlclair garrison's accounts. The inspector is methodical and thorough, and he quickly discovers that Commander Lysard has been misreporting troop strength and misallocating sohl. The crimes are minor—the sort of bureaucratic dishonesty common in militaries—but politically damaging. Lysard approaches Áldrik privately, asking him to subtly alter historical records to make the numbers match. Áldrik has never bent a rule in his life. Lysard is the only officer who has ever protected him. Refusal means Lysard faces disgrace and removal; compliance means Áldrik becomes complicit in fraud.

2. **The Merchant Prince's Ambition** — Corvino di Valmont approaches Áldrik with an unexpected offer: he will withdraw all animosity and even pay Áldrik a substantial sum if Áldrik will provide him with information about garrison movements and security procedures. The offer is explicit—Valmont admits it is corruption. Áldrik refuses. Two weeks later, Áldrik discovers that his aging father has become ill—expensively ill. The finest physicians cost money that Áldrik does not have. Valmont contacts him again, reiterating his offer and adding: "Consider your father's comfort." Áldrik's hand shakes when he refuses a second time.

3. **The Conscription Order** — The Chastèlclair garrison receives orders for a major deployment. Soldiers over thirty years of service are being reassigned to the capital for training duty; soldiers under thirty are being sent to a distant border conflict. Áldrik has precisely one year until his full pension vests. The redeployment will separate him from that by making him unavailable for his target retirement date. He confronts Commander Lysard and discovers that Lysard tried and failed to prevent the reassignment. The only way to stay is to resign dishonorably before the orders take effect, which forfeits his pension entirely. Resign with pension denied, or serve where he is told and miss his family's needs.

4. **The Broken Soldier** — A young soldier named **Tander Korsfeld** is assigned to Áldrik's squad. Tander is traumatized—his previous posting involved active combat, and he has developed a severe stutter and occasional paralysis during loud noises. The garrison's physicians say he is unfit for service but his discharge paperwork is incomplete due to bureaucratic delays. Meanwhile, other soldiers mock him relentlessly. Áldrik, unexpectedly, begins quietly protecting him and teaching him to function despite his trauma. This draws attention from officers who question whether Áldrik is "going soft," and from younger soldiers who resent the favoritism. Áldrik must choose between his single deep friendship and his reputation for stern professionalism.
