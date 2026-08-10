---
aliases:
    - Caracal
tags:
    - animal
    - image-needed
name:
    full: Caracal
    aliases: []
id: IDVdbQRzboB9CFFT
slug: caracal
img: icons/game-icons/delapouite/lynx-head.svg
portrait: ""
shortcode: caracal
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 10
        dex: 17
        agl: 18
        per: 16
        aur: 9
        wil: 11
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d4+6
        end: 1d4+7
        dex: 1d6+13
        agl: 1d6+14
        per: 1d6+12
        aur: 1d4+6
        wil: 1d4+8
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 1
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 2
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 35
            calc: "35"
        reachBase: 0
        bodyScaleBase: 0.88
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 25
        - name: Slashing Rake
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Slashing Rake
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -1
                      aspect: edged
                  lengthBase: 1
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
        - name: Neck Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Neck Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: piercing
                  lengthBase: 0
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
---

# Appearance {#appearance}

A russet shape launches from the scrub with the explosive force of a released spring — straight up, five feet, six feet into the air, both forepaws striking simultaneously at something above it. A bird. There is a brief, violent intersection of fur and feathers at the apex of the leap, and then the cat drops back to earth with its prize clenched between its forepaws, landing with a grace that makes the kill look choreographed. It is smaller than you expected — the size of a large dog, lean and angular, with a coat the color of burned sand. The ears are what hold your attention: tall, narrow, tipped with long tufts of black hair that give the animal a sharp, almost heraldic silhouette. The eyes are gold, bright and fierce, and they find you across the scrub with a directness that suggests the cat has known you were there for some time and has been choosing to ignore you. It holds your gaze for a moment, then turns away with its kill, vanishing into the thorn scrub with a single fluid movement that leaves no trace of its passage.

# Dossier {#dossier}

The Caracal is the desert hunting cat of the Khazryn steppe — a medium-sized, powerfully built felid found in rocky scrubland, thorn thickets, desert margins, and the dry grasslands that border the great sand seas. An adult caracal stands sixteen to twenty inches at the shoulder and weighs twenty-five to forty-five pounds, substantially smaller than a mountain lion but far larger than a house cat, occupying a predatory niche between the two as a specialist hunter of birds, hares, and small antelope. The caracal's defining characteristic is its extraordinary leaping ability — it is capable of springing vertically from a standing position to snatch birds from the air at heights that defy its modest size, a feat that has made it legendary among the Khazryn nomads. In Khazryn culture, the caracal occupies a unique position as a hunting companion of the nobility. While never truly domesticated in the way dogs have been, young caracals captured from the wild can be trained as hunting cats, used to bring down game birds, hares, and even young gazelles in the open steppe. A trained caracal is a prized possession of Khazryn chieftains and wealthy merchants — a status symbol comparable to a fine falcon, and considerably rarer. Adventurers encounter caracals in rocky terrain at dawn and dusk, occasionally around settlements where they hunt rats and pigeons, and in the camps of wealthy Khazryn where trained hunting caracals are kept.

## Presentation

A lean, muscular cat with a distinctive angular appearance. The coat is short and dense, uniformly reddish-brown to tawny across the back and flanks, shading to white on the chin, throat, and belly. The face is narrow and sharply defined, with a pale area around the eyes and mouth and dark markings running from the inner corners of the eyes down alongside the nose. The most distinctive features are the ears — tall, pointed, and tipped with dramatic tufts of long black hair that extend an inch or more beyond the ear tip, giving the animal an unmistakable silhouette. The ears are highly mobile, swiveling independently to track sound, and the tufts may serve to enhance the cat's already acute hearing by channeling sound into the ear canal. The legs are proportionally long for a cat of this size, with the hind legs noticeably longer than the forelegs — an adaptation for the explosive vertical leaping that defines the species. The paws are relatively large, with retractable claws kept razor-sharp. The tail is short, roughly a third of the body length. The eyes are gold to amber, round-pupiled, and carry the intense, focused expression of a dedicated hunter. The overall impression is of a creature designed for precision violence — compact, fast, and built around the single explosive movement that is its signature.

## Key Behaviors

Caracals are solitary, territorial, and primarily crepuscular or nocturnal. An adult maintains a territory of five to fifteen square miles, marked with urine, scat, and claw marks on prominent rocks and trees. They are secretive and rarely seen — even in areas where caracals are common, their presence is more often inferred from kills and tracks than from direct observation. They hunt primarily by stalking and ambush, using their tawny coloring to blend into scrubland and approaching prey to within a few body lengths before launching an explosive attack. Their signature hunting method — the vertical bird-catch — involves detecting birds flushing from cover, then launching vertically with the hind legs and striking with both forepaws simultaneously, batting the bird out of the air. A caracal can take multiple birds from a flock in rapid succession, leaping and striking with a speed that seems to bend the rules of physics. They also hunt hares, rodents, young gazelle fawns, and small antelope, using conventional stalking and pouncing techniques. Caracals are surprisingly vocal for a solitary cat, producing hissing, growling, and a distinctive barking call that serves as territorial communication. In captivity or semi-domestication, caracals form strong bonds with individual handlers but remain unpredictable — a trained caracal is a cooperative partner, not a submissive pet, and it hunts when it chooses, not when commanded.

## Combat Strategy

A caracal fights only when cornered or defending kittens — against larger threats, it vastly prefers to flee. When forced to fight, the caracal relies on speed, agility, and the ferocity that all cats bring to close combat when survival is at stake. It will hiss, flatten its ears, and deliver rapid swipes with its front claws, targeting the face and eyes of the attacker. If seized, a caracal fights with all four sets of claws and its teeth simultaneously, raking, biting, and twisting with a frenetic energy that makes it extremely difficult to hold. Against prey-sized opponents — dogs, jackals, other cats — a caracal is a genuinely dangerous combatant, faster and more agile than most animals its size and willing to escalate to lethal force immediately. It aims for the throat or the back of the neck, and its bite — while lacking the crushing power of larger cats — is precise and driven by proportionally strong jaw muscles.

## Attack Methods

### Bird Strike

The caracal's signature attack, used for hunting rather than defense. From a crouched position, the cat launches vertically — reaching heights of six feet or more from a standing start — and strikes with both forepaws simultaneously at a bird in flight. The claws are extended and the strike is delivered with enough force to stun or kill the bird on impact. The entire sequence — launch, strike, descent — takes less than a second.

### Slashing Rake

In defensive combat, the caracal delivers rapid, alternating swipes with its front claws, targeting the face, eyes, and throat of the attacker. The claws are sharp enough to cut through skin and light clothing, and the speed of delivery — three or four strikes in the time a human can throw one punch — makes defense difficult. The cat aims for the eyes with particular focus, an instinctive targeting of the most vulnerable point.

### Neck Bite

Against prey or in lethal combat, the caracal seizes the back of the neck or throat with its jaws and bites down, using its sharp canines to puncture and its jaw strength to crush. The bite is not as powerful as a leopard's but is delivered with precision, targeting the junction between skull and spine where even moderate force can be fatal to smaller animals.

## Special Abilities

### Explosive Vertical Leap

The caracal possesses the most powerful vertical leap of any cat relative to its body size. From a standing or crouched position, it can spring straight upward to heights exceeding six feet — three times its own shoulder height — with enough precision to strike a bird in flight. This ability is powered by proportionally massive hindquarter muscles and an elastic tendon system that stores and releases energy like a coiled spring. The leap is not merely high but fast — the acceleration from crouch to apex is virtually instantaneous, giving prey no time to react.

### Desert Stealth

The caracal's tawny coat provides excellent camouflage in the scrubland and rocky terrain it inhabits, and its movement through vegetation is as silent as any cat's. It can approach within striking distance of alert prey — birds, hares, even wary gazelle fawns — without being detected. In the Khazryn scrublands, a caracal can be within arms' reach and remain invisible against the sun-bleached rock and dried grass.

### Acute Hearing

The caracal's distinctive ear tufts are more than ornamental — the tall, mobile ears provide exceptional hearing that allows the cat to locate prey by sound alone. A caracal can detect the rustling of a rodent in dry grass at considerable distance and can pinpoint a bird's wingbeats with enough accuracy to launch a blind strike into tall vegetation. This auditory acuity, combined with excellent night vision, makes the caracal a supremely effective crepuscular and nocturnal hunter.

### Trainable Hunter

Unlike most wild cats, caracals can be trained as hunting companions when captured young and raised by experienced handlers. A trained caracal will flush and catch game birds, hares, and even young gazelles on command — or rather, on suggestion, for a caracal cooperates rather than obeys. This trainability, combined with the cat's extraordinary hunting ability, has made it a prized asset among Khazryn nobility, and a well-trained hunting caracal commands prices comparable to the finest falcons.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 8-11 (1d4+7)

- **Dexterity:** 14-19 (1d6+13)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
