import { world } from "@minecraft/server";
import { getJob } from "./jobManager.js";
import { addMoney } from "../economy/currency.js";
import { incrementQuestProgress } from "../quests/questManager.js";

const HUNTER_REWARDS = {
  "minecraft:zombie": 5,
  "minecraft:skeleton": 5,
  "minecraft:creeper": 10,
  "minecraft:spider": 3
};

world.afterEvents.entityDie.subscribe((event) => {
  const killer = event.damageSource?.damagingEntity;
  // Only players earn rewards / quest progress — a mob killing a mob must not misfire.
  if (!killer || killer.typeId !== "minecraft:player") return;

  const deadTypeId = event.deadEntity.typeId;

  if (deadTypeId === "minecraft:zombie") {
    incrementQuestProgress(killer, "kill_zombies");
  }

  if (getJob(killer) !== "hunter") return;
  if (deadTypeId in HUNTER_REWARDS) {
    addMoney(killer, HUNTER_REWARDS[deadTypeId]);
  }
});