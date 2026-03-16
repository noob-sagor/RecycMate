const { ObjectId } = require('mongodb');

const createPickupRequest = async (pickupsCollection, req, res) => {
    try {
        const pickup = req.body;
        pickup.status = 'pending';
        pickup.createdAt = new Date();
        const result = await pickupsCollection.insertOne(pickup);
        res.send(result);
    } catch (error) {
        console.error("Error creating pickup request:", error);
        res.status(500).send({ message: "Failed to create pickup request" });
    }
};

const getMyPickups = async (pickupsCollection, req, res) => {
    try {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await pickupsCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching my pickups:", error);
        res.status(500).send({ message: "Failed to fetch pickups" });
    }
};

const getAllPickups = async (pickupsCollection, req, res) => {
    try {
        const result = await pickupsCollection.find().sort({ createdAt: -1 }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching all pickups:", error);
        res.status(500).send({ message: "Failed to fetch pickups" });
    }
};

module.exports = {
    createPickupRequest,
    getMyPickups,
    getAllPickups
};
