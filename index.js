const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pump, Server is Running");
});
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2cofc5d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const toysDb = client.db("toysDb").collection("toysCollection");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();

    // get toys from db
    app.get("/toys", async (req, res) => {
      const result = await toysDb.find().toArray();
      res.send(result);
    });

    // post in db
    app.post("/toys", async (req, res) => {
      const result = await toysDb.insertOne();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running at port", port);
});
