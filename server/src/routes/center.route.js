const express = require('express');
const router = express.Router();
const centerController = require('../controllers/center.controller');

module.exports = (centersCollection) => {
    router.get('/', (req, res) => centerController.getAllCenters(centersCollection, req, res));
    router.get('/specialty/:specialty', (req, res) => centerController.getCentersBySpecialty(centersCollection, req, res));
    return router;
};
