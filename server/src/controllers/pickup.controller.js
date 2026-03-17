const { ObjectId } = require('mongodb');

const createPickupRequest = async (pickupsCollection, req, res) => {
    try {
        const pickup = req.body;
        pickup.status = 'pending';
        pickup.createdAt = new Date();
        pickup.statusHistory = [{
            status: 'pending',
            timestamp: pickup.createdAt,
            updatedBy: pickup.userEmail || 'User'
        }];
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

const updatePickupStatus = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { status, updatedBy } = req.body;
        
        if (!status) {
            return res.status(400).send({ message: "Status is required" });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { status },
            $push: {
                statusHistory: {
                    status,
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'System'
                }
            }
        };

        const result = await pickupsCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Pickup not found" });
        }
        res.send(result);
    } catch (error) {
        console.error("Error updating pickup status:", error);
        res.status(500).send({ message: "Failed to update status" });
    }
};

module.exports = {
    createPickupRequest,
    getMyPickups,
    getAllPickups,
    updatePickupStatus
};
