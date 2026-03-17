const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickup.controller');

module.exports = (pickupsCollection) => {
    router.post('/', (req, res) => pickupController.createPickupRequest(pickupsCollection, req, res));
    router.get('/my/:email', (req, res) => pickupController.getMyPickups(pickupsCollection, req, res));
    router.get('/all', (req, res) => pickupController.getAllPickups(pickupsCollection, req, res));
    router.patch('/:id/status', (req, res) => pickupController.updatePickupStatus(pickupsCollection, req, res));
    return router;
};
