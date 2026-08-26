# Cosmic Explorer – Core Interaction Model

**Status:** Locked based on player direction (2026-08-23)  
**References:** Shining in the Darkness wide scenes + planetary sphere Home Screen

---

## 1. Planet Sphere (Home Screen)

- The planet fills most of the screen.
- It behaves as a rotatable spherical object.
- Player drags to spin it freely on multiple axes.
- All major locations are **physically attached** to the planet surface:
  - Town
  - Gardens / Farms
  - Future sim districts (industrial, residential, research, etc.)
- When the planet rotates, the locations move with it.
- Tapping a location begins the entry transition.

## 2. Entry Transition (Location → Scene)

Sequence (always the same):

1. Player taps a location on the sphere.
2. Camera zooms in toward that point on the planet surface.
3. Screen fades to black.
4. Light, location-appropriate music starts playing.
5. Darkness fades up, revealing the wide side-scrolling POV scene.

This creates a consistent, cinematic feeling every time the player enters a place.

## 3. Town & Building Scenes (Side-Scrolling POV)

- Inspired directly by *Shining in the Darkness*.
- Every town street and every building interior is a **wide scene** — wider than the visible screen.
- Player character is **never shown**. This is pure first-person / POV.
- Player controls a camera that can:
  - Pan left and right freely (primary movement)
  - Look up and down a limited amount (for atmosphere and discovery)
- NPCs, counters, doors, objects, and story triggers are placed along the width of the scene.
- Because scenes are wide, we can later extend any building or street section to the left or right without redesigning the existing space.

## 4. Returning to the Planet

- Clear “Exit” or swipe/back gesture.
- Reverse of the entry transition (or a simpler fade) returns the player to the rotatable planet sphere.

## 5. Art Direction Note

- Visual style should capture the **charm and cuteness** of Shining in the Darkness while living in the existing Cosmic Explorer cosmic setting.
- Friendly characters, readable environments, strong sense of place, and a cozy-yet-adventurous feeling.

---

## Design Implications

- Home Screen and all location scenes share one coherent navigation language.
- The planet sphere is the permanent top-level map for the entire sim-planet layer.
- Side-scrolling POV scenes give us expandable “rooms” for story, NPCs, shops, upgrades, and management.
- Gesture set stays simple and consistent across the whole game.

This model is now the foundation for the Home Screen and Town design documents.
