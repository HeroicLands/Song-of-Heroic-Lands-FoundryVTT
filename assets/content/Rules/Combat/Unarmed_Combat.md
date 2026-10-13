---
shortcode: unrmdcmb
name: {full: Unarmed Combat, aliases: []}
type: doc
subType: rules
tags: [rules-combat, rules-combat-kinds-of-attack, rules-combat-sections]
data: {packFolder: rulescombat}
---

# Unarmed Combat {#unarmed-combat}

Fighting with no weapon is not a separate system. An empty hand, a boot, a set of teeth and a wrestler's grip are all **[[doc-strkmds|strike modes]]** like any other, and they resolve through the ordinary [[doc-atkreslv#resolving-an-attack|attack sequence]] against the **Melee** skill. What distinguishes them is where they come from: not from a weapon carried, but from a **combat technique** the character has trained.

Unarmed attacks are weak, short, and — except for the manoeuvres — poorly suited to hurting an armoured opponent. They matter because they are always available, because they work in places a weapon cannot be brought to bear, and because several of them do things no weapon does at all.

## Combat Techniques {#combat-techniques}

A **combat technique** is a trained way of using the body as a weapon. Each one carries a single strike mode with its own impact, aspect, precision and reach, and each is a separate thing to know: a fighter who can kick well cannot necessarily wrestle.

The attack is still tested against **Melee**. The technique supplies the _attack_ — what the blow is, how hard it lands, how precisely it can be placed — while Melee supplies the fighter's ability to land it. A character with no technique at all still has hands and feet, and may improvise; what they lack is anything trained to improvise with.

## The Folk Roster {#the-folk-roster}

The techniques ordinary folk learn are these. **The values are those of a human-sized person**, and no further:

| Technique      | Impact       | Zone die | Reach | What it is for                                  |
| -------------- | ------------ | -------- | ----- | ----------------------------------------------- |
| **Punch**      | 1d6−3 blunt  | d4       | 1 ft  | The plainest attack, and the feeblest           |
| **Kick**       | 1d6−2 blunt  | d4       | 2 ft  | The strongest opening, but it cannot reach high |
| **Headbutt**   | 1d6−2 blunt  | d4       | —     | Delivered from a grapple, needing no hands      |
| **Bite**       | 1d4 piercing | d2       | —     | The most precise, and the only piercing one     |
| **Grab**       | —            | d4       | 1 ft  | Take what a limb holds, or hold the limb itself |
| **Press**      | —            | —        | 1 ft  | Drive an opponent off their footing             |
| **Trip**       | —            | —        | 2 ft  | Put an opponent on the ground                   |
| **Limb Block** | —            | —        | 1 ft  | Block with an arm or a leg, having nothing else |

Reach is what the technique adds to the fighter's own bodily reach, so a bite or a headbutt reaches nothing at all beyond the body: the target must already be pressed against you, which is why neither ever opens an exchange and both so often close one.

Four of these describe **anatomy** and four describe **a rule**. Punch, Kick, Headbutt and Bite say what a human fist, foot, skull and jaw do, and mean nothing on a creature built differently — a bear's paw is not a punch and a wolf's bite is not a person's. Grab, Press, Trip and Limb Block inflict no damage of their own, so their rules hold for any creature with the limbs to perform them.

**Other creatures fight with their own techniques**, derived from their own anatomy and their own Strength: claws, gores, tail lashes, talons, stings, constricting coils, breath. Where such a creature does share a name with a folk technique — a bite is a bite — it does not share the numbers. See the [[doc-bestiary|Bestiary]].

## The Strength Trial {#the-strength-trial}

**Grab**, **Press** and **Trip** do not wound. Winning the exchange with one of them earns only the _attempt_; what settles it is an opposed **Strength Trial**.

> **Both combatants roll `d6 + Strength`. The initiator must win it, and the margin decides how completely.**

The Trial takes a bonus for each **Impact** [[doc-atkreslv#tactical-advantages|Tactical Advantage]] the winner chooses to spend from those earned in the exchange — **+2** for a Press, **+3** for a Grab, **+4** for a Trip — so a combatant who is comprehensively winning does these things almost at will, and one who scraped a narrow victory usually does not. Other circumstances adjust it too: pressing out of a charge, or having only one hand on an opponent.

Before a Grab Trial, declare **Take** or **Hold**, the participating limbs, and
how many Impact Tactical Advantages to spend (default **0**). Each spent
advantage adds the strike mode's Impact TA value: normally **+3** for a blunt
Grab, or the mode's explicit override. Using one hand applies **−2**; using only
the non-primary hand applies another **−3**. These are named adjustments to the
Strength Trial, separate from off-side penalties on the preceding Melee test.
Combat techniques have no Heft.

A Take targets the **part struck**, irrespective of the location within it. It
releases every grip on that part's held item; an empty part yields no effect.
The item goes into a usable free hand of the taker, or falls uncarried when none
is free. A Hold immobilizes the struck part for one round without releasing its
grip. The grabber's next turn repeats the Trial to maintain it; any other action
or movement ends the Hold. The victim receives a Pass reminder and still controls
their own turn and defences.

**Only one Strength Trial is made per exchange**, and only the combatant who _initiated_ one and won the Melee test may inflict its effect. A counterstriking manoeuvre therefore cancels the attacker's: whoever won the exchange gets the Trial. If the initiator loses the Trial, nothing whatever happens — a manoeuvre against a markedly stronger opponent is a wasted turn.

Each manoeuvre reads its winning margin off its own table, and the tables are given with the techniques themselves. In outline:

- **Press** knocks an opponent back, and at a wide enough margin puts them down and into [[doc-shock|shock]].
- **Trip** puts them [[doc-prone|prone]], and at a wide margin throws them and leaves them open to an automatic Grab.
- **Grab** either **takes** an object out of the limb struck — the disarm — or **holds** that limb fast. A hold costs the victim their next turn, though they may still defend, and it must be renewed by a fresh Strength Trial every round. A held limb keeps what it was holding: a hold is not a disarm, which is why the grabber must declare which of the two they are attempting before rolling.

## Entangling and enveloping weapons {#entangling-and-enveloping-weapons}

A weapon carrying **Entangle** offers a Hold attack instead of its damaging
strike, at that weapon's reach. Winning the Melee exchange earns the same
opposed Strength Trial as Grab (Hold); the trial must be won before the hold
begins. Entangling deals **no impact**, and a maintained hold follows the
ordinary Hold rules above. It does not take the target's weapon.

A weapon carrying **Envelop**, such as a net, leaves a struck target
**Enveloped**. The initial attack is defended normally unless the target is
already Enveloped. While the condition remains, attacks and **every defence,
including Dodge, take −20**. Enveloped lasts until removed: it has **no timer
and no escape roll**. The table decides when it can be removed.

## Limb Block {#limb-block}

**Limb Block** is the defence of last resort — no weapon, no shield, and something already coming at you. It is a Block made with a forearm, a shin or a shoulder, and it is genuinely dangerous.

Where an ordinary block wards the blow on a tie, a limb block wards it safely only on a **clear victory**: a higher success level than the attacker, with no tiebreak to help. On **tied successes the attack lands on the blocking limb itself** — the blow strikes that limb, a `d10` deciding where within it, and only **2** points are subtracted from the impact for the partial ward. Two points is nothing against a sword.

Against a fist, a club or a kick that is a reasonable trade; the worst case is a bruised arm. Against an edge and a bare arm it is a choice to make only when the alternative is worse — a blade in the forearm being better than a blade in the throat.

**Armour changes the arithmetic entirely.** A limb block is the only defence that decides _where_ a blow lands, and a fighter armoured unevenly can use that deliberately: a mail sleeve over an unprotected body turns the raised arm from a gamble into a plan. The limb's own protection applies as normal, and the block's two points come off on top of it.

Apply **−20** where the limb is at odds with the weapon's line — a leg raised against a punch — and the GM may disallow the block outright where it would be absurd.

## Armour on the Attacker {#armour-on-the-attacker}

Unarmed blows are the one case where the **attacker's** armour matters. A rigid helm, boot or gauntlet adds **2** to the impact of the strike it is worn on, which is most of the difference between a bare fist and a gauntleted one, and much of the reason an armoured fighter is dangerous even having lost their weapon.

The performing limb determines the off-side penalty. Punch and Kick from the
non-dominant side take **−10 to the roll and −1 impact**. Grab and Limb Block
from the non-dominant hand take **−10 to the roll**, with no impact reduction.
**Trip is exempt**: either foot sweeps without an off-side penalty. A being with
both dominance characteristics or neither has no off side and takes none of
these penalties. The named off-side deltas appear in the roll and impact
breakdowns. See [[doc-character#dominance|Dominance]].

A technique uses the dominant eligible limb when available, then an eligible
limb on the other side. Occupied or immobilized hands cannot perform a hand
technique, and an unusable or immobilized foot cannot kick or trip. Weapons
keep their separate Heft adjustment; this flat −10 belongs to techniques.

## See also {#see-also}

- [[doc-atkreslv|Attack Resolution]] — the exchange in full
- [[doc-mlattcks|Melee Attacks]] — reach, engagement, and the melee defences
- [[doc-strkmds|Strike Modes]] — the structure every technique is expressed in, and [[doc-strkmds#the-limb-a-technique-needs|the limb each technique needs]]
- [[doc-skills#skill-descriptions|Skill Descriptions]] — the individual techniques and their tables
