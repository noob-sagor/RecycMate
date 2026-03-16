const { ObjectId } = require('mongodb');

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

const getUserByEmail = async (usersCollection, req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const result = await usersCollection.findOne(query);
    res.send(result);
};

const updateUserRole = async (usersCollection, req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: {
            role: role
        },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
};

module.exports = {
    createUser,
    getUsers,
    getUserByEmail,
    updateUserRole
};
