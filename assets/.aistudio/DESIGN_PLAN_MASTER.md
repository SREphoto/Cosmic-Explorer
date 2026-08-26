# Cosmic Explorer – Master Design Plan

**Created:** 2026-08-23  
**Status:** Living planning document  
**Priority Order (locked):**  
1. Home Screen (+ Naming)  
2. Town Menu System (sliding town + NPCs + story)  
3. Monetization  
4. Sim Planet System  
5. Farming & Trading (subset of Sim Planet)

---

## Overall Architecture Goals

- **Single coherent fantasy**: The player’s home planet is both the emotional “home” and the long-term management sandbox.
- **Progressive disclosure**: Start simple (beautiful Home Screen + town) → gradually reveal deeper sim systems.
- **Mobile-first, gesture-friendly**: Prefer swipe, pinch, long-press, and contextual taps over dense button grids.
- **Story-driven loops**: NPCs, tasks, and narrative beats should make management feel purposeful, not like a spreadsheet.
- **Future-proof for Phase 2**: Design data models and UI containers so visiting, trading, and light multiplayer can be added without rewriting the core.

### Key Risks to Watch
| Risk | Why it hurts | Mitigation |
|------|--------------|------------|
| Scope explosion | Sim + story + monetization + future multiplayer | Strict priority order + vertical slices |
| Two games feeling disconnected | Jumper vs planet management | Strong visual & narrative bridges |
| Monetization feeling predatory | Long timers + pay-to-skip | Transparent value, free path always viable |
| UI becoming cluttered | Many systems on one planet | Layered zoom levels + progressive unlocks |
| Backend cost / complexity | Unique names + future social | Stick with Firebase until scale forces change |

### Helpful Foundations to Build Now
- Clear ownership of data (what lives on the planet vs what is run-only).
- Consistent visual language (planet view → town street → interior).
- Gesture vocabulary that can scale (swipe to move, pinch to zoom, long-press for context).
- Event / task system that both story and sim systems can feed into.

---

## Section 1 – Home Screen (+ Naming)

**Goal:** The first thing the player sees after login is their living, named planet. It must feel like *home* and already hint at future management depth.

### Planned Sub-Documents
- `DESIGN_HOME_SCREEN.md` – overall layout, camera, entry points
- `DESIGN_NAMING.md` – unique name flow, generator, edge cases
- `DESIGN_PLANET_VIEW.md` – how the planet is rendered and interacted with

### Forward-Looking Considerations (Sim Planet)
- The Home Screen camera and hotspot system will later become the top-level map for placing districts, buildings, and resource nodes.
- Leave empty “slots” or zoom levels that can later hold farming zones, industrial zones, etc.
- Name + founding date should be visible and feel permanent.

### UI / Gesture Direction
- Pinch-to-zoom between orbit view ↔ surface overview ↔ town.
- Swipe to rotate the planet or pan the surface.
- Tap hotspots (town, garden area, hangar, etc.).
- Long-press for quick info tooltips.
- Clean, minimal chrome – the planet itself is the UI.

### Potential Problems
- Making the planet view too static → feels like a menu background.
- Making it too interactive too early → overwhelms new players.
- Naming collisions or bad generated names → frustration on first session.

### Success Metrics (later)
- % of players who set a custom name
- Time spent on Home Screen before first run
- Clarity of “where do I go next?”

---

## Section 2 – Town Menu System (Sliding Town + NPCs + Story)

**Goal:** Replace abstract menus with a living street of buildings the player can walk/slide through. NPCs and tasks give the town a pulse and drive continued play.

### Planned Sub-Documents
- `DESIGN_TOWN_STREET.md` – layout, sliding mechanics, building list
- `DESIGN_NPC_AND_STORY.md` – characters, task system, narrative arcs
- `DESIGN_BUILDING_INTERIORS.md` – what happens when you enter Hangar, Gym, etc.

### Forward-Looking Considerations
- Buildings can later gain upgrade levels that visually change the street.
- NPCs can become the face of sim systems (farmer NPC for farming, trader for trading).
- Story tasks can unlock new sim features or planet zones.

### UI / Gesture Direction
- Horizontal swipe / drag to slide the street (momentum + snap).
- Tap building façade → enter.
- Swipe down or back gesture to exit interior → return to street.
- NPC speech bubbles and task markers that are tappable.
- Minimal persistent UI – let the environment speak.

### Potential Problems
- Sliding feel bad on different screen sizes / orientations.
- Too many buildings → street becomes a long boring scroll.
- Story feeling disconnected from the jumper runs.

### Success Metrics
- Buildings entered per session
- Story task completion rate
- Player retention after first town visit

---

## Section 3 – Monetization

**Goal:** Sustainable revenue that feels fair. Time + resource costs on upgrades, clear value on speed-ups and special gear, free path always possible.

### Planned Sub-Documents
- `DESIGN_MONETIZATION.md` – currency types, packs, speed-ups, ethics
- `DESIGN_UPGRADE_ECONOMY.md` – cost curves, timer lengths, construction queues

### Forward-Looking Considerations
- Design the economy so Phase 2 social features (raids, trading cosmetics, protection) can plug into the same currency and shop systems.
- Leave room for seasonal / battle-pass style tracks.

### Potential Problems
- Timers that feel punitive rather than strategic.
- Pay-to-win perception on the jumper side.
- Shop UI that breaks immersion in the story/town fantasy.

### Success Metrics
- Conversion rate, ARPDAU, retention of payers vs non-payers
- % of upgrades completed without spending

---

## Section 4 – Sim Planet System

**Goal:** Turn the Home Screen into a satisfying long-term management layer without losing the charm of the town and story.

### Planned Sub-Documents
- `DESIGN_SIM_PLANET.md` – core loop, districts, resources, events
- `DESIGN_PLANET_PROGRESSION.md` – unlock order, habitability, milestones

### Forward-Looking Considerations
- Everything built here must already live under the Home Screen camera system designed in Section 1.
- Data model should support later visitor views (what is public vs private).

### Potential Problems
- Complexity spike that drives away casual players.
- Management feeling like a second job instead of a cozy home.

---

## Section 5 – Farming & Trading (part of Sim Planet)

**Goal:** Deep, satisfying, visually rich farming and trading loops that feed both the story and the economy.

### Planned Sub-Documents
- `DESIGN_FARMING.md`
- `DESIGN_TRADING.md`

### Notes
- These are deliberately last so they can be shaped by the systems that come before them.
- Trading starts as NPC-only; player-to-player moves to Phase 2.

---

## Recommended Next Immediate Step

Create the first detailed design document:

**`DESIGN_HOME_SCREEN.md`**

It should cover:
- Visual hierarchy and camera levels
- Naming flow (unique via Firebase)
- Hotspots and entry points into town vs future sim districts
- Gesture set
- How the current header image is used (login + Home Screen)
- Explicit hooks for the later sim-planet layer

Would you like me to write that document next?
