const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickup.controller');

module.exports = (pickupsCollection, resellCollection) => {
    router.post('/', (req, res) => pickupController.createPickupRequest(pickupsCollection, req, res));
    router.get('/my/:email', (req, res) => pickupController.getMyPickups(pickupsCollection, req, res));
    router.get('/all', (req, res) => pickupController.getAllPickups(pickupsCollection, req, res));
    router.patch('/status/:id', (req, res) => pickupController.updatePickupStatus(pickupsCollection, req, res));
    router.patch('/reschedule/:id', (req, res) => pickupController.reschedulePickup(pickupsCollection, req, res));
    router.patch('/cancel/:id', (req, res) => pickupController.cancelPickup(pickupsCollection, req, res));
    router.patch('/checklist/:id', (req, res) => pickupController.submitChecklist(pickupsCollection, req, res));
    router.patch('/inspection/:id', (req, res) => pickupController.submitInspection(pickupsCollection, req, res));
    router.patch('/breakdown/:id', (req, res) => pickupController.submitBreakdown(pickupsCollection, resellCollection, req, res));
    router.patch('/disposal/:id', (req, res) => pickupController.finalizeDisposal(pickupsCollection, req, res));
    return router;
};
