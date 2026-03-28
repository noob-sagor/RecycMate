const { ObjectId } = require('mongodb');

// Add or update inventory entry
const addInventoryEntry = async (inventoryCollection, req, res) => {
    try {
        const { componentType, quantity, condition, pickupId, source, notes, recordedBy } = req.body;

        if (!componentType || quantity < 1) {
            return res.status(400).send({ message: "Component type and quantity are required" });
        }

        const entry = {
            componentType,
            quantity,
            condition: condition || 'good',
            pickupId: pickupId || null,
            source: source || 'pickup', // pickup, refurbishment, other
            notes: notes || '',
            status: 'stored', // stored, sold, consumed, disposed
            recordedBy: recordedBy || 'System',
            recordedAt: new Date(),
            lastUpdated: new Date()
        };

        const result = await inventoryCollection.insertOne(entry);
        res.send(result);
    } catch (error) {
        console.error("Error adding inventory entry:", error);
        res.status(500).send({ message: "Failed to add inventory entry" });
    }
};

// Update inventory quantity (for sales/consumption)
const updateInventoryQuantity = async (inventoryCollection, req, res) => {
    try {
        const id = req.params.id;
        const { quantityChange, status, reason, updatedBy } = req.body;

        if (!quantityChange || !reason) {
            return res.status(400).send({ message: "Quantity change and reason are required" });
        }

        const filter = { _id: new ObjectId(id) };
        const inventory = await inventoryCollection.findOne(filter);

        if (!inventory) {
            return res.status(404).send({ message: "Inventory entry not found" });
        }

        const newQuantity = inventory.quantity + quantityChange;
        if (newQuantity < 0) {
            return res.status(400).send({ message: "Insufficient inventory" });
        }

        const updateDoc = {
            $set: {
                quantity: newQuantity,
                ...(status && { status }),
                lastUpdated: new Date(),
                lastUpdatedBy: updatedBy || 'System'
            },
            $push: {
                history: {
                    timestamp: new Date(),
                    action: quantityChange > 0 ? 'added' : 'removed',
                    quantityChange,
                    newQuantity,
                    reason,
                    updatedBy: updatedBy || 'System'
                }
            }
        };

        const result = await inventoryCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).send({ message: "Failed to update inventory" });
    }
};

// Get all inventory items
const getAllInventory = async (inventoryCollection, req, res) => {
    try {
        const filters = {};
        
        // Apply filters if provided
        if (req.query.status) filters.status = req.query.status;
        if (req.query.componentType) filters.componentType = req.query.componentType;

        const result = await inventoryCollection.find(filters).sort({ recordedAt: -1 }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).send({ message: "Failed to fetch inventory" });
    }
};

// Get inventory summary/statistics
const getInventorySummary = async (inventoryCollection, req, res) => {
    try {
        const summary = await inventoryCollection.aggregate([
            {
                $group: {
                    _id: '$componentType',
                    totalQuantity: { $sum: '$quantity' },
                    storedCount: { $sum: { $cond: [{ $eq: ['$status', 'stored'] }, 1, 0] } },
                    soldCount: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
                    avgQuantity: { $avg: '$quantity' }
                }
            },
            { $sort: { totalQuantity: -1 } }
        ]).toArray();

        res.send(summary);
    } catch (error) {
        console.error("Error fetching inventory summary:", error);
        res.status(500).send({ message: "Failed to fetch inventory summary" });
    }
};

// Get inventory for specific pickup
const getPickupInventory = async (inventoryCollection, req, res) => {
    try {
        const pickupId = req.params.pickupId;
        const result = await inventoryCollection.find({ pickupId }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching pickup inventory:", error);
        res.status(500).send({ message: "Failed to fetch pickup inventory" });
    }
};

module.exports = {
    addInventoryEntry,
    updateInventoryQuantity,
    getAllInventory,
    getInventorySummary,
    getPickupInventory
};
