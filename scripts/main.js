import { world } from "@minecraft/server";
import "./economy/currency.js";
import "./jobs/miner.js";
import "./jobs/farmer.js";
import "./jobs/hunter.js";
import "./jobs/lumberjack.js";
import "./shop/shopUI.js";
import "./trade/tradeUI.js";
import "./quests/questUI.js";
import "./auction/auctionUI.js";

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) {
    event.player.sendMessage("[Aegis Economy] Behavior pack loaded");
  }
});