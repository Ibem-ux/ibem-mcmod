export const QUESTS = {
  "mine_stone": {
    id: "mine_stone",
    displayName: "Mine 20 Stone",
    target: 20,
    criteria: { type: "mine", block: "minecraft:stone" }
  },
  "kill_zombies": {
    id: "kill_zombies",
    displayName: "Kill 10 Zombies",
    target: 10,
    criteria: { type: "kill", entity: "minecraft:zombie" }
  },
  "earn_money": {
    id: "earn_money",
    displayName: "Earn 200 Money",
    target: 200,
    criteria: { type: "balance" }
  }
};

export const QUEST_REWARDS = {
  "mine_stone": 50,
  "kill_zombies": 100,
  "earn_money": 25
};