export const SHOP_ITEMS = {
  "minecraft:apple": {
    id: "minecraft:apple",
    displayName: "Apple",
    buyPrice: 10,
    sellPrice: 5
  },
  "minecraft:bread": {
    id: "minecraft:bread",
    displayName: "Bread",
    buyPrice: 15,
    sellPrice: 8
  },
  "minecraft:cooked_beef": {
    id: "minecraft:cooked_beef",
    displayName: "Steak",
    buyPrice: 20,
    sellPrice: 12
  },
  "minecraft:diamond": {
    id: "minecraft:diamond",
    displayName: "Diamond",
    buyPrice: 100,
    sellPrice: 50
  }
};

function validatePrices(obj) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const item = obj[key];
    if (item.buyPrice <= item.sellPrice) {
      throw new Error(`Invalid prices for ${item.displayName}: buyPrice must be > sellPrice`);
    }
  }
}

validatePrices(SHOP_ITEMS);