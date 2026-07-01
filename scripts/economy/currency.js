import { world } from "@minecraft/server";

const STARTING_BALANCE = 100;
const MONEY_OBJECTIVE = "money";

// Listeners notified when a player EARNS money (used by quests). Avoids importing quests here.
const earnListeners = [];
export function onEarn(fn) {
  earnListeners.push(fn);
}

function getOrCreateObjective() {
  let objective = world.scoreboard.getObjective(MONEY_OBJECTIVE);
  if (!objective) {
    objective = world.scoreboard.addObjective(MONEY_OBJECTIVE, "Money");
  }
  return objective;
}

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) {
    const player = event.player;
    try {
      const objective = getOrCreateObjective();
      const score = objective.getScore(player);
      if (score === undefined) {
        objective.setScore(player, STARTING_BALANCE); // starting balance does NOT count as "earned"
      }
    } catch {
      // Scoreboard not ready yet, will initialize on next spawn
    }
  }
});

function isValidAmount(amount) {
  return typeof amount === "number" && Number.isInteger(amount) && amount > 0;
}

export function getBalance(player) {
  try {
    const objective = getOrCreateObjective();
    const score = objective.getScore(player);
    return score !== undefined ? score : 0;
  } catch {
    return 0;
  }
}

export function addMoney(player, amount) {
  if (!isValidAmount(amount)) return false;
  try {
    const objective = getOrCreateObjective();
    const currentBalance = getBalance(player);
    objective.setScore(player, currentBalance + amount);
    for (const fn of earnListeners) {
      try { fn(player, amount); } catch {} // a listener error must not break the transaction
    }
    return true;
  } catch {
    return false;
  }
}

export function removeMoney(player, amount) {
  if (!isValidAmount(amount)) return false;
  try {
    const objective = getOrCreateObjective();
    const currentBalance = getBalance(player);
    if (currentBalance < amount) return false;
    objective.setScore(player, currentBalance - amount);
    return true;
  } catch {
    return false;
  }
}

export function hasEnough(player, amount) {
  if (!isValidAmount(amount)) return false;
  try {
    return getBalance(player) >= amount;
  } catch {
    return false;
  }
}