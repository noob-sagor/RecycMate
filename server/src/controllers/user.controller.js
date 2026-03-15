const createUser = async (usersCollection, req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
};

const getUsers = async (usersCollection, req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
};

module.exports = {
    createUser,
    getUsers
};
