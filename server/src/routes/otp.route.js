const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

module.exports = (otpsCollection) => {
    router.post('/generate', (req, res) => otpController.generateOTP(otpsCollection, req, res));
    router.post('/verify', (req, res) => otpController.verifyOTP(otpsCollection, req, res));
    return router;
};
