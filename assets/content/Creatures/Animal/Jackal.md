---
aliases:
    - Jackal
tags:
    - animal
    - image-needed
name:
    full: Jackal
    aliases: []
id: QwBtVq9RDqpwnf7s
slug: jackal
img: icons/game-icons/lorc/hound.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 14
        agl: 15
        per: 16
        aur: 7
        wil: 11
        rea: 10
        cre: 9
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+12
        aur: 1d4+4
        wil: 1d4+8
        rea: 1d4+7
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: fqtrzone
                  roles: &a1
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: fqtrzone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
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
                  probWeight: 2
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
            base: 25
            calc: "25"
        reachBase: 0
        bodyScaleBase: 0.73
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Darting Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Darting Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

A shape slips between the dunes at the edge of firelight — low-slung, tawny, moving with the practiced silence of something that has learned to survive by never being noticed until it chooses to be. The ears come first: tall, black-tipped, swiveling independently like a pair of sentries. Then the narrow face, sharp-muzzled and intelligent, with amber eyes that catch the light and throw it back as twin coins of gold. The body is lean to the point of emaciation, every rib visible beneath a coat of dusty gold and brown, but the leanness is deceptive — this is not starvation but economy, a creature stripped to nothing but sinew, speed, and hunger. It pauses, one paw lifted, nose working the air with rapid precision. Behind it, more shapes materialize from the darkness: three, five, seven — a loose constellation of identical silhouettes, each watching with the same patient, calculating stillness. They do not growl. They do not need to. They have been here longer than you, and they will be here long after you leave.

# Dossier {#dossier}

The Jackal is the ubiquitous canid of the Kheperi lowlands — a small, adaptable predator-scavenger found along the Tameresh River, in the desert margins, around village middens, and among the necropolis complexes where it feeds on offerings left for the dead. An adult jackal stands roughly sixteen to twenty inches at the shoulder and weighs fifteen to thirty-five pounds — far smaller than a wolf, but compensating with intelligence, speed, and a social flexibility that allows it to hunt alone, in mated pairs, or in loose packs of up to a dozen individuals. Jackals are sacred to Ánubís, lord of the dead, and their presence near tombs and burial sites is considered both natural and spiritually significant. Killing a jackal near a necropolis is a serious religious offense in Kheperi culture, though farmers and herders who lose livestock to jackal predation feel rather differently about the matter. Adventurers encounter jackals constantly in Kheperi lands — trotting along roadsides at dusk, skulking around campsites, scavenging battlefields, and haunting the margins of every settlement. They are rarely dangerous individually, but a pack of hungry jackals is a genuine threat to the wounded, the sleeping, and the unwary.

## Presentation

A slender, long-legged canid built for endurance rather than power. The coat is short and coarse, typically a blend of tawny gold, russet brown, and pale cream, with darker saddle markings across the back and black tips on the ears and tail. The face is narrow and fox-like, with a pointed muzzle, large amber or golden eyes, and oversized ears that give the animal an alert, perpetually watchful expression. The legs are proportionally long for the body, built for sustained trotting over open ground rather than the explosive sprinting of a hunting dog. The tail is bushy and held low when relaxed, raised when alert or dominant. The overall impression is of a creature designed for survival in marginal environments — lightweight, quick, adaptable, and always watching. At night, jackal eyes reflect firelight with an eerie golden-green glow, and their distinctive wailing cry — a rising, ululating howl answered by others across the darkness — is one of the signature sounds of the Kheperi night.

## Key Behaviors

Jackals are crepuscular and nocturnal, most active at dawn, dusk, and through the night. During the day they rest in shallow dens, rock crevices, or dense scrub. They are omnivorous scavengers first and hunters second, feeding on carrion, insects, fruit, small mammals, birds, reptiles, and refuse from human settlements. A mated pair will hunt cooperatively, one driving small prey toward the other, and larger packs can bring down young gazelles or sickly livestock through harassment and exhaustion. Jackals are intensely territorial, marking boundaries with urine and scat and defending home ranges against rival pairs with aggressive vocal displays and, when necessary, physical combat. They are among the most vocal of canids — their evening chorus of howls, yips, and wailing cries serves to establish territory, coordinate pack movements, and warn of predators. Jackals mate for life, and both parents participate in raising pups, with older offspring from previous litters sometimes remaining to help raise younger siblings. Near human settlements, jackals become increasingly bold over time, learning to raid middens, steal food from camps, and exploit the distraction of human activity to scavenge more effectively.

## Combat Strategy

A jackal avoids direct combat with anything larger than itself whenever possible. Against larger threats, a lone jackal will bark, feint, and retreat, attempting to draw the threat away from pups or food rather than engaging directly. However, a pack of jackals facing a vulnerable target — a wounded animal, a sleeping human, an isolated young child — will coordinate with surprising effectiveness. The pack circles, darting in to nip at legs and flanks from multiple directions, retreating when the target turns, and pressing again from behind. This harassment continues until the target collapses from exhaustion or blood loss. Against humans, jackals almost never attack the healthy and alert, but they are bold scavengers of the battlefield and will approach the wounded with increasing confidence as weakness becomes apparent.

## Attack Methods

### Darting Bite

The jackal lunges forward with a quick, snapping bite aimed at exposed extremities — ankles, calves, hands, and faces of prone targets. The bite itself is relatively weak compared to larger canids, but the teeth are sharp and the jaw quick, inflicting ragged wounds that bleed freely and are prone to infection.

### Pack Harassment

Multiple jackals coordinate attacks from different angles, darting in to bite and retreating before the target can retaliate. The psychological effect of being surrounded by multiple fast-moving attackers is often more debilitating than any individual bite, and the cumulative blood loss from dozens of small wounds can be genuinely life-threatening.

## Special Abilities

### Desert Adaptation

The jackal is superbly adapted to arid environments. It can survive on minimal water, deriving much of its moisture from food. It tolerates heat that would prostrate larger animals and can sustain a ground-covering trot for hours across open terrain. In desert and scrubland environments, the jackal's endurance exceeds that of much larger predators.

### Keen Senses

The jackal's hearing is exceptional — those oversized ears detect the movement of insects beneath sand and the footsteps of approaching creatures at considerable distance. Its sense of smell, while not as developed as a wolf's, is still remarkably acute, allowing it to locate carrion from miles away on the wind. At night, the jackal's vision is excellent, adapted for low-light hunting.

### Cunning and Adaptability

Jackals are among the most intelligent of the smaller canids, capable of learning from observation, remembering productive scavenging sites across seasons, and adapting behavior to exploit human activity. A jackal that has successfully stolen food from a campsite will develop increasingly sophisticated methods of distraction and theft. They learn the patterns of human settlements — when refuse is dumped, when guards change, when livestock is unattended — and exploit these patterns with patient precision.

### Necropolis Haunter

In Kheperi culture, jackals are associated with the dead and the boundary between the living and spirit worlds. Whether this association reflects genuine supernatural sensitivity or merely the jackal's preference for carrion near burial sites is debated by priests and scholars alike. What is certain is that jackals are always present near necropolises, that they seem drawn to sites of recent death, and that their howling chorus near a settlement is considered an omen — sometimes of death approaching, sometimes of Ánubís extending protection.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 5-8 (1d4+4)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 8-11 (1d4+7)

- **Creativity:** 7-10 (1d4+6)
