let player = {}; // Define player in the global scope

document.getElementById('adventure-button').addEventListener('click', async () => {
  try {
    await fetch('/adventure');
    // Removed the line that updates the player data on the client side
  } catch (error) {
    console.error('Failed to fetch data from /adventure:', error);
  }
});

document.getElementById('auto-adventure-button').addEventListener('click', async () => {
  try {
    const response = await fetch('/toggle-auto-adventure');
    const data = await response.json();
    if (data.autoAdventure) {
      document.getElementById('auto-adventure-button').textContent = 'Auto-Adventure (ON)';
    } else {
      document.getElementById('auto-adventure-button').textContent = 'Auto-Adventure (OFF)';
    }
    document.getElementById('auto-adventure-button').disabled = false;
  } catch (error) {
    console.error('Failed to toggle auto adventure:', error);
  }
});

// Fetch items from the server and add them to the shop
const fetchItems = async () => {
  try {
    const response = await fetch('/items');
    const items = await response.json();
    const shopDiv = document.getElementById('shop');
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.textContent = `${item.name} (cost: ${item.cost} gold)`;
      const buyButton = document.createElement('button');
      buyButton.textContent = 'Buy';
      buyButton.addEventListener('click', async () => {
        try {
          await fetch(`/buy/${item.name}`);
          updateStats();
        } catch (error) {
          console.error('Failed to buy item:', error);
        }
      });
      itemDiv.appendChild(buyButton);
      shopDiv.appendChild(itemDiv);
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
  }
};

fetchItems();
fetchInventory(); // Fetch the inventory when the page loads

// New function to fetch and display the inventory
async function fetchInventory() {
  try {
    const response = await fetch('/inventory');
    const inventory = await response.json();
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear the inventory list
    inventory.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.name;
      const sellButton = document.createElement('button');
      sellButton.textContent = 'Sell';
      sellButton.addEventListener('click', async () => {
        try {
          await fetch(`/sell/${item.name}`, { method: 'POST' });
          updateStats();
          fetchInventory(); // Fetch the inventory again after selling an item
        } catch (error) {
          console.error('Failed to sell item:', error);
        }
      });
      listItem.appendChild(sellButton);
      inventoryList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
  }
}

// New function to fetch and display the inventory
async function fetchInventory() {
  try {
    const response = await fetch('/inventory');
    const inventory = await response.json();
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear the inventory list
    inventory.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.name;
      const sellButton = document.createElement('button');
      sellButton.textContent = 'Sell';
      sellButton.addEventListener('click', async () => {
        try {
          await fetch(`/sell/${item.name}`);
          updateStats();
          fetchInventory(); // Fetch the inventory again after selling an item
        } catch (error) {
          console.error('Failed to sell item:', error);
        }
      });
      listItem.appendChild(sellButton);
      inventoryList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
  }
}
// New function to fetch and display the inventory
async function fetchInventory() {
  try {
    const response = await fetch('/inventory');
    const inventory = await response.json();
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear the inventory list
    inventory.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.name;
      const sellButton = document.createElement('button');
      sellButton.textContent = 'Sell';
      sellButton.addEventListener('click', async () => {
        try {
          await fetch(`/sell/${item.name}`, { method: 'POST' });
          updateStats();
          fetchInventory(); // Fetch the inventory again after selling an item
        } catch (error) {
          console.error('Failed to sell item:', error);
        }
      });
      listItem.appendChild(sellButton);
      inventoryList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
  }
}

// The updateStats function from index.js has been added here
const updateStats = async () => {
  fetchInventory(); // Fetch the inventory whenever the stats are updated
  try {
    const levelResponse = await fetch('/level');
    const levelData = await levelResponse.json();
    player.level = levelData.level;
    const experienceResponse = await fetch('/experience');
    const experienceData = await experienceResponse.json();
    player.experience = experienceData.experience;
    if (player && player.gold && player.experience && player.level) {
      document.getElementById('gold').textContent = player.gold.toFixed(2);
      document.getElementById('experience').textContent = player.experience.toFixed(2);
      document.getElementById('level').textContent = player.level;
      const xpToNextLevel = ((player.level + 2) * 100) * Math.pow(1.25, player.level + 2) - player.experience;
      document.getElementById('xp-to-next-level').textContent = xpToNextLevel.toFixed(2);
    } else {
      console.error('Failed to update stats:', player);
    }
  } catch (error) {
    console.error('Failed to fetch level or experience:', error);
  }
};
// Increase the interval between fetches and updates to 2 seconds
setInterval(async () => {
  // Added a delay before fetching and updating the experience
  setTimeout(async () => {
    try {
      const response = await fetch('/experience');
      const data = await response.json();
      document.getElementById('experience').textContent = data.experience.toFixed(2);
    } catch (error) {
      console.error('Failed to fetch experience:', error);
    }
    // Fetch and update gold
    try {
      const goldResponse = await fetch('/gold');
      const goldData = await goldResponse.json();
      document.getElementById('gold').textContent = goldData.gold.toFixed(2);
    } catch (error) {
      console.error('Failed to fetch gold:', error);
    }
    // Fetch and update level
    try {
      const levelResponse = await fetch('/level');
      const levelData = await levelResponse.json();
      document.getElementById('level').textContent = levelData.level;
      updateXpToNextLevel(levelData.level); // Call the new function whenever the level is updated
    } catch (error) {
      console.error('Failed to fetch level:', error);
    }
    updateStats();
    
    // New function to calculate and update the "XP to next level"
    function updateXpToNextLevel(level) {
      const xpToNextLevel = ((level + 1) * 100) * Math.pow(1.25, level + 1) - player.experience;
      document.getElementById('xp-to-next-level').textContent = xpToNextLevel.toFixed(2);
    }
  }, 500);
}, 2000);
document.getElementById('buy-club-button').addEventListener('click', async () => {
  try {
    await fetch('/buy/Club', { method: 'POST' });
    updateStats();
  } catch (error) {
    console.error('Failed to buy club:', error);
  }
});
