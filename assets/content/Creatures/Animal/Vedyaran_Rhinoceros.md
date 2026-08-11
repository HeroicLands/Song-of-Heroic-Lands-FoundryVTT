---
aliases:
    - Vedyaran Rhinoceros
tags:
    - animal
    - image-needed
name:
    full: Vedyaran Rhinoceros
    aliases: []
id: gg3f6OB21jF3mg0f
img: icons/game-icons/delapouite/rhinoceros-horn.svg
portrait: ""
shortcode: vdyrnrhn
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 18
        dex: 9
        agl: 8
        per: 12
        aur: 9
        wil: 14
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+15
        end: 1d6+14
        dex: 1d4+6
        agl: 1d4+5
        per: 1d6+8
        aur: 1d4+6
        wil: 1d6+10
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 8
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 16
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 12
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
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
        weight:
            base: 4000
            calc: "4000"
        reachBase: 0
        bodyScaleBase: 1.43
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Horn Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 53
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: piercing
                  lengthBase: 4
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
        - name: Battering Charge
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 46
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Battering Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: blunt
                  lengthBase: 4
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
        - name: Trample
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 46
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Trample
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: blunt
                  lengthBase: 5
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

The riverbank explodes. That is your first impression — the mud itself erupting outward in a wave of brown water and debris, and from the eruption something rises that redefines your understanding of what a living animal can be. It is armored. Not metaphorically, not approximately — armored, in riveted plates of gray-brown hide that fold and overlap across the shoulders, flanks, and haunches like the work of a god who had studied castle walls and decided to improve upon them. The plates are separated by deep creases that give the hide a segmented, almost mechanical appearance, and each plate is studded with raised bumps that look disturbingly like the rivets on a suit of plate mail. The animal is enormous — five to six feet at the shoulder, two tons or more of bone, muscle, and that impossible hide — and it moves out of the river mud with a speed that such a mass should not possess. The horn is a single blunt spike of dark keratin, maybe a foot long, less dramatic than you expected but somehow more threatening for its functionality — this is not an ornament but a tool, worn smooth from use. The small eyes find you and the ears swivel forward, and the animal produces a sound that is half snort and half roar, a blast of expelled air that carries enough force to feel against your skin at thirty paces. It is not afraid of you. It has no reason to be afraid of anything.

# Dossier {#dossier}

The Vedyaran Rhinoceros is the armored giant of the Vedyaran floodplains — a massive, semi-aquatic megaherbivore found along the great rivers, in the tall grasslands of the floodplain margins, and in the marshes and wallows that characterize the lowland landscape. An adult male stands five to six feet at the shoulder and weighs four thousand to five thousand pounds, making it the second-largest land animal in [[Vedyara_Region]] after the elephant. Its defining feature is its hide — thick, folded, and plated in a pattern that so closely resembles manufactured armor that early western travelers refused to believe it was natural. The hide's plates overlap at joints and flex at the deep creases between them, providing both protection and mobility in a combination that no armorer has ever successfully replicated.

The Vedyaran rhinoceros is solitary, territorial, and aggressive — more willing to charge and engage than most herbivores, and powerful enough to back that aggression with lethal force. It inhabits the river margins and floodplains where the tall elephant grass grows in dense stands twelve to fifteen feet high, and within this habitat it is both extremely difficult to detect and extremely dangerous to encounter at close range. A rhino that has been startled or that perceives an intrusion into its territory will charge first and assess the situation later, and its charge — two tons of armored animal accelerating to a gallop — is one of the most destructive impacts in the natural world.

In Vedyaran culture, the rhinoceros is associated with martial power and implacable defense. Warrior caste families use the rhinoceros as a heraldic symbol, and rhinoceros-hide shields — lighter than metal, nearly impervious to sword cuts, and resistant to arrow penetration — are prized military sohl. The horn, though less spectacular than an elephant's tusk, has medicinal and ceremonial significance, and the trade in rhinoceros horn drives a poaching economy that has reduced wild populations in settled areas. In the wilder regions of Vedyara, rhinoceros remain common enough to be a routine hazard along rivers and floodplains — one that experienced travelers respect by giving wallowing grounds and known territories a very wide berth.

Adventurers encounter Vedyaran rhinoceros along riverbanks, in tall grassland where visibility is measured in feet, at wallowing pools and mud baths, and occasionally on roads and paths that cross through rhinoceros territory. The most dangerous encounters are the accidental ones — stumbling into a rhino in tall grass at close range, where the animal's instinct to charge is triggered before either party can assess the situation.

## Presentation

A massive, barrel-bodied animal carried on thick, columnar legs that end in broad, three-toed feet. The body is dominated by the hide — thick, gray-brown skin that forms distinct, raised plates across the shoulders, back, and haunches, separated by deep folds and creases at the joints and flexion points. Each plate is covered in a pattern of raised, rounded tubercles — knob-like protrusions that give the hide its characteristic riveted appearance and provide additional structural reinforcement. The texture of the hide varies: the plates themselves are hard and rough, almost like stone, while the skin within the creases is thinner, more flexible, and pinkish-gray. The overall effect is of a creature wearing a suit of naturally grown plate armor, and the resemblance is close enough that it has inspired both artists and armorers across Vedyaran history.

The head is large and heavy, with a broad, flat forehead, small eyes set far back on the skull, and mobile, tubular ears that swivel independently. The upper lip is prehensile — pointed and flexible, used to grasp and tear vegetation with a precision that seems incongruous on such a massive animal. The horn is a single structure rising from the nose — typically eight to sixteen inches long, blunt, conical, and composed of compressed keratin fibers rather than bone. It is less visually impressive than the twin horns of some rhinoceros species but is a fully functional weapon, worn smooth and sometimes chipped from regular use in territorial combat and vegetation clearing.

The animal carries itself with a weight and solidity that makes the ground feel less stable. When it moves at a walk, the gait is ponderous but surprisingly quiet for something so massive. When it charges, the transition from immobility to full gallop is shockingly fast — the columnar legs driving the armored body forward with an acceleration that defies its apparent bulk.

## Key Behaviors

Vedyaran rhinoceros are solitary by nature, with adult males maintaining territories centered on wallowing pools, river access points, and prime grazing areas. Territories are marked with large communal dung heaps — shared defecation sites that serve as olfactory bulletin boards, allowing rhinos to identify neighbors, detect strangers, and assess the reproductive status of potential mates. Despite their solitary nature, rhinoceros are not truly antisocial — they tolerate neighbors at shared wallowing sites and dung heaps, and territorial confrontations between established neighbors are usually resolved through ritualized displays rather than combat. Strangers, however, are met with immediate aggression.

Rhinoceros are semi-aquatic by habit, spending hours each day submerged in rivers, wallows, and mud baths. The wallowing serves multiple functions: thermoregulation (the thick hide retains heat), parasite control (mud coating protects against biting insects), and skin maintenance (the hide cracks and bleeds if it dries completely). A rhinoceros denied access to water and mud will become progressively more distressed and aggressive.

They graze primarily on the tall elephant grasses of the floodplain, using the prehensile upper lip to grasp and tear grass stems, as well as browsing on aquatic vegetation, reeds, and the leaves of riverside shrubs. They are most active in the cooler hours of morning and evening, retreating to wallows and shade during midday heat.

The Vedyaran rhinoceros's legendary aggressiveness is not indiscriminate — it is territorial. A rhinoceros that perceives an intrusion into its personal space, its wallowing ground, or its territory will charge with minimal warning. The charge is triggered by proximity rather than by threat assessment: rhinos have relatively poor distance vision and rely on hearing and scent, which means they sometimes charge first and identify the target later. This hair-trigger response, combined with the dense habitat they inhabit (where encounters tend to occur at very close range), makes them statistically one of the most dangerous large animals in Vedyara.

## Combat Strategy

The Vedyaran rhinoceros has one combat strategy: charge. When it perceives a threat — which, given its poor eyesight, often means anything unfamiliar that gets too close — it lowers its head, orients on the target by sound and scent, and accelerates to a gallop directly at the threat. The charge covers ground with disturbing speed for an animal of this size, closing distances of fifty to a hundred yards in seconds. At impact, two tons of armored animal strikes the target with concentrated force, the horn driving into whatever it hits while the massive head and shoulders deliver a collision that can overturn carts, collapse walls, and crush anything human-sized.

If the initial charge misses — which is not uncommon given the rhino's poor eyesight — the animal wheels and charges again, and will repeat this cycle until the threat is gone, the target is destroyed, or the rhino's limited attention span is captured by something else. Against threats that climb trees or take elevated positions, the rhino may attempt to topple the tree or batter the structure, which, given its strength, is not an idle threat.

A rhinoceros defending its calf is the most dangerous scenario. Females with calves charge anything that approaches, with less preliminary warning than territorial males, and their aggression does not diminish with failed charges — they will continue attacking until the threat has been driven completely out of their perception range.

## Attack Methods

### Horn Gore

The rhinoceros drives its single horn into the target with the full momentum of the charge behind it. The horn is blunt rather than sharp, but at the force levels generated by a charging rhino, the distinction is academic — the horn punches through armor, timber, and flesh with equal facility. The upward scooping motion of the head at impact can launch human-sized targets into the air, and the injuries from a direct horn strike are typically crushing and penetrating simultaneously.

### Battering Charge

Even if the horn misses, the impact of the rhinoceros's massive skull, shoulders, and body is devastating. A human struck by a charging rhino is knocked flat, often thrown several yards, and the force of the collision is sufficient to break every rib on the impact side and rupture internal organs. Horses, carts, and light structures fare little better — the rhino simply goes through them.

### Trampling

A target knocked down by the charge is trampled by the broad, three-toed feet, each carrying over a thousand pounds of concentrated force. The rhino may also kneel on a downed target, pressing its full weight through the armored chest and forelegs onto the victim. This behavior is observed in territorial combat between males and is applied with equal enthusiasm to any target the rhino has successfully floored.

## Special Abilities

### Living Armor

The Vedyaran rhinoceros's hide is the most effective natural armor of any land animal. The plated skin is one to two inches thick over the shoulders and flanks, reinforced by the raised tubercles, and layered over a subcutaneous fat deposit that provides additional cushioning. Arrows and light spears bounce off or fail to penetrate. Sword cuts open the surface without reaching the underlying muscle. Even heavy weapons must be precisely placed — targeting the thinner skin of the creases and folds — to inflict meaningful wounds. The hide is not impervious, but it elevates the rhinoceros's effective defense to a level that makes casual attacks pointless.

### Floodplain Dominance

In the tall grass and river margins where it lives, the rhinoceros is the unquestioned dominant animal. It parts elephant grass like a ship's prow, crosses rivers with confident ease, and moves through marshland where its broad feet and massive weight actually provide stability rather than causing it to sink. Elephants are larger, but they share the floodplain peacefully with rhinos; nothing else challenges them.

### Poor Vision, Sharp Ears

The rhinoceros's small eyes provide mediocre distance vision — it cannot clearly identify a stationary human at more than fifty yards. However, its hearing is acute and its sense of smell is excellent. It detects threats primarily through sound and scent, which means that wind direction and noise discipline are the primary factors in avoiding a rhinoceros encounter. A rhinoceros that has winded you or heard you is already oriented; a rhinoceros that has not may walk past at ten paces without noticing you. This sensory profile makes the Vedyaran rhinoceros both easier to avoid and more dangerous to encounter than its physical capabilities alone would suggest — if you are careful, you can slip past; if you are careless, the charge will come before you can react.

### Territorial Memory

Despite their poor vision and apparent simplicity, rhinoceros have excellent spatial memory. An individual knows every wallow, every trail, every landmark in its territory, and it patrols these with routine regularity. This predictability makes rhinoceros both avoidable (experienced travelers learn the locations of territory centers and wallows) and dangerous (a path that was safe yesterday may cross a rhino's patrol route today). Rhinoceros also remember individual encounters — a rhino that has been harassed by humans will respond to human scent with preemptive aggression, and this aggression may persist for years.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
