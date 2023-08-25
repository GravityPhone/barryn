const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017/";

let db = null;

async function connect() {
    try {
        const client = new MongoClient(url, { family: 4 }); // This line specifies the use of IPv4 for MongoDB connection
        await client.connect();
        console.log("Connected successfully to server");
        db = client.db('barryn');
    } catch (error) {
        console.error("Failed to connect to server: ", error);
    }
}

async function getCollection(collectionName) {
    if (!db) await connect();
    return db.collection(collectionName);
}

async function getPlayer() {
    try {
        const collection = await getCollection('player');
        return await collection.findOne({ id: 1 });
    } catch (error) {
        console.error("Failed to get player: ", error);
    }
}

async function updatePlayer(player) {
    try {
        const collection = await getCollection('player');
        player.level = calculateLevel(player.experience); // Calculate the player's level based on their experience
        await collection.updateOne({ id: 1 }, { $set: player }, { upsert: true });
    } catch (error) {
        console.error("Failed to update player: ", error);
    }
}

function calculateLevel(experience) {
    console.log("Experience: ", experience); // Add console log
    let level = 0;
    while (((level + 1) * 100) * Math.pow(1.25, level + 1) <= experience) {
        level++;
    }
    console.log("Calculated level: ", level); // Add console log
    return level;
}

async function initializePlayer() {
    try {
        const collection = await getCollection('player');
        await collection.insertOne({ id: 1, level: 1, gold: 0, experience: 0, upgrades: { xpGain: 0, goldGain: 0, autoAdventure: 0 }, autoAdventure: false, inventory: [] });
    } catch (error) {
        console.error("Failed to initialize player: ", error);
    }
}

// New functions for interacting with the 'items' collection
async function getItems() {
    try {
        const collection = await getCollection('items');
        return await collection.find({}).toArray();
    } catch (error) {
        console.error("Failed to get items: ", error);
    }
}

async function addItem(item) {
    try {
        const collection = await getCollection('items');
        await collection.insertOne(item);
    } catch (error) {
        console.error("Failed to add item: ", error);
    }
}

async function addToInventory(itemName) {
    try {
        const collection = await getCollection('player');
        await collection.updateOne({ id: 1 }, { $push: { inventory: itemName } });
    } catch (error) {
        console.error("Failed to add item to inventory: ", error);
    }
}

async function removeFromInventory(itemName) {
    try {
        const collection = await getCollection('player');
        await collection.updateOne({ id: 1 }, { $pull: { inventory: itemName } });
    } catch (error) {
        console.error("Failed to remove item from inventory: ", error);
    }
}

async function getInventory() {
    try {
        const collection = await getCollection('player');
        const player = await collection.findOne({ id: 1 });
        return player.inventory || []; // Return an empty array if the inventory is undefined
    } catch (error) {
        console.error("Failed to get inventory: ", error);
    }
}

module.exports = { connect, getCollection, getPlayer, updatePlayer, initializePlayer, getItems, addItem, addToInventory, removeFromInventory, getInventory };
