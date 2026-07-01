import { world } from "@minecraft/server";
import { getJob } from "./jobManager.js";
import { addMoney } from "../economy/currency.js";

const LUMBERJACK_REWARDS = {
  "minecraft:oak_log": 2,
  "minecraft:spruce_log": 2,
  "minecraft:birch_log": 2,
  "minecraft:jungle_log": 2,
  "minecraft:acacia_log": 2,
  "minecraft:dark_oak_log": 2,
  "minecraft:mangrove_log": 2,
  "minecraft:cherry_log": 2,
  "minecraft:pale_oak_log": 2
};

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  
  if (getJob(player) !== "lumberjack") {
    return;
  }
  
  const blockTypeId = event.brokenBlockPermutation.type.id;
  
  if (blockTypeId in LUMBERJACK_REWARDS) {
    const reward = LUMBERJACK_REWARDS[blockTypeId];
    addMoney(player, reward);
  }
});