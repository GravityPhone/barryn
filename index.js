const express = require('express');
const db = require('./db');
const shop = require('./shop'); // Import the shop.js file

let player = null;

const app = express();
app.use(express.static(__dirname));
const port = 3001; // or any other free port

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const loadPlayer = async () => {
  player = await db.getPlayer();
  if (!player) {
    player = {
      id: 1,
      level: 1,
      gold: 0,
      experience: 100, // Set experience to 100 for new players
      upgrades: {
        xpGain: 0,
        goldGain: 0,
        autoAdventure: 0
      },
      inventory: [] // Initialize the inventory property
    };
    await db.updatePlayer(player);
    updateStats(); // Update the stats immediately after a new player is created
  }
};

db.connect()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening at http://0.0.0.0:${port}`);
      loadPlayer().then(() => {
        setInterval(() => {
          gainExperienceOverTime();
        }, 1000);
      });
    });
  })
  .catch(err => console.error(err));

// Removed the duplicate app.listen call

app.get('/adventure', async (req, res) => {
  const goldGain = 5 * (1 + player.upgrades.goldGain);
  const experienceGain = player.level * 10 * (1 + player.upgrades.xpGain); // Multiply the base experience gain by the player's level
  player.gold += goldGain;
  player.experience += experienceGain;
  await db.updatePlayer(player);
  res.send(player);
});

app.post('/buy/:item', async (req, res) => { 
  const item = shop.inventory.find(i => i.name === req.params.item);
  if (item) {
    if (!player) {
      await loadPlayer();
    }
    shop.purchaseItem(player, item);
    await db.updatePlayer(player);
    res.send(player);
  } else {
    res.status(404).send({ error: 'Item not found' });
  }
});

app.get('/toggle-auto-adventure', async (req, res) => {
  player.autoAdventure = !player.autoAdventure;
  await db.updatePlayer(player);
  res.send({ autoAdventure: player.autoAdventure });
});

setInterval(async () => {
  if (player.autoAdventure) {
    const goldGain = 5 * (1 + player.upgrades.goldGain);
    const experienceGain = 10 * (1 + player.upgrades.xpGain);
    player.gold += goldGain;
    player.experience += experienceGain;
    await db.updatePlayer(player);
  }
}, 3000); // Trigger the adventure action every 3 seconds
const gainExperienceOverTime = async () => {
  player.experience += player.level * (1 + player.upgrades.xpGain); // Multiply the base experience gain by the player's level
  await db.updatePlayer(player);
};

// Removed the separate setInterval call for gainExperienceOverTime

app.get('/experience', async (req, res) => {
  if (!player) {
    await loadPlayer();
  }
  res.send({ experience: player.experience });
});

// Add a '/gold' endpoint that returns the current gold amount
app.get('/gold', async (req, res) => {
  res.send({ gold: player.gold });
});

app.get('/level', async (req, res) => {
  const xpToNextLevel = ((player.level + 1) * 100) * Math.pow(1.25, player.level + 1) - player.experience;
  res.send({ level: player.level, xpToNextLevel: xpToNextLevel });
});

app.get('/items', async (req, res) => {
  const items = await db.getItems();
  res.send(items);
});

// New route for fetching the inventory
app.get('/inventory', async (req, res) => {
  const inventory = await db.getInventory();
  res.send(inventory);
});

app.post('/sell/:item', async (req, res) => {
  const item = shop.inventory.find(i => i.name === req.params.item);
  if (item && player.inventory.includes(item.name)) {
    player.gold += item.sellPrice; // Increase the player's gold by the sell price of the item
    await db.removeFromInventory(item.name); // Remove the item from the inventory
    applyInventoryEffects(); // Apply the effects of the remaining items in the inventory
    await db.updatePlayer(player);
    res.send(player);
  } else {
    res.status(404).send({ error: 'Item not found in inventory' });
  }
});

app.post('/sell/:item', async (req, res) => {
  const item = shop.inventory.find(i => i.name === req.params.item);
  if (item && player.inventory.includes(item.name)) {
    player.gold += item.sellPrice; // Increase the player's gold by the sell price of the item
    await db.removeFromInventory(item.name); // Remove the item from the inventory
    applyInventoryEffects(); // Apply the effects of the remaining items in the inventory
    await db.updatePlayer(player);
    res.send(player);
  } else {
    res.status(404).send({ error: 'Item not found in inventory' });
  }
});

// New route for selling items
app.post('/sell/:item', async (req, res) => {
  const item = shop.inventory.find(i => i.name === req.params.item);
  if (item && player.inventory.includes(item.name)) {
    player.gold += item.sellPrice; // Increase the player's gold by the sell price of the item
    await db.removeFromInventory(item.name); // Remove the item from the inventory
    applyInventoryEffects(); // Apply the effects of the remaining items in the inventory
    await db.updatePlayer(player);
    res.send(player);
  } else {
    res.status(404).send({ error: 'Item not found in inventory' });
  }
});

// New function to apply the effects of the items in the inventory
function applyInventoryEffects() {
  // Get the player's inventory from the database
  const inventory = db.getInventory();

  // Apply the effects of each item in the inventory to the player's stats
  inventory.forEach(item => {
    // Apply the effect of the item to the player's stats
    player.level += item.level;
    player.gold += item.gold;
    player.experience += item.experience;
    // ...
  });
}

// New function to apply the effects of the items in the inventory
function applyItemEffects() {
  // Get the player's inventory from the database
  const inventory = db.getInventory();

  // Apply the effects of each item in the inventory to the player's stats
  inventory.forEach(item => {
    // Apply the effect of the item to the player's stats
    player.level += item.level;
    player.gold += item.gold;
    player.experience += item.experience;
    // ...
  });
}

const purchaseUpgrade = async (upgradeType) => {
  if (player.gold >= 100) {
    player.gold -= 100;
    player.upgrades[upgradeType]++;
    await db.updatePlayer(player);
  }
};

let autoAdventureInterval;
