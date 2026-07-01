import { world } from "@minecraft/server";
import { addMoney, removeMoney } from "../economy/currency.js";

// Auction storage in world dynamic properties
const LISTINGS_KEY = "aegis:auction_listings";
const MIN_BID_INCREMENT = 1;

export function getListings() {
  return world.getDynamicProperty(LISTINGS_KEY) || {};
}

export function createListing(seller, itemStack, basePrice) {
  const listings = getListings();
  const listingId = `${seller.id}-${Date.now()}`;
  
  listings[listingId] = {
    sellerId: seller.id,
    itemTypeId: itemStack.typeId,
    itemAmount: itemStack.amount,
    basePrice,
    currentBid: basePrice,
    highestBidder: seller.id,
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    status: "active"
  };
  
  // Remove item from seller's inventory immediately (escrow)
  const inventory = seller.getComponent("minecraft:inventory");
  if (inventory && inventory.container) {
    const found = inventory.container.find(itemStack);
    if (found) {
      inventory.container.removeItem(found, itemStack.amount);
    }
  }
  
  return listingId;
}

export function placeBid(player, listingId, bidAmount) {
  const listings = getListings();
  const listing = listings[listingId];
  
  if (!listing || listing.status !== "active") {
    return { success: false, message: "Listing not found or not active." };
  }
  
  if (listing.sellerId === player.id) {
    return { success: false, message: "Cannot bid on your own listing." };
  }
  
  if (bidAmount < listing.currentBid + MIN_BID_INCREMENT) {
    return { success: false, message: "Bid too low." };
  }
  
  // Deduct money from bidder (escrow)
  if (!removeMoney(player, bidAmount)) {
    return { success: false, message: "Not enough money." };
  }
  
  // Refund previous highest bidder
  if (listing.highestBidder !== listing.sellerId) {
    const prevBidder = world.getPlayers().find(p => p.id === listing.highestBidder);
    if (prevBidder) {
      addMoney(prevBidder, listing.currentBid);
    }
  }
  
  listing.currentBid = bidAmount;
  listing.highestBidder = player.id;
  
  return { success: true };
}