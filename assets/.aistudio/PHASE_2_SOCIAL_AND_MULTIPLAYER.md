# Cosmic Explorer – Phase 2: Social & Multiplayer Systems

**Status:** Parked – high-level direction only  
**Created:** 2026-08-23  
**Source:** Player direction (unique town names + future social features)

---

## Scope of Phase 2

This phase is intentionally deferred. It is **not** part of the current priority work (Home Screen → Town Menu System → Monetization → Sim Planet).

Phase 2 introduces persistent multiplayer social layers on top of the single-player / async foundation.

### Core Features (Future)

1. **Unique Town Names (Server-Authoritative)**
   - Already required for Phase 1 naming.
   - Will use existing Firebase backend unless a strong alternative is chosen later.
   - On claim: server checks uniqueness → accept or return suggestions.
   - Rename later: possible with cooldown or cost.

2. **Visiting Other Players’ Planets**
   - Public or invitation-based views of another player’s home planet / town.
   - Read-only or limited interaction at first.
   - Requires planet “public snapshot” or live presence system.

3. **Player-to-Player Trading**
   - Secure inventory / resource transfer.
   - Trade window UI.
   - Possible reputation or trust indicators.
   - Anti-scam / confirmation flows.

4. **Social Graph**
   - Friends list
   - Enemy / rival status
   - Blocking / privacy controls

5. **Defense / Attack Systems**
   - Light raids, defense events, or full PvP (tone still TBD).
   - Strong protection for new players.
   - Clear stakes that feel meaningful but not punishing.
   - Anti-grief and moderation tools required.

---

## Research Direction (When Phase 2 Begins)

- Study successful async + light multiplayer colony/sims (e.g. how Animal Crossing handles visiting, how some mobile colony games handle raids).
- Backend: continue evaluating Firebase real-time + security rules vs dedicated game server if scale demands it.
- Monetization opportunities: visiting boosts, raid protection, exclusive trade cosmetics, alliance systems.
- Safety & moderation: reporting, temporary bans, planet privacy settings.

---

## Open Design Questions (Parked)

- How aggressive should attack/defense feel?
- Invitation-only vs open planet visiting?
- Should trading be real-time or mail/async?
- How much of the sim-planet state is visible to visitors?
- Integration with the existing story / NPC systems.

---

## Relationship to Current Priorities

Phase 1 (current focus) must ship solid single-player loops first:
1. Home Screen + naming
2. Town view / sliding menu + NPC story
3. Monetization
4. Sim planet systems
5. Farming & trading (single-player / NPC)

Phase 2 builds on top of a stable, fun core.

---

*This document exists only as a placeholder for future work. No implementation is planned until Phase 1 priorities are complete and the player explicitly green-lights Phase 2.*
