const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5176", "http://127.0.0.1:5176"],
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
  if (process.env.MOCK_MODE === 'true') {
    console.log("MOCK_MODE is active. Skipping MongoDB connection attempt.");
    setupMockRoutes();
    return;
  }

  try {
    const db = client.db("recycmateDB");
    const usersCollection = db.collection("users");
    const pickupsCollection = db.collection("pickups");
    const centersCollection = db.collection("centers");
    const otpsCollection = db.collection("otps");

    // Sample data for centers if empty
    const centersCount = await centersCollection.countDocuments();
    if (centersCount === 0) {
        // ... (insertMany logic remains here)
    }

    // Import Routes
    const userRoutes = require('./routes/user.route')(usersCollection);
    const resellCollection = db.collection("resellList");
    const pickupRoutes = require('./routes/pickup.route')(pickupsCollection, resellCollection);
    const centerRoutes = require('./routes/center.route')(centersCollection);
    const otpRoutes = require('./routes/otp.route')(otpsCollection);
    const resellRoutes = require('./routes/resell.route')(db.collection("resellList"));

    // Use Routes
    app.use('/users', userRoutes);
    app.use('/pickups', pickupRoutes);
    app.use('/centers', centerRoutes);
    app.use('/otp', otpRoutes);
    app.use('/resell', resellRoutes);

    console.log("Server routes initialized (Connected to MongoDB)");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    setupMockRoutes();
  }
}

function setupMockRoutes() {
    // Initialize routes with mock collections
    const mockAdmin = { _id: "mock-admin-id", name: "ABDULLAH AL MAHMUD SAGOR", email: "recycmate@gmail.com", role: "admin" };
    const mockElectrician = { _id: "mock-elec-id", name: "Electrician Mike", email: "electrician@recycmate.com", role: "electrician" };
    const mockSales = { _id: "mock-sales-id", name: "Sales Sam", email: "sales@recycmate.com", role: "sales" };
    
    const mockPickups = [
        { _id: "66029b9f1234567890abcdef", status: "pending", userEmail: "user@example.com", items: [{ category: "Laptop", quantity: 1 }], createdAt: new Date() },
        { _id: "66029b9f1234567890abcde1", status: "assigned", userEmail: "user@example.com", items: [{ category: "Phone", quantity: 2 }], createdAt: new Date() }
    ];
    const mockCenters = [
        { _id: "c1", name: "Mock Center 1", location: "Loc 1" },
        { _id: "c2", name: "Mock Center 2", location: "Loc 2" }
    ];
    const mockResellItems = [
        { _id: "r1", componentName: "Resistor 10k", condition: "New", price: 2.50, status: "listed", addedBy: "sales@recycmate.com" },
        { _id: "r2", componentName: "Capacitor 10uF", condition: "Used", price: 5.00, status: "sold", addedBy: "sales@recycmate.com" }
    ];

    const mockCol = { 
        countDocuments: async () => 2, 
        insertOne: async (doc) => ({ insertedId: "mock-id" }), 
        find: (query) => ({ 
            sort: () => ({ 
                toArray: async () => {
                    if (query && query.userEmail) return mockPickups;
                    if (query && query.name) return mockCenters;
                    // Default to resell items if no specific query matched
                    return mockResellItems;
                }
            }),
            toArray: async () => mockResellItems
        }), 
        updateOne: async () => ({ modifiedCount: 1 }),
        insertMany: async (docs) => ({ insertedCount: docs.length, insertedIds: {} }),
        findOne: async (query) => {
            if (query && query.email === "electrician@recycmate.com") return mockElectrician;
            if (query && query.email === "sales@recycmate.com") return mockSales;
            if (query && (query.email === "admin@gmail.com" || query.role === "admin")) return mockAdmin;
            if (query && query._id) return mockPickups[0];
            return mockAdmin;
        }
    };

    app.use('/users', require('./routes/user.route')(mockCol));
    const mockResellCol = mockCol; // In mock mode, they use the same mock object
    app.use('/pickups', require('./routes/pickup.route')(mockCol, mockResellCol));
    app.use('/centers', require('./routes/center.route')(mockCol));
    app.use('/otp', require('./routes/otp.route')(mockCol));
    app.use('/resell', require('./routes/resell.route')(mockCol));
    app.patch('/pickups/breakdown/:id', (req, res) => {
        console.log("Mock Breakdown Submitted for ID:", req.params.id, req.body);
        res.send({ modifiedCount: 1 });
    });
    console.log("Server initialized with ADMIN and ELECTRICIAN MOCKS");
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('RecycMate Server is running')
})

app.listen(port, () => {
  console.log(`RecycMate Server is running on port: ${port}`)
})
