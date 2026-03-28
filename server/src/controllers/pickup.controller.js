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

const submitBreakdown = async (pickupsCollection, resellCollection, req, res) => {
    try {
        const id = req.params.id;
        const { breakdown, updatedBy } = req.body;
        const filter = { _id: new ObjectId(id) };
        
        // Fetch pickup details to include in resell item description
        const pickup = await pickupsCollection.findOne(filter);
        const deviceType = pickup?.items?.[0]?.category || 'Electronic Device';

        // Update the pickup record
        const updateDoc = {
            $set: { breakdown: { ...breakdown, timestamp: new Date() }, status: 'broken-down' },
            $push: {
                statusHistory: {
                    status: 'broken-down',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Electrician',
                    note: 'Component breakdown and disposition recorded'
                }
            }
        };
        const result = await pickupsCollection.updateOne(filter, updateDoc);

        // Trigger next steps: Add resellable items to resellList
        const resellableItems = [];
        for (const [component, disposition] of Object.entries(breakdown)) {
            if (disposition === 'resellable') {
                resellableItems.push({
                    componentName: `${component} (${deviceType})`,
                    condition: 'Salvaged',
                    price: 0, // Admin or Sales will set the price later
                    status: 'listed',
                    addedBy: updatedBy,
                    addedByName: 'Electrician (Auto-generated)',
                    createdAt: new Date(),
                    originalPickupId: id
                });
            }
        }

        if (resellableItems.length > 0) {
            await resellCollection.insertMany(resellableItems);
        }

        res.send({ ...result, resellItemsAdded: resellableItems.length });
    } catch (error) {
        console.error("Error submitting breakdown:", error);
        res.status(500).send({ message: "Failed to submit breakdown" });
    }
};

const finalizeDisposal = async (pickupsCollection, req, res) => {
    try {
        const id = req.params.id;
        const { disposalMethod, notes, updatedBy } = req.body;

        if (!disposalMethod) {
            return res.status(400).send({ message: "Disposal method is required" });
        }

        const validDisposalMethods = ['recycle', 'hazardous', 'refurbish'];
        if (!validDisposalMethods.includes(disposalMethod)) {
            return res.status(400).send({ message: "Invalid disposal method" });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                disposal: {
                    method: disposalMethod,
                    notes: notes || '',
                    timestamp: new Date(),
                    recordedBy: updatedBy || 'Admin'
                },
                status: 'disposal-finalized'
            },
            $push: {
                statusHistory: {
                    status: 'disposal-finalized',
                    timestamp: new Date(),
                    updatedBy: updatedBy || 'Admin',
                    note: `Disposal method finalized as: ${disposalMethod}`
                }
            }
        };

        const result = await pickupsCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error finalizing disposal:", error);
        res.status(500).send({ message: "Failed to finalize disposal" });
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
    finalizeDisposal
};
