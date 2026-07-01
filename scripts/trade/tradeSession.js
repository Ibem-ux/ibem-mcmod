import { addMoney } from "../economy/currency.js";
import { getJob } from "../jobs/jobManager.js";

// Trade session state storage
export const activeTrades = new Map();

export function createTrade(requester, targetPlayer) {
  if (getJob(requester) !== "none" && getJob(requester) !== undefined) {
    return { success: false, message: "Finish your current job before trading" };
  }
  
  const tradeId = `${requester.id}-${Date.now()}`;
  activeTrades.set(tradeId, {
    requester,
    target: targetPlayer,
    requesterEscrow: { items: [], money: 0 },
    targetEscrow: { items: [], money: 0 },
    requesterConfirmed: false,
    targetConfirmed: false
  });
  
  return { success: true, tradeId };
}

export function getTrade(tradeId) {
  return activeTrades.get(tradeId);
}

export function cancelTrade(tradeId) {
  const trade = activeTrades.get(tradeId);
  if (!trade) return false;
  
  // Return escrowed items to players
  returnEscrowToPlayer(trade.requester, trade.requesterEscrow);
  returnEscrowToPlayer(trade.target, trade.targetEscrow);
  
  activeTrades.delete(tradeId);
  return true;
}

export function confirmTrade(tradeId, player) {
  const trade = activeTrades.get(tradeId);
  if (!trade) return false;
  
  if (player.id === trade.requester.id) {
    trade.requesterConfirmed = true;
  } else if (player.id === trade.target.id) {
    trade.targetConfirmed = true;
  } else {
    return false;
  }
  
  return trySettleTrade(trade);
}

function trySettleTrade(trade) {
  if (!trade.requesterConfirmed || !trade.targetConfirmed) {
    return false;
  }
  
  const tradeId = tradeIdForTrade(trade);
  
  // Revalidate escrow before settling
  if (!validateEscrow(trade.requester, trade.requesterEscrow) ||
      !validateEscrow(trade.target, trade.targetEscrow)) {
    // Escrow invalid - cancel trade
    cancelTrade(tradeId);
    return false;
  }
  
  // Perform atomic swap
  // Give requester's target their escrow items
  giveEscrowToPlayer(trade.target, trade.requesterEscrow);
  // Give target's requester their escrow items
  giveEscrowToPlayer(trade.requester, trade.targetEscrow);
  
  activeTrades.delete(tradeId);
  return true;
}

function tradeIdForTrade(trade) {
  for (const [id, t] of activeTrades) {
    if (t === trade) return id;
  }
  return null;
}

function validateEscrow(player, escrow) {
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return false;
  
  // Check items
  for (const escrowItem of escrow.items) {
    if (inventory.container.find(escrowItem) === undefined) {
      return false;
    }
  }
  
  return true;
}

function returnEscrowToPlayer(player, escrow) {
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;
  
  // Return items
  for (const item of escrow.items) {
    inventory.container.addItem(item);
  }
  
  // Return money
  if (escrow.money > 0) {
    addMoney(player, escrow.money);
  }
}

function giveEscrowToPlayer(player, escrow) {
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;
  
  // Give items
  for (const item of escrow.items) {
    inventory.container.addItem(item);
  }
  
  // Give money
  if (escrow.money > 0) {
    addMoney(player, escrow.money);
  }
}