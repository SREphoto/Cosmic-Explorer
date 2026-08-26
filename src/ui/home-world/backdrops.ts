/**
 * Painted scene backdrops keyed by SceneId. Scenes without an entry (or
 * while the image is still decoding) keep their procedural rendering.
 */
import street from '../../assets/art/scene-street-dusk.png';
import hangar from '../../assets/art/scene-hangar.png';
import greenhouse from '../../assets/art/scene-greenhouse.png';
import shop from '../../assets/art/scene-shop.png';
import gym from '../../assets/art/scene-gym.png';
import bank from '../../assets/art/scene-bank.png';

export const SCENE_BACKDROPS: Record<string, string> = {
  street,
  hangar,
  greenhouse,
  shop,
  gym,
  bank,
};
