---
aliases:
  - Onager
  - creature-onager
tags:
  - animal
  - image-needed
name:
  full: Onager
  aliases: []
description: "A wild ass of the Khazryn steppe, a medium equine of legendary speed, endurance, and ferocity ranging across gravel plains and salt flats."
id: GS7W7FIX26LUrAl2
img: icons/game-icons/skoll/donkey.svg
portrait: images/being/onager-portrait.webp
shortcode: onager
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 12
    end: 15
    dex: 13
    agl: 15
    per: 14
    aur: 8
    wil: 16
    rea: 8
    cre: 7
  attrRollFormula:
    str: 1d6+8
    end: 1d6+11
    dex: 1d6+9
    agl: 1d6+11
    per: 1d6+10
    aur: 1d4+5
    wil: 1d6+12
    rea: 1d4+5
    cre: 1d4+4
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 4
        - name: Forelegs
          shortcode: forelegszone
          probWeight: 2
        - name: Torso
          shortcode: torsozone
          probWeight: 8
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 6
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
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Foreleg
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Foreleg
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Flank
          shortcode: flkloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Quarter
          shortcode: lqtrloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Hind Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Quarter
          shortcode: rqtrloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 3
          probWeight: 5
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Hind Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
    weight:
      base: 1000
      calc: "1000"
    reachBase: 0
    bodyScaleBase: 1.06
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 80
      leaguesPerWatch: 10
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 75
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 75
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 36
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 48
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 56
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 35
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: kick
          name: Kick
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 8
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -2
            aspect: blunt
          lengthBase: 3
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
    - name: Bite
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
          name: Bite
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 1
            aspect: piercing
          lengthBase: 2
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

It stands on the salt flat like something carved from the desert itself — pale sandy hide bleached nearly white by sun and dust, with a dark stripe running down the spine like a line drawn in charcoal. Smaller than a horse, leaner, with ears that are too long and a head that is too heavy for elegance. But there is nothing clumsy about the way it holds itself. The legs are fine-boned and taut with tendon, the body stripped to nothing but running muscle, and the eyes — dark, wide, and rimmed with pale lashes — watch you with an intelligence that is calculating rather than curious. You take one step forward and it is gone. Not fled, not bolted — simply gone, accelerating from stillness to a flat-out gallop so fast that your eye loses it against the shimmer of the horizon. Nothing that lives in the desert moves like that. By the time the dust settles, it is a speck.

# Dossier {#dossier}

The Onager is the wild ass of the Khazryn steppe — a medium-sized equine of extraordinary speed, endurance, and ferocity found across the gravel plains, salt flats, and semi-arid grasslands of central Ankaris. An adult onager stands eleven to twelve hands at the shoulder and weighs five hundred to six hundred and fifty pounds, smaller and lighter than a wild horse but faster over open ground and possessed of a legendary willfulness that has defeated every historical attempt at domestication. Unlike the patient, cooperative donkey to which it is distantly related, the onager is a creature of explosive temperament — faster than a horse in a sprint, tireless over distance, and willing to fight with a viciousness that makes wild horses seem docile by comparison. For the Khazryn nomads, the onager is both a prized hunting quarry and a symbol of the desert's untameable spirit. Hunting onager on horseback is considered one of the supreme tests of rider and mount — the onager's speed forces the horse to its absolute limit, and the animal's unpredictable behavior and willingness to fight when cornered makes the final approach dangerous. Ancient Khazryn legends speak of warriors who tried to ride captured onagers, and none of these stories end well. Adventurers encounter onagers on the open steppe, often at a distance — the animals are wary and maintain a wide buffer from anything unfamiliar — and at remote watering holes where onager bands gather to drink.

## Presentation

A medium-sized equine that splits the difference between horse and donkey in proportions, with a character entirely its own. The body is lean and somewhat narrow, built for speed rather than the barrel-chested endurance of a wild horse. The coat is pale sandy-beige to reddish-brown, paler on the belly and legs, with a distinctive dark dorsal stripe and sometimes faint shoulder striping. The head is proportionally large with long ears — not as long as a donkey's but noticeably longer than a horse's — and a straight or slightly convex profile. The muzzle is pale, almost white, and the eyes are large, dark, and set high on the skull, providing excellent peripheral vision. The legs are long and fine, with hard, narrow hooves adapted for rocky and hard-packed ground. The mane is short, dark, and erect. The tail is tufted at the end, donkey-like rather than horse-like. The overall impression is of an animal stripped to its mechanical essentials — there is nothing decorative about an onager, nothing bred for human aesthetics. Every line serves speed, endurance, or survival.

## Key Behaviors

Onagers live in fluid social groups — small bands of mares and foals loosely associated with territorial stallions that defend ranges rather than herds. A dominant stallion maintains a territory around a water source or favored grazing area and breeds with mares that pass through, but does not maintain a permanent harem the way wild horse stallions do. This social flexibility allows onager bands to respond to drought and seasonal change by fragmenting and reforming as conditions dictate. They are primarily grazers, feeding on tough steppe grasses, desert shrubs, and dried vegetation, and like wild horses they can survive on forage that would starve domestic animals. Onagers are most active in the cooler hours of dawn and dusk, resting during midday heat in whatever shade the terrain provides. They are intensely alert and maintain extreme flight distances — an onager will begin moving away from an approaching human at several hundred yards, and will break into a full gallop at any sign of pursuit. Stallion fights are brutal and frequent during breeding season, involving savage biting, kicking, and rearing contests that leave both combatants bloodied. Unlike horse stallions, which typically stop fighting when dominance is established, onager stallions will pursue and attack defeated rivals with continuing aggression, sometimes inflicting fatal injuries.

## Combat Strategy

An onager's overwhelming preference is to run. It detects threats at extreme range and simply leaves, accelerating to speeds that outpace any pursuing horse over the first mile. However, an onager that is cornered, wounded, or defending a foal transforms from a flight animal into one of the most aggressive equines in existence. A cornered onager attacks without warning or hesitation, charging directly at the threat and delivering a rapid combination of bites, rearing strikes, and kicks that is far more violent than anything a wild horse produces. Onagers bite with genuine malice — they target faces, arms, and hands with snapping lunges and will hold and shake, behavior rarely seen in horses. Their kicks are delivered with precision, often spinning to present the hindquarters and then lashing out with both hind feet simultaneously. An onager that has been roped or restrained fights with an intensity that frequently injures handlers and has historically resulted in the death of the animal rather than its capture — they will throw themselves against restraints until bones break rather than submit.

## Attack Methods

### Savage Bite

Far more aggressive than a horse bite. The onager lunges with jaws open, seizes the target — arm, hand, face, throat — and shakes violently, tearing flesh and crushing tissue. The incisors are heavy and the jaw muscles are proportionally more powerful than a horse's, reflecting a lifetime of fighting that domestic equines never experience. An onager will bite repeatedly and with apparent intent to cause maximum damage, targeting the same wound multiple times.

### Double Kick

The onager spins to present its hindquarters and lashes out with both hind legs simultaneously, delivering a devastating double impact. The hooves are narrow and extremely hard, concentrating force into a small area, and the kick is powered by hindquarter muscles developed for explosive acceleration. This attack is faster than a horse's kick and delivered with less warning.

### Charging Strike

A cornered onager will charge directly at a threat, rearing at the last moment to bring forelegs crashing down on the target. Unlike a horse's defensive rear, which is typically a single motion, the onager's charge involves a sustained assault — rearing, striking, then immediately lunging to bite before rearing again.

## Special Abilities

### Desert Speed

The onager is the fastest equine on the Khazryn steppe. Over short distances — the first half-mile of a pursuit — an onager can outrun any horse, reaching speeds that are simply inaccessible to heavier domestic breeds. Even over longer distances, an onager's speed drops only marginally, and it can sustain a pace that exhausts pursuing horses within a few miles. This speed, combined with the onager's ability to navigate rough terrain at full gallop without faltering, makes mounted pursuit a genuinely difficult proposition.

### Untameable Spirit

The onager's legendary willfulness is not merely stubbornness — it is an active, aggressive refusal to submit that has no parallel among equines. Historical attempts to domesticate onagers have universally failed. Captured animals injure handlers, refuse training, attack other livestock, and will starve themselves or fight restraints to the point of self-destruction rather than cooperate. This is not fear-based panic but something closer to rage — an onager that has been restrained becomes genuinely dangerous to everyone around it. The few Khazryn stories of warriors who managed to ride onagers describe animals that cooperated only on their own terms and that could never be fully trusted.

### Extreme Endurance

Like the donkey to which it is related, the onager possesses extraordinary metabolic efficiency. It requires less water and food than a horse of comparable size, tolerates heat that would prostrate heavier equines, and can sustain activity through conditions — sandstorms, extreme cold, prolonged drought — that would leave domestic animals debilitated. An onager band can range across territories that no mounted pursuer can follow without supply lines.

### Territorial Aggression

Onager stallions are territorial in a way that wild horse stallions are not — they defend specific patches of ground rather than herds, and they respond to intrusion with immediate, escalating aggression. A stallion that perceives a horse-mounted rider as a territorial challenge may charge directly rather than flee, creating dangerous situations for travelers who unknowingly cross territorial boundaries near water sources or grazing grounds.

## Attributes

- **Strength:** 9-14 (1d6+8)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
