const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

module.exports = (usersCollection) => {
    router.post('/', (req, res) => userController.createUser(usersCollection, req, res));
    router.get('/', (req, res) => userController.getUsers(usersCollection, req, res));
    return router;
};
