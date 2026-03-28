const express = require('express');
const router = express.Router();
const resellController = require('../controllers/resell.controller');

module.exports = (resellCollection) => {
    router.get('/', (req, res) => resellController.getResellItems(resellCollection, req, res));
    router.post('/', (req, res) => resellController.addResellItem(resellCollection, req, res));
    router.patch('/:id', (req, res) => resellController.updateResellItemStatus(resellCollection, req, res));
    return router;
};
