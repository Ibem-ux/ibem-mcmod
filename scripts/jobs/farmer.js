import { world } from "@minecraft/server";
import { getJob } from "./jobManager.js";
import { addMoney } from "../economy/currency.js";

const FARMER_REWARDS = {
  "minecraft:wheat": 2,
  "minecraft:carrots": 3,
  "minecraft:potatoes": 3,
  "minecraft:beetroot": 2
};

// Bedrock crops use the "growth" state (0–7), NOT "age".
function isMatureCrop(permutation) {
  return permutation.getState("growth") === 7;
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  if (getJob(player) !== "farmer") return;

  const blockTypeId = event.brokenBlockPermutation.type.id;
  if (blockTypeId in FARMER_REWARDS && isMatureCrop(event.brokenBlockPermutation)) {
    addMoney(player, FARMER_REWARDS[blockTypeId]);
  }
});