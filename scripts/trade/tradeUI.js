import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { activeTrades } from "./tradeSession.js";
import { createTrade, getTrade, confirmTrade, cancelTrade } from "./tradeSession.js";
import { getBalance } from "../economy/currency.js";

function findPendingTradeForTarget(target) {
  for (const trade of activeTrades.values()) {
    if (trade.target.id === target.id && !trade.targetConfirmed) {
      return trade;
    }
  }
  return null;
}

// Temporary debug trigger - request trade via script event
// Usage: /scriptevent aegis:trade <targetPlayerName>
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "aegis:trade") {
    const requester = event.sourceEntity;
    if (!requester) return;
    
    const targetName = event.message;
    const players = world.getPlayers();
    const target = players.find(p => p.name === targetName);
    
    if (!target) {
      requester.sendMessage("Target player not found.");
      return;
    }
    
    const result = createTrade(requester, target);
    if (!result.success) {
      requester.sendMessage(result.message);
      return;
    }
    
    target.sendMessage(`${requester.name} wants to trade with you. Type /scriptevent aegis:tradeaccept to accept.`);
  }
});

// Accept trade
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "aegis:tradeaccept") {
    const target = event.sourceEntity;
    if (!target) return;
    
    // Find pending trade for this player
    const trade = findPendingTradeForTarget(target);
    if (!trade) {
      target.sendMessage("No pending trade found.");
      return;
    }
    
    // Open trade UI for both players
    target.sendMessage("Trade accepted. Escrow your items.");
    // Trade UI would open here in full implementation
  }
});