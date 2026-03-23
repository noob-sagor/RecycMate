const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
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
    const pickupsCollection = db.collection("pickups");
    const centersCollection = db.collection("centers");
    const otpsCollection = db.collection("otps");

    // Sample data for centers if empty
    const centersCount = await centersCollection.countDocuments();
    if (centersCount === 0) {
        await centersCollection.insertMany([
            {
                name: "Green Tech Recycling Hub",
                location: "Downtown, Metro City",
                specialties: ["Computer/Laptop", "Smartphone/Tablet"],
                contact: "+1-234-567-8901",
                image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Eco-Waste Center",
                location: "West Side Industrial Park",
                specialties: ["Battery", "Home Appliances", "Monitor/TV"],
                contact: "+1-234-567-8902",
                image: "https://images.unsplash.com/photo-1605600611284-1952139d8823?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Circuit Salvage Solutions",
                location: "North Point Tech Park",
                specialties: ["Printer/Scanner", "Cable/Charger", "Other"],
                contact: "+1-234-567-8903",
                image: "https://images.unsplash.com/photo-1612965110667-4187019a2882?auto=format&fit=crop&q=80&w=400"
            }
        ]);
    }

    // Import Routes
    const userRoutes = require('./routes/user.route')(usersCollection);
    const pickupRoutes = require('./routes/pickup.route')(pickupsCollection);
    const centerRoutes = require('./routes/center.route')(centersCollection);
    const otpRoutes = require('./routes/otp.route')(otpsCollection);

    // Use Routes
    app.use('/users', userRoutes);
    app.use('/pickups', pickupRoutes);
    app.use('/centers', centerRoutes);
    app.use('/otp', otpRoutes);

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
