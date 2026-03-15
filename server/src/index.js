const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db = client.db("recycmateDB");
    const usersCollection = db.collection("users");

    // Import Routes
    const userRoutes = require('./routes/user.route')(usersCollection);

    // Use Routes
    app.use('/users', userRoutes);

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('RecycMate Server is running')
})

app.listen(port, () => {
  console.log(`RecycMate Server is running on port: ${port}`)
})
