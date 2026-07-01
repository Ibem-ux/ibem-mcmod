import { ItemStack } from "@minecraft/server";

function getContainer(player) {
  const inv = player.getComponent("minecraft:inventory");
  return inv?.container ?? null;
}

// Total count of a given item type the player holds.
export function countItem(player, typeId) {
  const container = getContainer(player);
  if (!container) return 0;
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === typeId) total += item.amount;
  }
  return total;
}

// Remove `amount` of a type. Returns true only if the FULL amount was removed (all-or-nothing).
export function removeItem(player, typeId, amount) {
  const container = getContainer(player);
  if (!container) return false;
  if (countItem(player, typeId) < amount) return false; // don't partially remove

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== typeId) continue;
    if (item.amount <= remaining) {
      remaining -= item.amount;
      container.setItem(i, undefined); // clear slot
    } else {
      item.amount -= remaining;
      container.setItem(i, item);
      remaining = 0;
    }
  }
  return remaining === 0;
}

// Can the player receive `amount` of an item without overflow?
export function hasSpaceFor(player, typeId, amount) {
  const container = getContainer(player);
  if (!container) return false;
  const maxStack = new ItemStack(typeId, 1).maxAmount;
  let capacity = 0;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) capacity += maxStack;
    else if (item.typeId === typeId) capacity += (maxStack - item.amount);
  }
  return capacity >= amount;
}

// Give `amount`, splitting into max-size stacks. Returns leftover that didn't fit (0 if all placed).
export function giveItem(player, typeId, amount) {
  const container = getContainer(player);
  if (!container) return amount;
  const maxStack = new ItemStack(typeId, 1).maxAmount;
  let remaining = amount;
  while (remaining > 0) {
    const stackSize = Math.min(maxStack, remaining);
    const leftover = container.addItem(new ItemStack(typeId, stackSize));
    if (leftover) return remaining - (stackSize - leftover.amount);
    remaining -= stackSize;
  }
  return 0;
}