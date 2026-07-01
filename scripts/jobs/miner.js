import { world, system } from "@minecraft/server";
import { getJob, setJob } from "./jobManager.js";
import { addMoney } from "../economy/currency.js";
import { incrementQuestProgress } from "../quests/questManager.js";

const MINER_REWARDS = {
  "minecraft:stone": 1,
  "minecraft:coal_ore": 3,
  "minecraft:iron_ore": 5,
  "minecraft:diamond_ore": 15
};

// Temporary debug trigger: /scriptevent aegis:setjob <miner|farmer|hunter|lumberjack|none>
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "aegis:setjob") return;
  const player = event.sourceEntity;
  if (!player) return;
  const job = (event.message || "").trim();
  if (setJob(player, job)) {
    player.sendMessage(`Job set to: ${job}`);
  } else {
    player.sendMessage(`Invalid job: "${job}". Valid: none, miner, farmer, hunter, lumberjack`);
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const blockTypeId = event.brokenBlockPermutation.type.id;

  // Quest: stone mining (tracked regardless of job)
  if (blockTypeId === "minecraft:stone") {
    incrementQuestProgress(player, "mine_stone");
  }

  if (getJob(player) !== "miner") return;
  if (blockTypeId in MINER_REWARDS) {
    addMoney(player, MINER_REWARDS[blockTypeId]);
  }
});