const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

module.exports = (inventoryCollection) => {
    router.post('/', (req, res) => inventoryController.addInventoryEntry(inventoryCollection, req, res));
    router.get('/', (req, res) => inventoryController.getAllInventory(inventoryCollection, req, res));
    router.get('/summary', (req, res) => inventoryController.getInventorySummary(inventoryCollection, req, res));
    router.get('/pickup/:pickupId', (req, res) => inventoryController.getPickupInventory(inventoryCollection, req, res));
    router.patch('/:id', (req, res) => inventoryController.updateInventoryQuantity(inventoryCollection, req, res));
    return router;
};
