const getAllCenters = async (centersCollection, req, res) => {
    try {
        const result = await centersCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching centers:", error);
        res.status(500).send({ message: "Failed to fetch centers" });
    }
};

const getCentersBySpecialty = async (centersCollection, req, res) => {
    try {
        const specialty = req.params.specialty;
        const query = { specialties: { $in: [specialty] } };
        const result = await centersCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching centers by specialty:", error);
        res.status(500).send({ message: "Failed to fetch centers" });
    }
};

module.exports = {
    getAllCenters,
    getCentersBySpecialty
};
