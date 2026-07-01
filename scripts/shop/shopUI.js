import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { SHOP_ITEMS } from "./shopConfig.js";
import { hasEnough, removeMoney, addMoney, getBalance } from "../economy/currency.js";
import { countItem, removeItem, giveItem, hasSpaceFor } from "../util/inventory.js";

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "aegis:shop") {
    const player = event.sourceEntity;
    if (player) openShop(player);
  }
});

function parseQty(value) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

async function openShop(player) {
  const menu = new ActionFormData()
    .title("Aegis Shop")
    .body(`Your balance: ${getBalance(player)}`)
    .button("Buy")
    .button("Sell");
  const res = await menu.show(player);
  if (res.canceled) return;
  if (res.selection === 0) openBuyMenu(player);
  else if (res.selection === 1) openSellMenu(player);
}

async function openBuyMenu(player) {
  const items = Object.keys(SHOP_ITEMS);
  const form = new ModalFormData()
    .title("Buy Items")
    .dropdown("Select item", items.map(id => SHOP_ITEMS[id].displayName))
    .textField("Quantity", "Enter number to buy");
  const res = await form.show(player);
  if (res.canceled) return;

  const selectedItem = items[res.formValues[0]];
  const quantity = parseQty(res.formValues[1]);
  if (!selectedItem || quantity === null) {
    player.sendMessage("Invalid selection or quantity.");
    return;
  }

  const cfg = SHOP_ITEMS[selectedItem];
  const totalCost = cfg.buyPrice * quantity;

  if (!hasEnough(player, totalCost)) {
    player.sendMessage(`Not enough money. Need ${totalCost} coins.`);
    return;
  }
  if (!hasSpaceFor(player, selectedItem, quantity)) { // check BEFORE charging
    player.sendMessage("Not enough inventory space for that purchase.");
    return;
  }
  if (!removeMoney(player, totalCost)) {
    player.sendMessage("Transaction failed.");
    return;
  }
  const leftover = giveItem(player, selectedItem, quantity);
  if (leftover > 0) {
    addMoney(player, leftover * cfg.buyPrice); // defensive refund for anything that didn't fit
    player.sendMessage(`Partial delivery; refunded ${leftover} item(s).`);
  }
  const delivered = quantity - leftover;
  player.sendMessage(`Bought ${delivered} ${cfg.displayName} for ${delivered * cfg.buyPrice} coins.`);
}

async function openSellMenu(player) {
  const items = Object.keys(SHOP_ITEMS);
  const form = new ModalFormData()
    .title("Sell Items")
    .dropdown("Select item", items.map(id => SHOP_ITEMS[id].displayName))
    .textField("Quantity", "Enter number to sell");
  const res = await form.show(player);
  if (res.canceled) return;

  const selectedItem = items[res.formValues[0]];
  const quantity = parseQty(res.formValues[1]);
  if (!selectedItem || quantity === null) {
    player.sendMessage("Invalid selection or quantity.");
    return;
  }

  const cfg = SHOP_ITEMS[selectedItem];
  if (countItem(player, selectedItem) < quantity) {
    player.sendMessage(`Not enough ${cfg.displayName} to sell.`);
    return;
  }
  if (!removeItem(player, selectedItem, quantity)) { // remove first (anti-dupe)
    player.sendMessage("Transaction failed.");
    return;
  }
  const totalSell = cfg.sellPrice * quantity;
  addMoney(player, totalSell);
  player.sendMessage(`Sold ${quantity} ${cfg.displayName} for ${totalSell} coins.`);
}