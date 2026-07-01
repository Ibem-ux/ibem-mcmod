import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { QUESTS, QUEST_REWARDS } from "./questConfig.js";
import { getQuestProgress, canClaimQuest, claimQuestReward } from "./questManager.js";

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "aegis:quests") {
    const player = event.sourceEntity;
    if (player) openQuestMenu(player);
  }
});

async function openQuestMenu(player) {
  const questKeys = Object.keys(QUESTS);
  const menu = new ActionFormData().title("Quests").body("Select a quest to view or claim");

  for (const questId of questKeys) {
    const quest = QUESTS[questId];
    const progress = Math.min(getQuestProgress(player, questId), quest.target);
    let suffix = "";
    if (canClaimQuest(player, questId)) suffix = " (CLAIM!)";
    else if (progress >= quest.target) suffix = " (Claimed)";
    menu.button(`${quest.displayName}: ${progress}/${quest.target}${suffix}`);
  }

  const result = await menu.show(player);
  if (result.canceled) return;

  const questId = questKeys[result.selection];
  if (canClaimQuest(player, questId)) {
    const reward = QUEST_REWARDS[questId] || 0;
    if (claimQuestReward(player, questId)) {
      player.sendMessage(`Claimed reward: ${reward} coins!`);
    }
  } else {
    player.sendMessage("Quest not complete or already claimed.");
  }
}