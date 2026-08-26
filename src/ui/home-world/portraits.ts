/**
 * Generated NPC portrait art, keyed by NPC id. NPCs without a portrait
 * gracefully fall back to their emoji icon.
 */
import juno from '../../assets/art/npc-juno.png';
import townsfolk1 from '../../assets/art/npc-townsfolk1.png';
import townsfolk2 from '../../assets/art/npc-townsfolk2.png';
import mechanic from '../../assets/art/npc-mechanic.png';
import shopkeeper from '../../assets/art/npc-shopkeeper.png';
import gardener from '../../assets/art/npc-gardener.png';
import trainer from '../../assets/art/npc-trainer.png';
import teller from '../../assets/art/npc-teller.png';

export const NPC_PORTRAITS: Record<string, string> = {
  quest_giver: juno,
  townsfolk_1: townsfolk1,
  townsfolk_2: townsfolk2,
  mechanic: mechanic,
  shopkeeper: shopkeeper,
  gardener: gardener,
  trainer: trainer,
  teller: teller,
};
