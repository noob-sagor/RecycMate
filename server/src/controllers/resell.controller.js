const { ObjectId } = require('mongodb');

const getResellItems = async (resellCollection, req, res) => {
    try {
        const result = await resellCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching resell items:", error);
        res.status(500).send({ message: "Failed to fetch resell items" });
    }
};

const addResellItem = async (resellCollection, req, res) => {
    try {
        const item = req.body;
        item.createdAt = new Date();
        const result = await resellCollection.insertOne(item);
        res.send(result);
    } catch (error) {
        console.error("Error adding resell item:", error);
        res.status(500).send({ message: "Failed to add resell item" });
    }
};

const updateResellItemStatus = async (resellCollection, req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { status: status }
        };
        const result = await resellCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error updating resell item status:", error);
        res.status(500).send({ message: "Failed to update status" });
    }
};

module.exports = {
    getResellItems,
    addResellItem,
    updateResellItemStatus
};
