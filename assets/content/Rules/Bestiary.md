---
tags: []
id: w21JSRk0uXGTaznQ
name:
  full: Bestiary
  aliases: []
shortcode: bestiary
type: doc
subType: rules
folder: RqKUTBUBN2Y3MHYB
---

# Animals

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "animal"
```

# Constructs

Golems are powerful, magical constructs animated by the mystical arts of skilled magicians. Crafted from a variety of materials such as clay, stone, iron, or other substances, these humanoid figures are brought to life through the infusion of arcane energy and complex enchantments. Unlike living creatures, golems lack free will and consciousness, operating solely under the commands and directives of their creators. Their imposing forms and immense strength make them formidable guardians and relentless enforcers, capable of executing simple but crucial tasks with precision and unwavering loyalty. The intricate runes and mystical symbols often etched into their surfaces are the binding spells that maintain their animation and tireless purpose. Golems are typically found guarding ancient treasures, sacred sites, or serving as tireless laborers in tasks too dangerous or demanding for mortal hands, embodying the pinnacle of magical craftsmanship and arcane ingenuity.

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "construct"
```

# Dreadspawn

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "dreadspawn"
```

# Elementals

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "elemental"
```

# Grukar - A Blight Upon the Land {#grukar}

The Grukar are a brutal and prolific folk, feared wherever their guttural war-cries echo across the hills. Thick-skinned, tusked, and foul-tempered, they inhabit the blighted wastes, the deep ravines, and the ruined places of the world where no civilized folk would willingly tread. Ranging in height from roughly four and a half feet among the stunted common breed to a towering six and a half feet among the rarest and most fearsome of their kind, the Grukar are not a single uniform threat but a fractious, seething mass of subspecies locked in perpetual internal struggle — a struggle that, paradoxically, is the very engine of their survival.

## Biology and Reproduction

The Grukar are genderless. They are not "males" or "females" in any meaningful sense — the words simply do not apply, and Grukar themselves have no concept of male or female roles, mating pairs, or sexual difference. Reproduction in Grukar society is the exclusive function of a separate subspecies, the [[being-grkrahk|Grukar-ahk]], which is self-fertilizing. A fertile Grukar-ahk lays clutches of eggs from which all other Grukar are spawned, and one of the Grukar-ahk's most remarkable abilities is the capacity to choose the subspecies of its spawn — to lay eggs that hatch as Grukar-Uk, Grukar-Sha, or Grukar-Hai according to the changing needs of its tribe.

The choice is made at the moment of laying. What decides a hatchling's subspecies is not its blood — every Grukar of a tribe is built from the same inheritance — but what the Ahk feeds into the egg as it lays: a chemistry that wakes some part of that common inheritance and puts the rest to sleep. The egg is not bred into a Grukar-Hai; it is told to become one. A clutch is dosed as a clutch and so comes out whole: a laying of Uk, or a laying of Sha, or — rarely, and never without cause — a laying of Hai. Word that the spawn-chamber has laid Hai runs through a tribe the way a declaration of war runs through a kingdom, which is precisely what it is.

What the dosing cannot do is hurry. An Uk clutch hatches in about six weeks; a Hai clutch takes twelve; a Sha clutch takes eighteen, and an Ahk clutch the same. The longest waits do not yield the largest creatures — the time goes not into bulk but into the intricacy of the nervous system, which is why the tribe's cleverest are also its slowest to arrive and its dearest to replace. Every clutch is a wager on where the tribe will stand a season or a year hence: an Ahk cannot answer tomorrow's raid by laying warriors today, and a tribe thick with Hai is a tribe whose spawner expected a war that may never have come.

Nor can the dosing outrun the larder. A Hai is an enormous quantity of meat to assemble, and the provision that goes into one Hai clutch would have raised several times that number of Uk. A hungry tribe cannot make warriors; it can only make laborers, and must spend them finding the food that might one day pay for a warrior. The tribes most desperate for Hai are reliably the least able to spawn them, and this, more than any enemy, is what has kept the Grukar from simply covering the world.

## The Inherited Mind

A Grukar is not taught. It hatches knowing — how to hold a spear, which fungus is safe, where the tribe's water lies, what a Hai's raised chin means and what becomes of those who mistake it. This knowledge arrives with the body, issued in the same laying that settled the body's shape. What separates the castes is not what they are given, which is much the same, but how much any of them can add to it afterward.

The Uk adds nothing. Instruction slides off it like water off stone; it can be shown a task a hundred times and will perform it on the hundred and first exactly as it performed it on the first, no better and no worse. An Uk put to work within days of hatching will still be doing that same work, in that same way, on the day it dies. What it was given is what it has.

The Hai adds a great deal, and adds it all in one narrow channel. A Hai learns what a fight can teach: which shield-wall gives at the left, how a horse behaves on scree, what a crossbow does at forty paces and what it cannot do at ten, which of the neighboring warbands breaks when pressed and which only pretends to. It learns from its disasters, provided it survives them, and it learns from its victories with a thoroughness that makes an old Hai a genuinely dangerous animal. But it learns tactics and nothing else. It cannot imagine a situation it has not stood in, cannot follow a consequence more than one step from its cause, and cannot assemble what it knows into anything that reaches past the present season. A Hai will win the battle in front of it and lose the war it never understood it was fighting.

The Sha does the thing no other Grukar can do. It thinks forward — sees what a course will cost three moves hence, sees what another creature wants and how that wanting can be made to serve some further end, builds an approach and then patiently builds the conditions the approach requires. To the rest of Grukar-kind this does not register as cleverness of a greater degree; it is very nearly sorcery, a Sha appearing to know what has not yet happened, and the deference a Sha collects is the deference owed to something uncanny. It is also the only Grukar that can carry an idea home from beyond the tribe, and the only one that can be told a thing rather than having to survive it.

## An Invitation to Dinner

Which is the problem a Sha spends its life trying not to solve — and, less often, a Hai. Knowledge that lives in one skull dies in that skull, and the tribe cannot inherit what it was never issued. So it is taken.

When a Grukar has come to hold something the tribe cannot afford to lose — a Sha returned from three seasons among human traders with their roads and their rivalries and the shape of their walls behind its eyes, a Hai that walked away from a battle no other Grukar survived and knows precisely how it did so — it is invited to dinner. The phrase is not a euphemism. The guest is received in the spawn-chamber with every honor the tribe can muster, and there its skull is opened and its brain and the long cord of its nerves are fed, fresh, to the Ahk. What the Ahk takes in it renders down and writes into the next laying, and the clutch that follows hatches already knowing the roads, the rivalries, and the shape of the walls.

To be invited is the highest distinction a Grukar can be given, and there is no refusing it. A guest is spoken of afterward the way other folk speak of an ancestor — which, in the only sense the Grukar recognize, it has become: it is in every hatchling of the following season. It is also why a canny Sha is careful about how much it appears to know. Competence is an appetite the spawn-chamber cannot ignore forever, and a Sha that makes itself indispensable has, by that very act, set itself a date. The cleverest of them spend their lives being exactly useful enough and never remarkable — and the surest way for one Sha to be rid of another is to see that the Ahk hears how very much it has learned.

## The Hive-like Society of the Grukar

A Grukar tribe is centered on a single fertile [[being-grkrahk|Grukar-ahk]], the spawning matrix on whom the entire tribe's continuation depends. Around the fertile Grukar-ahk live a small number of infertile Grukar-ahk — usually three to six — who serve as personal guardians and as a kind of biological reserve. These infertile Grukar-ahk are physically smaller and structurally simpler than the fertile one; they cannot spawn while the fertile Grukar-ahk lives, but each carries the latent capacity to become fertile if the circumstances arise.

When a tribe grows too large for its territory to support, internal pressure builds toward fragmentation. A faction of disaffected Grukar — typically a Grukar-Hai with its retainers, sometimes coordinated by a Grukar-Sha plotting an exit — will mount a raid on the inner sanctum, seize one of the infertile Grukar-ahk, and flee with it into unclaimed land. Once the abducted Grukar-ahk is sufficiently distant from its mother-tribe's fertile spawner, its dormant biology activates and it becomes fertile in turn. From that moment a new tribe exists; from its first clutch of eggs, the new Grukar-ahk begins shaping it.

This pattern of fission is the engine of Grukar expansion. A successful tribe never remains static — it grows, splits, grows again, and splits again, sending fragmentary tribes outward in every direction along the frontier of viable land. Grukar holds spread the way mold spreads: not by march and conquest but by repeated budding from any tribe that has accumulated enough mass to fracture.

## The Ahk's Quiet Hand

The fertile Ahk has one purpose, and only one: the welfare and increase of its tribe. The Ahk does not lead the tribe so much as cultivate it, and every social structure within it serves that single end through the Ahk's deliberate management.

The tribe needs Grukar-Hai — it cannot survive raids, contested territory, or hostile neighbors without the ferocity Hai bring — but the Ahk cannot afford a unified Hai cohort. A single dominant Hai backed by the others would be the only force in the tribe capable of unseating the spawner. So the Ahk spawns Hai in numbers that ensure constant rivalry, deliberately permits the conditions in which they fight one another to the death, and treats every Hai-on-Hai killing as the desired outcome it is. The result is a perpetually replenished caste of the strongest survivors and a politics in which no Hai ever holds power long enough to threaten the spawn-chamber.

There is a second reason for this manufactured violence, deeper than mere prevention of regicide. A Hai that survived and reflected long enough would arrive at a conclusion that the Ahk needs to never be reached: killing the Ahk is the wrong move; controlling the Ahk is the right one. Mastery of the spawning Ahk is mastery of the tribe entire — every clutch, every demographic decision, every spawn pouring from the chamber. A Hai with the patience to see this and the strength to seize it would become the absolute power its temperament has always craved. The Ahk understands this perfectly, and engineers Hai-on-Hai violence not just to keep any one Hai weak, but to keep all Hai too occupied with their immediate quarrels to ever sit still long enough to reach the deeper insight. A Hai locked in a fight for its life against another Hai is a Hai that does not think strategically about the spawn-chamber.

The Ahk protects the Grukar-Sha because the Sha could not survive a season among the Hai's brutality and the Uk's mass on their own. In return the Ahk uses them as its instruments. A Sha at a Hai warlord's elbow whispers cunning that often carries the Ahk's intent; the Sha plants the rumor that turns Hai against Hai, spreads the suggestion that keeps the Uk obedient, sees the threat the Ahk sees and acts on it before the Ahk must. The Sha are also the tribe's interface with the outside world — when a Grukar tribe must speak to outsiders, it is a Sha mouth that does the speaking. And it is a Sha mind that carries home what it saw — which is the second reason the Ahk keeps them safe, and the reason that protection ends at the spawn-chamber door.

The Grukar-Uk are the labor pool, and the Ahk regards their deaths with the same equanimity a farmer regards the loss of grain. The spawner can replace them whenever the tribe needs them. Their value is collective rather than individual: a hundred Uk to dig the moat, fifty Uk to die holding the pass, eighty Uk to raise the next generation of warriors before they themselves are spent in the next raid. The Hai's boot is what gets work out of them; the Sha's whisper is what aims them.

The Ahk has no personal ambition. It does not lust, plot for individual aggrandizement, or pursue any goal beyond the tribe's continuation; the welfare and increase of its tribe is the only animating purpose it possesses, and every act of cruelty, manipulation, or biological calculation flows from that single, total dedication. It is not concerned with itself for its own sake — but it understands clearly that it is the cornerstone of the tribe and that its death without an heir-apparent would mean the tribe's collapse, and so it guards itself with the same calculated care it extends to every other instrument of survival.

Sometimes, however, the abduction raid that founds a new tribe is not a failure of the Ahk's vigilance but an exercise of it. The fission of an established tribe is the gravest threat the Ahk faces, but it is also, on rare occasion, the Ahk's quietest tool. When a particular Hai has become too dangerous to leave inside the tribe, or a Sha has grown too independent in its scheming, or a knot of Uk has begun to coordinate beyond what the Hai can suppress, the Ahk will sometimes decide that the cost of letting them go is less than the cost of keeping them. It does not move directly — the Ahk never moves directly — but it permits, indirectly and almost passively, the conversation it would otherwise crush. A hint reaches a Sha that the spawn-chamber's defenses are lazy on the night side. An infertile bodyguard is left a little less closely watched. A Hai with grievances finds a sympathetic ear it should not have found. The faction departs with the troublemakers in tow, an infertile in their grasp, and the home tribe's health is restored. A new and weaker tribe rises at the far edge of viable land — a future problem, perhaps, but a smaller one than the same troublemakers fomenting at the heart of one's own.

The Ahk's most delicate problem sits at its own side. The three to six infertile Ahk bodyguards cannot spawn while the fertile spawner lives, but every one of them carries the latent capacity to become fertile the moment it is separated from the mother spawner — and there can only ever be one fertile Ahk in a tribe. The fertile Ahk knows this, and watches its own retinue with the same wariness it directs at any external threat. Every bodyguard is both a shield and a potential successor; every reserve is a defender today and a possible rival tomorrow. The Ahk cultivates dependency in its bodyguards, isolates them from one another's conspiracies, and listens always for the first whisper of a plot — the abduction raid that founds a new tribe always begins as a conversation that the Ahk failed to overhear in time.

What stays the spawner's hand is not the eighteen weeks an Ahk clutch costs; it is that the tribe has almost no use for the result. Every other caste has work — the Uk dig and die, the Hai fight, the Sha think — but a second spawner has nothing to do that the first is not already doing, and is, by the bare fact of existing, the only thing in the tribe capable of replacing the first. One or two proto-Ahk are prudence: insurance against a bad season, a plague, a lucky spear. A large and confident tribe may keep five or six and station them at the chamber door, where their bulk and their entirely selfish interest in the chamber holding make them the finest bodyguards in Grukar-kind. Past six they are not insurance but a queue, and a spawner has been known to lay a seventh and then quietly let it fail to thrive.

The leash on all of them is chemical. A proto-Ahk stays barren only while it remains near enough to taste the prime Ahk's suppression, and the range is short — a matter of chambers, not of miles. It cannot be sent to scout, cannot be posted on the outer palisade, cannot be marched out with a war party; carry it beyond the edge of that scent for long enough and its dormant biology begins, irreversibly, to wake. This is why the reserves are bodyguards at all: proximity is not a duty the Ahk assigns them but a condition of their remaining what they are. It is why the abduction raid works — a breakaway faction need not defeat the tribe, only get one proto-Ahk far enough away, fast enough, and keep it there. And it is why the prime Ahk is very nearly immobile: a spawner that moves must move its entire core with it, or arrive somewhere new to find a rival waking in the ground behind it.

The Ahk's calculation does not stop at the spawn-chamber's walls. The tribe needs food, water, materials, and space to grow, and these must come from somewhere — the territory around the nest, the lands beyond it, the smaller settlements at the edge of viable contact. The Ahk has no abstract attachment to territory; what it cares about is whether the tribe can be fed, sheltered, and enlarged. Where territory is the means, the Ahk is territorial; where territory is no longer needed, the Ahk shifts its attention without sentiment.

The same calculation is what restrains the tribe from the destruction it would otherwise bring. A tribe that hunted out its local game, exhausted its own forage, and scoured its own forests bare would soon collapse from within, and the Ahk understands this perfectly. It manages the local environment with the same long-view patience it brings to the Hai cohort: enough taken to sustain, never so much that the source fails. Hunters and gatherers are sent at controlled intervals; certain prey populations are deliberately spared in lean seasons; raids on the same neighboring herds are paced so that the herds can recover. The Grukar are brutal, but the Ahk that runs a Grukar tribe is not stupid, and it will not preside over a tribe that starves itself out of existence.

Beyond the tribe's immediate range the Ahk's calculation shifts but does not soften. Weaker neighbors — small villages, isolated farmsteads, lone caravans, the fringe outposts of larger powers — are valid targets, and a tribe with surplus Hai will send raiding parties to take what those settlements have. But the Ahk is careful in its choices. Groups likely to organize a successful response, settlements backed by serious military power, neighbors whose retaliation could break the tribe — these the Ahk leaves alone, and a Hai pushing for a raid against such a target will find its plans subtly undermined by the same channels through which the spawn-chamber's other instructions flow. The Ahk fears no creature for itself, but the survival of the tribe is the only thing it values, and a raid that brings down a vengeful army is no different from a famine.

## The Tribe That Cannot Move

And when the famine comes, the Ahk does not leave. Not that it strictly cannot — a spawner can be carried, at ruinous risk, and its core carried with it — but in the whole long calculation it performs on the tribe's behalf there is no operation for abandonment. The Ahk husbands the game, paces the raids, balances the castes, and turns every dial it possesses to keep this tribe alive in this place. When the place itself begins to fail, it applies the same instruments harder. It rations. It sends the hunters further out. It lays Uk instead of Hai to bring the tribe's appetite down, and then lays fewer of those. It worries, and it waits, and it does not order a march — because every course it is capable of evaluating is some variation on continuing, and the one course that is not, which is to go and let all of this be lost, is not a thought its purpose can produce. A dying Grukar tribe is very often a well-managed one, declining in good order, its spawner attending to the arrangements to the last.

What breaks the deadlock is a Sha. Some Sha, watching the stores and counting the seasons, sees the end of the line before it arrives and understands that no amount of clever management now reaches past it. It cannot argue the Ahk out of the spawn-chamber; nothing can. So it does what a Sha does, and arranges for the tribe to fracture around the obstacle. It finds a second Sha of the same mind, because one alone cannot manage it; it finds a Hai with a grievance and gives that grievance somewhere to go; and between them they mount the raid on the inner chamber, cut a proto-Ahk out of the guard, and run it far enough and fast enough that the suppression fails and the thing in their hands wakes up fertile. The Uk come because they are driven, and because a Hai is telling them to.

This is not one of those departures the Ahk quietly permits. It will fight this one with everything it has, and the conspiracy is precisely the sort the spawn-chamber exists to smell out — so the thing does not assemble while any hope remains, but only once the disaster has grown plain enough that even a Hai can see it. Sha do not trust one another and Hai do not take direction; nothing short of an obvious and imminent end could make either do both at once. So a tribe never relocates. It splits, at the last possible moment, and only one half lives: the faction goes out into unclaimed land with its stolen spawner and founds something new, while the old tribe stays exactly where it stood, in the ordered care of an Ahk still managing the decline, and finishes dying of the famine or the drought or the fouled water that drove the others out.

Fission is normally the work of a tribe carrying too much mass — a success shedding its surplus. This is the other road to the same event, and it is the one that kills. It is also the plainest statement of the rule behind everything else about them: the Grukar do not migrate, they bud. A tribe is not a people who can gather themselves up and go. It is a place with a spawner in it, and when the place fails the tribe fails with it, less whatever some frightened Sha contrived to throw clear.

## Sub-species of Grukar

The Grukar are not one creature but four, each subspecies as distinct from the others as a wolf from a jackal. They share a common ancestry, a common mode of communication (body posture and gesture as the primary channel, supplemented by chest- and throat-generated clacks, rasps, and subsonic and ultrasonic calls that lie outside human hearing), and a common brutality — but beyond that, they are shaped by vastly different pressures and the deliberate spawning choices of the Grukar-ahk into vastly different forms. Together they constitute a crude but effective society: the spawner sustains, the strong rule, the clever manipulate, and the many toil and die.

[[being-grkrahk|Grukar-ahk]] — The spawners. Self-fertilizing, present in any tribe as one fertile individual plus a small handful of infertile guardians-and-reserves. The Grukar-ahk decide the demographic composition of the tribe by selecting the subspecies of each clutch they lay. They are physically substantial — stronger than the Sha, less massive than the Hai — but rarely fight personally; their role is biological, not martial. An Ahk clutch takes eighteen weeks, though time has never been what limits their number: the proto-Ahk are tethered within a chamber or two of the prime spawner's suppressing scent and cannot be sent anywhere, and beyond a handful they cease to be insurance and become a queue of successors.

[[being-grukaruk|Grukar-Uk]] — The common Grukar, comprising roughly eighty-five percent of any tribe. Stocky, strong, and numbingly stupid, they are the laborers, the foot soldiers, and the expendable masses. What they lack in wit they make up for in sheer numbers and a stubborn, muscular endurance. An Uk clutch hatches in six weeks, the quickest and cheapest laying a spawner can make.

[[being-grkrsh|Grukar-Sha]] — The thinkers, the whisperers, the ones who survive by being too useful to kill — until the day they become too useful to leave alive. Roughly ten percent of the population, the Grukar-Sha are thin, cunning, and physically the weakest of their kind — but their intelligence makes them indispensable as scouts, spies, and counselors to the mighty. A Sha clutch takes eighteen weeks to hatch, the longest of any Grukar, which is why a Sha lost is a loss the tribe feels for a season and more.

[[being-grkrh|Grukar-Hai]] — The towering apex of Grukar-kind, and the rarest of the warrior castes, comprising perhaps five percent of the population. Massively built and savagely violent, the Grukar-Hai are spawned to dominate — but their ferocious temperament drives them to fight one another as readily as any enemy, ensuring that only the most fearsome survive while their own numbers remain forever thin. A Hai clutch takes twelve weeks and costs the tribe more in provision than any other laying.

## The Grukar Threat

Where the Grukar spread, the land suffers. Their tribes are a roiling cauldron of violence, held in a precarious balance by the interplay of their subspecies: the Grukar-Hai too few and too fractious to organize alone, the Grukar-Sha too weak to seize power openly, and the Grukar-Uk too lazy and dim to act without a boot on their necks. Yet when a strong leader rises — a Grukar-Hai cunning enough to listen to a Sha counselor and brutal enough to whip the Uk into a marching horde — the result is a tide of destruction that has swallowed towns, scattered armies, and laid waste to entire regions before burning itself out in the inevitable internal collapse that follows.

# Goblins - The Cunning Tricksters

Goblins are small, mischievous creatures known for their cunning, stealth, and guile. As followers of their trickster god, they thrive on chaos and deception. Goblins can be found in a variety of environments, from the dark depths of caves to dense, shadowy forests. They possess pointed features, sharp claws, and skin tones that allow them to blend seamlessly into their surroundings. Unlike many communal creatures, goblins are fiercely individualistic, rarely cooperating even when encountered in groups. Instead, they exploit chaos and confusion to their advantage, each seeking personal gain. Renowned for their ability to lie and deceive with ease, goblins are adept at setting traps and ambushing unsuspecting prey. Their weapons are often simple but effective, frequently enhanced with poisons and toxins. Whether lurking in the underbrush or hiding in the shadows, goblins present a constant nuisance and danger to adventurers with their unpredictable and treacherous nature.

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "goblin"
```

# Helspawn

A creeping dread fills the air as the Helspawn emerge from the shadows — a host of ghastly figures summoned from the underworld by dark priests. Their appearances vary from grotesque and decayed to eerily beautiful, a testament to the fell energhy that binds them. Some retain a semblance of their former selves but with a chill touch of death, while others are twisted and malformed, their bodies marred by necrotic energy. Each Helspawn exudes an unsettling aura, a tangible sense of the unnatural that makes one's skin crawl and breath catch in the throat.

When they move, it is with a graceless, relentless determination for some, and a terrifying, fluid elegance for others. Their hollow eyes, whether ablaze with malevolent intelligence or empty and vacant, speak of an unholy existence bound to serve their necromantic masters. The mere presence of Helspawn can dampen light, casting an oppressive gloom that chills the soul and foretells doom.

Helspawn are the undead — the dead made animate through the power of gods, celestial agents, or mortals who have been granted necromantic authority. They are found across all the world, wherever the right kind of necromantic power holds sway, and the phenomenon is not limited to any single pantheon. "Helspawn" is a generic term for "undead". Every major religious tradition that touches on death or chaos has its own theological explanation for why the dead sometimes walk, and every such tradition has those who can — or who dare to — call them back.

Every Helspawn is, at root, a vessel imbued with necrotic spiritual force. Details are unclear, but it seems clear that this necrotic force is associated with the destruction or perversion of the living spirit, or soul, that previously inhabited the body. This conversion of the spirit seems to always involve coercion or arrangement: once spirits leave their deceased bodies they do not naturally return. Something — a necromancer, a ritual, a creator-Helspawn, a divine agent — must act as a catalyst to the binding.

One important distinction is between Helspawn and Spirits. The spirits of dead beings may from time to time remain connected to places in the material realm; ghosts and similar beings. But those creatures are not Helspawn; those are immaterial spirits from the spirit realm that persist usually near where they died.

## The Undead Hierarchy

Helspawn exist on a spectrum defined by the completeness of the soul bound to the body. At one extreme are the [[being-nghtwght|Nightwights]] — intelligent, powerful, and semi-permanent, created through deliberate ritual from willing and powerful subjects whose souls, often already perverted, were violently transformed to produce powerful undead beings. At the other extreme are the [[being-hlthrls|Helthraals]] in their most degraded state — mindless, shambling, rotting corpses animated by the barest fragments of spiritual energy.

Between these poles lies the full range of undead existence. A soul ripped back from the afterlife and forced into its deceased body arrives damaged by the process, the more so if unwilling — incomplete, diminished by the passage. How much of the original person remains depends on how long the body had been dead, how violently the spirit was coerced back, and the skill of whomever performed the reanimation. In some cases the recently dead, especially if the death was not violent, pulled back quickly, might return confused but retaining speech, memory, and personality, although with significant confusion about their situation, and significant memmory gaps. So long as the fact of their death can be hidden fron them, they might be able to persist for a short time as if nothing had happened. But quickly the body begins to decay, the mind to degenerate, and often a great hunger for living flesh and blood blossoms. All Helspawn below the Nightwight tier degrade over time — the soul fragments eroding, the body decaying, identity slipping away week by week until nothing remains but the mindless hunger.

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "helspawn"
```

# Mythic Creatures

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "mythic"
```

# Spirit Creatures

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  sohl.body.weight.base AS "Weight",
  sohl.body.bodyScaleBase AS "BodyScale",
  description AS "Description"
WHERE type = "creature" AND sohl.kbcat = "spirit"
```
