import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getListings, createListing, placeBid } from "./auctionStore.js";

// Temporary debug trigger - open auction via script event
// Usage: /scriptevent aegis:auction
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "aegis:auction") {
    const player = event.sourceEntity;
    if (player) {
      openAuctionMenu(player);
    }
  }
});

async function openAuctionMenu(player) {
  // Placeholder - full UI would show listings, allow bidding, etc.
  player.sendMessage("Auction House opened. Feature in development.");
}