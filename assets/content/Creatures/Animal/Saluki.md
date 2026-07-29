---
aliases:
    - Desert Sighthound
    - Saluki
tags:
    - animal
    - image-needed
name:
    full: Saluki
    aliases: []
id: t7edWGJipMjipWWu
slug: saluki
img: icons/game-icons/lorc/hound.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 12
        dex: 15
        agl: 17
        per: 16
        aur: 11
        wil: 12
        rea: 9
        cre: 7
    attrRollFormula:
        str: 1d4+6
        end: 1d6+8
        dex: 1d6+11
        agl: 1d6+13
        per: 1d6+12
        aur: 1d6+7
        wil: 1d6+8
        rea: 1d4+6
        cre: 1d4+4
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The dog lies beside the fire like a piece of living calligraphy — all line and curve, drawn by a hand that valued elegance over utility. It is nothing like the blocky, thick-skulled working dogs of northern lands. This creature is made of air and tendon, so lean that every rib is visible beneath the short, silken coat, so long in the leg that it seems to have been stretched on a rack. The head is narrow and aristocratic, tapering to a fine muzzle with a slight convexity to the skull, and the ears are long, feathered, and folded close against the head like the pages of a closed book. The eyes are large, dark, and fathomlessly calm, regarding the world with an expression that manages to convey both complete awareness and supreme indifference. It does not look at you as a dog looks at a person. It looks at you the way a falcon looks at the ground — from a great and unbridgeable distance. Then something moves at the edge of the firelight and the transformation is instant: the languid curve becomes a coiled spring, the calm eyes narrow to fixed points, and every line of the body aligns toward the movement like a compass needle finding north. For one held breath it is absolutely still. Then it is gone — a pale blur accelerating into the darkness with a silence and speed that leaves you staring at the empty space where a dog used to be.

# Dossier {#dossier}

The Saluki is the great sighthound of [[Dunhara_Region]] — a lean, elegant hunting dog of ancient lineage, bred for coursing gazelle and hare across the open desert. An adult saluki stands twenty-three to twenty-eight inches at the shoulder and weighs thirty-five to sixty-five pounds, though their extreme leanness makes them appear lighter than they are. They are built entirely for speed — long-legged, deep-chested, narrow-waisted, and capable of sustained high-speed pursuit that bridges the gap between a horse's gallop and a cheetah's sprint. Unlike the cheetah, which exhausts itself in seconds, a saluki can run at near-maximum speed for miles, chasing down prey through endurance as much as raw velocity.

The saluki occupies a unique position in Dunharan culture — it is the only dog considered ritually clean under the strictest interpretations of [[Ashaian_Pantheon|Āsháian]] religious law. Where other dogs are viewed as unclean animals, tolerated for guarding but not welcomed in the tent, the saluki sleeps beside its master, eats from the household food, and is mourned at death with the grief normally reserved for family members. This exception exists because the saluki is not regarded as merely a dog but as something apart — a hunting companion whose lineage is tracked as carefully as a family's own genealogy, whose breeding is a matter of tribal prestige, and whose loss in the field is a genuine bereavement. A sheikh's saluki is an extension of the sheikh's own honor, and the gift of a well-bred saluki puppy between tribal leaders carries political weight comparable to a marriage alliance.

Salukis hunt in conjunction with falcons and, in wealthy households, with trained cheetahs — the falcon spots and flushes prey, the saluki courses and holds it, and the hunter on horseback arrives to make the kill. This three-part hunting system — eye in the sky, speed on the ground, authority in the saddle — is the defining field sport of Dunharan nobility and the practical method by which gazelle, hare, and bustard are taken across the open steppe.

Adventurers encounter salukis in the camps of Dunharan nomads (where they lounge with an air of aristocratic boredom), running alongside mounted hunting parties, and occasionally as strays or ferals — escaped or orphaned salukis that have reverted to a semi-wild state in the desert margins, hunting hare and scavenging with the lean, self-sufficient competence of animals bred for exactly this environment.

## Presentation

The saluki is immediately recognizable as something fundamentally different from other dogs. The build is extreme — a deep, narrow chest enclosing oversized heart and lungs, a dramatically tucked abdomen that makes the waist almost impossibly thin, and long, fine-boned legs that seem too delicate for the speeds they produce. The overall silhouette is a series of curves: the gentle arch of the back, the tuck of the belly, the sweep of the feathered tail, the curve of the long, narrow head. There is no bulk anywhere. Every ounce of the animal serves either speed or the organs that sustain it.

The coat is short and silky across the body, with distinctive feathering — long, fine, silky hair — on the ears, tail, backs of the legs, and sometimes between the toes. Coloring varies widely: cream, gold, red, grizzle, tricolor, black and tan, and white with colored patches are all common. The texture of the coat is remarkably soft, almost like spun silk, and is maintained with an obsessive self-grooming that makes salukis unusually clean for dogs. The skin beneath is thin, and on a saluki in motion, the play of muscle and tendon beneath the coat is visible — the animal is a living anatomy lesson, every mechanical element on display.

The head is long, narrow, and refined, with a slight dome to the skull, a moderate stop, and a tapering muzzle. The eyes are large, oval, and dark — hazel to deep brown — with an expression of quiet, watchful intelligence that has been described variously as gentle, noble, aloof, and unnerving. Unlike most dogs, a saluki does not look at humans with eagerness or submission; it looks with a calm, assessing awareness that feels more like a cat's regard than a dog's devotion. The ears are long, set high, and covered with feathering that may extend well past the ear tip. When the dog is alert, the ears lift slightly; when relaxed, they lie flat along the head.

The movement is distinctive even at a walk — a smooth, ground-covering stride with an effortless quality that suggests the dog is always operating well below its actual capacity. At a trot, the saluki floats. At a gallop, the body extends and compresses in a double-suspension gait — all four feet off the ground twice per stride — that produces a blurred, rippling motion covering tremendous ground with each stride.

## Key Behaviors

Salukis are quiet, reserved, and independent — temperamentally closer to cats than to the eager, people-pleasing working dogs of other cultures. They form deep bonds with their primary handler but are aloof with strangers, tolerating rather than welcoming unfamiliar contact. They are not demonstratively affectionate, expressing attachment through presence — a saluki that trusts you will lie near you, watch you, and follow you, but it will not grovel, bark for attention, or perform tricks for treats. This reserve is not a failure of domestication but a feature of it — the Dunharan tribes specifically bred for a dog that is a dignified companion, not a fawning servant.

Their hunting instinct is absolute and non-negotiable. A saluki that sees movement at the edge of its vision — a running hare, a fleeing gazelle, even a blowing piece of cloth — will pursue with an intensity that overrides all training, all commands, and all consideration of personal safety. This prey drive is the defining behavioral characteristic of the breed, and it cannot be trained out because it is the entire reason the breed exists. A saluki off-leash in open country will chase anything that runs, and it will not stop until it has caught the quarry, lost sight of it, or run itself to exhaustion.

Between hunts, salukis are remarkably calm, spending long hours resting with a stillness that borders on meditative. They conserve energy with the instinctive economy of desert animals, and a resting saluki can be so motionless that guests mistake it for a decorative fur draped over a cushion. This alternation between absolute stillness and explosive, maximum-intensity pursuit is the saluki's fundamental rhythm — there is no middle gear.

Salukis are sensitive and do not respond to harsh treatment. A saluki that is struck, shouted at, or handled roughly will simply withdraw — not in fear but in a kind of dignified refusal to engage with unworthy behavior. This sensitivity, combined with their independence, means they require a handler who leads through respect and consistency rather than dominance. The bond between a Dunharan hunter and their saluki is built over years and is fundamentally a partnership between equals who happen to be different species.

## Combat Strategy

A saluki is not a combat dog. It lacks the mass, the jaw strength, and the aggressive temperament of guard breeds. It will not attack humans on command, it will not defend property, and it has no interest in confrontation for its own sake. Against threats, a saluki's instinct is to evade — it is fast enough to outrun virtually anything that might threaten it, and it will use that speed without hesitation.

However, a saluki engaged with prey — or defending itself when cornered — fights with the lean, efficient violence of a coursing predator. It strikes at the quarry's legs and flanks with snapping bites delivered at speed, aiming to trip or hamper rather than to deliver a killing blow. Against larger prey that has been brought to bay, it circles and darts, keeping the quarry's attention divided until the hunter arrives. A saluki will not hold a quarry like a bulldog or tear like a wolf — it harasses, exhausts, and contains, functioning as one element of a coordinated hunting system rather than a solo killer.

A saluki defending its master — the one circumstance in which it will stand and fight rather than flee — is a different animal entirely. The bond with the primary handler overrides the self-preservation instinct, and a saluki that perceives a direct threat to its person will interpose itself with a fierce, barking aggression that surprises people accustomed to the breed's usual reserve. It is still not a mastiff, but a thirty-five-to-sixty-five-pound dog moving at the speed of a saluki and targeting the face and hands is not a negligible threat.

## Attack Methods

### Coursing Bite

The saluki's hunting attack. At full speed, the dog delivers a snapping bite to the quarry's hind legs, flanks, or hamstrings, aiming to trip or slow rather than to kill. The bite is quick and precise — a single snap delivered in passing, the dog already moving away before the quarry can retaliate. Against hare-sized prey, the coursing bite may be sufficient to break the neck; against gazelle, it serves to slow the quarry until the hunter can close.

### Darting Snap

In close combat or when defending its handler, the saluki darts in, delivers a rapid bite to hands, face, or throat, and retreats before a counter-blow can land. The speed of the attack makes it difficult to intercept, and the dog's lateral agility allows it to change direction instantly, attacking from a new angle before the target can reorient.

## Special Abilities

### Coursing Speed

The saluki is the fastest sustained runner among domestic animals — faster than any horse over a mile, and capable of maintaining near-maximum speed for distances that exhaust both horses and cheetahs. This speed is not merely raw velocity but includes the ability to match a fleeing gazelle's evasive turns stride for stride, adjusting course at full run with a flexibility that heavier dogs cannot achieve. A saluki in open pursuit is one of the most beautiful and efficient running machines in the natural world.

### Sighthound Vision

The saluki hunts primarily by sight, not scent. Its eyes are adapted for detecting motion at extreme distance across open terrain — a running hare at half a mile, a fleeing gazelle at a mile or more. This visual acuity, combined with the dog's elevated eye position (tall for its weight), makes it an exceptional detection platform. A hunting party accompanied by salukis effectively has a perimeter of visual surveillance that extends far beyond human sight, as the dogs' body language — the fixed stare, the lifted ears, the shift of weight onto the forelimbs — signals the presence and direction of prey long before the human eye can find it.

### Sacred Hound

The saluki's unique ritual status in Dunharan culture provides practical benefits beyond the spiritual. A saluki is welcome in tents and settlements where other dogs would be driven out, giving the hunter and his dog access to hospitality that a handler with a common cur would be denied. The genealogies of prized saluki bloodlines are known and valued across tribal boundaries, and a saluki of distinguished lineage serves as a social passport — proof that its owner is a person of quality, worthy of respect and hospitality under the Laws of the Well. Conversely, mistreatment of a saluki is a serious social offense, and a guest who kicks a host's saluki has committed an insult that may have consequences far beyond the immediate discomfort.

### Desert Endurance

Like all Dunharan animals, the saluki is adapted to extreme arid conditions. It requires less water than other dogs its size, tolerates heat well, and maintains condition on sparse, irregular feeding — hunting dogs are traditionally fed once daily, and a saluki can fast for days without significant performance loss. This metabolic efficiency, combined with its speed and hunting skill, means a saluki can survive indefinitely in the desert as a feral animal — a fact that cuts both ways, since escaped or orphaned salukis form semi-wild packs that compete with jackals and foxes for small prey.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 9-14 (1d6+8)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 8-13 (1d6+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
