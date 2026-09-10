import type { EnemyState } from "@/types";

// Standard training-dummy enemy: level 90, 10% resistance to every element.
export const testEnemy: EnemyState = {
  id: "test-dummy",
  name: "Training Dummy",
  level: 90,
  resistances: {
    pyro: 0.1,
    hydro: 0.1,
    electro: 0.1,
    cryo: 0.1,
    anemo: 0.1,
    geo: 0.1,
    dendro: 0.1,
    physical: 0.1,
  },
};
