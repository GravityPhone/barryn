const db = require('./db');
const inventory = [
  {
    name: 'Club',
    cost: 500,
    effect: { xpGain: 0.1 } // +10% experience per adventure
  }
  // More items can be added here
];

async function purchaseItem(player, item) {
  if (player.inventory && player.inventory.includes(item.name)) {
    console.error('Item already in inventory:', item.name);
    return;
  }
  if (player.gold >= item.cost) {
    const items = await db.getItems();
    const itemInDb = items.find(i => i.name === item.name);
    if (itemInDb) {
      player.gold -= item.cost;
      player.inventory.push(item);
      // The effect of the item should be applied to the player here
    } else {
      console.error('Item not found in database:', item.name);
    }
  } else {
    console.error('Not enough gold to purchase item:', item.name);
  }
}

module.exports = { inventory, purchaseItem };
