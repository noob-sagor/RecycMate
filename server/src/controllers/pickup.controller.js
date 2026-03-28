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
        const { status, updatedBy, note } = req.body;
        
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
                    updatedBy: updatedBy || 'System',
                    ...(note && { note })
                }
            }
        };

        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error updating pickup status:", error);
        res.status(500).send({ message: "Failed to update status" });
    }
};

const reschedulePickup = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { preferredDate, preferredTime, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { preferredDate, preferredTime, status: 'pending' },
            $push: {
                statusHistory: {
                    status: 'rescheduled',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'User',
                    note: `Rescheduled to ${preferredDate} at ${preferredTime}`
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error rescheduling pickup:", error);
        res.status(500).send({ message: "Failed to reschedule" });
    }
};

const cancelPickup = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { status: 'cancelled' },
            $push: {
                statusHistory: {
                    status: 'cancelled',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'User'
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error cancelling pickup:", error);
        res.status(500).send({ message: "Failed to cancel" });
    }
};

const submitChecklist = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { checklist, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { checklist: { ...checklist, timestamp: new Date() }, status: 'collector-arrived' },
            $push: {
                statusHistory: {
                    status: 'collector-arrived',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Agent',
                    note: 'Collector arrived and checklist completed'
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error submitting checklist:", error);
        res.status(500).send({ message: "Failed to submit checklist" });
    }
};

const submitInspection = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { inspection, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { inspection: { ...inspection, timestamp: new Date() }, status: 'inspected' },
            $push: {
                statusHistory: {
                    status: 'inspected',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Agent',
                    note: 'Inspection report submitted'
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error submitting inspection:", error);
        res.status(500).send({ message: "Failed to submit inspection" });
    }
};

const submitBreakdown = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { breakdown, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        
        // Support both old format (simple object) and new format (components array with dispositions)
        const breakdownRecord = {
            ...breakdown,
            timestamp: new Date()
        };
        
        const updateDoc = {
            $set: { breakdown: breakdownRecord, status: 'component-breakdown' },
            $push: {
                statusHistory: {
                    status: 'component-breakdown',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Electrician',
                    note: breakdown.components ? `Component breakdown recorded: ${breakdown.components.length} components identified` : 'Component breakdown recorded'
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error submitting breakdown:", error);
        res.status(500).send({ message: "Failed to submit breakdown" });
    }
};

// Feature 10: Submit component dispositions (functional, repairable, resellable, waste)
const submitComponentDispositions = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { components, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        
        // Validate that components have disposition field
        const validComponents = components.every(c => 
            ['functional', 'repairable', 'resellable', 'waste'].includes(c.disposition)
        );
        
        if (!validComponents) {
            return res.status(400).send({ message: "Invalid disposition values. Must be: functional, repairable, resellable, or waste" });
        }
        
        const updateDoc = {
            $set: { 
                'breakdown.components': components,
                'breakdown.dispositionRecordedAt': new Date(),
                status: 'disposition-assigned'
            },
            $push: {
                statusHistory: {
                    status: 'disposition-assigned',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Electrician',
                    note: `Component dispositions assigned: ${components.map(c => `${c.name} (${c.disposition})`).join(', ')}`
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error submitting component dispositions:", error);
        res.status(500).send({ message: "Failed to submit component dispositions" });
    }
};

module.exports = {
    createPickupRequest,
    getMyPickups,
    getAllPickups,
    updatePickupStatus,
    reschedulePickup,
    cancelPickup,
    submitChecklist,
    submitInspection,
    submitBreakdown,
    submitComponentDispositions
};
