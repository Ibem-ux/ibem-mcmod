import { addMoney, onEarn } from "../economy/currency.js";
import { QUESTS, QUEST_REWARDS } from "./questConfig.js";

const QUEST_PROGRESS_KEY = "aegis:quest_progress";
const QUEST_CLAIMED_KEY = "aegis:quest_claimed";

// Dynamic properties can only store primitives — serialize objects as JSON strings.
function readMap(player, key) {
  const raw = player.getDynamicProperty(key);
  if (typeof raw !== "string") return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function writeMap(player, key, obj) {
  player.setDynamicProperty(key, JSON.stringify(obj));
}

export function getQuestProgress(player, questId) {
  return readMap(player, QUEST_PROGRESS_KEY)[questId] || 0;
}

export function incrementQuestProgress(player, questId, amount = 1) {
  const quest = QUESTS[questId];
  if (!quest) return;
  const progress = readMap(player, QUEST_PROGRESS_KEY);
  const before = progress[questId] || 0;
  if (before >= quest.target) return; // already complete — stop tracking & prevent spam
  const after = before + amount;
  progress[questId] = after;
  writeMap(player, QUEST_PROGRESS_KEY, progress);
  if (after >= quest.target) {
    player.sendMessage(`Quest complete: ${quest.displayName}! Open the quest menu to claim.`);
  }
}

export function canClaimQuest(player, questId) {
  if (readMap(player, QUEST_CLAIMED_KEY)[questId]) return false;
  const quest = QUESTS[questId];
  if (!quest) return false;
  return getQuestProgress(player, questId) >= quest.target;
}

export function claimQuestReward(player, questId) {
  if (!canClaimQuest(player, questId)) return false;
  const claimed = readMap(player, QUEST_CLAIMED_KEY);
  claimed[questId] = true;
  writeMap(player, QUEST_CLAIMED_KEY, claimed); // mark claimed BEFORE paying (re-entrancy safe)
  const reward = QUEST_REWARDS[questId] || 0;
  if (reward > 0) addMoney(player, reward);
  return true;
}

// "Earn money" quest: progress whenever a player earns money.
onEarn((player, amount) => incrementQuestProgress(player, "earn_money", amount));