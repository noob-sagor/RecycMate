const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

module.exports = (usersCollection) => {
    router.post('/', (req, res) => userController.createUser(usersCollection, req, res));
    router.get('/', (req, res) => userController.getUsers(usersCollection, req, res));
    router.get('/email/:email', (req, res) => userController.getUserByEmail(usersCollection, req, res));
    router.patch('/role/:id', (req, res) => userController.updateUserRole(usersCollection, req, res));
    return router;
};
