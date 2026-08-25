# Cosmic Explorer – Shining-in-the-Darkness Menu System
## Full Design: How It Looks, How It Plays, NPCs, Locations, and Momentum

**Status:** Detailed design document  
**Date:** 2026-08-25

---

## 1. What “Shining in the Darkness Menu System” Actually Means

In the original *Shining in the Darkness* (Sega, 1991), towns and interiors were not abstract menus. They were real places you moved through.

Key traits we are copying:

- Every location is a **wide horizontal scene** — wider than the screen.
- The player does **not** appear as a sprite on screen. The camera *is* the player’s point of view.
- You pan left and right (and a little up/down) to look around and find people or objects to interact with.
- Buildings and streets feel like actual spaces that can later be extended.
- NPCs stand in specific places and deliver dialogue, quests, and services.
- The environment itself carries atmosphere and story.

In Cosmic Explorer this becomes the entire **Home Layer** once the player leaves the Planet Sphere:

- Town Main Street is a wide POV scene.
- Every building interior is its own wide POV scene.
- The player is always “inside” the world, never looking at a list of buttons that say “Shop” or “Upgrades.”

This is the opposite of a traditional mobile game menu.  
The menu *is* the place.

---

## 2. How the Player Experiences It

### From the Planet Sphere
1. Player rotates their planet.
2. Taps the Town (or another location).
3. Camera zooms in.
4. Screen fades to black.
5. Soft location music begins.
6. Darkness fades up into the wide scene.

### Inside a Scene
- The view is a detailed illustration that extends left and right beyond the screen edges.
- Player drags horizontally to pan the camera.
- Limited vertical drag lets them look up or down slightly (for atmosphere and hidden details).
- Tappable hotspots appear on NPCs, counters, doors, objects, and story markers.
- Interacting opens dialogue, a shop panel, a task, or a management interface — still framed inside the scene so the player never fully leaves the place.

### Leaving
- Clear exit control (button or gesture).
- Reverse transition (or simple fade) returns the player to the rotatable planet.

The feeling should be:  
“I am walking around my town and going into buildings,”  
not  
“I am opening menus.”

---

## 3. How NPCs Drive Game Momentum

NPCs are the engine that keeps the player coming back and moving forward. They do four jobs:

### A. Give Direction (Tasks & Quests)
- NPCs offer concrete next actions: “Bring me three star petals,” “Clear the debris near the old landing pad,” “Talk to the mechanic about the new thruster.”
- These tasks send the player into jumper runs or into other buildings.
- Completing them advances story beats and unlocks new systems or dialogue.

### B. Create Routine & Attachment
- Different NPCs have daily or rotating lines.
- Some remember previous conversations or completed tasks.
- The player starts to feel known by the town.

### C. Gate Systems Gently
- The gardener introduces farming.
- The mechanic introduces ship upgrades.
- The bank teller introduces storage and currency features.
- Systems appear through people rather than through abstract unlock screens.

### D. Deliver Story & Emotion
- Short character arcs.
- Town events.
- Reactions to the player’s progress on the planet (new buildings, better farms, medals earned).
- The town feels alive because the people in it change as the player changes the world.

**Momentum loop:**
NPC gives task → player goes on a run or manages something → returns → NPC reacts / gives reward / opens next task → planet and story advance → new NPC content appears.

This loop is the primary long-term retention driver on the Home Layer.

---

## 4. Locations to Build (Starting Set)

| Location | Role | Priority |
|----------|------|----------|
| **Town Main Street** | Central hub, social space, entry point to most buildings | Highest |
| **Hangar** | Launch runs, ship management, return point | Highest |
| **Parts Store / Shop** | Buy/sell resources, gear, consumables | High |
| **Gym / Upgrades** | Character & ship permanent upgrades | High |
| **Greenhouse / Gardens** | Farming and plant management | High |
| **Bank** | Currency, diamonds, secure storage | Medium |
| **Warehouse** | General inventory & bulk storage | Medium |
| **Trophy / Medals Hall** | Achievements, medals, collection display | Medium |
| **Habitat / Living Quarters** | Personal space, furniture, rest | Medium |
| **Workshop** | Crafting tools and furniture | Medium-Low |
| **Town Gate / Entrance** | Optional atmospheric entry scene | Low (can be part of street) |

All of these are wide POV scenes.  
Town Main Street is the one the player will see most often and should feel the most alive.

---

## 5. What the Player Does at Each Location

### Town Main Street
- Pan along the street and see multiple building façades.
- Talk to roaming or standing NPCs.
- Accept and turn in general town tasks.
- Enter any of the buildings by tapping their doors or signs.
- Feel the daily life of the colony (different NPCs at different times, small ambient events).

### Hangar
- View and select the current ship.
- Launch a jumper run.
- See basic ship status and quick upgrades.
- Talk to the Mechanic NPC for ship-related tasks and dialogue.
- Return point after runs (with a short “welcome back” moment possible).

### Parts Store / Shop
- Browse and buy resources, gear, consumables, and special items.
- Sell excess materials.
- Talk to the Shopkeeper for stock tips, limited-time offers, or story tasks.
- Occasional special inventory that rotates.

### Gym / Upgrades
- Spend resources and/or currency on permanent upgrades (player stats, ship systems, skill trees).
- See clear progress and next costs.
- Talk to a trainer-style NPC who explains upgrades and gives related challenges.

### Greenhouse / Gardens
- View and manage garden plots.
- Plant, water, harvest.
- See growth timers and plant quality.
- Talk to the Gardener for seeds, advice, and farming tasks.
- Visual satisfaction of a thriving greenhouse that also appears on the planet surface.

### Bank
- Deposit / withdraw soft and hard currency.
- Access secure storage for valuable items.
- Talk to the Teller for financial tips or story-related banking tasks.
- Later: interest or special accounts if desired.

### Warehouse
- Organize and view bulk inventory.
- Move items between warehouse and active inventory.
- Possibly expand storage capacity (resource + time cost).

### Trophy / Medals Hall
- View earned medals, achievements, and collection progress.
- Feel pride and long-term goals.
- Occasional NPC or plaque that gives lore or new challenges.

### Habitat / Living Quarters
- Personalize the space with furniture.
- Rest or trigger short recovery / daily bonus.
- Private story moments or diary-style entries.
- A quiet place that feels like “home” inside the home.

### Workshop
- Craft tools, furniture, and special items from gathered resources.
- Unlock new recipes through story or progression.
- Talk to a crafting-focused NPC.

---

## 6. Characters / NPCs Needed (Starting Cast)

| NPC | Location | Personality Direction | Primary Job |
|-----|----------|-----------------------|-------------|
| **Shopkeeper** | Parts Store | Warm, slightly opportunistic, gossipy | Shop + town rumors |
| **Mechanic** | Hangar | Practical, encouraging, a bit gruff | Ship & launch tasks |
| **Gardener** | Greenhouse | Calm, nurturing, quietly wise | Farming introduction & tasks |
| **Trainer** | Gym | Energetic, motivational | Upgrade guidance & challenges |
| **Bank Teller** | Bank | Polite, precise, dry humor | Currency & storage |
| **Quest Giver / Town Guide** | Main Street | Welcoming, story-focused | Main narrative tasks |
| **Warehouse Keeper** | Warehouse | Organized, a little obsessive | Inventory management |
| **Townsfolk (2–4 generics)** | Main Street | Varied, light dialogue | Atmosphere & small tasks |
| **Optional later** | Various | — | Story arcs, visitors, specialists |

All NPCs should follow the same visual language:  
cute, readable proportions, charming expressions, simple but distinctive outfits (Shining-inspired cuteness adapted to the cosmic frontier).

---

## 7. Graphics Required

### Wide Scene Backgrounds (highest priority)
- Town Main Street – Day
- Town Main Street – Dusk (or Night)
- Hangar Interior
- Parts Store Interior
- Gym Interior
- Greenhouse Interior
- Bank Interior
- Warehouse Interior
- Trophy Hall Interior
- Habitat Interior
- Workshop Interior
- (Optional) Town Gate / Entrance

These must be significantly wider than a phone screen so panning feels good.

### Character Art
- Full-body or 3/4 view of each main NPC (ideally with a few expression or pose variants)
- 2–4 generic townsfolk
- Consistent style across all characters

### Supporting Props & Details
- Shop counters
- Display shelves / cases
- Garden plots and plants
- Lanterns and light sources
- Ship / rocket (parked versions)
- Doors, signs, and interactive objects
- Small ambient props that make scenes feel lived-in

### Planet Surface Markers
- Clear, readable versions of the Town, Farms, Hangar, etc. that sit on the rotatable planet and move with it.

### UI Overlays (minimal)
- Soft dialogue boxes
- Task markers
- Simple shop / upgrade panels that still feel like they belong inside the scene
- Exit / back control

---

## 8. How It All Appears and Plays Together (Example Session)

1. Player finishes a run and returns.
2. Lands on the Planet Sphere. The planet has a few more lights than last time.
3. Rotates to the Town and taps it.
4. Zoom → fade → music → arrives on Main Street at dusk.
5. Pans right, sees the Shopkeeper standing outside.
6. Talks → receives a task: “The Gardener needs star petals.”
7. Enters the Hangar, talks briefly to the Mechanic, launches a short run.
8. Returns with the petals.
9. Goes to the Greenhouse, gives the petals, plants something new, watches the first growth timer start.
10. Steps back onto Main Street. The Quest Giver has a new line acknowledging the help.
11. Player feels the town is a little more alive and has a clear reason to come back tomorrow.

That loop — place → person → task → action → return → reaction — is the heart of the system.

---

## 9. Design Rules Going Forward

- Never replace a place with a pure list menu if a POV scene can do the job.
- Every major system should have a face (an NPC).
- Scenes must be wide enough that the player wants to look around.
- Dialogue and tasks should be short, warm, and useful.
- The planet surface and the interior scenes must always stay visually consistent with each other.
- Leave empty space in every wide scene so future content can be added without rebuilding.

---

This is the full meaning of the Shining-in-the-Darkness menu system inside Cosmic Explorer:  
a living town of real places and real people that gives the player reasons to go out, come home, and keep building a life on their planet.
