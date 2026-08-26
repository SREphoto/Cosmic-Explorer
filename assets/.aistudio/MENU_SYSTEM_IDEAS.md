# Cosmic Explorer – Visual Home-Town Menu System Ideas

Source: Shared conversation “Shining in the Darkness Menu System”  
https://grok.com/share/c2hhcmQtNA_47a8934c-6c5e-45eb-a883-eb7697a1f53b  
Captured: 2026-08-23

## Core Concept

Keep the 2D planet-orbiting jumper as the main gameplay loop.  
The home planet becomes a **visual town hub** that replaces (or heavily upgrades) the current modal-based menus.

When the player is not in a run, they are on their personal home planet / home town.

### Buildings = Menus

| Building          | Current / Proposed Function                  | Notes |
|-------------------|----------------------------------------------|-------|
| Hangar            | Ship selection, launch, rocket upgrades      | “Home is the hangar” |
| Medals Case / Trophy Hall | Achievements, medals, badges            | Visual display |
| Parts Store       | Buy/sell parts, resources                    | Shop |
| Gym               | Player / character upgrades & skills         | Upgrades |
| Garden            | Planting, harvesting, greenhouse             | Already partially exists |
| Bank              | Currency, diamonds, storage of valuables     | Money management |
| Warehouse         | General storage / inventory                  | Storage |
| (Future) Workshop | Crafting tools & furniture                   | Already in HomePlanetModal |
| (Future) Habitat  | Living quarters, furniture placement         | Already in HomePlanetModal |

### Interaction Model

- Horizontal sliding street of buildings (left / right).
- Buildings are graphical assets that slide into view.
- Tap / click a building → enter it.
- Entering a building switches to a new perspective / interior view (still 2D for now; possible 3D later).
- Concept art shown: “Planet Solara – Starwake” with hangar + town at dusk. Tagline: “Home is the hangar. Tap to wake on Hearth Row.”

## Relation to Current Code

Existing relevant files:

- `src/ui/HomePlanetModal.tsx` – already has tabs: HABITAT | GARDEN | VISUAL_GARDEN | STORAGE | WORKSHOP | SHOP | TRAVELER
- `src/ui/MainMenu.tsx`
- `src/ui/VisualGardenLayout.tsx`
- Sprite atlases for habitats, furniture, plants, etc.

The new direction is to evolve the tabbed modal into a **spatial, navigable town** rather than a list of tabs.

## Open Questions / Next Design Steps

1. Exact list of buildings and their priority order on the street.
2. How the sliding street is implemented (canvas? CSS scroll-snap? React state?).
3. Transition style when entering a building (zoom, fade, door animation, etc.).
4. Whether the town view itself is shown on a canvas or as a React UI layer.
5. How this coexists with the existing Main Menu and the run-start flow.
6. Naming: keep “Home Planet” or move toward “Hearth Row” / “Starwake” / “Planet Solara”?

## Status

- Ideas captured from public share.
- Full conversation may contain more detail (gated behind sign-in).
- Ready for design / implementation discussion.
